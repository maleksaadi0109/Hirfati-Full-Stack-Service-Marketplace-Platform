import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock3,
    MapPin,
    Receipt,
    ShieldCheck,
    Sparkles,
    Star,
    User,
    XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

interface ClientOrder {
    id: number;
    service: string;
    proName: string;
    proRating: number;
    date: string;
    time: string;
    location: string;
    status: OrderStatus;
    total: number;
    payment: 'Paid' | 'Pending';
    progress: number;
    proPicture?: string;
}

const tabs: Array<{ key: 'all' | OrderStatus; label: string }> = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
];

export default function MyOrders() {
    const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all');
    const [orders, setOrders] = useState<ClientOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            setLoadError(null);

            try {
                const token = localStorage.getItem('access_token');
                const headers = token
                    ? { Authorization: `Bearer ${token}` }
                    : undefined;

                const response = await axios.get('/api/client/orders', {
                    headers,
                    params:
                        activeTab === 'all' ? undefined : { status: activeTab },
                });

                const rawOrders = response.data?.data?.orders;
                const orderList = Array.isArray(rawOrders)
                    ? rawOrders
                    : Array.isArray(rawOrders?.data)
                      ? rawOrders.data
                      : [];

                const normalizedOrders: ClientOrder[] = orderList.map(
                    (order: any) => ({
                        id: Number(order.id),
                        service: String(order.service ?? 'Service'),
                        proName: String(order.proName ?? 'Professional'),
                        proRating: Number(order.proRating ?? 0),
                        date: String(order.date ?? '-'),
                        time: String(order.time ?? '-'),
                        location: String(order.location ?? 'No address set'),
                        status: order.status as OrderStatus,
                        total: Number(order.total ?? 0),
                        payment: (order.payment === 'Paid'
                            ? 'Paid'
                            : 'Pending') as 'Paid' | 'Pending',
                        progress: Number(order.progress ?? 0),
                        proPicture: order.proPicture as string,
                    }),
                );

                setOrders(normalizedOrders);
            } catch (error) {
                console.error('Failed to load orders:', error);
                setLoadError('Failed to load orders. Please try again.');
                setOrders([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [activeTab]);

    const filteredOrders = useMemo(() => {
        if (activeTab === 'all') return orders;
        return orders.filter((order) => order.status === activeTab);
    }, [activeTab, orders]);

    const stats = useMemo(() => {
        const active = orders.filter((order) =>
            ['pending', 'confirmed', 'in_progress'].includes(order.status),
        ).length;
        const completed = orders.filter(
            (order) => order.status === 'completed',
        ).length;
        const saved = orders
            .filter((order) => order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);

        return { active, completed, saved };
    }, [orders]);

    return (
        <DashboardLayout title="My Orders">
            <Head title="My Orders" />

            <div className="space-y-8">
                <section className="relative overflow-hidden rounded-[2rem] border border-orange-100/80 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/50 p-6 shadow-[0_26px_65px_-42px_rgba(234,88,12,0.55)] sm:p-8">
                    <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-orange-300/20 blur-3xl" />
                    <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />

                    <div className="relative z-10 grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-black tracking-[0.18em] text-orange-600 uppercase shadow-sm">
                                <Sparkles className="h-4 w-4" />
                                Client Workspace
                            </div>
                            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                My Orders
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 font-medium text-slate-600 sm:text-base">
                                Track your ongoing bookings, review completed
                                work, and manage upcoming service appointments
                                from one place.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <TopStat
                                label="Active"
                                value={stats.active.toString()}
                            />
                            <TopStat
                                label="Completed"
                                value={stats.completed.toString()}
                            />
                            <TopStat
                                label="Spent"
                                value={`${stats.saved} LYD`}
                            />
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex flex-wrap items-center gap-2">
                        {tabs.map((tab) => {
                            const active = activeTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                                        active
                                            ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/70 hover:text-slate-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_0.45fr]">
                        <div className="space-y-5">
                            {isLoading ? (
                                <div className="rounded-[1.7rem] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                                    <Receipt className="mx-auto h-10 w-10 animate-pulse text-orange-300" />
                                    <h3 className="mt-4 text-xl font-black text-slate-900">
                                        Loading orders...
                                    </h3>
                                </div>
                            ) : loadError ? (
                                <div className="rounded-[1.7rem] border border-rose-200 bg-rose-50 px-6 py-14 text-center shadow-sm">
                                    <h3 className="text-xl font-black text-rose-700">
                                        {loadError}
                                    </h3>
                                </div>
                            ) : filteredOrders.length ? (
                                filteredOrders.map((order, idx) => (
                                    <motion.article
                                        key={order.id}
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.35,
                                            delay: idx * 0.06,
                                        }}
                                        onClick={() =>
                                            router.get(
                                                `/client/orders/${order.id}`,
                                            )
                                        }
                                        className="group relative cursor-pointer overflow-hidden rounded-[1.7rem] border border-slate-200/80 bg-white p-5 shadow-[0_22px_55px_-40px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-orange-200/20 sm:p-6"
                                    >
                                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.12),_transparent_28%)]" />

                                        <div className="relative flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <h3 className="text-xl font-black text-slate-900">
                                                        {order.service}
                                                    </h3>
                                                    <StatusBadge
                                                        status={order.status}
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">
                                                    Order #{order.id}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">
                                                    Total
                                                </p>
                                                <p className="mt-1 text-xl font-black text-slate-900">
                                                    {order.total} LYD
                                                </p>
                                            </div>
                                        </div>

                                        <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                                                <p className="flex items-center gap-1 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                                                    <User className="h-3.5 w-3.5" />
                                                    Pro
                                                </p>
                                                <div className="mt-1 flex items-center gap-2 min-w-0">
                                                    <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-md border border-slate-100 bg-slate-50">
                                                        {order.proPicture ? (
                                                            <img
                                                                src={
                                                                    order.proPicture
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                                                                <User className="h-3 w-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-sm font-bold text-slate-700">
                                                        {order.proName}
                                                    </p>
                                                </div>
                                            </div>
                                            <InfoPill
                                                icon={Calendar}
                                                label="Date"
                                                value={order.date}
                                            />
                                            <InfoPill
                                                icon={Clock3}
                                                label="Time"
                                                value={order.time}
                                            />
                                            <InfoPill
                                                icon={MapPin}
                                                label="Location"
                                                value={order.location}
                                            />
                                        </div>

                                        <div className="relative mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                            <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-600">
                                                <span>Order progress</span>
                                                <span>{order.progress}%</span>
                                            </div>
                                            <div className="h-2.5 rounded-full bg-slate-200">
                                                <div
                                                    className="h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                                                    style={{
                                                        width: `${order.progress}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3">
                                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                                <Star className="h-3.5 w-3.5 text-orange-500" />
                                                {order.proRating} rating
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 sm:text-sm"
                                                >
                                                    Message Pro
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => router.get(`/client/orders/${order.id}`)}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-orange-600 sm:text-sm"
                                                >
                                                    View Details
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))
                            ) : (
                                <div className="rounded-[1.7rem] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                                    <Receipt className="mx-auto h-10 w-10 text-slate-300" />
                                    <h3 className="mt-4 text-xl font-black text-slate-900">
                                        No orders here yet
                                    </h3>
                                    <p className="mt-2 text-sm font-medium text-slate-500">
                                        Try another tab to see your orders.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
                                <h3 className="text-base font-black text-slate-900">
                                    Quick Actions
                                </h3>
                                <div className="mt-4 space-y-3">
                                    <Link
                                        href="/client/find-pros"
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        Book new service
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/client/messages"
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        Open messages
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/client/profile"
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        Manage addresses
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white shadow-[0_22px_55px_-26px_rgba(234,88,12,0.75)]">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-white/20 p-2.5">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black">
                                            Secure Orders
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-orange-50">
                                            Your payments are protected and only
                                            released after completed service.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-orange-600 shadow-lg shadow-orange-900/20"
                                >
                                    Learn more
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}

function TopStat({ value, label }: { value: string; label: string }) {
    return (
        <div className="rounded-2xl border border-white/80 bg-white/90 p-3 text-center shadow-sm sm:p-4">
            <p className="text-lg font-black text-slate-900 sm:text-xl">
                {value}
            </p>
            <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                {label}
            </p>
        </div>
    );
}

function StatusBadge({ status }: { status: OrderStatus }) {
    if (status === 'completed') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 uppercase">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
            </span>
        );
    }

    if (status === 'cancelled') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold text-rose-700 uppercase">
                <XCircle className="h-3.5 w-3.5" />
                Cancelled
            </span>
        );
    }

    if (status === 'confirmed') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-[11px] font-bold text-sky-700 uppercase">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Confirmed
            </span>
        );
    }

    if (status === 'in_progress') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold text-indigo-700 uppercase">
                <Clock3 className="h-3.5 w-3.5" />
                In Progress
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-700 uppercase">
            <Clock3 className="h-3.5 w-3.5" />
            Pending
        </span>
    );
}

function InfoPill({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof User;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5">
            <p className="flex items-center gap-1 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </p>
            <p className="mt-1 truncate text-sm font-bold text-slate-700">
                {value}
            </p>
        </div>
    );
}
