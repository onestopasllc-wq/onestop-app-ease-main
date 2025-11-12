import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    const adminNumber = Deno.env.get('ADMIN_WHATSAPP_NUMBER');

    if (!token || !phoneNumberId || !adminNumber) {
      throw new Error('WhatsApp credentials not configured');
    }

    const { customerName, email, phone, services, date, time, description } = await req.json();

    const message = `🔔 *New Appointment Booking*

👤 *Customer:* ${customerName}
📧 *Email:* ${email}
📱 *Phone:* ${phone}

📅 *Date:* ${date}
🕐 *Time:* ${time}

📋 *Services:*
${services.map((s: string) => `• ${s}`).join('\n')}

${description ? `📝 *Details:*\n${description}` : ''}`;

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: adminNumber.replace(/\D/g, ''),
          type: 'text',
          text: { body: message },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      throw new Error(`WhatsApp API error: ${JSON.stringify(data)}`);
    }

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
