import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Types matching your existing appointments schema (partial)
interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  appointment_date: string;
  appointment_time: string;
  services: string[];
  description?: string | null;
  payment_status?: string | null;
  status?: string | null;
  stripe_session_id?: string | null;
  created_at?: string;
}

// Initialize Stripe with API version compatible with your code
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-08-27.basil' as any,
});

// Supabase admin client (service role key required for server-side updates)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { persistSession: false } }
);

// CORS headers to return on all responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, API-Key, Content-Type, Stripe-Signature',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Quick debug: log incoming request method/url and incoming Stripe signature header
  // This helps diagnose 405s where a POST may be converted to GET by a redirect or middleware
  try {
    console.log('Incoming webhook request', {
      method: req.method,
      url: (req as any).url || req.url,
      stripeSignature: req.headers['stripe-signature'] || req.headers['Stripe-Signature'] || null,
    });
  } catch (err) {
    console.error('Failed to log incoming request info', err);
  }

  // Always return CORS for preflight and regular responses
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = (req.headers['stripe-signature'] as string) || req.headers['Stripe-Signature'] as string;
  if (!signature) {
    console.error('No Stripe signature header present');
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SIGNING_SECRET as string);
    console.log('✔️  Stripe webhook verified:', event.type, event.id);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err?.message || err);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err?.message || err}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook event:', error);
    return res.status(500).json({ error: 'Webhook handling failed' });
  }
}

// Helper: read raw body buffer from VercelRequest
function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    // The incoming message is a Node IncomingMessage
    // @ts-ignore
    const stream = req as unknown as NodeJS.ReadableStream;
    stream.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('💰 checkout.session.completed, session id:', session.id, 'metadata:', session.metadata);

  // Prefer appointment_id in metadata
  let appointmentId = session.metadata?.appointment_id || session.client_reference_id || null;

  // If we don't have appointmentId, attempt to fetch full session from Stripe (robustness)
  if (!appointmentId) {
    try {
      const fetched = await stripe.checkout.sessions.retrieve(session.id as string);
      appointmentId = fetched.metadata?.appointment_id || fetched.client_reference_id || null;
      session = fetched;
      console.log('Fetched session from Stripe for metadata lookup:', fetched.id, fetched.metadata);
    } catch (err) {
      console.error('Failed to retrieve session from Stripe:', err);
    }
  }

  // Fallback: try looking up appointment by stripe_session_id in the DB
  if (!appointmentId) {
    try {
      console.log('Attempting fallback DB lookup by stripe_session_id:', session.id);
      const { data: found, error: findErr } = await supabaseAdmin
        .from('appointments')
        .select('id')
        .eq('stripe_session_id', session.id as string)
        .limit(1)
        .maybeSingle();

      if (findErr) {
        console.error('Error querying appointment by stripe_session_id:', findErr);
      } else if (found) {
        appointmentId = (found as any).id as string;
        console.log('Found appointment by stripe_session_id:', appointmentId);
      }
    } catch (err) {
      console.error('Fallback DB lookup failed:', err);
    }
  }

  if (!appointmentId) {
    console.error('No appointment id found for session, cannot update DB');
    return;
  }

  // Normalize id
  appointmentId = String(appointmentId).trim();

  // Update appointment row
  try {
    const { data: updated, error } = await supabaseAdmin
      .from('appointments')
      .update({ payment_status: 'paid', stripe_session_id: session.id as string, status: 'confirmed' })
      .eq('id', appointmentId)
      .select();

    if (error) {
      console.error('Error updating appointment:', error);
      return;
    }

    if (!updated || (Array.isArray(updated) && updated.length === 0)) {
      console.warn('No rows updated for appointment id:', appointmentId);
    } else {
      console.log('Appointment updated to paid:', appointmentId);
    }

    // Fire notifications via existing Edge Functions (non-blocking)
    try {
      await supabaseAdmin.functions.invoke('send-confirmation-email', {
        body: {
          to: (updated && Array.isArray(updated) ? updated[0].email : undefined) || null,
          name: (updated && Array.isArray(updated) ? updated[0].full_name : undefined) || null,
          appointmentDate: (updated && Array.isArray(updated) ? updated[0].appointment_date : undefined) || null,
          appointmentTime: (updated && Array.isArray(updated) ? updated[0].appointment_time : undefined) || null,
          services: (updated && Array.isArray(updated) ? updated[0].services : undefined) || []
        }
      });
    } catch (err) {
      console.error('Failed invoking confirmation email function:', err);
    }

    try {
      await supabaseAdmin.functions.invoke('send-whatsapp-notification', {
        body: {
          customerName: (updated && Array.isArray(updated) ? updated[0].full_name : undefined) || '',
          email: (updated && Array.isArray(updated) ? updated[0].email : undefined) || '',
          phone: (updated && Array.isArray(updated) ? updated[0].phone : undefined) || 'Not provided',
          services: (updated && Array.isArray(updated) ? updated[0].services : undefined) || [],
          date: (updated && Array.isArray(updated) ? updated[0].appointment_date : undefined) || '',
          time: (updated && Array.isArray(updated) ? updated[0].appointment_time : undefined) || '',
          description: (updated && Array.isArray(updated) ? updated[0].description : undefined) || ''
        }
      });
    } catch (err) {
      console.error('Failed invoking WhatsApp function:', err);
    }

  } catch (err) {
    console.error('Unhandled error updating appointment:', err);
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('⌛ checkout.session.expired, session id:', session.id);
  let appointmentId = session.metadata?.appointment_id || session.client_reference_id || null;

  if (!appointmentId) {
    console.log('No appointment id in metadata for expired session, skipping');
    return;
  }

  try {
    const { error } = await supabaseAdmin
      .from('appointments')
      .update({ payment_status: 'expired', status: 'cancelled' })
      .eq('id', appointmentId);

    if (error) console.error('Error marking appointment expired:', error);
    else console.log('Appointment marked expired:', appointmentId);
  } catch (err) {
    console.error('Unhandled error marking expired:', err);
  }
}
