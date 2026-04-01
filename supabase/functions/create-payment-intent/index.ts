import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.9.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amountStr } = await req.json()
    // Parse the amount string "₹1,500" or similar to a raw number in the smallest integer format (paise for INR)
    let rawAmount = 0
    if (typeof amountStr === 'string') {
      const parsed = Number(amountStr.replace(/[^0-9.-]+/g, ''))
      rawAmount = parseInt((parsed * 100).toString()) // Stripe expects the smallest currency unit (e.g., cents/paise)
    } else {
      rawAmount = parseInt((amountStr * 100).toString())
    }

    // Create a PaymentIntent with the final exact numeric amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: rawAmount > 0 ? rawAmount : 5000, // Fallback to ₹50 minimum if 0 to prevent crashes
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
