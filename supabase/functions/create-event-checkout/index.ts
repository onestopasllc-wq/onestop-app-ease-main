import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

console.log("Event Registration Checkout function initialized");

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    console.log("Request body received:", requestBody);

    if (!requestBody) {
      throw new Error("Empty request body");
    }

    let registrationData;
    try {
      const body = JSON.parse(requestBody);
      registrationData = body.registrationData;
      console.log("Parsed registrationData:", registrationData ? "present" : "missing");
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

    if (!registrationData) {
      console.error("No registrationData provided");
      return new Response(JSON.stringify({
        error: "Registration data is required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia"
    });

    const origin = req.headers.get("origin") || "http://localhost:8080";

    console.log("Creating Stripe checkout session for event registration...");

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Event Registration Fee",
              description: "Registration for OneStop Application Services Event"
            },
            unit_amount: 1500 // $15
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${origin}/appointment-success?session_id={CHECKOUT_SESSION_ID}&type=event`,
      cancel_url: `${origin}/event-registration`,
      metadata: {
        type: "event_registration",
        registration_data: JSON.stringify(registrationData),
        customer_name: registrationData.full_name,
        customer_phone: registrationData.phone_number,
      },
    });

    console.log("✅ Event Checkout session created successfully:", session.id);

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

  } catch (error: any) {
    console.error("Error creating event checkout session:", error.message);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
    });
  }
});
