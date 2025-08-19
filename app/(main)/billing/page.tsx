'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge" // Assuming you have a Badge component
import { useCurrentUser } from "@/hooks/use-current-user"
import { cn } from "@/lib/utils"
import { Check, Loader2, CreditCard, Star, Info } from "lucide-react"

import { fetchClientSecret, createCustomerPortal } from "../../actions/stripe"
import { updateSubscriptionPlan, cancelSubscription } from "@/lib/api"

// --- Base Plan Definitions ---
const basePlans = [
  {
    name: "Free",
    price: "$0",
    priceFrequency: "/ month",
    features: [
      "3 lecture generations per month",
      "Access to community lectures",
      "Basic support",
    ],
    cta: "Start for Free",
  },
  {
    name: "Plus",
    price: "$20",
    priceFrequency: "/ month",
    features: [
      "15 lecture generations per month",
      "Unlimited community lectures",
      "AI-powered quiz generation",
      "Priority support",
    ],
    cta: "Upgrade to Plus",
  },
  {
    name: "Pro",
    price: "$100",
    priceFrequency: "/ month",
    features: [
      "Unlimited lecture generations",
      "Unlimited community lectures",
      "AI-powered quiz generation",
      "Advanced analytics",
      "24/7 dedicated support",
    ],
    cta: "Go Pro",
  },
]

// --- Stripe Initialization ---
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

  // --- Derived Values & Helpers ---
  const currency = "USD"; // Display only; real currency is set in Stripe

export default function BillingPage() {
  const { data: userDataRaw, isLoading: userLoading } = useCurrentUser()
  
  // --- Type Definition for User Data ---
  interface UserData {
    email?: string;
    name?: string;
    plan?: string;
    cust_id?: string;
    sub_id?: string;
    profile?: {
      sub_: string
      id?: string | number;
      avatar_url?: string;
    }
  }

  // --- State Management ---
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isCancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isChangePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  
  const [selectedPlan, setSelectedPlan] = useState<typeof basePlans[number] | null>(null);
  
  const userData = userDataRaw as UserData | undefined;

  // --- Dynamically process plans to mark the current one ---
  const plans = useMemo(() => {
    return basePlans.map(plan => ({
      ...plan,
      isCurrent: userData?.plan === plan.name,
    }));
  }, [userData?.plan]);

  // --- Event Handlers ---

  // Opens the appropriate dialog when a CTA button is clicked
  const handlePlanActionClick = (plan: typeof plans[number]) => {
    setSelectedPlan(plan);
    // If user is moving from Free to Paid, open Stripe checkout directly
    if (userData?.plan === 'Free') {
      setCheckoutOpen(true);
    } else {
    // If user is switching between paid plans, show a confirmation dialog first
      setChangePlanDialogOpen(true);
    }
  };
  
  // Handles the actual plan change after confirmation
  const confirmPlanChange = async () => {
    if (!selectedPlan || !userData?.profile?.id) return;

    try {
      // NOTE: Replace these with your actual Stripe Price IDs
      const priceId = selectedPlan.name === "Plus" ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;

      await updateSubscriptionPlan(userData.sub_id!, priceId as string);
      window.location.reload(); // Reload to reflect the new plan status
    } catch (err) {
      console.error("Failed to change subscription plan:", err);
      // Here you could show an error toast to the user
    } finally {
      setChangePlanDialogOpen(false);
    }
  };

  const handleManagePayment = async () => {
    if (!userData?.cust_id) return;
    try {
        const url = await createCustomerPortal(userData.cust_id)
        if (url) window.location.href = url;
    } catch (err) {
      console.error("Failed to open Stripe billing portal:", err);
    }
  };
  
  const confirmCancel = async () => {
    if (!userData?.sub_id) return; // Ensure we have a subscription ID

    try {
      await cancelSubscription(userData.sub_id);
      window.location.reload(); // Refresh to reflect the cancelled plan
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      // TODO: Show an error toast/notification
    } finally {
      setCancelDialogOpen(false);
    }
  };
  
  // --- Conditional Rendering ---
  
  // Show a loading state while user data is being fetched
  if (userLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div role="status" aria-live="polite" aria-busy="true" className="flex items-center gap-3 text-gray-700">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading billing…</span>
        </div>
      </div>
    );
  }

  const showPaymentSection = (userData?.plan && userData.plan !== "Free") || !!userData?.cust_id;

  return (
    // space between
    <div className="min-h-full bg-gray-50/50 flex flex-col justify-between items-center">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* --- Header --- */}
        <div className="mb-12 space-y-6 text-center sm:text-left">
          <div className="flex flex-col items-center sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Billing</h1>
              <p className="mt-2 text-base text-gray-600">Start for free, then upgrade to unlock more power and features.</p>
            </div>

            {showPaymentSection && (
              <Button
                aria-label="Manage payment details and invoices"
                variant="default"
                onClick={handleManagePayment}
                className="group relative mt-2 sm:mt-0 overflow-hidden rounded-xl px-6 py-3 text-base font-semibold shadow-md focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2"
              >
                <CreditCard className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                Manage Payment
                <span className="absolute inset-0 -z-10 translate-y-1/2 bg-gradient-to-r from-primary/60 via-primary/40 to-primary/60 opacity-20 blur-xl transition-opacity duration-300 group-hover:opacity-40" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 border border-emerald-200">
              <Star className="mr-1 h-4 w-4" /> Current plan: <span className="ml-1 font-semibold">{userData?.plan ?? "Free"}</span>
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 border text-gray-700">Prices in {currency}</span>
          </div>
        </div>

        {/* --- Pricing Plans Grid --- */}
        <div className="grid max-w-5xl mx-auto grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "group flex flex-col h-full rounded-2xl bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                plan.isCurrent && "border-primary shadow-lg ring-1 ring-primary/20"
              )}
            >
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl font-semibold tracking-tight">{plan.name}</CardTitle>
                  {plan.name === "Plus" && !plan.isCurrent && (
                    <Badge variant="secondary" className="uppercase tracking-wide">Most popular</Badge>
                  )}
                  {plan.isCurrent && <Badge variant="secondary">Current</Badge>}
                </div>
                <CardDescription className="pt-3">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="ml-1 text-lg text-gray-500">{plan.priceFrequency}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow p-8 pt-2">
                <ul className="space-y-3 sm:space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-8 pt-0 mt-auto">
                {plan.isCurrent ? (
                    <Button
                      className="w-full text-base py-4 rounded-md"
                      variant="secondary"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      Manage Plan
                    </Button>
                ) : (
                    <Button
                      className="w-full text-base py-4 rounded-md"
                      variant="default"
                      onClick={() => handlePlanActionClick(plan)}
                    >
                      {plan.cta}
                    </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* --- Fine Print / Notes --- */}
        <div className="max-w-5xl mx-auto mt-2 text-center text-sm text-gray-500">
          Cancel anytime. Changes take effect at the end of your current billing period.
        </div>

        {/* --- Contact Link --- */}
        <div className="text-center mt-14">
          <p className="text-gray-700 text-base">
            Need more? {" "}
            <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
              Contact us
            </Link>{" "}
            for enterprise solutions.
          </p>
        </div>

        {/* --- FAQ --- */}
        <section aria-labelledby="faq-heading" className="max-w-4xl mx-auto mt-10 space-y-3">
          <h2 id="faq-heading" className="sr-only">Billing FAQ</h2>
          <details className="rounded-lg border border-gray-200 p-4 bg-white">
            <summary className="cursor-pointer font-medium text-gray-900 flex items-center"><Info className="mr-2 h-4 w-4"/>Can I change plans later?</summary>
            <p className="mt-2 text-sm text-gray-600">Yes. You can upgrade or downgrade anytime. Billing is prorated by Stripe.</p>
          </details>
          <details className="rounded-lg border border-gray-200 p-4 bg-white">
            <summary className="cursor-pointer font-medium text-gray-900 flex items-center"><Info className="mr-2 h-4 w-4"/>What happens when I cancel?</summary>
            <p className="mt-2 text-sm text-gray-600">You keep access until the end of the paid period, then revert to the Free plan.</p>
          </details>
        </section>
        
        {/* --- Dialogs --- */}
        
        {/* Stripe Checkout Dialog */}
        <Dialog open={isCheckoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="max-w-lg max-h-[95vh] p-4 overflow-y-auto">
            {selectedPlan && (
              <div id="checkout" className="[&>div]:rounded-lg">
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{
                    fetchClientSecret: () => fetchClientSecret(selectedPlan!.name, userData?.email as string) as Promise<string>
                  }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Plan Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="p-4 max-w-lg">
            <DialogHeader>
              <DialogTitle>Cancel Subscription?</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your {userData?.plan} plan? You'll lose access to premium features at the end of your current billing period.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep Plan</Button>
              <Button variant="destructive" onClick={confirmCancel}>Confirm Cancellation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Plan Dialog */}
        <Dialog open={isChangePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
          <DialogContent className="p-4 max-w-lg">
            <DialogHeader>
              <DialogTitle>Change Subscription Plan?</DialogTitle>
              <DialogDescription>
                You are about to switch to the <strong>{selectedPlan?.name}</strong> plan. Your billing will be adjusted accordingly.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setChangePlanDialogOpen(false)}>Never mind</Button>
              <Button variant="default" onClick={confirmPlanChange}>Confirm Plan Change</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}