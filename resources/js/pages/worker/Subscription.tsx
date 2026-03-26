import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    CreditCard,
    Crown,
    ExternalLink,
    Loader2,
    Rocket,
    ShieldCheck,
    Sparkles,
    Star,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

type PlanData = {
    name: string;
    slug: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
};

type SubscriptionData = {
    current_plan: string;
    subscription: {
        stripe_status: string;
        ends_at: string | null;
        trial_ends_at: string | null;
        created_at: string;
    } | null;
    plans: Record<string, PlanData>;
    on_grace_period: boolean;
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
    starter: <Star className="h-7 w-7" />,
    pro: <Rocket className="h-7 w-7" />,
    elite: <Crown className="h-7 w-7" />,
};

const PLAN_COLORS: Record<string, { bg: string; border: string; text: string; gradient: string; badge: string; glow: string }> = {
    starter: {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        text: 'text-slate-600',
        gradient: 'from-slate-100 to-slate-50',
        badge: 'bg-slate-100 text-slate-600',
        glow: 'bg-slate-200/40',
    },
    pro: {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        text: 'text-orange-600',
        gradient: 'from-orange-500 to-amber-500',
        badge: 'bg-orange-100 text-orange-700',
        glow: 'bg-orange-400/20',
    },
    elite: {
        bg: 'bg-violet-50',
        border: 'border-violet-300',
        text: 'text-violet-600',
        gradient: 'from-violet-600 to-purple-600',
        badge: 'bg-violet-100 text-violet-700',
        glow: 'bg-violet-400/20',
    },
};

export default function Subscription() {
    const { auth } = usePage<any>().props;
    const [data, setData] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const [portalLoading, setPortalLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [cancelMessage, setCancelMessage] = useState('');

    const authHeaders = useMemo(() => {
        if (typeof window === 'undefined') return undefined;
        const token = localStorage.getItem('access_token');
        return token ? { Authorization: `Bearer ${token}` } : undefined;
    }, []);

    // Check for success/cancel query params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === '1') {
            setSuccessMessage('🎉 Subscription activated successfully! Welcome to your new plan.');
            window.history.replaceState({}, '', window.location.pathname);
        }
        if (params.get('cancelled') === '1') {
            setCancelMessage('Checkout was cancelled. You can try again anytime.');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axios.get('/api/provider/subscription', {
                    headers: authHeaders,
                });
                setData(res.data?.data ?? null);
            } catch {
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [authHeaders]);

    const handleCheckout = async (planSlug: string) => {
        setCheckoutLoading(planSlug);
        try {
            const res = await axios.post(
                '/api/provider/subscription/checkout',
                { plan: planSlug },
                { headers: authHeaders },
            );
            if (res.data?.checkout_url) {
                window.location.href = res.data.checkout_url;
            }
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Failed to start checkout. Please try again.');
        } finally {
            setCheckoutLoading(null);
        }
    };

    const handlePortal = async () => {
        setPortalLoading(true);
        try {
            const res = await axios.post(
                '/api/provider/subscription/portal',
                {},
                { headers: authHeaders },
            );
            if (res.data?.portal_url) {
                window.location.href = res.data.portal_url;
            }
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Failed to open billing portal.');
        } finally {
            setPortalLoading(false);
        }
    };

    const plans = data?.plans ? Object.values(data.plans) : [];
    const currentPlan = data?.current_plan || 'starter';
    const isSubscribed = data?.subscription !== null && data?.subscription !== undefined;

    return (
        <DashboardLayout title="Subscription">
            {/* Alerts */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700 shadow-sm"
                    >
                        {successMessage}
                        <button
                            onClick={() => setSuccessMessage('')}
                            className="ml-3 font-bold text-green-800 underline"
                        >
                            Dismiss
                        </button>
                    </motion.div>
                )}
                {cancelMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700 shadow-sm"
                    >
                        {cancelMessage}
                        <button
                            onClick={() => setCancelMessage('')}
                            className="ml-3 font-bold text-amber-800 underline"
                        >
                            Dismiss
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl sm:p-10"
            >
                {/* Decorative elements */}
                <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-60 w-60 -translate-x-1/3 translate-y-1/3 rounded-full bg-violet-500/10 blur-3xl" />

                <div className="relative z-10">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
                            <CreditCard className="h-6 w-6 text-orange-400" />
                        </div>
                        <div className="rounded-full border border-orange-500/30 bg-orange-500/20 px-3 py-1 text-[10px] font-black tracking-widest text-orange-400 uppercase">
                            {isSubscribed ? 'Subscribed' : 'Free Plan'}
                        </div>
                    </div>
                    <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl">
                        Choose Your Plan
                    </h1>
                    <p className="max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                        Unlock premium features to grow your business, get more clients, and stand out from the competition.
                    </p>

                    {isSubscribed && (
                        <button
                            onClick={handlePortal}
                            disabled={portalLoading}
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 disabled:opacity-60"
                        >
                            {portalLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ExternalLink className="h-4 w-4" />
                            )}
                            Manage Billing
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
            )}

            {/* Plans Grid */}
            {!loading && (
                <div className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan, idx) => {
                        const colors = PLAN_COLORS[plan.slug] || PLAN_COLORS.starter;
                        const isCurrentPlan = currentPlan === plan.slug;
                        const isPro = plan.slug === 'pro';
                        const isFree = plan.price === 0;

                        return (
                            <motion.div
                                key={plan.slug}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.12 }}
                                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                className={`relative flex flex-col overflow-hidden rounded-[2rem] border-2 bg-white shadow-xl transition-all ${
                                    isCurrentPlan
                                        ? `${colors.border} shadow-2xl ring-2 ring-offset-2 ${plan.slug === 'pro' ? 'ring-orange-300' : plan.slug === 'elite' ? 'ring-violet-300' : 'ring-slate-200'}`
                                        : 'border-slate-100 hover:border-slate-200'
                                }`}
                            >
                                {/* Popular Badge */}
                                {isPro && (
                                    <div className="absolute top-0 right-0 z-20">
                                        <div className="rounded-bl-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-lg">
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                {/* Glow Effect */}
                                <div className={`pointer-events-none absolute top-0 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full ${colors.glow} blur-3xl`} />

                                {/* Plan Header */}
                                <div className={`relative p-8 pb-6`}>
                                    <div className={`mb-4 inline-flex items-center justify-center rounded-2xl p-3 ${colors.bg} ${colors.text}`}>
                                        {PLAN_ICONS[plan.slug]}
                                    </div>

                                    <h3 className="mb-1 text-2xl font-black text-slate-900">{plan.name}</h3>

                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black tracking-tight text-slate-900">
                                            {isFree ? 'Free' : `$${plan.price}`}
                                        </span>
                                        {!isFree && (
                                            <span className="text-sm font-bold text-slate-400">
                                                /{plan.interval}
                                            </span>
                                        )}
                                    </div>

                                    {isCurrentPlan && (
                                        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            Current Plan
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="flex-1 border-t border-slate-100 p-8 pt-6">
                                    <p className="mb-4 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                                        What's included
                                    </p>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, fIdx) => (
                                            <motion.li
                                                key={fIdx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.12 + fIdx * 0.05 }}
                                                className="flex items-start gap-3"
                                            >
                                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                                    isCurrentPlan
                                                        ? `bg-gradient-to-br ${colors.gradient} text-white`
                                                        : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                    <Check className="h-3 w-3" strokeWidth={3} />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600">
                                                    {feature}
                                                </span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Action Button */}
                                <div className="p-8 pt-0">
                                    {isCurrentPlan ? (
                                        <div className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 text-center text-sm font-bold text-slate-400">
                                            Your Current Plan
                                        </div>
                                    ) : isFree ? (
                                        <div className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 text-center text-sm font-bold text-slate-400">
                                            Included Free
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleCheckout(plan.slug)}
                                            disabled={checkoutLoading !== null}
                                            className={`group flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${
                                                plan.slug === 'elite'
                                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 shadow-violet-200/50 hover:shadow-xl hover:shadow-violet-300/40'
                                                    : 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/40'
                                            }`}
                                        >
                                            {checkoutLoading === plan.slug ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
                                            )}
                                            {checkoutLoading === plan.slug
                                                ? 'Redirecting...'
                                                : `Subscribe to ${plan.name}`}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* FAQ / Trust Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 rounded-[2rem] border border-slate-100 bg-white/80 p-8 shadow-sm backdrop-blur-md"
            >
                <h3 className="mb-6 text-lg font-bold text-slate-900">
                    Frequently Asked Questions
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                    {[
                        {
                            q: 'Can I cancel anytime?',
                            a: 'Yes! You can cancel your subscription at any time. Your plan will remain active until the end of your billing period.',
                        },
                        {
                            q: 'What payment methods are accepted?',
                            a: 'We accept all major credit and debit cards through our secure Stripe payment gateway.',
                        },
                        {
                            q: 'Can I switch between plans?',
                            a: 'Absolutely! You can upgrade or downgrade your plan at any time through the billing portal.',
                        },
                        {
                            q: 'Is there a free trial?',
                            a: 'The Starter plan is always free. Paid plans may offer trial periods — check the plan details for availability.',
                        },
                    ].map((faq, idx) => (
                        <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                            <h4 className="mb-2 text-sm font-bold text-slate-800">{faq.q}</h4>
                            <p className="text-sm leading-relaxed text-slate-500">{faq.a}</p>
                        </div>
                    ))}
                </div>

                {/* Stripe badge */}
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-semibold">Payments secured by Stripe</span>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
