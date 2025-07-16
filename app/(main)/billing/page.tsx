'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useCurrentUser } from "@/hooks/use-current-user"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import Link from "next/link"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useState } from "react"


const plans = [
  {
    name: "Plus",
    price: "$20 / mo",
    features: [
      "15 lecture generations per month",
      "Unlimited community lectures",
      "AI-powered quiz generation",
      "Priority support",
    ],
    cta: "Upgrade to Plus",
    isCurrent: false,
    isHighlighted: true,
  },
  {
    name: "Pro",
    price: "$100 / mo",
    features: [
      "Unlimited lecture generations",
      "Unlimited community lectures",
      "AI-powered quiz generation",
      "Advanced analytics",
      "24/7 dedicated support",
    ],
    cta: "Go Pro",
    isCurrent: false,
    isHighlighted: false,
  },
]

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutForm({ plan, onClose }: { plan: { name: string; price: string }; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // ❗️Replace the fetch URL with your real API endpoint that creates a PaymentIntent
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: plan.name }),
    });
    const { clientSecret } = await res.json();

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (error) {
      console.error(error);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CardElement className="p-4 border rounded-md" />
      <Button type="submit" className="w-full py-6">Pay {plan.price}</Button>
    </form>
  );
}

export default function BillingPage() {
    const { data: userDataRaw, isLoading: userLoading } = useCurrentUser()
    
      interface UserData {
        email?: string
        name?: string
        profile?: {
          id?: string | number
          avatar_url?: string
        }
      }
    const userData = (userDataRaw && typeof userDataRaw === 'object' && 'profile' in userDataRaw)
    ? userDataRaw as UserData
    : undefined

    const [open, setOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<typeof plans[number] | null>(null);

    const handlePayClick = (plan: typeof plans[number]) => {
      setSelectedPlan(plan);
      setOpen(true);
    };


  return (
    <div className="container mx-auto px-4 py-16 h-full flex flex-col justify-center items-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">Find the perfect plan</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start for free, then upgrade to unlock more features and power.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "flex flex-col rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105 border-gray-200",
            )}
          >
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-4xl font-bold pt-4">{plan.price}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-0">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button
                className="w-full text-lg py-6 rounded-lg"
                size="lg"
                disabled={plan.isCurrent}
                variant="default"
                onClick={() => handlePayClick(plan)}
              >
                {plan.isCurrent ? "Current Plan" : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          Need more?{" "}
          <Link href="/contact" className="text-blue-600 hover:underline">
            Contact us
          </Link>{" "}
          for enterprise solutions.
        </p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enter your payment details</DialogTitle>
            <DialogDescription>
              Complete your purchase of the <span className="font-semibold">{selectedPlan?.name}</span> plan.
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <Elements stripe={stripePromise}>
              <CheckoutForm plan={selectedPlan} onClose={() => setOpen(false)} />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
