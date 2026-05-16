import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, email, registrationData, eventId } = await req.json();

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY not set");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase credentials not set");

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ STEP 0: Validate Event Status
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('status, registration_deadline')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: "Event not found." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (event.status !== 'active' || new Date() > new Date(event.registration_deadline)) {
      return new Response(JSON.stringify({ error: "Registration is closed." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-11-20.acacia" });

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 3000,
      currency: "usd",
      receipt_email: email,
      metadata: {
        type: "event_registration",
        event_id: eventId,
        full_name: registrationData.full_name,
        email: email,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
