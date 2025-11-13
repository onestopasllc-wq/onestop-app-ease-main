import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Types matching your database schema
interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  appointment_date: string;
  appointment_time: string;
  services: string[];
  description: string | null;
  payment_status: string | null;
  status: string;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover' as any,
});

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to get raw body for signature verification
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // CORS headers for webhook
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const signature = request.headers['stripe-signature'] as string;
    
    if (!signature) {
      console.error('❌ No Stripe signature provided');
      return response.status(400).json({ error: 'No Stripe signature provided' });
    }

    // Get RAW body for signature verification
    const rawBody = await getRawBody(request);
    
    let event: Stripe.Event;

    try {
      // Verify webhook signature with raw body
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log('✅ Webhook verified:', event.type, event.id);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return response.status(400).json({ 
        error: `Webhook signature verification failed: ${err.message}` 
      });
    }

    // Handle the event
    console.log(`🔄 Processing event: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        console.log('💳 Payment intent succeeded');
        break;
      case 'payment_intent.payment_failed':
        console.log('❌ Payment intent failed');
        break;
      default:
        console.log(`⚡ Unhandled event type: ${event.type}`);
    }

    // Quickly return 2xx response as per Stripe docs
    return response.json({ 
      received: true,
      event: event.type,
      message: 'Webhook processed successfully'
    });

  } catch (error: any) {
    console.error('💥 Webhook error:', error);
    return response.status(500).json({ error: error.message });
  }
}

// Handle successful checkout sessions
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log('💰 Processing completed checkout session:', session.id);
  const appointmentId = session.metadata?.appointment_id;
  
  if (!appointmentId) {
    console.error('❌ No appointment ID found in session metadata');
    return;
  }

  try {
    console.log('📝 Updating appointment in database:', appointmentId);
    
    // Update appointment in Supabase
    const { error } = await supabaseAdmin
      .from('appointments')
      .update({
        payment_status: 'paid',
        stripe_session_id: session.id,
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (error) {
      console.error('❌ Database update error:', error);
      throw error;
    }

    console.log('✅ Appointment updated successfully');

    // Send notifications
    await sendPaymentConfirmationEmail(appointmentId);
    await sendPaymentWhatsAppNotification(appointmentId);
    
  } catch (error: any) {
    console.error('❌ Error in handleCheckoutSessionCompleted:', error);
    throw error;
  }
}

// Handle expired checkout sessions
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<void> {
  console.log('⏰ Processing expired checkout session:', session.id);
  const appointmentId = session.metadata?.appointment_id;
  
  if (!appointmentId) {
    console.log('ℹ️ No appointment ID found for expired session');
    return;
  }

  try {
    const { error } = await supabaseAdmin
      .from('appointments')
      .update({
        payment_status: 'expired',
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (error) {
      console.error('❌ Database update error for expired session:', error);
      throw error;
    }
    
    console.log(`✅ Appointment ${appointmentId} marked as expired`);
  } catch (error: any) {
    console.error('❌ Error in handleCheckoutSessionExpired:', error);
  }
}

// Send email confirmation using your existing Edge Function
async function sendPaymentConfirmationEmail(appointmentId: string): Promise<void> {
  try {
    console.log('📧 Sending payment confirmation email for appointment:', appointmentId);
    
    const { data: appointment, error: fetchError } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointment) {
      console.error('❌ Failed to fetch appointment for email:', fetchError);
      return;
    }

    // Call your existing email Edge Function
    const { error } = await supabaseAdmin.functions.invoke('send-confirmation-email', {
      body: {
        to: appointment.email,
        name: appointment.full_name,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        services: appointment.services,
        paymentStatus: 'paid'
      }
    });

    if (error) {
      console.error('❌ Failed to invoke email function:', error);
      throw error;
    }
    
    console.log('✅ Payment confirmation email sent successfully');
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
  }
}

// Send WhatsApp notification using your existing Edge Function
async function sendPaymentWhatsAppNotification(appointmentId: string): Promise<void> {
  try {
    console.log('💬 Sending WhatsApp notification for appointment:', appointmentId);
    
    const { data: appointment, error: fetchError } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointment) {
      console.error('❌ Failed to fetch appointment for WhatsApp:', fetchError);
      return;
    }

    // Call your existing WhatsApp Edge Function
    const { error } = await supabaseAdmin.functions.invoke('send-whatsapp-notification', {
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

    if (error) {
      console.error('❌ Failed to invoke WhatsApp function:', error);
      throw error;
    }
    
    console.log('✅ WhatsApp notification sent successfully');
  } catch (error: any) {
    console.error('❌ Failed to send WhatsApp:', error);
  }
}