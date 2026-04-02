import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load the .env.local variables like VITE_SUPABASE_URL and STRIPE_SECRET_KEY
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env.local') });

const app = express();
const port = 5002;

app.use(cors());
app.use(express.json());

// Initialize Stripe Secret Key
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.warn("WARNING: STRIPE_SECRET_KEY is missing from .env.local!");
}
const stripe = stripeKey ? new Stripe(stripeKey) : null;

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: { message: 'Stripe secret key is not configured on the payment server.' } });
    }

    const { items, isCustom } = req.body;

    // Parse the totalAmountStr which comes in like "₹1,987"
    let totalAmountStr = (items && items[0]) ? items[0].price : "0";
    let rawAmount = 0;

    if (typeof totalAmountStr === 'string') {
      const parsed = Number(totalAmountStr.replace(/[^0-9.-]+/g, ''));
      rawAmount = parseInt((parsed * 100).toString()); // Cents/paise format
    } else {
      rawAmount = parseInt((totalAmountStr * 100).toString());
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: isCustom ? 100000 : (rawAmount > 0 ? rawAmount : 5000),
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(400).json({ error: { message: error.message } });
  }
});

app.listen(port, () => {
  console.log(`✅ Secure Payment Server running locally on http://localhost:${port}`);
  console.log(`Ready to process Stripe Payments!`);
});
