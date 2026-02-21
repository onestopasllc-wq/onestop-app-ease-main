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

    const body = await req.text();

    // Get environment variables
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("Environment check:", {
      hasWebhookSecret: !!webhookSecret,
      hasStripeKey: !!stripeSecretKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
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

    let event;
    try {
      console.log("Verifying Stripe event signature...");
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
      console.log("✅ Event verified successfully:", event.type, event.id);
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
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
      .filter(key => key.startsWith('data_')) // Matches new format
      .sort((a, b) => {
        const numA = parseInt(a.split('_')[1]);
        const numB = parseInt(b.split('_')[1]);
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
