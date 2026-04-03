import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
    if (!stripe) {
      return res.status(503).json({ error: { message: 'STRIPE_SECRET_KEY is not configured.' } });
    }

    const { items, isCustom, metadata = {} } = req.body || {};
    const totalAmountStr = items?.[0]?.price ?? '0';
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
        address: metadata.address || '',
        occasion: metadata.occasion || '',
        size: metadata.size || '',
        user_id: metadata.userId || '',
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    return res.status(400).json({ error: { message: error.message } });
  }
}
