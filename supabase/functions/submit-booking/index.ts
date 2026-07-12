// supabase/functions/submit-booking/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      full_name,
      email,
      phone,
      contact_method,
      services,
      description,
      appointment_date,
      appointment_time,
      file_url,
      how_heard,
      location,
      state,
      city,
    } = body;

    // Basic validation
    if (!full_name || !email || !appointment_date || !appointment_time || !services?.length) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert appointment directly – no payment required
    const { data: appointment, error: insertError } = await supabase
      .from("appointments")
      .insert({
        full_name,
        email,
        phone: phone || null,
        contact_method,
        services,
        description: description || null,
        appointment_date,
        appointment_time,
        file_url: file_url || null,
        how_heard: how_heard || null,
        location: location || "Virtual",
        state: state || null,
        city: city || null,
        payment_status: "free",
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    console.log("Appointment created:", appointment.id);

    // Send confirmation email to user + admin notification
    try {
      await supabase.functions.invoke("send-confirmation-email", {
        body: {
          type: "appointment",
          to: email,
          name: full_name,
          appointmentDate: appointment_date,
          appointmentTime: appointment_time,
          services,
          appointmentId: appointment.id,
          phone: phone || "Not provided",
          location: location || "Virtual",
          state: state || "",
          city: city || "",
          description: description || "",
          how_heard: how_heard || "",
          contact_method,
        },
      });
    } catch (emailErr) {
      // Don't fail the booking if email fails
      console.error("Email send failed (non-fatal):", emailErr);
    }

    return new Response(
      JSON.stringify({ success: true, appointmentId: appointment.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("submit-booking error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
