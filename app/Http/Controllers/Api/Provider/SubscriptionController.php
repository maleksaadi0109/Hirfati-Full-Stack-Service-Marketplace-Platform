<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Get current subscription status for the authenticated provider.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        $plans = config('stripe.plans');

        // Determine current plan
        $currentPlan = 'starter';
        $subscription = null;

        if ($user->subscribed('default')) {
            $sub = $user->subscription('default');
            $subscription = [
                'stripe_status' => $sub->stripe_status,
                'ends_at'       => $sub->ends_at,
                'trial_ends_at' => $sub->trial_ends_at,
                'created_at'    => $sub->created_at,
            ];

            // Match the current price to a plan
            foreach ($plans as $slug => $plan) {
                if ($plan['stripe_price_id'] && $sub->hasPrice($plan['stripe_price_id'])) {
                    $currentPlan = $slug;
                    break;
                }
            }
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'current_plan'  => $currentPlan,
                'subscription'  => $subscription,
                'plans'         => collect($plans)->map(fn($plan) => [
                    'name'     => $plan['name'],
                    'slug'     => $plan['slug'],
                    'price'    => $plan['price'],
                    'currency' => $plan['currency'],
                    'interval' => $plan['interval'],
                    'features' => $plan['features'],
                ]),
                'on_grace_period' => $user->subscribed('default')
                    ? $user->subscription('default')->onGracePeriod()
                    : false,
            ],
        ]);
    }

    /**
     * Create a Stripe Checkout session for subscribing to a plan.
     */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'plan' => 'required|string|in:pro,elite',
        ]);

        $user = $request->user();
        $plan = config("stripe.plans.{$request->plan}");

        if (!$plan || !$plan['stripe_price_id']) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid plan selected.',
            ], 422);
        }

        try {
            $checkout = $user
                ->newSubscription('default', $plan['stripe_price_id'])
                ->checkout([
                    'success_url' => url('/worker/subscription?success=1'),
                    'cancel_url'  => url('/worker/subscription?cancelled=1'),
                ]);

            return response()->json([
                'success'      => true,
                'checkout_url' => $checkout->url,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create checkout session: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a Stripe Customer Portal session for managing subscription.
     */
    public function portal(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasStripeId()) {
            return response()->json([
                'success' => false,
                'message' => 'No billing account found.',
            ], 404);
        }

        try {
            $portalUrl = $user->billingPortalUrl(
                url('/worker/subscription')
            );

            return response()->json([
                'success'    => true,
                'portal_url' => $portalUrl,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create portal session: ' . $e->getMessage(),
            ], 500);
        }
    }
}
