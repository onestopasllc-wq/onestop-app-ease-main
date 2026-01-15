import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET"
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: corsHeaders
        });
    }

    try {
        console.log("=== CREATE-RENTAL-CHECKOUT FUNCTION STARTED ===");

        const requestBody = await req.text();
        let listingData;

        try {
            const body = JSON.parse(requestBody);
            listingData = body.listingData;
            console.log("Parsed listingData present:", !!listingData);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (!listingData) {
            return new Response(JSON.stringify({ error: "Listing data is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeSecretKey) {
            throw new Error("STRIPE_SECRET_KEY environment variable is not set");
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: "2024-11-20.acacia" // Matching version from create-checkout
        });

        const origin = req.headers.get("origin") || "http://localhost:8080";
        console.log("Origin:", origin);

        // Helper to chunk data for Stripe metadata (500 char limit)
        const chunkData = (data: any) => {
            const str = JSON.stringify(data);
            const chunks: Record<string, string> = {};
            const chunkSize = 450; // Leave some buffer

            for (let i = 0; i < str.length; i += chunkSize) {
                chunks[`data_chunk_${Math.floor(i / chunkSize)}`] = str.slice(i, i + chunkSize);
            }
            return chunks;
        };

        const metadata = {
            type: "rental_listing",
            user_id: listingData.user_id,
            ...chunkData(listingData)
        };

        console.log("Creating Stripe subscription checkout session...");

        // Create checkout session for subscription
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Rental Listing Subscription",
                            description: `Monthly listing for: ${listingData.title}`
                        },
                        unit_amount: 2500, // $25.00
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: "subscription", // Recurring payment
            success_url: `${origin}/dashboard/listings?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${origin}/dashboard/rentals/new`,
            metadata,
            customer_email: listingData.contact_email, // Prefill if available
        });

        console.log("✅ Rental Subscription Session created:", session.id);

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
        console.error("❌ Error in create-rental-checkout:", error);
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
