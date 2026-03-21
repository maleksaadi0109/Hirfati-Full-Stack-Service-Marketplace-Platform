import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
 Briefcase, MessageSquare, DollarSign, Star,
 Check, MapPin, Clock, XCircle, Calendar, ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from './components/DashboardComponents';

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

export default function WorkerDashboard({ isAvailable, setIsAvailable }: any) {
 return (
 <>
 {/* Pro Header / Availability Switch */}
 <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
 <div>
 <h2 className="text-2xl font-bold text-slate-900">Work Mode</h2>
 <p className="text-slate-500">Manage your availability and accept new work.</p>
 </div>

 <div className="flex items-center gap-4">
 <span className={`text-sm font-bold ${isAvailable ? 'text-green-600' : 'text-slate-400'}`}>
 {isAvailable ? 'You are Online' : 'You are Offline'}
 </span>
 <button
 onClick={() => setIsAvailable(!isAvailable)}
 className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isAvailable ? 'bg-green-500' : 'bg-slate-200'}`}
 >
 <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 ${isAvailable ? 'translate-x-8' : 'translate-x-0'}`}></div>
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <StatCard title="Wallet Balance" value="1,250 LYD" icon={<DollarSign />} trend="Available for withdrawal" color="green" delay={0.1} />
 <StatCard title="Work Completed" value="24" icon={<Briefcase />} trend="+3 this week" color="blue" delay={0.2} />
 <StatCard title="Response Rate" value="98%" icon={<MessageSquare />} trend="Avg time: 5m" color="orange" delay={0.3} />
 <StatCard title="Rating" value="4.9" icon={<Star />} trend="Top Rated Pro" color="purple" delay={0.4} />
 </div>

 <div className="grid lg:grid-cols-3 gap-8">
 {/* Left Column: Earnings & Leads */}
 <div className="lg:col-span-2 space-y-8">

 {/* Earnings Chart */}
 <motion.div
 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
 className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm"
 >
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-lg font-bold text-slate-900">Earnings Overview</h2>
 <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-1.5 outline-none text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors">
 <option>This Week</option>
 <option>Last Week</option>
 <option>This Month</option>
 </select>
 </div>
 <div className="h-[300px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={EARNINGS_DATA}>
 <defs>
 <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2} />
 <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} tickFormatter={(value) => `${value}`} />
 <Tooltip
 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
 cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
 />
 <Area type="monotone" dataKey="amount" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }} />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </motion.div>

 {/* New Job Requests */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
 New Work Requests
 </h2>
 <span className="text-xs font-bold text-slate-500">{MOCK_JOBS.length} Pending</span>
 </div>

 <div className="space-y-4">
 {MOCK_JOBS.map((job, idx) => (
 <motion.div
 key={job.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: idx * 0.1 }}
 className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
 >
 <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
 <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
 <div className="flex gap-4">
 <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm shrink-0">
 <Briefcase className="w-7 h-7" />
 </div>
 <div>
 <h3 className="font-bold text-lg text-slate-900">{job.title}</h3>
 <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
 <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location} ({job.distance})</span>
 <span className="w-1 h-1 rounded-full bg-slate-300"></span>
 <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.time}</span>
 </div>
 </div>
 </div>
 <div className="text-right">
 <p className="text-2xl font-extrabold text-slate-900 text-green-600">{job.budget}</p>
 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Budget</p>
 </div>
 </div>

 <div className="flex gap-3 pt-4 border-t border-slate-100">
 <button className="flex-1 bg-slate-900 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2">
 <Check className="w-5 h-5" /> Accept Work
 </button>
 <button className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold transition-colors flex items-center gap-2">
 <XCircle className="w-5 h-5" /> Decline
 </button>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </div>

 {/* Right Column: Schedule & Quick Stats */}
 <div className="space-y-8">
 {/* ID verification banner if needed, else Schedule */}
 <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}>
 <h2 className="text-lg font-bold text-slate-900 mb-4">Today's Schedule</h2>
 <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
 {UPCOMING_SCHEDULE.length > 0 ? UPCOMING_SCHEDULE.map((item, idx) => (
 <div key={item.id} className="p-5 hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 relative group cursor-pointer">
 <div className="flex gap-4">
 <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-600 rounded-2xl w-14 h-14 shrink-0">
 <span className="text-xs font-bold uppercase">{item.time.split(" ")[1]}</span>
 <span className="text-sm font-extrabold">{item.time.split(" ")[0]}</span>
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="font-bold text-slate-900 truncate">{item.task}</h4>
 <p className="text-sm text-slate-500 truncate mb-1">{item.client}</p>
 <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
 <MapPin className="w-3 h-3" /> {item.location}
 </div>
 </div>
 </div>
 <div className="mt-3 flex items-center justify-between">
 <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">Confirmed</span>
 <span className="font-bold text-slate-900">{item.amount}</span>
 </div>
 </div>
 )) : (
 <div className="p-8 text-center text-slate-400">
 <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
 <p className="text-sm">No jobs scheduled today.</p>
 </div>
 )}
 <div className="p-4 bg-slate-50 border-t border-slate-100">
 <button className="w-full text-center text-sm font-bold text-orange-600 hover:underline">View Full Calendar</button>
 </div>
 </div>
 </motion.div>

 {/* Verification Badge / Pro Level */}
 <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
 <div className="relative z-10">
 <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
 <ShieldCheck className="w-6 h-6 text-green-400" />
 </div>
 <h3 className="font-bold text-lg mb-1">Pro Verified</h3>
 <p className="text-slate-400 text-sm mb-4">Your profile is verified and boosted in search results.</p>
 <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
 <div className="bg-green-500 h-2 rounded-full w-[85%]"></div>
 </div>
 <div className="flex justify-between text-xs text-slate-400 font-bold">
 <span>Profile Strength</span>
 <span>85%</span>
 </div>
 </div>
 {/* Decor */}
 <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
 </div>
 </div>
 </div>
 </>
 );
}
