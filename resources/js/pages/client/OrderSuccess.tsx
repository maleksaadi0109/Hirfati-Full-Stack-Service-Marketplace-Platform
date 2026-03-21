import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Calendar,
    CheckCircle2,
    DollarSign,
    MapPin,
    MessageSquare,
    ShoppingBag,
    Sparkles,
    User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

type Props = {
    orderId: string;
};

const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1] as const,
            staggerChildren: 0.15,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
};

export default function OrderSuccess({ orderId }: Props) {
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const authHeaders = useMemo(() => {
        if (typeof window === 'undefined') return undefined;
        const token = localStorage.getItem('access_token');
        return token ? { Authorization: `Bearer ${token}` } : undefined;
    }, []);

    useEffect(() => {
        const loadOrder = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`/api/client/orders/${orderId}`, {
                    headers: authHeaders,
                });
                setOrder(res.data?.data?.order ?? null);
            } catch {
                setOrder(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrder();
    }, [orderId, authHeaders]);

    return (
        <DashboardLayout title="Booking Confirmed">
            <Head title="Booking Successful - Hirfati" />

            {/* Background Mesh Gradient Layer */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30">
                <div className="absolute top-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-emerald-100/50 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-orange-50/60 blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-2xl px-4 py-8 sm:py-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative overflow-hidden rounded-[3rem] border border-white/60 bg-white/80 p-8 text-center shadow-[0_32px_80px_-24px_rgba(15,23,42,0.15)] backdrop-blur-2xl sm:p-12"
                >
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2,
                        }}
                        className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-200/50"
                    >
                        <CheckCircle2 className="h-12 w-12" />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-[10px] font-black tracking-widest text-emerald-600 uppercase">
                            <Sparkles className="h-3.5 w-3.5" />
                            Request Dispatched Successfully
                        </div>

                        {/* Connection Visual */}
                        <div className="flex items-center justify-center gap-4 py-4">
                            {/* Client Photo */}
                            <div className="relative group/user">
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-slate-100 shadow-md">
                                    {order?.customerPicture ? (
                                        <img
                                            src={order.customerPicture}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
                                            <User className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Connection Arrow */}
                            <div className="flex flex-col items-center gap-1">
                                <div className="h-[1.5px] w-6 bg-slate-200" />
                                <Sparkles className="h-3 w-3 text-emerald-500 animate-pulse" />
                                <div className="h-[1.5px] w-6 bg-slate-200" />
                            </div>

                            {/* Provider Photo */}
                            <div className="relative group/provider">
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-slate-100 shadow-md">
                                    {order?.proPicture ? (
                                        <img
                                            src={order.proPicture}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-orange-50 text-orange-500">
                                            <User className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                            You're all set!
                        </h1>
                        <p className="mx-auto max-w-md text-lg leading-relaxed font-medium text-slate-500">
                            Your service request has been sent to the
                            professional. We'll notify you as soon as they
                            confirm.
                        </p>
                        <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-slate-400">
                            Next: provider confirms - you receive update -
                            continue chat for details.
                        </p>
                    </motion.div>

                    {/* Order Details Receipt Card */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-12 overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/50 p-6 text-left sm:p-8"
                    >
                        <div className="mb-6 flex items-center justify-between border-b border-slate-200/60 pb-4">
                            <div>
                                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                    Order Reference
                                </p>
                                <p className="mt-1 text-xl font-black text-slate-900">
                                    #{orderId}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                    Status
                                </p>
                                <span className="mt-1 inline-block rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black text-amber-700 uppercase">
                                    {order?.status || 'Pending Review'}
                                </span>
                            </div>
                        </div>

                        {isLoading && (
                            <p className="mb-4 text-xs font-bold tracking-wide text-slate-400 uppercase">
                                Loading final order details...
                            </p>
                        )}

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-4">
                                <DetailItem
                                    icon={Sparkles}
                                    label="Service"
                                    value={order?.service || 'Service Request'}
                                />
                                <DetailItem
                                    icon={User}
                                    label="Professional"
                                    value={order?.proName || 'Provider'}
                                />
                            </div>
                            <div className="space-y-4">
                                <DetailItem
                                    icon={Calendar}
                                    label="Date"
                                    value={order?.date || 'Scheduled'}
                                />
                                <DetailItem
                                    icon={DollarSign}
                                    label="Estimated Budget"
                                    value={`${order?.total || '0'} LYD`}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white bg-white p-4 shadow-sm">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                    Service Location
                                </p>
                                <p className="max-w-[200px] truncate text-sm font-bold text-slate-700 sm:max-w-none">
                                    {order?.location || 'Address Details'}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-10 grid gap-4 sm:grid-cols-2"
                    >
                        <Link
                            href="/client/my-orders"
                            className="group flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 text-base font-black text-white shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-200 active:scale-95"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            View All Orders
                        </Link>
                        <Link
                            href={`/client/messages?order=${orderId}`}
                            className="group flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-6 text-base font-black text-slate-900 transition-all hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50 hover:text-orange-600 active:scale-95"
                        >
                            <MessageSquare className="h-5 w-5" />
                            Message Provider
                        </Link>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="mt-8 border-t border-slate-100 pt-8"
                    >
                        <p className="text-sm font-medium text-slate-400">
                            Need to make changes?
                            <Link
                                href={`/client/orders/${orderId}`}
                                className="ml-1.5 font-bold text-orange-600 underline underline-offset-4 hover:text-orange-700"
                            >
                                View Order Details
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}

function DetailItem({
    icon: Icon,
    label,
    value,
}: {
    icon: any;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    {label}
                </p>
                <p className="truncate text-sm font-black text-slate-800">
                    {value}
                </p>
            </div>
        </div>
    );
}
