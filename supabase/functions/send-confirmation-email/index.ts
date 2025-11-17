import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY missing in function env');
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Prepare Supabase admin client if caller provides an appointmentId
    let supabase: any = null;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    }

    const payload = await req.json().catch(() => ({}));

  // Support two invocation shapes:
    // 1) Full payload { to, name, appointmentDate, appointmentTime, services }
    // 2) { appointmentId } - function will fetch appointment details from DB
    let to: string | undefined = payload.to;
    let name: string | undefined = payload.name;
    let appointmentDate: string | undefined = payload.appointmentDate;
    let appointmentTime: string | undefined = payload.appointmentTime;
    let services: string[] | undefined = payload.services;
  // optional caller/admin email (used to avoid emailing the admin who triggered a reminder)
  const callerEmail: string | undefined = payload.callerEmail;

    if (payload.appointmentId) {
      if (!supabase) {
        return new Response(JSON.stringify({ error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { data: appointment, error: fetchErr } = await supabase
        .from('appointments')
        .select('full_name, email, appointment_date, appointment_time, services')
        .eq('id', payload.appointmentId)
        .maybeSingle();

      if (fetchErr || !appointment) {
        console.error('Appointment lookup failed', fetchErr);
        return new Response(JSON.stringify({ error: 'Appointment not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      to = appointment.email;
      name = appointment.full_name;
      appointmentDate = appointment.appointment_date;
      appointmentTime = appointment.appointment_time;
      services = appointment.services;
      // If the request included a callerEmail and it matches the appointment email,
      // we will skip sending the client email (admin likely triggered the reminder)
      const skipClientEmail = callerEmail && callerEmail === appointment.email;
      if (skipClientEmail) console.log('Skipping client email because callerEmail matches appointment email', { callerEmail, appointmentId: payload.appointmentId });
      // Attach skip flag to payload so later logic can reference it
      (payload as any)._skipClientEmail = !!skipClientEmail;
    }

    if (!to || !name || !appointmentDate || !appointmentTime || !services) {
      return new Response(JSON.stringify({ error: 'Missing required email fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  const resend = new Resend(resendApiKey);

  // Sender email should be a verified address on your verified domain (e.g. notifications@onestopasllc.com)
  const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'notifications@onestopasllc.com';
  // Public logo URL used in emails (must be accessible from the internet)
  const SENDER_LOGO_URL = Deno.env.get('SENDER_LOGO_URL') || 'https://qhocfxggmhmrbyezmhsg.supabase.co/storage/v1/object/public/LOGO/Application%20Services.png';

  console.log('Sending confirmation email to:', to, 'from:', SENDER_EMAIL, 'logo:', SENDER_LOGO_URL);

  const html = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Lato', sans-serif; line-height: 1.6; color: #1A365D; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1A365D, #00B5AD); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
        .info-box { background: #F5F6FA; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00B5AD; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="display:flex;align-items:center;gap:16px;">
          <img src="${SENDER_LOGO_URL}" alt="OneStop logo" style="height:56px;width:auto;border-radius:6px;object-fit:contain;" />
          <div>
            <h1 style="margin: 0; font-size: 22px;">Appointment Confirmed</h1>
            <p style="margin: 6px 0 0 0;font-size:14px;">OneStop Application Services LLC</p>
          </div>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p><strong>Thank you for booking with OneStop Application Services LLC!</strong></p>
          <div class="info-box">
            <p><strong>📅 Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>🕐 Time:</strong> ${appointmentTime}</p>
            <p><strong>📋 Services:</strong></p>
            <ul>${(services as string[]).map((s: string) => `<li>${s}</li>`).join('')}</ul>
          </div>
          <p>We look forward to helping you achieve your goals!</p>
          <p>Best regards,<br><strong>The OneStop Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} OneStop Application Services LLC</p>
        </div>
      </div>
    </body>
    </html>`;

    // send client email (unless explicitly skipped because caller/admin matches the client)
    if (!(payload as any)._skipClientEmail) {
      try {
        const clientRes = await resend.emails.send({
          from: `${SENDER_EMAIL}`,
          to: [to],
          subject: "Appointment Confirmation - OneStop Application Services LLC",
          html,
        });
        console.log('Resend client send response:', JSON.stringify(clientRes));
      } catch (sendErr: any) {
        console.error('Resend client send failed:', sendErr?.message || sendErr);
        return new Response(JSON.stringify({ error: 'Failed to send client email', details: String(sendErr) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } else {
      console.log('Client email send skipped for appointmentId:', payload.appointmentId || '(unknown)');
    }

    // send internal notification to team (include both addresses)
    try {
      const teamRecipients = [
        'onestopapplicationservicesllc@gmail.com',
        'onestopasllc@gmail.com'
      ];

      const internalRes = await resend.emails.send({
        from: `${SENDER_EMAIL}`,
        to: teamRecipients,
        subject: `New Appointment: ${name}`,
        html: `<p>New appointment from <strong>${name}</strong> (${to}) on <strong>${appointmentDate}</strong> at <strong>${appointmentTime}</strong></p><p>Services: ${(services as string[]).join(', ')}</p><p>File URL: ${payload.fileUrl || 'N/A'}</p>`,
      });
      console.log('Resend internal send response:', JSON.stringify(internalRes));
    } catch (sendErr: any) {
      console.error('Resend internal send failed:', sendErr?.message || sendErr);
      // don't fail the entire function if internal notification fails; just log
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in send-confirmation-email:', error);
    // If the error is an object with a message property that looks like JSON, try to return it as JSON
    let message = error?.message || String(error);
    try {
      const parsed = JSON.parse(message);
      return new Response(JSON.stringify({ error: parsed }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch {
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
});
