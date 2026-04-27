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

    let supabase: any = null;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    }

    const payload = await req.json().catch(() => ({}));
    let to: string | undefined = payload.to;
    let name: string | undefined = payload.name;
    let appointmentDate: string | undefined = payload.appointmentDate;
    let appointmentTime: string | undefined = payload.appointmentTime;
    let services: string[] | undefined = payload.services;
    const type = payload.type || 'appointment';
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
      
      const skipClientEmail = callerEmail && callerEmail === appointment.email;
      if (skipClientEmail) {
        (payload as any)._skipClientEmail = true;
      }
    }

    // Validation
    if (type === 'appointment') {
      if (!to || !name || !appointmentDate || !appointmentTime || !services) {
        return new Response(JSON.stringify({ error: 'Missing required fields for appointment' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } else if (type === 'rental_subscription') {
      if (!payload.adminEmail && !to) {
        return new Response(JSON.stringify({ error: 'Missing recipient for rental' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } else if (type === 'event_registration') {
      if (!to || !name) {
        return new Response(JSON.stringify({ error: 'Missing recipient for event' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const resend = new Resend(resendApiKey);
    const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'notifications@onestopasllc.com';
    const SENDER_LOGO_URL = Deno.env.get('SENDER_LOGO_URL') || 'https://qhocfxggmhmrbyezmhsg.supabase.co/storage/v1/object/public/LOGO/Application%20Services.png';

    console.log('Processing email type:', type, 'to:', to);

    // 1. Client Email
    if (!(payload as any)._skipClientEmail) {
      let clientHtml = null;
      let clientSubject = "";

      if (type === 'appointment') {
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
                  <p><strong>📅 Date:</strong> ${new Date(appointmentDate!).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>🕐 Time:</strong> ${appointmentTime}</p>
                  <p><strong>📋 Services:</strong></p>
                  <ul>${(services as string[]).map((s: string) => `<li>${s}</li>`).join('')}</ul>
              </div>
              <p>We look forward to helping you achieve your goals!</p>
              <p>Best regards,<br><strong>The OneStop Team</strong></p>
              </div>
              <div class="footer"><p>© ${new Date().getFullYear()} OneStop Application Services LLC</p></div>
          </div>
          </body>
          </html>`;
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
              <div class="info-box">
                  <p><strong>🏠 Listing:</strong> ${payload.listingTitle || 'Rental Listing'}</p>
                  <p><strong>💰 Price:</strong> ${payload.price || '$25.00'}/month</p>
                  <p><strong>ℹ️ Status:</strong> Pending Approval</p>
              </div>
              <p>Your listing has been submitted for review. We will notify you once it is live.</p>
              <p>Best regards,<br><strong>The OneStop Team</strong></p>
              </div>
              <div class="footer"><p>© ${new Date().getFullYear()} OneStop Application Services LLC</p></div>
          </div>
          </body>
          </html>`;
      } else if (type === 'event_registration') {
        clientSubject = "Event Registration Confirmed - OneStop Application Services";
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
                  <h1 style="margin: 0; font-size: 22px;">Registration Confirmed</h1>
                  <p style="margin: 6px 0 0 0;font-size:14px;">OneStop Application Services LLC</p>
              </div>
              </div>
              <div class="content">
              <p>Dear ${name},</p>
              <p><strong>You're registered!</strong> We have received your registration for our upcoming event.</p>
              <div class="info-box">
                  <p><strong>🎟️ Registration Type:</strong> Event Attendee</p>
                  <p><strong>💰 Status:</strong> Paid ($15.00)</p>
                  <p><strong>📍 Location:</strong> ${payload.cityState || 'N/A'}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                  <a href="https://onestopasllc.com/appointment-success?session_id=${payload.sessionId}&type=event" 
                     style="background: #1A365D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                     🎫 View & Download Your Ticket
                  </a>
              </div>
              <p>We look forward to seeing you there!</p>
              <p>Best regards,<br><strong>The OneStop Team</strong></p>
              </div>
              <div class="footer"><p>© ${new Date().getFullYear()} OneStop Application Services LLC</p></div>
          </div>
          </body>
          </html>`;
      }

      if (clientHtml && to) {
        try {
          await resend.emails.send({
            from: SENDER_EMAIL,
            to: [to],
            subject: clientSubject,
            html: clientHtml,
          });
        } catch (err) {
          console.error('Failed to send client email:', err);
        }
      }
    }

    // 2. Internal Notification
    try {
      const teamRecipients = ['Info@onestopasllc.com'];
      let internalSubject = `New Notification: ${name}`;
      let internalHtml = "";

      if (type === 'appointment') {
        internalSubject = `New Appointment: ${name}`;
        internalHtml = `<p>New appointment from <strong>${name}</strong> (${to}) on <strong>${appointmentDate}</strong> at <strong>${appointmentTime}</strong></p><p>Services: ${(services || []).join(', ')}</p>`;
      } else if (type === 'rental_subscription') {
        internalSubject = `New Rental Subscription: ${payload.listingTitle || 'Untitled'}`;
        internalHtml = `<h2>New Rental Subscription</h2><p><strong>User:</strong> ${name} (${to})</p><p><strong>Listing:</strong> ${payload.listingTitle}</p>`;
      } else if (type === 'event_registration') {
        internalSubject = `New Event Registration: ${name}`;
        internalHtml = `<h2>New Event Registration</h2><p><strong>User:</strong> ${name} (${to})</p><p><strong>Phone:</strong> ${payload.phoneNumber || 'N/A'}</p><p><strong>Interests:</strong> ${(payload.areasOfInterest || []).join(', ')}</p>`;
      }

      if (internalHtml) {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: teamRecipients,
          subject: internalSubject,
          html: internalHtml,
        });
      }
    } catch (err) {
      console.error('Failed to send internal notification:', err);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in edge function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
