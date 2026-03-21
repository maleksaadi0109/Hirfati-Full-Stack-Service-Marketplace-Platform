import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Briefcase,
    Calendar,
    Check,
    ChevronDown,
    Clock,
    DollarSign,
    MapPin,
    MessageSquare,
    ShieldCheck,
    Star,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard } from '../dashboard/components/DashboardComponents';

type ProviderDashboardSummary = {
    metrics?: {
        earnings_paid?: number;
        completed_orders?: number;
        response_rate?: number;
        portfolio_posts?: number;
        pending_orders?: number;
    };
    next_order?: {
        id: number;
        service: string;
        status: string;
        scheduled_at?: string | null;
        customer_name?: string | null;
    } | null;
    recent_orders?: Array<{
        id: number;
        service: string;
        status: string;
        scheduled_at?: string | null;
        total: number;
        customer_name?: string | null;
    }>;
};

// --- Mock Data for Worker ---
const MOCK_JOBS = [
    {
        id: 1,
        title: 'Fix Leaking Sink',
        location: 'Ben Ashour, Tripoli',
        budget: '50-80 LYD',
        time: 'Urgent',
        type: 'Plumbing',
        distance: '2.5 km',
    },
    {
        id: 2,
        title: 'Install Ceiling Fan',
        location: 'Gargaresh',
        budget: '100 LYD',
        time: 'Tomorrow',
        type: 'Electrical',
        distance: '5.0 km',
    },
    {
        id: 3,
        title: 'Full House Wiring',
        location: 'Ain Zara',
        budget: '500+ LYD',
        time: 'Next Week',
        type: 'Electrical',
        distance: '8.2 km',
    },
];

const UPCOMING_SCHEDULE = [
    {
        id: 1,
        client: 'Omar Libi',
        task: 'AC Maintenance',
        time: '10:00 AM',
        date: 'Tomorrow',
        location: 'Tripoli Center',
        amount: '150 LYD',
    },
    {
        id: 2,
        client: 'Fatima S.',
        task: 'Kitchen Light Fix',
        time: '02:30 PM',
        date: 'Oct 28',
        location: 'Janzour',
        amount: '80 LYD',
    },
];

const EARNINGS_DATA = [
    { name: 'Sat', amount: 120 },
    { name: 'Sun', amount: 250 },
    { name: 'Mon', amount: 180 },
    { name: 'Tue', amount: 320 },
    { name: 'Wed', amount: 450 },
    { name: 'Thu', amount: 200 },
    { name: 'Fri', amount: 380 },
];

export default function WorkerDashboard() {
    const { auth } = usePage<any>().props;
    const [isAvailable, setIsAvailable] = useState(true);
    const [conversations, setConversations] = useState<any[]>([]);
    const [portfolioPosts, setPortfolioPosts] = useState<any[]>([]);
    const [summary, setSummary] = useState<ProviderDashboardSummary | null>(
        null,
    );

    const provider = auth?.user?.provider || auth?.user?.data?.provider;
    const authHeaders = useMemo(() => {
        if (typeof window === 'undefined') return undefined;
        const token = localStorage.getItem('access_token');
        return token ? { Authorization: `Bearer ${token}` } : undefined;
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [messagesRes, postsRes, summaryRes] = await Promise.all([
                    axios.get('/api/provider/messages', {
                        headers: authHeaders,
                    }),
                    axios.get('/api/provider/posts', { headers: authHeaders }),
                    axios.get('/api/provider/dashboard-summary', {
                        headers: authHeaders,
                    }),
                ]);

                const messages =
                    messagesRes.data?.data?.conversations?.data ??
                    messagesRes.data?.data?.conversations ??
                    [];
                const posts =
                    postsRes.data?.providerPosts?.data ??
                    postsRes.data?.providerPosts ??
                    [];

                setConversations(Array.isArray(messages) ? messages : []);
                setPortfolioPosts(Array.isArray(posts) ? posts : []);
                setSummary(summaryRes.data?.data ?? null);
            } catch {
                setConversations([]);
                setPortfolioPosts([]);
                setSummary(null);
            }
        };

        loadData();
    }, [authHeaders]);

    const pendingConversations = useMemo(
        () => conversations.filter((c) => Number(c.unreadCount ?? 0) > 0),
        [conversations],
    );

    const jobsCompleted = useMemo(
        () =>
            Number(
                summary?.metrics?.completed_orders ??
                    conversations.filter((c) => c.lastMessageAt).length,
            ),
        [conversations, summary],
    );

    const walletBalance = useMemo(() => {
        if (summary?.metrics?.earnings_paid !== undefined) {
            return Number(summary.metrics.earnings_paid).toFixed(2);
        }

        const rate = Number(provider?.hourly_rate || provider?.hourlyRate || 0);
        return (jobsCompleted * rate).toFixed(0);
    }, [jobsCompleted, provider, summary]);

    const responseRate = useMemo(() => {
        if (summary?.metrics?.response_rate !== undefined) {
            return Number(summary.metrics.response_rate);
        }

        if (conversations.length === 0) return 100;
        return Math.max(
            70,
            Math.round(
                ((conversations.length - pendingConversations.length) /
                    conversations.length) *
                    100,
            ),
        );
    }, [conversations, pendingConversations, summary]);

    const EARNINGS_DATA = useMemo(() => {
        const daily = [0, 0, 0, 0, 0, 0, 0];
        const labels = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const base = Number(
            provider?.hourly_rate || provider?.hourlyRate || 60,
        );

        conversations.forEach((c, idx) => {
            const bucket = idx % 7;
            daily[bucket] += base;
        });

        return labels.map((name, index) => ({ name, amount: daily[index] }));
    }, [conversations, provider]);

    const liveJobs = useMemo(() => {
        const recent = summary?.recent_orders ?? [];
        if (recent.length > 0) {
            return recent
                .filter((order) =>
                    ['pending', 'confirmed', 'in_progress'].includes(
                        order.status,
                    ),
                )
                .slice(0, 4)
                .map((order) => ({
                    id: order.id,
                    title: order.service || 'Service request',
                    location: 'Client location',
                    budget: `${Number(order.total ?? 0).toFixed(2)} LYD`,
                    time: order.scheduled_at
                        ? new Date(order.scheduled_at).toLocaleDateString()
                        : 'Scheduled',
                    type: order.status || 'pending',
                    distance: '--',
                }));
        }

        return pendingConversations.slice(0, 4).map((conversation) => ({
            id: conversation.orderId,
            title: conversation.service || 'Service request',
            location: 'Client location',
            budget: `${Number(provider?.hourly_rate || provider?.hourlyRate || 60)} LYD`,
            time: 'New',
            type: conversation.service || 'General',
            distance: '--',
        }));
    }, [pendingConversations, provider, summary]);

    const UPCOMING_SCHEDULE = useMemo(() => {
        const recent = summary?.recent_orders ?? [];
        if (recent.length > 0) {
            return recent.slice(0, 3).map((order) => {
                const date = order.scheduled_at
                    ? new Date(order.scheduled_at)
                    : null;

                return {
                    id: order.id,
                    client: order.customer_name || 'Client',
                    task: order.service || 'Service request',
                    time: date
                        ? date.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                          })
                        : '--:--',
                    date: date ? date.toLocaleDateString() : 'Scheduled',
                    location: 'Client address',
                    amount: `${Number(order.total ?? 0).toFixed(2)} LYD`,
                };
            });
        }

        return conversations.slice(0, 3).map((conversation) => ({
            id: conversation.orderId,
            client: conversation.contact?.name || 'Client',
            task: conversation.service || 'Service request',
            time: '10:00 AM',
            date: 'Scheduled',
            location: 'Client address',
            amount: `${Number(provider?.hourly_rate || provider?.hourlyRate || 60)} LYD`,
        }));
    }, [conversations, provider, summary]);

    const portfolioPostsCount = Number(
        summary?.metrics?.portfolio_posts ?? portfolioPosts.length,
    );

    const pendingJobsCount = Number(
        summary?.metrics?.pending_orders ?? liveJobs.length,
    );

    // Calculate Profile Strength
    const calculateStrength = () => {
        if (!provider) return 20;
        let score = 20; // Basic account
        if (provider.bio) score += 20;
        if (provider.hourly_rate || provider.hourlyRate) score += 20;
        if (provider.skills) score += 20;
        if (auth?.user?.picture || auth?.user?.data?.picture) score += 20;
        return score;
    };

    const profileStrength = calculateStrength();

    useEffect(() => {
        // Redirect to complete profile if bio or hourly rate is missing
        if (
            provider &&
            (!provider.bio || (!provider.hourly_rate && !provider.hourlyRate))
        ) {
            window.location.href = '/worker/complete-profile';
        }
    }, [provider]);

    return (
        <DashboardLayout title="Worker Workspace">
            {/* Pro Header / Availability Switch */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-8 flex flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-md sm:flex-row sm:items-center"
            >
                <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100/30 blur-3xl"></div>

                <div className="relative z-10">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-2 text-white shadow-lg">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            Work Mode
                        </h2>
                    </div>
                    <p className="font-medium text-slate-500">
                        Manage your availability and accept new jobs.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="hidden text-right sm:block">
                        <span
                            className={`block text-sm font-extrabold ${isAvailable ? 'text-green-600' : 'text-slate-400'}`}
                        >
                            {isAvailable ? 'Online' : 'Offline'}
                        </span>
                        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                            Status
                        </span>
                    </div>
                    <button
                        onClick={() => setIsAvailable(!isAvailable)}
                        className={`relative h-10 w-20 rounded-full shadow-inner transition-all duration-500 ${isAvailable ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                        <div
                            className={`absolute top-1 left-1 h-8 w-8 rounded-full bg-white shadow-lg transition-transform duration-500 ${isAvailable ? 'translate-x-10' : 'translate-x-0'}`}
                        >
                            {isAvailable && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap className="h-4 w-4 fill-current text-green-500" />
                                </div>
                            )}
                        </div>
                    </button>
                </div>
            </motion.div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Wallet Balance"
                    value={`${walletBalance} LYD`}
                    icon={<DollarSign />}
                    trend="Estimated"
                    trendUp={true}
                    color="green"
                    delay={0.1}
                />
                <StatCard
                    title="Jobs Completed"
                    value={String(jobsCompleted)}
                    icon={<Briefcase />}
                    trend="From conversations"
                    trendUp={true}
                    color="blue"
                    delay={0.2}
                />
                <StatCard
                    title="Response Rate"
                    value={`${responseRate}%`}
                    icon={<MessageSquare />}
                    trend={`${pendingConversations.length} pending`}
                    trendUp={responseRate >= 85}
                    color="orange"
                    delay={0.3}
                />
                <StatCard
                    title="Portfolio Posts"
                    value={String(portfolioPostsCount)}
                    icon={<Star />}
                    trend="Published projects"
                    trendUp={portfolioPostsCount > 0}
                    color="purple"
                    delay={0.4}
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Earnings & Leads */}
                <div className="space-y-8 lg:col-span-2">
                    {/* Earnings Chart */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        initial="hidden"
                        animate="visible"
                        className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40"
                    >
                        {/* Decor */}
                        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-50/50 blur-3xl"></div>

                        <div className="relative z-10 mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Earnings Overview
                                </h2>
                                <p className="text-sm font-medium text-slate-400">
                                    Track your income over time
                                </p>
                            </div>
                            <div className="relative">
                                <select className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pr-10 pl-4 text-xs font-bold text-slate-700 shadow-sm transition-all outline-none hover:border-slate-300 hover:bg-slate-100">
                                    <option>This Week</option>
                                    <option>Last Week</option>
                                    <option>This Month</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                        <div className="relative z-10 h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={EARNINGS_DATA}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="colorAmount"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#ea580c"
                                                stopOpacity={0.15}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#ea580c"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: '#94a3b8',
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: '#94a3b8',
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}
                                        dx={-10}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow:
                                                '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                            padding: '12px 16px',
                                            fontFamily: 'inherit',
                                        }}
                                        cursor={{
                                            stroke: '#cbd5e1',
                                            strokeWidth: 1.5,
                                            strokeDasharray: '4 4',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#ea580c"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                        activeDot={{
                                            r: 6,
                                            fill: '#ea580c',
                                            stroke: '#fff',
                                            strokeWidth: 3,
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* New Job Requests */}
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900">
                                <div className="relative flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500"></span>
                                </div>
                                Job Requests
                            </h2>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold tracking-wide text-slate-600 uppercase">
                                {pendingJobsCount} Pending
                            </span>
                        </div>

                        <div className="space-y-4">
                            {liveJobs.map((job, idx) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{
                                        y: -4,
                                        boxShadow:
                                            '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    }}
                                    className="group relative cursor-default overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm transition-all"
                                >
                                    <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-orange-400 to-orange-600"></div>
                                    <div className="mb-6 flex flex-col justify-between gap-6 pl-4 sm:flex-row sm:items-start">
                                        <div className="flex gap-5">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-600 shadow-sm transition-transform group-hover:scale-105">
                                                <Briefcase className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <h3 className="mb-2 text-xl font-extrabold text-slate-900 transition-colors group-hover:text-orange-600">
                                                    {job.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="h-4 w-4 text-slate-400" />{' '}
                                                        {job.location}
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                                    <span className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-2 py-0.5 text-orange-600">
                                                        <Clock className="h-3.5 w-3.5" />{' '}
                                                        {job.time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pl-4 text-right">
                                            <p className="text-3xl font-black tracking-tight text-slate-900">
                                                {job.budget}
                                            </p>
                                            <p className="mt-1 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                                                Est. Budget
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pl-4">
                                        <button className="group/btn flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95">
                                            <Check className="h-5 w-5 transition-transform group-hover/btn:scale-110" />{' '}
                                            Accept Job
                                        </button>
                                        <button className="flex items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-8 py-3.5 font-bold text-slate-600 transition-all hover:border-slate-200 hover:bg-slate-50 hover:text-red-500 active:scale-95">
                                            Decline
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Schedule & Quick Stats */}
                <div className="space-y-8">
                    {/* Schedule */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, x: 20 },
                            visible: { opacity: 1, x: 0 },
                        }}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">
                                Today's Schedule
                            </h2>
                            <button className="rounded-lg px-2 py-1 text-xs font-bold text-orange-600 transition-colors hover:bg-orange-50">
                                See All
                            </button>
                        </div>
                        <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-2 shadow-sm">
                            {UPCOMING_SCHEDULE.length > 0 ? (
                                UPCOMING_SCHEDULE.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className="group mb-2 cursor-pointer rounded-2xl border border-transparent p-4 transition-colors last:mb-0 hover:border-slate-100 hover:bg-slate-50"
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                                                <span className="text-[10px] font-bold tracking-wider uppercase opacity-70">
                                                    {item.time.split(' ')[1]}
                                                </span>
                                                <span className="text-sm font-black">
                                                    {item.time.split(' ')[0]}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1">
                                                <h4 className="truncate leading-tight font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                                                    {item.task}
                                                </h4>
                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                    {item.client}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between pl-[4.5rem]">
                                            <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400">
                                                <MapPin className="h-3 w-3" />{' '}
                                                {item.location}
                                            </span>
                                            <span className="text-sm font-bold text-slate-900">
                                                {item.amount}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400">
                                    <Calendar className="mx-auto mb-2 h-10 w-10 opacity-50" />
                                    <p className="text-sm">
                                        No jobs scheduled today.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Verification Badge / Pro Level */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl shadow-slate-900/40"
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent opacity-0 transition-opacity duration-700 hover:opacity-100"></div>

                        <div className="relative z-10">
                            <div className="mb-6 flex items-start justify-between">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner backdrop-blur-md">
                                    <ShieldCheck className="h-7 w-7 text-green-400 drop-shadow-lg" />
                                </div>
                                <div className="rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1 text-[10px] font-black tracking-widest text-green-400 uppercase backdrop-blur-sm">
                                    Verified
                                </div>
                            </div>

                            <h3 className="mb-2 text-2xl font-extrabold tracking-tight">
                                Pro Status
                            </h3>
                            <p className="mb-6 rounded-xl border border-white/5 bg-white/5 p-3 text-sm leading-relaxed text-slate-400">
                                Your profile is top-tier. You appear in{' '}
                                <span className="font-bold text-white">
                                    top 10%
                                </span>{' '}
                                of searches.
                            </p>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold tracking-wide">
                                    <span className="text-slate-400">
                                        Profile Strength
                                    </span>
                                    <span className="text-white">
                                        {profileStrength}%
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${profileStrength}%`,
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            ease: 'easeOut',
                                        }}
                                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Animated BG Decor (Optimized) */}
                        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-60 blur-3xl" />
                        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-br from-orange-500/10 to-pink-500/10 opacity-40 blur-3xl" />
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
