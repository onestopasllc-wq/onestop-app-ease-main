import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resend = new Resend(resendApiKey);
    const { to, name, appointmentDate, appointmentTime, services } = await req.json();

    console.log('Sending confirmation email to:', to);

    const clientEmail = await resend.emails.send({
      from: "OneStop Application Services <onboarding@resend.dev>",
      to: [to],
      subject: "Appointment Confirmation - OneStop Application Services LLC",
      html: `
        <!DOCTYPE html>
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
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎓 Appointment Confirmed!</h1>
              <p style="margin: 10px 0 0 0;">OneStop Application Services LLC</p>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p><strong>Thank you for booking with OneStop Application Services LLC!</strong></p>
              <div class="info-box">
                <p><strong>📅 Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>🕐 Time:</strong> ${appointmentTime}</p>
                <p><strong>📋 Services:</strong></p>
                <ul>${services.map((s: string) => `<li>${s}</li>`).join('')}</ul>
              </div>
              <p>We look forward to helping you achieve your goals!</p>
              <p>Best regards,<br><strong>The OneStop Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} OneStop Application Services LLC</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    const companyEmail = await resend.emails.send({
      from: "OneStop Notifications <onboarding@resend.dev>",
      to: ["onestopapplicationservicesllc@gmail.com"],
      subject: `New Appointment: ${name}`,
      html: `<p>New appointment from ${name} (${to}) on ${appointmentDate} at ${appointmentTime}</p><p>Services: ${services.join(', ')}</p>`,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
