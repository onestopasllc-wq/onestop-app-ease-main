import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * SECURE unified payment verification function.
 * The mobile frontend sends a session_id → this function calls Stripe directly to
 * confirm the payment is real → returns status to unlock the UI.
 * The actual database updates and emails are handled asynchronously by the robust stripe-webhook.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "sessionId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeSecretKey) {
      throw new Error("Missing server environment variables");
    }

    // ✅ STEP 1: Verify with Stripe directly — cannot be faked by a user
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-11-20.acacia" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("Stripe session status:", session.payment_status, "| type:", session.metadata?.type);

    // For subscriptions, payment_status is 'paid' for the initial invoice
    // We check both payment_status and general status just to be safe
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return new Response(JSON.stringify({ 
        error: "Payment not confirmed by Stripe",
        payment_status: session.payment_status,
        status: session.status
      }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Return success to the mobile app
    return new Response(JSON.stringify({ 
      verified: true, 
      type: session.metadata?.type || 'unknown',
      payment_status: session.payment_status,
      session_id: session.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("verify-payment error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
