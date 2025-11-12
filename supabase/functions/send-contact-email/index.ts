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
    const { name, email, message } = await req.json();

    await resend.emails.send({
      from: "OneStop Contact Form <onboarding@resend.dev>",
      to: ["onestopapplicationservicesllc@gmail.com"],
      replyTo: email,
      subject: `New Contact: ${name}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong></p><p>${message}</p>`,
    });

    await resend.emails.send({
      from: "OneStop Application Services <onboarding@resend.dev>",
      to: [email],
      subject: "We Received Your Message",
      html: `<p>Dear ${name},</p><p>Thank you for contacting us. We'll respond within 24 hours.</p><p>Best regards,<br>The OneStop Team</p>`,
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
