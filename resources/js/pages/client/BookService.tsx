import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    CalendarClock,
    CheckCircle,
    Clock,
    DollarSign,
    FileText,
    Loader2,
    MapPin,
    ShieldCheck,
    Sparkles,
    User,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../layouts/DashboardLayout';

type Props = {
    providerId: string;
};

type Address = {
    id: number;
    label: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    is_default?: boolean;
};

const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as const,
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
};

export default function BookService({ providerId }: Props) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const getProfileUrl = (path: string | undefined | null) => {
        if (!path) return undefined;
        if (path.startsWith('http')) return path;
        return `/storage/${path}`;
    };
    
    const [provider, setProvider] = useState<any>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [minDateTime, setMinDateTime] = useState('');

    const [serviceName, setServiceName] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [addressId, setAddressId] = useState<string>('');
    const [budget, setBudget] = useState('50');
    const [notes, setNotes] = useState('');

    const authHeaders = useMemo(() => {
        if (typeof window === 'undefined') return undefined;
        const token = localStorage.getItem('access_token');
        return token ? { Authorization: `Bearer ${token}` } : undefined;
    }, []);

    useEffect(() => {
        const updateMinDate = () => {
            const now = new Date();
            now.setSeconds(0, 0);
            const local = new Date(
                now.getTime() - now.getTimezoneOffset() * 60000,
            )
                .toISOString()
                .slice(0, 16);
            setMinDateTime(local);
        };

        updateMinDate();
        const timer = window.setInterval(updateMinDate, 30000);

        return () => window.clearInterval(timer);
    }, []);

    const getFirstError = (key: string) => errors[key]?.[0] || '';

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [providerRes, addressRes] = await Promise.all([
                    axios.get(`/api/client/providers/${providerId}`, {
                        headers: authHeaders,
                    }),
                    axios.get('/api/client/addresses', {
                        headers: authHeaders,
                    }),
                ]);

                const providerData = providerRes.data?.provider ?? null;
                const addressesData = addressRes.data?.data?.addresses ?? [];

                setProvider(providerData);
                setAddresses(Array.isArray(addressesData) ? addressesData : []);

                const defaultAddress = (addressesData as Address[]).find(
                    (address) => address.is_default,
                );
                if (defaultAddress) {
                    setAddressId(String(defaultAddress.id));
                }

                if (providerData?.profession) {
                    setServiceName(providerData.profession);
                }
            } catch {
                toast.error('Failed to load booking details.');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [providerId, authHeaders]);

    const providerName = useMemo(() => {
        const user = provider?.user;
        if (!user) return 'Professional';
        if (user.first_name || user.last_name) {
            return `${user.first_name || ''} ${user.last_name || ''}`.trim();
        }
        return user.name || 'Professional';
    }, [provider]);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Simple client-side check for past date
        if (scheduledAt) {
            const selectedDate = new Date(scheduledAt);
            if (selectedDate <= new Date()) {
                setErrors({
                    scheduled_at: ['Please select a future date and time.'],
                });
                setIsSubmitting(false);
                return;
            }
        }

        if (Number(budget) <= 0) {
            setErrors({ budget: ['Budget must be greater than zero.'] });
            setIsSubmitting(false);
            return;
        }

        try {
            const payload: Record<string, unknown> = {
                provider_id: Number(providerId),
                service_name: serviceName,
                scheduled_at: scheduledAt,
                notes,
                budget: Number(budget),
            };

            if (addressId) {
                payload.address_id = Number(addressId);
            }

            const res = await axios.post('/api/client/orders', payload, {
                headers: authHeaders,
            });

            const orderId = res.data?.data?.order_id;
            if (orderId) {
                window.location.href = `/client/orders/${orderId}/success`;
                return;
            }

            toast.error('Order created but no order id was returned.');
        } catch (error: any) {
            if (
                error?.response?.status === 422 &&
                error?.response?.data?.errors
            ) {
                setErrors(error.response.data.errors);
                toast.error('Please fix the errors below.');
            } else {
                const message =
                    error?.response?.data?.message ||
                    'Failed to create order. Please check your fields.';
                toast.error(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout title="Book Service">
            <Head title={`Book Service with ${providerName} - Hirfati`} />

            {/* Background Mesh Gradient Layer */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40">
                <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-orange-200/50 blur-[120px]" />
                <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-rose-100/60 blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl space-y-8">
                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link
                        href={`/client/providers/${providerId}?from=find-pros`}
                        className="group inline-flex items-center gap-2 rounded-2xl bg-white/60 px-6 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-orange-600 hover:shadow-lg hover:shadow-orange-500/10"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />{' '}
                        Back to Provider
                    </Link>
                </motion.div>

                {isLoading ? (
                    <div className="flex h-96 items-center justify-center rounded-[3rem] border border-white/50 bg-white/70 shadow-xl backdrop-blur-xl">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                            <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">
                                Preparing your session...
                            </p>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
                    >
                        {/* Booking Form Card */}
                        <div className="relative overflow-hidden rounded-[3rem] border border-white/60 bg-white/80 p-8 shadow-[0_32px_80px_-24px_rgba(15,23,42,0.15)] backdrop-blur-2xl sm:p-10">
                            <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-[0.03]">
                                <CalendarClock className="h-40 w-40" />
                            </div>

                            <motion.div
                                variants={itemVariants}
                                className="mb-10"
                            >
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100/50 px-4 py-2 text-xs font-black tracking-widest text-orange-600 uppercase">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Secure Booking Process
                                </div>
                                <h1 className="text-4xl font-black tracking-tight text-slate-950">
                                    Book Service with{' '}
                                    <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                                        {providerName}
                                    </span>
                                </h1>
                                <p className="mt-3 text-lg font-medium text-slate-500">
                                    Detailed planning for the best service
                                    experience.
                                </p>
                            </motion.div>

                            <form onSubmit={onSubmit} className="space-y-8">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <motion.div
                                        variants={itemVariants}
                                        className="sm:col-span-2"
                                    >
                                        <label className="mb-2 block text-sm font-black tracking-wide text-slate-700 uppercase">
                                            Service Category
                                        </label>
                                        <div className="group relative">
                                            <div className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500">
                                                <Sparkles className="h-5 w-5" />
                                            </div>
                                            <input
                                                value={serviceName}
                                                onChange={(e) => {
                                                    setServiceName(
                                                        e.target.value,
                                                    );
                                                    if (errors.service_name)
                                                        setErrors({
                                                            ...errors,
                                                            service_name: [],
                                                        });
                                                }}
                                                required
                                                className={`h-14 w-full rounded-2xl border-2 bg-slate-50/50 pr-4 pl-12 text-lg font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300 focus:bg-white focus:ring-4 ${errors.service_name?.length ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-100 focus:border-orange-500 focus:ring-orange-500/10'}`}
                                                placeholder="e.g. Plumbing Repair"
                                            />
                                        </div>
                                        {errors.service_name?.[0] && (
                                            <p className="mt-1.5 ml-2 text-xs font-bold text-rose-500">
                                                {errors.service_name[0]}
                                            </p>
                                        )}
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label className="mb-2 block text-sm font-black tracking-wide text-slate-700 uppercase">
                                            Target Schedule
                                        </label>
                                        <div className="group relative">
                                            <div className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500">
                                                <CalendarClock className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="datetime-local"
                                                value={scheduledAt}
                                                min={minDateTime}
                                                onChange={(e) => {
                                                    setScheduledAt(
                                                        e.target.value,
                                                    );
                                                    if (errors.scheduled_at)
                                                        setErrors({
                                                            ...errors,
                                                            scheduled_at: [],
                                                        });
                                                }}
                                                required
                                                className={`h-14 w-full rounded-2xl border-2 bg-slate-50/50 pr-4 pl-12 text-base font-bold text-slate-700 transition-all outline-none focus:bg-white focus:ring-4 ${errors.scheduled_at?.length ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-100 focus:border-orange-500 focus:ring-orange-500/10'}`}
                                            />
                                        </div>
                                        {errors.scheduled_at?.[0] && (
                                            <p className="mt-1.5 ml-2 text-xs font-bold text-rose-500">
                                                {errors.scheduled_at[0]}
                                            </p>
                                        )}
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label className="mb-2 block text-sm font-black tracking-wide text-slate-700 uppercase">
                                            Budget (LYD)
                                        </label>
                                        <div className="group relative">
                                            <div className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500">
                                                <DollarSign className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={budget}
                                                onChange={(e) => {
                                                    setBudget(e.target.value);
                                                    if (errors.budget)
                                                        setErrors({
                                                            ...errors,
                                                            budget: [],
                                                        });
                                                }}
                                                required
                                                className={`h-14 w-full rounded-2xl border-2 bg-slate-50/50 pr-4 pl-12 text-lg font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300 focus:bg-white focus:ring-4 ${errors.budget?.length ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-100 focus:border-orange-500 focus:ring-orange-500/10'}`}
                                            />
                                        </div>
                                        {errors.budget?.[0] && (
                                            <p className="mt-1.5 ml-2 text-xs font-bold text-rose-500">
                                                {errors.budget[0]}
                                            </p>
                                        )}
                                    </motion.div>

                                    <motion.div
                                        variants={itemVariants}
                                        className="sm:col-span-2"
                                    >
                                        <label className="mb-2 block text-sm font-black tracking-wide text-slate-700 uppercase">
                                            Service Location
                                        </label>
                                        <div className="group relative">
                                            <div className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <select
                                                value={addressId}
                                                onChange={(e) => {
                                                    setAddressId(
                                                        e.target.value,
                                                    );
                                                    if (errors.address_id)
                                                        setErrors({
                                                            ...errors,
                                                            address_id: [],
                                                        });
                                                }}
                                                className={`h-14 w-full appearance-none rounded-2xl border-2 bg-slate-50/50 pr-10 pl-12 text-base font-bold text-slate-700 transition-all outline-none focus:bg-white focus:ring-4 ${getFirstError('address_id') ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-100 focus:border-orange-500 focus:ring-orange-500/10'}`}
                                            >
                                                <option value="">
                                                    Choose an address (optional)
                                                </option>
                                                {addresses.map((address) => (
                                                    <option
                                                        key={address.id}
                                                        value={address.id}
                                                    >
                                                        {address.label} -{' '}
                                                        {address.address_line_1}{' '}
                                                        {address.city
                                                            ? `, ${address.city}`
                                                            : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-400">
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        {getFirstError('address_id') && (
                                            <p className="mt-1.5 ml-2 text-xs font-bold text-rose-500">
                                                {getFirstError('address_id')}
                                            </p>
                                        )}
                                        {addresses.length === 0 && (
                                            <p className="mt-2 ml-2 text-xs font-semibold text-slate-500">
                                                No saved address found. You can
                                                still submit, but adding an
                                                address improves matching.
                                            </p>
                                        )}
                                    </motion.div>

                                    <motion.div
                                        variants={itemVariants}
                                        className="sm:col-span-2"
                                    >
                                        <label className="mb-2 block text-sm font-black tracking-wide text-slate-700 uppercase">
                                            Instructions & Notes
                                        </label>
                                        <div className="group relative">
                                            <div className="absolute top-4 left-4 text-slate-400 transition-colors group-focus-within:text-orange-500">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <textarea
                                                value={notes}
                                                onChange={(e) =>
                                                    setNotes(e.target.value)
                                                }
                                                rows={5}
                                                className="w-full rounded-[1.5rem] border-2 border-slate-100 bg-slate-50/50 py-4 pr-4 pl-12 text-base font-medium text-slate-700 transition-all outline-none placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                                                placeholder="Please provide any extra details or requirements for the service..."
                                            />
                                        </div>
                                        {getFirstError('notes') && (
                                            <p className="mt-1.5 ml-2 text-xs font-bold text-rose-500">
                                                {getFirstError('notes')}
                                            </p>
                                        )}
                                    </motion.div>
                                </div>

                                <motion.div
                                    variants={itemVariants}
                                    className="pt-4"
                                >
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="relative h-14 w-full overflow-hidden rounded-[1.3rem] bg-slate-950 p-[2px] shadow-[0_20px_40px_-16px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-16px_rgba(15,23,42,0.6)] active:scale-95 disabled:opacity-60"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950" />
                                        <div className="relative flex h-full items-center justify-center gap-2 rounded-[1.15rem] transition-colors group-hover:bg-slate-900/40">
                                            {isSubmitting ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-5 w-5 text-orange-400" />
                                                    <span className="text-lg font-black text-white">
                                                        Confirm Booking
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </motion.div>
                            </form>
                        </div>

                        {/* Summary & Trust Panel */}
                        <div className="space-y-6">
                            {/* Booking Connection Card */}
                            <motion.div
                                variants={itemVariants}
                                className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur-xl"
                            >
                                <div className="flex flex-col items-center gap-6">
                                    <div className="flex items-center justify-center gap-4 w-full">
                                        {/* Client Photo */}
                                        <div className="relative group/user">
                                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-slate-100 shadow-md">
                                                {user?.picture ? (
                                                    <img
                                                        src={getProfileUrl(user.picture)}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
                                                        <User className="h-10 w-10" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -top-3 -left-3 rounded-xl bg-slate-900 px-2.5 py-1 text-[9px] font-black tracking-widest text-white uppercase shadow-sm">
                                                You
                                            </div>
                                        </div>

                                        {/* Connection Arrow */}
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="h-[2px] w-8 bg-slate-200" />
                                            <Sparkles className="h-4 w-4 text-orange-400 animate-pulse" />
                                            <div className="h-[2px] w-8 bg-slate-200" />
                                        </div>

                                        {/* Provider Photo */}
                                        <div className="relative group/provider">
                                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-slate-100 shadow-md">
                                                {provider?.user?.picture ? (
                                                    <img
                                                        src={getProfileUrl(provider.user.picture)}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-orange-50 text-orange-500">
                                                        <User className="h-10 w-10" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500">
                                                <CheckCircle className="h-3 w-3 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center w-full">
                                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
                                            Booking Request for
                                        </p>
                                        <h3 className="text-2xl font-black text-slate-900 leading-none">
                                            {providerName}
                                        </h3>
                                        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                                            <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black tracking-wide text-orange-600 uppercase">
                                                {provider?.profession || 'Professional'}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="text-xs font-bold tracking-tight">
                                                    {provider?.user?.city || 'Location unavailable'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Trust Badge Card */}
                            <motion.div
                                variants={itemVariants}
                                className="rounded-[2.5rem] border border-white/60 bg-gradient-to-br from-slate-900 to-slate-950 p-8 text-white shadow-2xl"
                            >
                                <h4 className="mb-6 flex items-center gap-2 text-lg font-black tracking-tight">
                                    <ShieldCheck className="h-6 w-6 text-orange-400" />
                                    Hirfati Guarantee
                                </h4>
                                <ul className="space-y-4">
                                    {[
                                        {
                                            icon: Clock,
                                            title: 'Verified Schedule',
                                            desc: 'Pros commit to your requested time window.',
                                        },
                                        {
                                            icon: DollarSign,
                                            title: 'Secure Payment',
                                            desc: 'Secure local payment options with full protection.',
                                        },
                                        {
                                            icon: ShieldCheck,
                                            title: 'Satisfied Result',
                                            desc: 'Hire with confidence through our verified profiles.',
                                        },
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-orange-400 backdrop-blur-md">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs leading-relaxed font-medium text-slate-400">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Need Help? Card */}
                            <motion.div
                                variants={itemVariants}
                                className="rounded-[2.5rem] border border-orange-100 bg-orange-50/50 p-8"
                            >
                                <p className="mb-2 text-sm font-bold text-slate-900">
                                    Need assistance with your booking?
                                </p>
                                <Link
                                    href="/client/messages"
                                    className="text-xs font-black tracking-widest text-orange-600 uppercase underline underline-offset-4 transition-colors hover:text-orange-700"
                                >
                                    Contact Support Team &rarr;
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
}
