import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// This is your Stripe secret key - use environment variables!
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover' as any,
});

// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Only verify the event if you have an endpoint secret defined
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'] as string;
    
    if (!signature) {
      console.log('⚠️ No Stripe signature provided');
      return response.status(400).send('No Stripe signature provided');
    }

    let event: Stripe.Event;
    const rawBody = await getRawBody(request);

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        endpointSecret
      );
      console.log('✅ Webhook signature verified:', event.type);
    } catch (err: any) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return response.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object;
        console.log(`💰 Checkout Session for ${checkoutSession.amount_total} was successful!`);
        await handleCheckoutSessionCompleted(checkoutSession);
        break;
      case 'checkout.session.expired':
        const expiredSession = event.data.object;
        console.log(`⏰ Checkout Session expired: ${expiredSession.id}`);
        await handleCheckoutSessionExpired(expiredSession);
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`💳 PaymentIntent for ${paymentIntent.amount} was successful!`);
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log(`❌ Payment failed: ${failedPayment.last_payment_error?.message}`);
        break;
      default:
        // Unexpected event type
        console.log(`⚡ Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  } else {
    // No endpoint secret defined - use basic event (not recommended for production)
    console.log('⚠️ No endpoint secret defined - using basic event deserialization');
    const rawBody = await getRawBody(request);
    const event = JSON.parse(rawBody.toString()) as Stripe.Event;
    
    // Handle event without verification (not secure)
    console.log(`Received unverified event: ${event.type}`);
    response.send();
  }
}

// Helper function to get raw body - CRITICAL for signature verification
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Handle successful checkout sessions
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log('🔄 Processing completed checkout session:', session.id);
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