import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing Stripe env var. Set VITE_STRIPE_PUBLIC_KEY in your environment.',
  );
}

export const stripePromise = loadStripe(publishableKey);

