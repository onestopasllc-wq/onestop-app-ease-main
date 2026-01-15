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
    const type = payload.type || 'appointment'; // default to appointment
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

    // Validation based on type
    if (type === 'appointment') {
      if (!to || !name || !appointmentDate || !appointmentTime || !services) {
        return new Response(JSON.stringify({ error: 'Missing required email fields for appointment' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } else if (type === 'rental_subscription') {
      // For rentals, we mainly need to and name, but let's be flexible
      if (!payload.adminEmail && !to) { // at least one recipient
        return new Response(JSON.stringify({ error: 'Missing recipient' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const resend = new Resend(resendApiKey);

    // Sender email should be a verified address on your verified domain (e.g. notifications@onestopasllc.com)
    const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'notifications@onestopasllc.com';
    // Public logo URL used in emails (must be accessible from the internet)
    const SENDER_LOGO_URL = Deno.env.get('SENDER_LOGO_URL') || 'https://qhocfxggmhmrbyezmhsg.supabase.co/storage/v1/object/public/LOGO/Application%20Services.png';

    console.log('Sending confirmation email to:', to, 'from:', SENDER_EMAIL, 'logo:', SENDER_LOGO_URL);

    // send client email 
    if (!(payload as any)._skipClientEmail) {
      let clientHtml = null;
      let clientSubject = "";

      if (type === 'appointment') {
        if (!appointmentDate || !appointmentTime || !services) {
          console.error("Skipping client email due to missing appointment details");
        } else {
          clientSubject = "Appointment Confirmation - OneStop Application Services LLC";
          clientHtml = `<!DOCTYPE html>
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
        }
      } else if (type === 'rental_subscription') {
        clientSubject = "Rental Listing Received - OneStop Application Services";
        clientHtml = `<!DOCTYPE html>
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
                    <h1 style="margin: 0; font-size: 22px;">Payment Received</h1>
                    <p style="margin: 6px 0 0 0;font-size:14px;">OneStop Application Services LLC</p>
                </div>
                </div>
                <div class="content">
                <p>Dear ${name},</p>
                <p><strong>Thank you for listing with OneStop Application Services LLC!</strong></p>
                <p>We have received your subscription payment for the following listing:</p>
                <div class="info-box">
                    <p><strong>🏠 Listing:</strong> ${payload.listingTitle || 'Rental Listing'}</p>
                    <p><strong>💰 Price:</strong> ${payload.price || '$25.00'}/month</p>
                    <p><strong>ℹ️ Status:</strong> <span style="color: #d97706; font-weight: bold;">Pending Approval</span></p>
                </div>
                <p>Your listing has been submitted to our team for review. You will receive another notification once it has been approved and is live on our platform.</p>
                <p>You can manage your subscription and listing from your dashboard.</p>
                <p>Best regards,<br><strong>The OneStop Team</strong></p>
                </div>
                <div class="footer">
                <p>© ${new Date().getFullYear()} OneStop Application Services LLC</p>
                </div>
            </div>
            </body>
            </html>`;
      }

      if (clientHtml) {
        try {
          const clientRes = await resend.emails.send({
            from: `${SENDER_EMAIL}`,
            to: [to!],
            subject: clientSubject,
            html: clientHtml,
          });
          console.log('Resend client send response:', JSON.stringify(clientRes));
        } catch (sendErr: any) {
          console.error('Resend client send failed:', sendErr?.message || sendErr);
          // Don't fail hard here, we still want to try sending internal email
        }
      } else {
        console.log('No client HTML generated for type:', type);
      }
    } else {
      console.log('Client email send explicitly skipped');
    }

    // send internal notification to team
    try {
      const teamRecipients = [
        'onestopapplicationservicesllc@gmail.com',
        'onestopasllc@gmail.com'
      ];

      let subject = `New Appointment: ${name}`;
      let internalHtml = `<p>New appointment from <strong>${name}</strong> (${to}) on <strong>${appointmentDate}</strong> at <strong>${appointmentTime}</strong></p><p>Services: ${(services as string[] || []).join(', ')}</p><p>File URL: ${payload.fileUrl || 'N/A'}</p>`;

      if (type === 'rental_subscription') {
        subject = `New Rental Subscription: ${payload.listingTitle || 'Untitled Listing'}`;
        internalHtml = `
            <h2>New Rental Subscription Started</h2>
            <p><strong>User:</strong> ${name || 'N/A'} (${to || 'N/A'})</p>
            <p><strong>Listing:</strong> ${payload.listingTitle}</p>
            <p><strong>Price:</strong> ${payload.price}</p>
            <p><strong>Listing ID:</strong> ${payload.listingId}</p>
            <br/>
            <p>Please review the listing in the admin dashboard.</p>
          `;
      }

      const internalRes = await resend.emails.send({
        from: `${SENDER_EMAIL}`,
        to: teamRecipients,
        subject: subject,
        html: internalHtml,
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
