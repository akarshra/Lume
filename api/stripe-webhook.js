import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export const config = {
  api: {
    bodyParser: false,
  },
};

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
};

const readRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    if (!stripe || !webhookSecret) {
      return res.status(503).json({ error: { message: 'Stripe webhook is not configured.' } });
    }

    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: { message: 'Missing Stripe signature header.' } });
    }

    const rawBody = await readRawBody(req);
    let event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      console.error('Stripe webhook signature verification failed:', error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Stripe webhook: payment_intent.succeeded', event.data.object.id, event.data.object.metadata || {});
        break;
      case 'payment_intent.payment_failed':
        console.log('Stripe webhook: payment_intent.payment_failed', event.data.object.id);
        break;
      case 'checkout.session.completed':
        console.log('Stripe webhook: checkout.session.completed', event.data.object.id, event.data.object.metadata || {});
        break;
      default:
        console.log(`Stripe webhook: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook handler error:', error);
    return res.status(500).json({ error: { message: error.message } });
  }
}
