import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize with error handling
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are set
if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:', {
    hasStripeKey: !!stripeSecretKey,
    hasWebhookSecret: !!webhookSecret,
    hasSupabaseUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey
  });
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-10-29.clover' as any,
}) : null;

const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(
  supabaseUrl,
  supabaseServiceKey
) : null;

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  console.log('🔔 Webhook handler called, method:', request.method);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
    return response.status(200).send('ok');
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Check if environment  variables are missing
    if (!stripe || !supabaseAdmin) {
      console.error('❌ Missing environment variables - cannot process webhook');
      return response.status(500).json({
        error: 'Server configuration error: Missing environment variables'
      });
    }

    const signature = request.headers['stripe-signature'] as string;

    if (!signature) {
      console.log('⚠️ No Stripe signature provided');
      return response.status(400).json({ error: 'No Stripe signature provided' });
    }

    // Get raw body
    const rawBody = await getRawBody(request);
    console.log('📦 Raw body received, length:', rawBody.length);

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
      console.log('✅ Webhook signature verified:', event.type);
    } catch (err: any) {
      console.log('⚠️ Webhook signature verification failed:', err.message);
      return response.status(400).json({
        error: `Webhook signature verification failed: ${err.message}`
      });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        console.log(`💰 Checkout Session completed: ${event.id}`);
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'checkout.session.expired':
        console.log(`⏰ Checkout Session expired: ${event.id}`);
        await handleCheckoutSessionExpired(event.data.object);
        break;
      default:
        console.log(`⚡ Unhandled event type: ${event.type}`);
    }

    return response.json({ received: true });

  } catch (error: any) {
    console.error('💥 Webhook error:', error);
    return response.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Helper function to get raw body
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Handler functions
async function handleCheckoutSessionCompleted(session: any) {
  if (!supabaseAdmin) {
    console.error('❌ Supabase client not initialized');
    return;
  }

  console.log('💰 Processing completed checkout session:', session.id);

  try {
    // 1. Check if appointment already exists for this session (idempotency)
    const { data: existingAppointment } = await supabaseAdmin
      .from('appointments')
      .select('id, appointment_date, appointment_time')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (existingAppointment) {
      console.log('✅ Appointment already created for session:', session.id);
      console.log('Existing appointment ID:', existingAppointment.id);
      return existingAppointment;
    }

    // 2. Extract booking data from metadata
    const bookingDataStr = session.metadata?.booking_data;
    console.log('📦 Booking data from metadata:', bookingDataStr ? 'present' : 'missing');

    if (!bookingDataStr) {
      console.error('❌ No booking data found in session metadata');
      throw new Error('Missing booking data in session metadata');
    }

    let bookingData;
    try {
      bookingData = JSON.parse(bookingDataStr);
      console.log('✅ Parsed booking data successfully');
      console.log('📅 Appointment date:', bookingData.appointment_date);
      console.log('🕐 Appointment time:', bookingData.appointment_time);
    } catch (parseError) {
      console.error('❌ Failed to parse booking data:', parseError);
      throw new Error('Invalid booking data format in metadata');
    }

    // 3. Validate slot is still available (optional - log warning but continue)
    const { data: conflictingAppointments } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('appointment_date', bookingData.appointment_date)
      .eq('appointment_time', bookingData.appointment_time)
      .neq('status', 'cancelled');

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      console.warn('⚠️ Time slot conflict detected!');
      console.warn('Conflicting appointments:', conflictingAppointments);
      // Log but continue - payment succeeded so we create anyway
      console.warn('Creating appointment despite slot conflict - admin should review');
    }

    // 4. Create appointment in database
    console.log('💾 Creating appointment record in database...');
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
        // Payment info
        payment_status: 'paid',
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        status: 'confirmed',
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to create appointment:', insertError);
      console.error('Error code:', insertError.code);
      console.error('Error details:', insertError.details);

      // Log to error table for manual review
      await supabaseAdmin
        .from('webhook_errors')
        .insert({
          event_id: session.id,
          event_type: 'checkout.session.completed',
          error_message: insertError.message,
          error_details: JSON.stringify(insertError),
          metadata: session.metadata,
        })
        .catch((logErr: any) => console.error('Failed to log error:', logErr));

      throw insertError;
    }

    console.log('✅ Appointment created successfully!');
    console.log('📝 Appointment ID:', appointment.id);
    console.log('👤 Customer:', appointment.full_name);
    console.log('📅 Date/Time:', appointment.appointment_date, appointment.appointment_time);

    // 5. Send notifications (optional - requires Edge Functions or external service)
    // Note: You may need to call Supabase Edge Functions or use a service like SendGrid
    console.log('📧 Notifications should be sent here (email/WhatsApp)');
    // Example: Call Supabase Edge Function
    // await supabaseAdmin.functions.invoke('send-confirmation-email', { body: {...} });

    return appointment;
  } catch (error: any) {
    console.error('❌ Error in handleCheckoutSessionCompleted:', error);

    // Log critical error
    await supabaseAdmin
      .from('webhook_errors')
      .insert({
        event_id: session.id,
        event_type: 'checkout.session.completed',
        error_message: error.message,
        error_details: JSON.stringify({
          error: error.toString(),
          stack: error.stack
        }),
        metadata: session.metadata,
      })
      .catch((logErr: any) => console.error('Failed to log error:', logErr));

    throw error;
  }
}

async function handleCheckoutSessionExpired(session: any) {
  if (!supabaseAdmin) {
    console.error('❌ Supabase client not initialized');
    return;
  }

  console.log('⏰ Processing expired checkout session:', session.id);

  // With payment-first flow, there's no appointment to cancel
  // Just log for analytics
  console.log('Checkout session expired (no appointment was created)');
  console.log('Customer email:', session.metadata?.customer_email);
  console.log('Booking data was:', session.metadata?.booking_data ? 'present' : 'missing');

  // Optional: Log to analytics table
  // This helps track how many people abandon payment
}