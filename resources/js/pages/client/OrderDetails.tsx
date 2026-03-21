import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock3,
    MapPin,
    MessageSquare,
    Receipt,
    ShieldCheck,
    Star,
    User,
    XCircle,
    Info,
    AlertCircle,
    CreditCard
} from 'lucide-react';
import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

interface OrderDetailsProps {
    orderId: string;
}

interface OrderData {
    id: number;
    service: string;
    proName: string;
    proRating: number;
    date: string;
    time: string;
    location: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    total: number;
    subtotal: number;
    fees: number;
    payment: string;
    progress: number;
    notes?: string;
    createdAt?: string;
    proPicture?: string;
    customerPicture?: string;
}

export default function OrderDetails({ orderId }: OrderDetailsProps) {
    const [order, setOrder] = useState<OrderData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`/api/client/orders/${orderId}`);
                setOrder(response.data.data.order);
            } catch (err) {
                console.error('Failed to fetch order details:', err);
                setError('Failed to load order details. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
        
        setIsCancelling(true);
        try {
            const response = await axios.patch(`/api/client/orders/${orderId}/cancel`);
            setOrder(response.data.data.order);
        } catch (err: any) {
            console.error('Failed to cancel order:', err);
            const message = err.response?.data?.message || 'Failed to cancel order. Please check if the status allows cancellation.';
            alert(message);
        } finally {
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Order Details">
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="text-center">
                        <Receipt className="mx-auto h-12 w-12 animate-pulse text-orange-400" />
                        <h3 className="mt-4 text-xl font-black text-slate-900">Loading Order Details...</h3>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !order) {
        return (
            <DashboardLayout title="Error">
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="rounded-3xl border border-rose-100 bg-rose-50 p-8 text-center max-w-md">
                        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
                        <h3 className="mt-4 text-xl font-black text-rose-900">{error || 'Order not found'}</h3>
                        <Link
                            href="/client/my-orders"
                            className="mt-6 inline-flex items-center gap-2 font-bold text-rose-600 hover:text-rose-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to my orders
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={`Order #${order.id}`}>
            <Head title={`Order #${order.id}`} />

            <div className="mx-auto max-w-5xl space-y-8">
                {/* Header Section */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link
                        href="/client/my-orders"
                        className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Orders
                    </Link>

                    <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} size="lg" />
                        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Order #{order.id}
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                    {/* Left Column: Main Details */}
                    <div className="space-y-8">
                        {/* Hero Card */}
                        <section className="relative overflow-hidden rounded-[2.5rem] border border-orange-100 bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 p-8 shadow-[0_32px_80px_-45px_rgba(234,88,12,0.3)]">
                            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-orange-200/20 blur-3xl" />
                            
                            <div className="relative z-10">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                    {order.service}
                                </h1>
                                <p className="mt-2 text-slate-500 font-medium">
                                    Booked on {new Date(order.createdAt || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>

                                <div className="mt-8 space-y-6">
                                    <div>
                                        <div className="mb-3 flex items-center justify-between text-sm font-black text-slate-700">
                                            <span>Service Progress</span>
                                            <span>{order.progress}%</span>
                                        </div>
                                        <div className="h-3 rounded-full bg-slate-200/60 p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${order.progress}%` }}
                                                className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <DetailItem icon={Calendar} label="Scheduled Date" value={order.date} />
                                        <DetailItem icon={Clock3} label="Preferred Time" value={order.time} />
                                        <DetailItem icon={MapPin} label="Service Location" value={order.location} className="sm:col-span-2" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Professional Info */}
                        <section className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900">Service Provider</h2>
                            <div className="mt-6 flex flex-wrap items-center gap-6">
                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1.5rem] border-2 border-white bg-slate-100 shadow-md">
                                    {order.proPicture ? (
                                        <img
                                            src={order.proPicture} // It's already a full URL from Resource
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
                                            <User className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <h3 className="text-xl font-black text-slate-900">{order.proName}</h3>
                                    <div className="mt-1 flex items-center gap-3">
                                        <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
                                            <Star className="h-3.5 w-3.5 fill-orange-500" />
                                            {order.proRating} Rating
                                        </div>
                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span className="text-sm font-medium text-slate-500">Professional Technician</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => router.visit(`/client/messages?order=${order.id}`)}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Send Message
                                </button>
                            </div>
                        </section>

                        {/* Notes */}
                        {order.notes && (
                            <section className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Info className="h-5 w-5 text-orange-500" />
                                    <h2 className="text-xl font-black text-slate-900">Order Notes</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 rounded-2xl p-4 italic">
                                    "{order.notes}"
                                </p>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Pricing & Meta */}
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="flex items-center gap-2 text-lg font-black text-slate-900">
                                <Receipt className="h-5 w-5 text-orange-500" />
                                Payment Summary
                            </h3>
                            
                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between text-sm font-bold text-slate-500">
                                    <span>Service Subtotal</span>
                                    <span className="text-slate-900">{order.subtotal} LYD</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-500">
                                    <span>Platform Fees</span>
                                    <span className="text-slate-900">{order.fees} LYD</span>
                                </div>
                                <div className="my-4 border-t border-dashed border-slate-200" />
                                <div className="flex justify-between items-center font-black">
                                    <span className="text-slate-900">Total Amount</span>
                                    <span className="text-2xl text-orange-600">{order.total} LYD</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-orange-50 p-4 border border-orange-100">
                                <CreditCard className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-orange-400">Payment Status</p>
                                    <p className="text-sm font-black text-orange-700">{order.payment}</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl shadow-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="rounded-xl bg-orange-500 p-2">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <h3 className="font-extrabold tracking-tight">Hirfati Guarantee</h3>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                Funds are held securely and only released to the professional after you confirm the job is complete.
                            </p>
                        </div>

                        {/* Actions */}
                        {['pending', 'confirmed'].includes(order.status) && (
                            <button 
                                className={`w-full rounded-2xl border-2 border-slate-100 bg-white py-4 text-sm font-black text-rose-500 transition-all hover:bg-rose-50 hover:border-rose-100 flex items-center justify-center gap-2 ${isCancelling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                                ) : (
                                    <XCircle className="h-4 w-4" />
                                )}
                                {isCancelling ? 'Cancelling...' : 'Request Cancellation'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function DetailItem({ icon: Icon, label, value, className = "" }: any) {
    return (
        <div className={`rounded-2xl border border-slate-100 bg-white p-4 ${className}`}>
            <p className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </p>
            <p className="mt-1 text-base font-black text-slate-800">{value}</p>
        </div>
    );
}

function StatusBadge({ status, size = 'sm' }: { status: OrderData['status'], size?: 'sm' | 'lg' }) {
    const config = {
        completed: { icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
        cancelled: { icon: XCircle, bg: 'bg-rose-100', text: 'text-rose-700', label: 'Cancelled' },
        confirmed: { icon: CheckCircle2, bg: 'bg-sky-100', text: 'text-sky-700', label: 'Confirmed' },
        in_progress: { icon: Clock3, bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In Progress' },
        pending: { icon: Clock3, bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
    };

    const { icon: Icon, bg, text, label } = config[status];
    const sizeClasses = size === 'lg' ? 'px-4 py-1.5 text-xs' : 'px-3 py-1 text-[11px]';

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full ${bg} ${sizeClasses} font-black uppercase tracking-wider ${text}`}>
            <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
            {label}
        </span>
    );
}
