<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Subscription Plans
    |--------------------------------------------------------------------------
    |
    | Define the subscription plans available to providers.
    | Update the 'stripe_price_id' with real IDs from your Stripe Dashboard:
    | https://dashboard.stripe.com/test/products
    |
    */

    'plans' => [
        'starter' => [
            'name'            => 'Starter',
            'slug'            => 'starter',
            'stripe_price_id' => null, // Free tier, no Stripe price
            'price'           => 0,
            'currency'        => 'USD',
            'interval'        => 'month',
            'features'        => [
                'Basic profile listing',
                'Up to 5 portfolio posts',
                'Receive job requests',
                'In-app messaging',
            ],
        ],

        'pro' => [
            'name'            => 'Pro',
            'slug'            => 'pro',
            'stripe_price_id' => 'price_1TFEWTHFxMSNMEU281nHm04A',
            'price'           => 29,
            'currency'        => 'USD',
            'interval'        => 'month',
            'features'        => [
                'Everything in Starter',
                'Unlimited portfolio posts',
                'Priority in search results',
                'Verified Pro badge',
                'Advanced analytics',
                'Priority support',
            ],
        ],

        'elite' => [
            'name'            => 'Elite',
            'slug'            => 'elite',
            'stripe_price_id' => 'price_1TFEWUHFxMSNMEU2McxnVeK4',
            'price'           => 79,
            'currency'        => 'USD',
            'interval'        => 'month',
            'features'        => [
                'Everything in Pro',
                'Featured on homepage',
                'Boosted visibility',
                'Custom profile URL',
                'Dedicated account manager',
                'Early access to features',
                'Revenue insights dashboard',
            ],
        ],
    ],
];
