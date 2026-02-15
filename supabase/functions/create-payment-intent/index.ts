import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET"
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { bookingData } = await req.json();

        if (!bookingData) {
            throw new Error("Booking data is required");
        }

        const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeSecretKey) {
            throw new Error("STRIPE_SECRET_KEY is not set");
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: "2024-11-20.acacia"
        });

        // Create a PaymentIntent with the amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 7500, // $75.00
            currency: "usd",
            metadata: {
                booking_data: JSON.stringify(bookingData),
                customer_email: bookingData.email,
                customer_name: bookingData.full_name,
                appointment_date: bookingData.appointment_date,
                appointment_time: bookingData.appointment_time,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return new Response(
            JSON.stringify({
                paymentIntent: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                publishableKey: Deno.env.get("STRIPE_PUBLISHABLE_KEY"),
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
});
