// supabase/functions/admin-appointments/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// Function to verify JWT and check admin role
async function verifyAdmin(authHeader: string | null) {
  if (!authHeader) {
    return { error: "Missing authorization header" };
  }

  const token = authHeader.replace("Bearer ", "");
  
  // Verify the JWT token
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { error: "Invalid token" };
  }

  // Check if user has admin role
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError || !roleData) {
    return { error: "Admin access required" };
  }

  return { user };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify admin access for all endpoints
    const authHeader = req.headers.get("Authorization");
    const adminCheck = await verifyAdmin(authHeader);
    
    if (adminCheck.error) {
      return new Response(
        JSON.stringify({ success: false, error: adminCheck.error }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const raw = await req.text();
    let body: any = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }
    const action = (body.action || "get").toString();

    // ---------- GET appointments (all)
    if (action === "get") {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ---------- UPDATE appointment
    if (action === "update") {
      const { id, data } = body;
      if (!id || !data) {
        return new Response(JSON.stringify({ success: false, error: "Missing id or data" }), { status: 400, headers: corsHeaders });
      }

      const { data: updated, error } = await supabase
        .from("appointments")
        .update(data)
        .eq("id", id)
        .select()
        .limit(1);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data: updated }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ---------- DELETE appointment(s)
    if (action === "delete") {
      const { id, ids } = body;
      if (!id && !(ids && Array.isArray(ids) && ids.length)) {
        return new Response(JSON.stringify({ success: false, error: "Missing id or ids" }), { status: 400, headers: corsHeaders });
      }

      let query = supabase.from("appointments").delete().select("*");
      if (ids && Array.isArray(ids)) {
        query = query.in("id", ids);
      } else {
        query = query.eq("id", id);
      }

      const { data: deleted, error } = await query;
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data: deleted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ---------- WORKING HOURS
    if (action === "get-working-hours") {
      const { data, error } = await supabase.from("working_hours").select("*").order("day_of_week");
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    if (action === "update-working-hour") {
      const { id, field, value } = body;
      if (!id || !field) return new Response(JSON.stringify({ success: false, error: "Missing id/field" }), { status: 400, headers: corsHeaders });

      const { data: updated, error } = await supabase
        .from("working_hours")
        .update({ [field]: value })
        .eq("id", id)
        .select();
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data: updated }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    // ---------- BLOCKED DATES
    if (action === "get-blocked-dates") {
      const { data, error } = await supabase.from("blocked_dates").select("*").order("blocked_date");
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    if (action === "add-blocked-date") {
      const { blocked_date, reason } = body;
      if (!blocked_date) return new Response(JSON.stringify({ success: false, error: "Missing blocked_date" }), { status: 400, headers: corsHeaders });
      const { data: inserted, error } = await supabase.from("blocked_dates").insert({ blocked_date, reason }).select();
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data: inserted }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    if (action === "delete-blocked-date") {
      const { id } = body;
      if (!id) return new Response(JSON.stringify({ success: false, error: "Missing id" }), { status: 400, headers: corsHeaders });
      const { data: deleted, error } = await supabase.from("blocked_dates").delete().eq("id", id).select();
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data: deleted }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    // ---------- SEND REMINDER
    if (action === "send-reminder") {
      const { appointmentId } = body;
      if (!appointmentId) return new Response(JSON.stringify({ success: false, error: "Missing appointmentId" }), { status: 400, headers: corsHeaders });

      // We invoke existing function (make sure it exists and is deployed)
      const invokeRes = await supabase.functions.invoke("send-confirmation-email", {
        body: JSON.stringify({ appointmentId }),
      });

      if ((invokeRes as any).error) throw (invokeRes as any).error;
      return new Response(JSON.stringify({ success: true, data: invokeRes }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    return new Response(JSON.stringify({ success: false, error: "Unknown action" }), { status: 400, headers: corsHeaders });
  } catch (err: any) {
    console.error("admin-appointments error:", err);
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }});
  }
});