/* global process */
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load the .env.local variables like VITE_SUPABASE_URL and STRIPE_SECRET_KEY
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY || 're_fallback');

const app = express();
const port = process.env.PORT || 5001;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseUrlStr = supabaseUrl || 'https://fallback.supabase.co';
const supabaseKeyStr = supabaseKey || 'fallback_key';
const supabase = createClient(supabaseUrlStr, supabaseKeyStr);

app.use(cors());

// Initialize Stripe Secret Key
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripeKeyValid = stripeKey && (stripeKey.startsWith('sk_test_') || stripeKey.startsWith('sk_live_'));
if (!stripeKeyValid) {
  console.warn("WARNING: STRIPE_SECRET_KEY is missing or invalid. Online payments will be disabled.");
}
const stripe = stripeKeyValid ? new Stripe(stripeKey) : null;

// Stripe Webhook endpoint MUST use express.raw parser
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log(`✅ Webhook: PaymentIntent ${paymentIntent.id} succeeded for amount ${paymentIntent.amount}!`);
      break;
    }
    default:
      console.log(`Webhook: Unhandled event type ${event.type}`);
  }

  res.send();
});

// For all other routes, use JSON parser
app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: { message: 'Online payment is not configured. Please use Cash on Delivery.' } });
  }
  try {
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

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    const { data, error } = await resend.emails.send({
      from: 'Lumé Orders <onboarding@resend.dev>', // Default testing sender
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      return res.status(400).json({ error: error });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Resend Error:", error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.post("/api/contact-email", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const { data, error } = await resend.emails.send({ from: "Lume Store <onboarding@resend.dev>", to: ["akarshsrivastava322@gmail.com"], subject: "New Contact from " + name, html: "<h2>New Inquiry from " + name + "</h2><p>Email: " + email + "</p><p>Message: " + message + "</p>" });
    if (error) return res.status(400).json({ error });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: { message: error.message } }); }
});

app.post('/api/update-status', async (req, res) => {
  try {
    const { id, status, order } = req.body;
    
    // 1. Update DB securely from backend
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select();
    
    if (error) {
      return res.status(400).json({ error });
    }

    // 2. Track & Send Email
    if (order && order.email) {
      const msg = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
           <h2 style="color: #9b1b30;">Hello ${order.customer},</h2>
           <p>We wanted to let you know that your Lumé order status has been updated!</p>
           <div style="padding: 16px; background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
             <p style="margin: 0; font-size: 1.2rem;"><strong>Order Status: <span style="color: #3b82f6;">${status}</span></strong></p>
             <p style="margin: 8px 0 0; color: #64748b;">Item: ${order.item}</p>
           </div>
           <p>If you have any questions, feel free to reply to this email or reach out to us on Instagram.</p>
           <br/>
           <p>Best,<br/><strong>The Lumé Artisans</strong></p>
        </div>
      `;

      await resend.emails.send({
        from: 'Lumé Orders <onboarding@resend.dev>',
        to: [order.email],
        subject: `Artisan Update: Your Lumé order is now ${status}`,
        html: msg,
      });
    }

    res.json({ success: true, data: data ? data[0] : null });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Only run app.listen locally or on Render to prevent port binding issues on Vercel Serverless
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`✅ Secure Data & Payment Server running locally on port ${port}`);
    console.log(`Ready to process Stripe Payments!`);
  });
}

export default app;
