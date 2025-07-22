'use server'

import { headers } from 'next/headers'

import { stripe } from '../../lib/stripe'


export async function fetchClientSecret(plan: string, email: string) {
  // Retrieve the logged‑in user's email from NextAuth
  
  const origin = (await headers()).get('origin')
  
  const priceId =
    plan === 'Plus'
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS!
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!;

      
  const checkoutSession = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [
      {
        // Pass the Stripe Price ID instead of a raw number
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    customer_email: email,
    return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
   subscription_data:{
    metadata:
   {
    plan: plan,
    email: email,
   }
   }
    
  });

  return checkoutSession.client_secret;
}


export async function createCustomerPortal(customerId: string) {
  const origin = (await headers()).get('origin');

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/billing`,
  });

  return portalSession.url;
}


