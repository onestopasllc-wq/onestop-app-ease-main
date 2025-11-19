//supabase/functions/create-checkout/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET"
};

serve(async (req) => {
  // Handle CORS preflight requests - THIS MUST BE FIRST
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }

  try {
    console.log("=== CREATE-CHECKOUT FUNCTION STARTED ===");
    console.log("Request method:", req.method);
    
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    let appointmentId;
    try {
      const body = JSON.parse(requestBody);
      appointmentId = body.appointmentId;
      console.log("Parsed appointmentId:", appointmentId);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(JSON.stringify({
        error: "Invalid JSON in request body"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    if (!appointmentId) {
      console.error("No appointmentId provided");
      return new Response(JSON.stringify({
        error: "Appointment ID is required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("Stripe key exists:", !!stripeSecretKey);

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }

    // Test if Stripe key is valid format
    if (!stripeSecretKey.startsWith('sk_')) {
      throw new Error("STRIPE_SECRET_KEY appears to be invalid (should start with sk_)");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia"
    });

    const origin = req.headers.get("origin") || "http://localhost:8080";
    console.log("Origin:", origin);
    console.log("Creating Stripe checkout session...");

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Appointment Booking Deposit",
              description: "OneStop Application Services - Appointment Deposit"
            },
            unit_amount: 2500
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${origin}/appointment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/appointment`,
      metadata: {
        appointment_id: appointmentId  // ✅ Perfect - this is what the webhook needs!
      }
    });

    console.log("✅ Checkout session created successfully:", session.id);
    console.log("Checkout URL:", session.url);
    console.log("Session metadata:", session.metadata);

    return new Response(JSON.stringify({
      url: session.url,
      sessionId: session.id
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("❌ Error in create-checkout:", error);
    console.error("Error stack:", error.stack);
    return new Response(JSON.stringify({
      error: error.message,
      type: error.type || "UnknownError"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});