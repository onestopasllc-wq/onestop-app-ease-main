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
    // Check if environment variables are missing
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
  const appointmentId = session.metadata?.appointment_id;
  
  if (!appointmentId) {
    console.error('❌ No appointment ID found in session metadata');
    return;
  }

  try {
    const { error } = await supabaseAdmin
      .from('appointments')
      .update({
        payment_status: 'paid',
        stripe_session_id: session.id,
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (error) throw error;
    console.log('✅ Appointment updated successfully');

  } catch (error: any) {
    console.error('❌ Error updating appointment:', error);
  }
}

async function handleCheckoutSessionExpired(session: any) {
  if (!supabaseAdmin) {
    console.error('❌ Supabase client not initialized');
    return;
  }

  console.log('⏰ Processing expired checkout session:', session.id);
  const appointmentId = session.metadata?.appointment_id;
  
  if (!appointmentId) return;

  try {
    const { error } = await supabaseAdmin
      .from('appointments')
      .update({
        payment_status: 'expired',
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (error) throw error;
    console.log(`✅ Appointment ${appointmentId} marked as expired`);
  } catch (error: any) {
    console.error('❌ Error updating expired appointment:', error);
  }
}