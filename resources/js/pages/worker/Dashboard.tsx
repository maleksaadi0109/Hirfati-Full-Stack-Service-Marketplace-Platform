import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import {
 Briefcase, MessageSquare, DollarSign, Star,
 Check, MapPin, Clock, XCircle, Calendar, ShieldCheck,
 ChevronDown, Filter, Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '../dashboard/components/DashboardComponents';

// --- Mock Data for Worker ---
const MOCK_JOBS = [
 { id: 1, title: "Fix Leaking Sink", location: "Ben Ashour, Tripoli", budget: "50-80 LYD", time: "Urgent", type: "Plumbing", distance: "2.5 km" },
 { id: 2, title: "Install Ceiling Fan", location: "Gargaresh", budget: "100 LYD", time: "Tomorrow", type: "Electrical", distance: "5.0 km" },
 { id: 3, title: "Full House Wiring", location: "Ain Zara", budget: "500+ LYD", time: "Next Week", type: "Electrical", distance: "8.2 km" },
];

const UPCOMING_SCHEDULE = [
 { id: 1, client: "Omar Libi", task: "AC Maintenance", time: "10:00 AM", date: "Tomorrow", location: "Tripoli Center", amount: "150 LYD" },
 { id: 2, client: "Fatima S.", task: "Kitchen Light Fix", time: "02:30 PM", date: "Oct 28", location: "Janzour", amount: "80 LYD" },
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

 const provider = auth?.user?.provider || auth?.user?.data?.provider;
 
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
  if (provider && (!provider.bio || (!provider.hourly_rate && !provider.hourlyRate))) {
   window.location.href = '/worker/complete-profile';
  }
 }, [provider]);

 return (
 <DashboardLayout title="Worker Workspace">
 {/* Pro Header / Availability Switch */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-white/60 shadow-xl shadow-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-64 h-64 bg-green-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

 <div className="relative z-10">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white shadow-lg">
 <Briefcase className="w-5 h-5" />
 </div>
 <h2 className="text-2xl font-extrabold text-slate-900">Work Mode</h2>
 </div>
 <p className="text-slate-500 font-medium">Manage your availability and accept new jobs.</p>
 </div>

 <div className="flex items-center gap-6 relative z-10">
 <div className="text-right hidden sm:block">
 <span className={`block text-sm font-extrabold ${isAvailable ? 'text-green-600' : 'text-slate-400'}`}>
 {isAvailable ? 'Online' : 'Offline'}
 </span>
 <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status</span>
 </div>
 <button
 onClick={() => setIsAvailable(!isAvailable)}
 className={`relative w-20 h-10 rounded-full transition-all duration-500 shadow-inner ${isAvailable ? 'bg-green-500' : 'bg-slate-200'}`}
 >
 <div className={`absolute top-1 left-1 bg-white w-8 h-8 rounded-full shadow-lg transition-transform duration-500 ${isAvailable ? 'translate-x-10' : 'translate-x-0'}`}>
 {isAvailable && <div className="absolute inset-0 flex items-center justify-center"><Zap className="w-4 h-4 text-green-500 fill-current" /></div>}
 </div>
 </button>
 </div>
 </motion.div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 <StatCard title="Wallet Balance" value="1,250 LYD" icon={<DollarSign />} trend="Available" trendUp={true} color="green" delay={0.1} />
 <StatCard title="Jobs Completed" value="24" icon={<Briefcase />} trend="+3 this week" trendUp={true} color="blue" delay={0.2} />
 <StatCard title="Response Rate" value="98%" icon={<MessageSquare />} trend="Avg time: 5m" trendUp={true} color="orange" delay={0.3} />
 <StatCard title="Rating" value="4.9" icon={<Star />} trend="Top Rated" trendUp={true} color="purple" delay={0.4} />
 </div>

 <div className="grid lg:grid-cols-3 gap-8">
 {/* Left Column: Earnings & Leads */}
 <div className="lg:col-span-2 space-y-8">

 {/* Earnings Chart */}
 <motion.div
 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
 initial="hidden" animate="visible"
 className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden"
 >
 {/* Decor */}
 <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

 <div className="flex items-center justify-between mb-8 relative z-10">
 <div>
 <h2 className="text-xl font-bold text-slate-900">Earnings Overview</h2>
 <p className="text-sm text-slate-400 font-medium">Track your income over time</p>
 </div>
 <div className="relative">
 <select className="appearance-none bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl pl-4 pr-10 py-2 outline-none text-slate-700 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm">
 <option>This Week</option>
 <option>Last Week</option>
 <option>This Month</option>
 </select>
 <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
 </div>
 </div>
 <div className="h-[320px] w-full relative z-10">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={EARNINGS_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#ea580c" stopOpacity={0.15} />
 <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dx={-10} tickFormatter={(value) => `${value}`} />
 <Tooltip
 contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontFamily: 'inherit' }}
 cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '4 4' }}
 />
 <Area type="monotone" dataKey="amount" stroke="#ea580c" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6, fill: '#ea580c', stroke: '#fff', strokeWidth: 3 }} />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </motion.div>

 {/* New Job Requests */}
 <div>
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
 <div className="relative flex h-3 w-3">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
 </div>
 Job Requests
 </h2>
 <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide">{MOCK_JOBS.length} Pending</span>
 </div>

 <div className="space-y-4">
 {MOCK_JOBS.map((job, idx) => (
 <motion.div
 key={job.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: idx * 0.1 }}
 whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
 className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm transition-all group relative overflow-hidden cursor-default"
 >
 <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-400 to-orange-600"></div>
 <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-6 mb-6 pl-4">
 <div className="flex gap-5">
 <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm shrink-0 border border-orange-100 group-hover:scale-105 transition-transform">
 <Briefcase className="w-7 h-7" />
 </div>
 <div>
 <h3 className="font-extrabold text-xl text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">{job.title}</h3>
 <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
 <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {job.location}</span>
 <span className="w-1 h-1 rounded-full bg-slate-300"></span>
 <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg"><Clock className="w-3.5 h-3.5" /> {job.time}</span>
 </div>
 </div>
 </div>
 <div className="text-right pl-4">
 <p className="text-3xl font-black text-slate-900 tracking-tight">{job.budget}</p>
 <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">Est. Budget</p>
 </div>
 </div>

 <div className="flex gap-3 pl-4">
 <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group/btn active:scale-95">
 <Check className="w-5 h-5 group-hover/btn:scale-110 transition-transform" /> Accept Job
 </button>
 <button className="px-8 py-3.5 bg-white hover:bg-slate-50 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold transition-all flex items-center gap-2 hover:border-slate-200 hover:text-red-500 active:scale-95">
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
 <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }} initial="hidden" animate="visible">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-lg font-bold text-slate-900">Today's Schedule</h2>
 <button className="text-orange-600 text-xs font-bold hover:bg-orange-50 px-2 py-1 rounded-lg transition-colors">See All</button>
 </div>
 <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-2">
 {UPCOMING_SCHEDULE.length > 0 ? UPCOMING_SCHEDULE.map((item, idx) => (
 <div key={item.id} className="p-4 hover:bg-slate-50 rounded-2xl transition-colors mb-2 last:mb-0 group cursor-pointer border border-transparent hover:border-slate-100">
 <div className="flex gap-4">
 <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-600 rounded-2xl w-14 h-14 shrink-0 group-hover:bg-blue-100 transition-colors">
 <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{item.time.split(" ")[1]}</span>
 <span className="text-sm font-black">{item.time.split(" ")[0]}</span>
 </div>
 <div className="flex-1 min-w-0 pt-1">
 <h4 className="font-bold text-slate-900 truncate leading-tight group-hover:text-blue-600 transition-colors">{item.task}</h4>
 <p className="text-xs text-slate-500 truncate mt-1">{item.client}</p>
 </div>
 </div>
 <div className="mt-3 flex items-center justify-between pl-[4.5rem]">
 <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
 <MapPin className="w-3 h-3" /> {item.location}
 </span>
 <span className="font-bold text-slate-900 text-sm">{item.amount}</span>
 </div>
 </div>
 )) : (
 <div className="p-8 text-center text-slate-400">
 <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
 <p className="text-sm">No jobs scheduled today.</p>
 </div>
 )}
 </div>
 </motion.div>

 {/* Verification Badge / Pro Level */}
 <motion.div
 whileHover={{ y: -5 }}
 className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40"
 >
 {/* Shimmer effect */}
 <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700"></div>

 <div className="relative z-10">
 <div className="flex justify-between items-start mb-6">
 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
 <ShieldCheck className="w-7 h-7 text-green-400 drop-shadow-lg" />
 </div>
 <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/30 backdrop-blur-sm">
 Verified
 </div>
 </div>

 <h3 className="font-extrabold text-2xl mb-2 tracking-tight">Pro Status</h3>
 <p className="text-slate-400 text-sm mb-6 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
 Your profile is top-tier. You appear in <span className="text-white font-bold">top 10%</span> of searches.
 </p>

 <div className="space-y-2">
 <div className="flex justify-between text-xs font-bold tracking-wide">
 <span className="text-slate-400">Profile Strength</span>
 <span className="text-white">85%</span>
 </div>
 <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: "85%" }}
 transition={{ duration: 1.5, ease: "easeOut" }}
 className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
 />
 </div>
 </div>
 </div>
 {/* Animated BG Decor (Optimized) */}
 <div
 className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl opacity-60"
 />
 <div
 className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-full blur-3xl opacity-40"
 />
 </motion.div>
 </div>
 </div>
 </DashboardLayout>
 );
}
