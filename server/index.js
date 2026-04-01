import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123');
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_123';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());

// --- NodeMailer Setup (Ethereal for testing) ---
let transporter;
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return process.exit(1);
  }
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
});

// --- Stripe Webhook Endpoint (Must use raw body) ---
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    const session = event.data.object;
    
    // Attempt to get customer email
    const customerEmail = session.customer_details?.email || session.receipt_email || 'test@example.com';
    const amountTotal = session.amount_total ? session.amount_total / 100 : session.amount / 100;

    console.log(`Payment successful for ₹${amountTotal}. Sending confirmation email to ${customerEmail}`);

    // Send confirmation email via Nodemailer
    try {
      let info = await transporter.sendMail({
        from: '"Lumé Bot" <hello@lume.com>',
        to: customerEmail,
        subject: "Order Confirmation - Lumé",
        text: `Thank you for your order! Your payment of ₹${amountTotal} was successful. Our artisans are now handcrafting your bouquet.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #fafafa; border-radius: 8px;">
            <h2 style="color: #ff4757;">Lumé</h2>
            <h3>Thank you for your order!</h3>
            <p>Your payment of <strong>₹${amountTotal}</strong> was successfully received.</p>
            <p>Our artisans are now carefully handcrafting your spectacular ribbon bouquet. We will update you once it ships!</p>
            <br/>
            <p style="font-size: 0.8em; color: #888;">Order Reference: ${session.id}</p>
          </div>
        `
      });
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (emailErr) {
      console.error("Error sending email:", emailErr);
    }
  }

  res.json({received: true});
});

// For normal JSON endpoints
app.use(express.json());

// --- Stripe Checkout Endpoints ---
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, isCustom } = req.body;
    let line_items = [];
    
    if (isCustom) {
      line_items = [{
        price_data: { currency: 'inr', product_data: { name: 'Custom Bouquet Deposit' }, unit_amount: 100000 },
        quantity: 1
      }];
    } else {
      let subtotal = 0;
      line_items = items.map(item => {
        const itemPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
        subtotal += itemPrice * (item.quantity || 1);
        return {
          price_data: {
            currency: 'inr',
            product_data: { name: item.name },
            unit_amount: itemPrice * 100,
          },
          quantity: item.quantity || 1,
        };
      });

      const gst = Math.round(subtotal * 0.18);
      line_items.push({
        price_data: { currency: 'inr', product_data: { name: 'GST (18%)' }, unit_amount: gst * 100 },
        quantity: 1,
      });

      line_items.push({
        price_data: { currency: 'inr', product_data: { name: 'Handling & Processing' }, unit_amount: 100 * 100 },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/cart',
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { items, isCustom } = req.body;
    let amount = 0;
    
    if (isCustom) {
      amount = 1000 * 100; // 1000 INR deposit
    } else {
      let subtotal = 0;
      items.forEach(item => {
        const itemPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
        subtotal += itemPrice * (item.quantity || 1);
      });
      const gst = Math.round(subtotal * 0.18);
      const delivery = 100;
      amount = (subtotal + gst + delivery) * 100; // total in paise
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe PaymentIntent error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Stripe Microservice running on http://localhost:${PORT}`);
});
