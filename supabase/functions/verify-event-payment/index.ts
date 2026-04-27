import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * SECURE payment verification function.
 * The frontend sends a session_id → this function calls Stripe directly to
 * confirm the payment is real → only then updates the DB and sends email.
 * 
 * Security: The Stripe secret key never leaves the server. A user cannot
 * fake a payment because they'd need Stripe's signature to pass verification.
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing server environment variables");
    }

    // ✅ STEP 1: Verify with Stripe directly — cannot be faked by a user
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-11-20.acacia" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("Stripe session status:", session.payment_status, "| type:", session.metadata?.type);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        error: "Payment not confirmed by Stripe",
        payment_status: session.payment_status
      }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ✅ STEP 2: Only handle event registrations here
    if (session.metadata?.type !== "event_registration") {
      return new Response(JSON.stringify({ verified: true, type: "other" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ✅ STEP 3: Use service role (admin) key — never exposed to browser
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Look up the registration
    const { data: registration, error: fetchError } = await supabaseAdmin
      .from("event_registrations")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (fetchError || !registration) {
      // Try by registration_id from metadata
      const regId = session.metadata?.registration_id;
      if (!regId) {
        throw new Error("Registration not found");
      }

      const { data: regById } = await supabaseAdmin
        .from("event_registrations")
        .select("*")
        .eq("id", regId)
        .maybeSingle();

      if (!regById) throw new Error("Registration not found for ID: " + regId);

      // Update it
      if (regById.payment_status !== "paid") {
        await supabaseAdmin
          .from("event_registrations")
          .update({ payment_status: "paid", stripe_session_id: sessionId })
          .eq("id", regId);

        // Trigger email
        await supabaseAdmin.functions.invoke("send-confirmation-email", {
          body: {
            type: "event_registration",
            to: regById.email,
            name: regById.full_name,
            areasOfInterest: regById.areas_of_interest,
            cityState: regById.city_state,
            phoneNumber: regById.phone_number,
            sessionId,
          }
        }).catch(console.error);
      }

      return new Response(JSON.stringify({ verified: true, registration: { ...regById, payment_status: "paid" } }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Already found by session_id — update if still pending
    if (registration.payment_status !== "paid") {
      await supabaseAdmin
        .from("event_registrations")
        .update({ payment_status: "paid" })
        .eq("id", registration.id);

      registration.payment_status = "paid";

      await supabaseAdmin.functions.invoke("send-confirmation-email", {
        body: {
          type: "event_registration",
          to: registration.email,
          name: registration.full_name,
          areasOfInterest: registration.areas_of_interest,
          cityState: registration.city_state,
          phoneNumber: registration.phone_number,
          sessionId,
        }
      }).catch(console.error);
    }

    return new Response(JSON.stringify({ verified: true, registration }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("verify-event-payment error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
