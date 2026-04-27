import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

console.log("Event Registration Checkout function initialized");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    if (!requestBody) throw new Error("Empty request body");

    let registrationData: any;
    try {
      const body = JSON.parse(requestBody);
      registrationData = body.registrationData;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!registrationData) {
      return new Response(JSON.stringify({ error: "Registration data is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY not set");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase credentials not set");

    // ✅ STEP 1: Save registration to DB first with 'pending' status
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: pendingReg, error: insertError } = await supabaseAdmin
      .from("event_registrations")
      .insert({
        full_name: registrationData.full_name,
        email: registrationData.email,
        phone_number: registrationData.phone_number,
        areas_of_interest: registrationData.areas_of_interest || [],
        other_interest: registrationData.other_interest || null,
        city_state: registrationData.city_state,
        payment_status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Failed to pre-save registration:", insertError);
      throw new Error("Failed to save registration: " + insertError.message);
    }
    console.log("✅ Pre-saved registration ID:", pendingReg.id);

    // ✅ STEP 2: Create Stripe session with only the small registration ID in metadata
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-11-20.acacia" });
    const origin = req.headers.get("origin") || "https://onestopasllc.com";

    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "Event Registration Fee",
            description: "Registration for OneStop Application Services Event"
          },
          unit_amount: 50 // $0.50 for testing
        },
        quantity: 1
      }],
      mode: "payment",
      customer_email: registrationData.email,
      success_url: `${origin}/appointment-success?session_id={CHECKOUT_SESSION_ID}&type=event`,
      cancel_url: `${origin}/event-registration`,
      metadata: {
        type: "event_registration",
        registration_id: pendingReg.id, // ✅ Just the ID — stays well under 500 chars
      },
    });

    // ✅ STEP 3: Update the registration with the stripe session ID
    await supabaseAdmin
      .from("event_registrations")
      .update({ stripe_session_id: session.id })
      .eq("id", pendingReg.id);

    console.log("✅ Event Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    console.error("Error creating event checkout session:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
