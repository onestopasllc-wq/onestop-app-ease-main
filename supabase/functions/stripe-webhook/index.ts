import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET"
};

console.log('🔔 Stripe Webhook Function initialized');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No Stripe signature provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get raw body as bytes to prevent ANY character encoding corruption
    const rawBodyBuffer = await req.arrayBuffer();
    const payload = new Uint8Array(rawBodyBuffer);
    const bodyLength = payload.length;

    // Get environment variables and trim whitespace/newlines
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")?.trim();
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

    console.log("Environment check:", {
      hasWebhookSecret: !!webhookSecret,
      webhookSecretLength: webhookSecret?.length,
      webhookSecretPrefix: webhookSecret ? `${webhookSecret.slice(0, 8)}...${webhookSecret.slice(-4)}` : null,
      hasStripeKey: !!stripeSecretKey,
      stripeKeyPrefix: stripeSecretKey ? `${stripeSecretKey.slice(0, 8)}...` : null,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      bodyLength: bodyLength,
      signatureExists: !!signature,
      signaturePrefix: signature ? `${signature.slice(0, 20)}...` : null
    });

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SIGNING_SECRET environment variable is not set");
    }
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials are not set");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
    });

    // Create a crypto provider for Web Crypto (required in Deno/Edge Functions)
    const cryptoProvider = Stripe.createSubtleCryptoProvider();

    let event;
    try {
      console.log("Verifying Stripe event signature...");
      event = await stripe.webhooks.constructEventAsync(
        payload,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      );
      console.log("✅ Event verified successfully:", event.type, event.id);
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ 
          error: `Webhook signature verification failed: ${err.message}`,
          debug: {
            webhookSecretPrefix: webhookSecret ? `${webhookSecret.slice(0, 8)}...${webhookSecret.slice(-4)}` : "missing",
            signaturePrefix: signature ? `${signature.slice(0, 15)}...` : "missing",
            bodyLength: bodyLength,
            isLiveMode: signature?.includes("v1="), // Signature format sanity check
            hint: "Check your Stripe Dashboard > Developers > Webhooks. Ensure the Signing Secret (whsec_...) matches the webhookSecretPrefix exactly. Note: Live mode and Test mode have DIFFERENT secrets."
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event
    console.log(`Processing event type: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, supabaseAdmin);
        break;
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object, supabaseAdmin);
        break;
      case 'payment_intent.succeeded':
        console.log("Payment intent succeeded");
        break;
      case 'payment_intent.payment_failed':
        console.log("Payment intent failed");
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({
        received: true,
        event: event.type,
        message: "Webhook processed successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);

    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleCheckoutSessionCompleted(session: any, supabaseAdmin: any) {
  console.log('Processing completed checkout session:', session.id);

  try {
    const metadata = session.metadata || {};

    // 1. Reassemble chunked metadata if present
    let reassembledData: any = null;
    const chunkKeys = Object.keys(metadata)
      .filter(key => key.startsWith('data_') || key.startsWith('data_chunk_'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+$/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/\d+$/)?.[0] || '0', 10);
        return numA - numB;
      });

    if (chunkKeys.length > 0) {
      console.log(`Found ${chunkKeys.length} data chunks in metadata`);
      let combinedStr = '';
      for (const key of chunkKeys) {
        combinedStr += metadata[key];
      }
      try {
        reassembledData = JSON.parse(combinedStr);
        console.log('Successfully reassembled data from chunks');
      } catch (parseError) {
        console.error('Failed to parse reassembled data:', parseError);
      }
    }

    // Check for Rental Listing Type
    if (metadata.type === 'rental_listing') {
      await handleRentalListing(session, supabaseAdmin, reassembledData);
      return;
    }

    // Check for Event Registration Type
    if (metadata.type === 'event_registration') {
      await handleEventRegistration(session, supabaseAdmin, reassembledData);
      return;
    }

    // 2. Check if appointment already exists for this session (idempotency)
    const { data: existingAppointment } = await supabaseAdmin
      .from('appointments')
      .select('id, appointment_date, appointment_time')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (existingAppointment) {
      console.log('✅ Appointment already created for session:', session.id);
      return existingAppointment;
    }

    // 3. Get booking data - prefer reassembled, fallback to direct booking_data string
    let bookingData = reassembledData;
    if (!bookingData && metadata.booking_data) {
      try {
        bookingData = JSON.parse(metadata.booking_data);
      } catch (e) {
        console.error('Fallback booking_data parse failed');
      }
    }

    if (!bookingData) {
      console.error('No booking data found in session metadata');
      return;
    }

    // 4. Validate slot is still available
    const { data: conflictingAppointments } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('appointment_date', bookingData.appointment_date)
      .eq('appointment_time', bookingData.appointment_time)
      .neq('status', 'cancelled');

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      console.warn('Creating appointment despite slot conflict - admin should review');
    }

    // 5. Create appointment in database
    const { data: appointment, error: insertError } = await supabaseAdmin
      .from('appointments')
      .insert({
        full_name: bookingData.full_name,
        email: bookingData.email,
        phone: bookingData.phone || null,
        contact_method: bookingData.contact_method,
        location: bookingData.location,
        state: bookingData.state,
        city: bookingData.city,
        services: bookingData.services,
        description: bookingData.description || null,
        appointment_date: bookingData.appointment_date,
        appointment_time: bookingData.appointment_time,
        file_url: bookingData.file_url || null,
        how_heard: bookingData.how_heard || null,
        payment_status: 'paid',
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        status: 'confirmed',
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to create appointment:', insertError);
      throw insertError;
    }

    console.log('✅ Appointment created successfully ID:', appointment.id);

    // 6. Send notifications
    sendPaymentConfirmationEmail(appointment, supabaseAdmin).catch(console.error);
    sendPaymentWhatsAppNotification(appointment, supabaseAdmin).catch(console.error);

    return appointment;
  } catch (error: any) {
    console.error('❌ Error in handleCheckoutSessionCompleted:', error);
    // Log critical error
    await supabaseAdmin.from('webhook_errors').insert({
      event_id: session.id,
      event_type: 'checkout.session.completed',
      error_message: error.message,
      metadata: session.metadata,
    }).catch(console.error);
    throw error;
  }
}

async function handleCheckoutSessionExpired(session: any, supabaseAdmin: any) {
  console.log('Checkout session expired:', session.id);
}

async function sendPaymentConfirmationEmail(appointment: any, supabaseAdmin: any) {
  try {
    await supabaseAdmin.functions.invoke('send-confirmation-email', {
      body: {
        to: appointment.email,
        name: appointment.full_name,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        services: appointment.services,
        paymentStatus: 'paid'
      }
    });
  } catch (error) {
    console.error('Email failed:', error);
  }
}

async function sendPaymentWhatsAppNotification(appointment: any, supabaseAdmin: any) {
  try {
    await supabaseAdmin.functions.invoke('send-whatsapp-notification', {
      body: {
        customerName: appointment.full_name,
        email: appointment.email,
        phone: appointment.phone || 'Not provided',
        services: appointment.services,
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        description: appointment.description,
        paymentStatus: 'paid'
      }
    });
  } catch (error) {
    console.error('WhatsApp failed:', error);
  }
}

async function handleRentalListing(session: any, supabaseAdmin: any, reassembledData: any) {
  console.log('🏠 Processing Rental Listing Payment:', session.id);

  try {
    const listingData = reassembledData;

    if (!listingData) {
      throw new Error("No reassembled listing data found in metadata");
    }

    // Check if listing already exists (idempotency)
    const { data: existingListing } = await supabaseAdmin
      .from('rental_listings')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (existingListing) {
      console.log('✅ Rental listing already created for session:', session.id);
      return;
    }

    console.log('Creating listing for:', listingData.title);

    const { data: newListing, error: insertError } = await supabaseAdmin
      .from('rental_listings')
      .insert({
        user_id: listingData.user_id,
        title: listingData.title,
        description: listingData.description,
        address: listingData.address,
        property_type: listingData.property_type,
        price: listingData.price,
        features: listingData.features || [],
        contact_name: listingData.contact_name,
        contact_phone: listingData.contact_phone,
        contact_email: listingData.contact_email,
        images: listingData.images || [],
        status: 'pending_approval',
        payment_status: 'paid',
        stripe_payment_id: session.payment_intent || session.subscription,
        stripe_session_id: session.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to insert listing:', insertError);
      throw insertError;
    }

    console.log(`✅ Rental listing created ID: ${newListing.id}`);
  } catch (error: any) {
    console.error('❌ Error handling rental listing:', error);
    throw error;
  }
}

async function handleEventRegistration(session: any, supabaseAdmin: any, _reassembledData: any) {
  console.log('🎟️ Processing Event Registration Payment:', session.id);

  try {
    const metadata = session.metadata || {};
    const registrationId = metadata.registration_id;

    console.log('Looking up registration ID from metadata:', registrationId);

    if (!registrationId) {
      throw new Error("No registration_id found in session metadata");
    }

    // ✅ Look up the pre-saved registration by its ID
    const { data: existingReg, error: fetchError } = await supabaseAdmin
      .from('event_registrations')
      .select('*')
      .eq('id', registrationId)
      .maybeSingle();

    if (fetchError || !existingReg) {
      console.error('❌ Could not find pre-saved registration:', fetchError);
      throw new Error(`Registration not found for ID: ${registrationId}`);
    }

    console.log('✅ Found pre-saved registration for:', existingReg.full_name);

    if (existingReg.payment_status === 'paid') {
      console.log('✅ Event registration already marked as PAID. ID:', registrationId);
      return;
    }

    // ✅ Update it to 'paid' and attach the stripe session ID
    const { error: updateError } = await supabaseAdmin
      .from('event_registrations')
      .update({
        payment_status: 'paid',
        stripe_session_id: session.id
      })
      .eq('id', registrationId);

    if (updateError) {
      console.error('❌ Failed to update registration status:', updateError);
      throw updateError;
    }

    console.log(`✅ Event registration marked as PAID. ID: ${registrationId}`);

    // ✅ Send professional confirmation email
    await supabaseAdmin.functions.invoke('send-confirmation-email', {
      body: {
        type: 'event_registration',
        to: existingReg.email,
        name: existingReg.full_name,
        areasOfInterest: existingReg.areas_of_interest,
        cityState: existingReg.city_state,
        phoneNumber: existingReg.phone_number,
        sessionId: session.id
      }
    }).catch((err: any) => console.error('Error triggering event confirmation email:', err));

  } catch (error: any) {
    console.error('❌ Error handling event registration:', error);
    throw error;
  }
}
