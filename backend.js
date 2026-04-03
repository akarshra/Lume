import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env.local') });

const app = express();
const port = process.env.PORT || 5003;
const stripeKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeKey) {
  console.warn('WARNING: STRIPE_SECRET_KEY is missing from .env.local!');
}

if (!webhookSecret) {
  console.warn('WARNING: STRIPE_WEBHOOK_SECRET is missing from .env.local!');
}

const stripe = stripeKey ? new Stripe(stripeKey) : null;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    if (!stripe || !webhookSecret) {
      return res.status(503).json({ error: { message: 'Stripe webhook is not configured on the payment server.' } });
    }

    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: { message: 'Missing Stripe signature header.' } });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
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

    return res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook handler error:', error);
    return res.status(500).json({ error: { message: error.message } });
  }
});

app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: { message: 'Stripe secret key is not configured on the payment server.' } });
    }

    const { items, isCustom, metadata = {} } = req.body;

    let totalAmountStr = (items && items[0]) ? items[0].price : '0';
    let rawAmount = 0;

    if (typeof totalAmountStr === 'string') {
      const parsed = Number(totalAmountStr.replace(/[^0-9.-]+/g, ''));
      rawAmount = parseInt((parsed * 100).toString(), 10);
    } else {
      rawAmount = parseInt((totalAmountStr * 100).toString(), 10);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: isCustom ? 100000 : (rawAmount > 0 ? rawAmount : 5000),
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
      metadata: {
        source: metadata.source || 'lume-app',
        order_type: metadata.orderType || (isCustom ? 'custom' : 'cart'),
        customer_name: metadata.customerName || '',
        customer_phone: metadata.phone || '',
        user_id: metadata.userId || '',
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(400).json({ error: { message: error.message } });
  }
});

app.listen(port, () => {
  console.log(`✅ Secure Payment Server running locally on http://localhost:${port}`);
  console.log('Ready to process Stripe Payments and webhooks!');
});
