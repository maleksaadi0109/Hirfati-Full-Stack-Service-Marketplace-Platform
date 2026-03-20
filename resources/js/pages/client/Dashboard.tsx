import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Bell,
    Check,
    ChevronRight,
    Clock,
    Droplets,
    Filter,
    Home,
    MessageCircle,
    Phone,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
    Wind,
    Zap,
} from 'lucide-react';
import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const ACTIVE_JOB = {
    id: 101,
    service: 'AC Maintenance',
    pro: 'Ahmed Ben Ali',
    status: 'In Progress',
    arrival: 'Tomorrow, 4:00 PM',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80',
    icon: <Wind className="h-8 w-8 text-orange-500" />,
};

const CATEGORIES = [
    {
        label: 'Electricity',
        icon: <Zap />,
        color: 'text-yellow-500 bg-yellow-50',
    },
    {
        label: 'Plumbing',
        icon: <Droplets />,
        color: 'text-blue-500 bg-blue-50',
    },
    { label: 'Cleaning', icon: <Home />, color: 'text-green-500 bg-green-50' },
    {
        label: 'AC Repair',
        icon: <Wind />,
        color: 'text-orange-500 bg-orange-50',
    },
];

const MOCK_ORDERS = [
    {
        id: 1,
        service: 'AC Repair',
        status: 'Completed',
        date: 'Oct 24',
        price: '120 LYD',
        pro: 'Ahmed Ben Ali',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 2,
        service: 'House Cleaning',
        status: 'Completed',
        date: 'Oct 20',
        price: '80 LYD',
        pro: 'Sara Khaled',
        image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 3,
        service: 'Plumbing',
        status: 'Completed',
        date: 'Oct 15',
        price: '45 LYD',
        pro: 'Mahmoud Fathi',
        image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=400&q=80',
    },
];

const PENDING_MESSAGES = [
    {
        id: 1,
        sender: 'Ahmed Ben Ali',
        text: 'I have sent you the quote for the AC repair.',
        time: '2h ago',
        avatar: 'https://i.pravatar.cc/120?img=12',
    },
    {
        id: 2,
        sender: 'Sara Khaled',
        text: 'Are you available on Tuesday?',
        time: '5h ago',
        avatar: 'https://i.pravatar.cc/120?img=32',
    },
];

const RECOMMENDED_PROS = [
    {
        id: 1,
        name: 'Ahmed Ben Ali',
        profession: 'Plumber',
        rating: 4.8,
        jobs: 120,
        verified: true,
        avatar: 'https://i.pravatar.cc/160?img=12',
        cover: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 2,
        name: 'Sara Khaled',
        profession: 'Interior Designer',
        rating: 4.9,
        jobs: 45,
        verified: true,
        avatar: 'https://i.pravatar.cc/160?img=32',
        cover: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 3,
        name: 'Mahmoud Fathi',
        profession: 'Electrician',
        rating: 4.7,
        jobs: 89,
        verified: false,
        avatar: 'https://i.pravatar.cc/160?img=15',
        cover: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=600&q=80',
    },
];

export default function ClientDashboard() {
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/client/find-pros', { search: e.currentTarget.value });
        }
    };

    const handleCategoryClick = (label: string) => {
        router.get('/client/find-pros', { category: label });
    };

    return (
        <DashboardLayout title="Client Dashboard">
            <div className="space-y-10">
                <section className="relative overflow-hidden rounded-[2.5rem] border border-orange-100/70 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/60 p-6 shadow-[0_30px_80px_-45px_rgba(234,88,12,0.45)] sm:p-8 xl:p-10">
                    <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />

                    <div className="relative z-10 grid items-center gap-8 xl:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-black tracking-[0.18em] text-orange-600 uppercase shadow-sm">
                                <Sparkles className="h-4 w-4" />
                                Home Service Hub
                            </div>

                            <div className="space-y-3">
                                <h1 className="max-w-3xl text-4xl leading-tight font-black tracking-tight text-slate-950 sm:text-5xl">
                                    How can we make your{' '}
                                    <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                                        home feel easier
                                    </span>{' '}
                                    today?
                                </h1>
                                <p className="max-w-2xl text-base leading-8 font-medium text-slate-600 sm:text-lg">
                                    Search trusted professionals, track live
                                    service requests, and rebook your favorite
                                    experts in a cleaner, faster workspace.
                                </p>
                            </div>

                            <div className="relative max-w-3xl rounded-[2rem] border border-white/80 bg-white/90 p-2.5 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.28)] backdrop-blur-xl">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <div className="flex flex-1 items-center gap-3 rounded-[1.4rem] px-4 py-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                            <Search className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search for any service (e.g., plumbing, AC repair)..."
                                            onKeyDown={handleSearch}
                                            className="h-12 w-full border-none bg-transparent text-base font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
                                        />
                                    </div>
                                    <button className="inline-flex h-14 items-center justify-center rounded-[1.2rem] bg-slate-900 px-7 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-orange-600 sm:px-8">
                                        Search Pros
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {CATEGORIES.map((cat, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() =>
                                            handleCategoryClick(cat.label)
                                        }
                                        className="group flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-5 py-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                                    >
                                        <span
                                            className={`rounded-xl p-2.5 ${cat.color} transition-transform group-hover:scale-110`}
                                        >
                                            {React.cloneElement(
                                                cat.icon as React.ReactElement<any>,
                                                {
                                                    className: 'h-5 w-5',
                                                },
                                            )}
                                        </span>
                                        <span className="text-sm font-bold text-slate-700">
                                            {cat.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.28)] sm:col-span-3 xl:col-span-1">
                                <div className="relative h-56">
                                    <img
                                        src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80"
                                        alt="Modern home service interior"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/20 to-transparent" />
                                    <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black tracking-[0.18em] text-orange-300 uppercase">
                                                Trusted professionals
                                            </p>
                                            <h3 className="mt-1 text-2xl font-black text-white">
                                                Ready when you are
                                            </h3>
                                        </div>
                                        <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur-md">
                                            <div className="text-2xl font-black text-white">
                                                24/7
                                            </div>
                                            <div className="text-[10px] font-bold tracking-[0.18em] text-white/70 uppercase">
                                                support
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[1.8rem] border border-white/80 bg-white/85 p-5 shadow-sm">
                                <p className="text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase">
                                    Saved time
                                </p>
                                <p className="mt-2 text-3xl font-black text-slate-950">
                                    8.5h
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-500">
                                    handled for you this month
                                </p>
                            </div>

                            <div className="rounded-[1.8rem] border border-white/80 bg-slate-900 p-5 text-white shadow-sm">
                                <p className="text-[11px] font-black tracking-[0.18em] text-orange-300 uppercase">
                                    Preferred pros
                                </p>
                                <div className="mt-3 flex -space-x-3">
                                    {RECOMMENDED_PROS.slice(0, 3).map((pro) => (
                                        <img
                                            key={pro.id}
                                            src={pro.avatar}
                                            alt={pro.name}
                                            className="h-11 w-11 rounded-full border-2 border-slate-900 object-cover"
                                        />
                                    ))}
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-300">
                                    Your top-rated local experts are one tap
                                    away.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-8 xl:grid-cols-[1.6fr_0.8fr]">
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-[2.4rem] bg-slate-900 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.65)]"
                        >
                            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                                <div className="relative p-7 sm:p-8">
                                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-[11px] font-black tracking-[0.18em] text-orange-300 uppercase">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                                        {ACTIVE_JOB.status}
                                    </div>

                                    <div className="flex items-start gap-5">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-white/10 bg-white/10 backdrop-blur-xl">
                                            {ACTIVE_JOB.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black tracking-tight">
                                                {ACTIVE_JOB.service} Request
                                            </h3>
                                            <p className="mt-2 text-base font-medium text-slate-300">
                                                Assigned to {ACTIVE_JOB.pro}
                                            </p>
                                            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-400">
                                                <Clock className="h-4 w-4" />
                                                {ACTIVE_JOB.arrival}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-3">
                                        <button className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-500">
                                            Track Progress
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                        <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/15">
                                            <Phone className="h-4 w-4" />
                                            Call Pro
                                        </button>
                                        <button className="inline-flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/15 px-5 py-3.5 text-sm font-bold text-green-300 transition-all hover:bg-green-500/20">
                                            <MessageCircle className="h-4 w-4" />
                                            WhatsApp
                                        </button>
                                    </div>

                                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                        {[
                                            'Live arrival updates',
                                            'Chat with your pro',
                                            'Protected payments',
                                        ].map((item) => (
                                            <div
                                                key={item}
                                                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300"
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="absolute bottom-0 -left-10 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
                                </div>

                                <div className="relative min-h-[18rem] overflow-hidden lg:min-h-full">
                                    <img
                                        src={ACTIVE_JOB.image}
                                        alt="AC service in progress"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/20 to-transparent lg:bg-gradient-to-l" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-950">
                                    Recent Services
                                </h2>
                                <button className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                                    View History
                                </button>
                            </div>

                            <div className="space-y-4">
                                {MOCK_ORDERS.map((order, idx) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="group flex items-center justify-between gap-4 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white p-4 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="h-20 w-20 overflow-hidden rounded-[1.4rem] border border-slate-100 bg-slate-100">
                                                <img
                                                    src={order.image}
                                                    alt={order.service}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="truncate text-lg font-black text-slate-900 transition-colors group-hover:text-orange-600">
                                                    {order.service}
                                                </h4>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                                                    <span>{order.pro}</span>
                                                    <span className="text-slate-300">
                                                        •
                                                    </span>
                                                    <span>{order.date}</span>
                                                </div>
                                                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black tracking-[0.16em] text-emerald-600 uppercase">
                                                    <ShieldCheck className="h-3.5 w-3.5" />
                                                    {order.status}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-4">
                                            <div className="hidden text-right sm:block">
                                                <div className="text-xl font-black text-slate-950">
                                                    {order.price}
                                                </div>
                                                <div className="text-[10px] font-black tracking-[0.16em] text-slate-400 uppercase">
                                                    Paid
                                                </div>
                                            </div>
                                            <button className="rounded-2xl border border-orange-100 bg-orange-50 px-5 py-3 text-xs font-black text-orange-600 transition-all hover:bg-orange-600 hover:text-white">
                                                Rebook
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative overflow-hidden rounded-[2.3rem] border border-orange-100 bg-white p-6 shadow-[0_24px_60px_-35px_rgba(234,88,12,0.18)]"
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-950">
                                        Pending Quotes
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500">
                                        Reply quickly to secure your slot.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {PENDING_MESSAGES.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className="rounded-[1.8rem] border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4 transition-all hover:shadow-sm"
                                    >
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={msg.avatar}
                                                alt={msg.sender}
                                                className="h-12 w-12 rounded-2xl object-cover"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="truncate text-sm font-black text-slate-900">
                                                        {msg.sender}
                                                    </h3>
                                                    <span className="text-[10px] font-black tracking-[0.14em] text-orange-500 uppercase">
                                                        {msg.time}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm leading-6 font-medium text-slate-600">
                                                    {msg.text}
                                                </p>
                                                <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-xs font-black tracking-[0.14em] text-orange-600 uppercase transition-all hover:bg-orange-600 hover:text-white">
                                                    View Quote
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-orange-200/20 blur-3xl" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-950">
                                    Recommended Pros
                                </h2>
                                <button className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                                    <Filter className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {RECOMMENDED_PROS.map((pro) => (
                                    <motion.div
                                        key={pro.id}
                                        className="group overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_20px_50px_-38px_rgba(15,23,42,0.25)] transition-all hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="relative h-28">
                                            <img
                                                src={pro.cover}
                                                alt={pro.profession}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
                                        </div>

                                        <div className="relative px-5 pb-5">
                                            <div className="-mt-8 flex items-end gap-4">
                                                <div className="relative h-16 w-16 overflow-hidden rounded-[1.3rem] border-4 border-white bg-white shadow-md">
                                                    <img
                                                        src={pro.avatar}
                                                        alt={pro.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    {pro.verified && (
                                                        <div className="absolute right-0 bottom-0 rounded-tl-lg bg-sky-500 p-1 text-white">
                                                            <Check className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pb-1">
                                                    <h3 className="text-lg font-black text-slate-950 transition-colors group-hover:text-orange-600">
                                                        {pro.name}
                                                    </h3>
                                                    <p className="text-sm font-medium text-slate-500">
                                                        {pro.profession} •{' '}
                                                        {pro.jobs} jobs
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-black text-slate-800">
                                                    <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                                                    {pro.rating}
                                                </div>
                                                <button className="rounded-xl bg-slate-50 p-3 text-slate-400 transition-all hover:bg-orange-50 hover:text-orange-600">
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
