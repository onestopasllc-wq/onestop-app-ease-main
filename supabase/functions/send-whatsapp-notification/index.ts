import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET"
};
console.log('🔔 Stripe Webhook Function initialized');
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
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
      return new Response(JSON.stringify({
        error: "No Stripe signature provided"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
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
      apiVersion: "2025-08-27.basil"
    });
    let event;
    try {
      console.log("Verifying Stripe event signature...");
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log("✅ Event verified successfully:", event.type, event.id);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return new Response(JSON.stringify({
        error: `Webhook signature verification failed: ${err.message}`
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    // Handle the event
    console.log(`Processing event type: ${event.type}`);
    switch(event.type){
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
    return new Response(JSON.stringify({
      received: true,
      event: event.type,
      message: "Webhook processed successfully"
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
async function handleCheckoutSessionCompleted(session, supabaseAdmin) {
  console.log('Processing completed checkout session:', session.id);
  const appointmentId = session.metadata?.appointment_id;
  console.log('Appointment ID from metadata:', appointmentId);
  if (!appointmentId) {
    console.error('No appointment ID found in session metadata');
    return;
  }
  try {
    console.log('Updating appointment in database:', appointmentId);
    // Update appointment payment status
    const { error } = await supabaseAdmin.from('appointments').update({
      payment_status: 'paid',
      stripe_session_id: session.id,
      status: 'confirmed',
      updated_at: new Date().toISOString()
    }).eq('id', appointmentId);
    if (error) {
      console.error('Database update error:', error);
      throw error;
    }
    console.log('✅ Appointment updated successfully');
    // Get the updated appointment for notifications
    const { data: updatedAppointment, error: fetchError } = await supabaseAdmin.from('appointments').select('*').eq('id', appointmentId).single();
    if (!fetchError && updatedAppointment) {
      console.log('Update verified - stripe_session_id:', updatedAppointment.stripe_session_id);
      // Send notifications
      sendPaymentConfirmationEmail(updatedAppointment, supabaseAdmin).catch((err)=>console.error('Email notification failed:', err));
      sendPaymentWhatsAppNotification(updatedAppointment, supabaseAdmin).catch((err)=>console.error('WhatsApp notification failed:', err));
    }
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
    throw error;
  }
}
async function handleCheckoutSessionExpired(session, supabaseAdmin) {
  console.log('Processing expired checkout session:', session.id);
  const appointmentId = session.metadata?.appointment_id;
  if (!appointmentId) return;
  try {
    const { error } = await supabaseAdmin.from('appointments').update({
      payment_status: 'expired',
      status: 'cancelled',
      updated_at: new Date().toISOString()
    }).eq('id', appointmentId);
    if (error) throw error;
    console.log(`Appointment ${appointmentId} marked as expired`);
  } catch (error) {
    console.error('Error in handleCheckoutSessionExpired:', error);
  }
}
async function sendPaymentConfirmationEmail(appointment, supabaseAdmin) {
  try {
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
    if (error) throw error;
    console.log('Payment confirmation email sent');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
async function sendPaymentWhatsAppNotification(appointment, supabaseAdmin) {
  try {
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
    if (error) throw error;
    console.log('WhatsApp notification sent');
  } catch (error) {
    console.error('Failed to send WhatsApp:', error);
  }
}
