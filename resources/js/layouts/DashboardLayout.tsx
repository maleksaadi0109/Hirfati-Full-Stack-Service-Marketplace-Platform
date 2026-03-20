import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 LayoutDashboard, MessageSquare, Settings,
 ShoppingBag, Search, Bell, LogOut,
 Briefcase, Calendar, Star, User, Menu, X,
 DollarSign, Sparkles
} from 'lucide-react';
import { NavItem } from '../pages/dashboard/components/DashboardComponents';
import { Toaster } from 'sonner';

// Background Shapes Component (Static & Optimized for Performance)
const DashboardBackgroundShapes = () => (
 <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
 <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100/40 to-pink-100/40 rounded-full blur-3xl opacity-50 transform -translate-x-1/4 -translate-y-1/4" />
 <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-100/30 to-purple-100/30 rounded-full blur-3xl opacity-50 transform translate-x-1/4 translate-y-1/4" />
 </div>
);

export default function DashboardLayout({ children, title = "Dashboard" }: any) {
 const { auth } = usePage<any>().props;
    const [localUserData] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || localStorage.getItem('herfati_user_data') || 'null');
        } catch { return null; }
    });

  const user = auth?.user || localUserData || { name: "Malek Saadi", firstName: "Malek", lastName: "Saadi", role: "client" };
 const role = user.role || localStorage.getItem('herfati_user_role') || 'client';
 
 const isClientRoute = typeof window !== 'undefined' && (window.location.pathname.includes('/client') || window.location.pathname.includes('/my-orders'));
 const displayRole = isClientRoute ? 'client' : (role === 'customer' ? 'client' : role);

 const [isSidebarOpen, setIsSidebarOpen] = useState(false);

 const handleLogout = () => {
 localStorage.removeItem('herfati_user_data');
 localStorage.removeItem('herfati_user_role');
 router.post('/logout');
 };

 const initials = user.firstName ? (user.firstName[0] + (user.lastName ? user.lastName[0] : '')).toUpperCase() : 'HE';

 return (
 <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900 relative overflow-hidden flex">
 <Toaster position="top-center" richColors />
 <Head title={`${title} - Hirfati`} />

 <DashboardBackgroundShapes />

 {/* --- Mobile Overlay --- */}
 <AnimatePresence>
 {isSidebarOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setIsSidebarOpen(false)}
 className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
 />
 )}
 </AnimatePresence>

 {/* --- Sidebar --- */}
 <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-xl shadow-slate-200/50 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
 <div className="p-8 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="relative">
 <div className="absolute inset-0 bg-orange-500 blur-sm opacity-50 rounded-xl"></div>
 <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
 <span className="text-xl">H</span>
 </div>
 </div>
 <div>
 <span className="font-extrabold text-slate-800 text-xl tracking-tight block leading-none">Hirfati</span>
 <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Dashboard</span>
 </div>
 </div>
 <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
 <X className="w-6 h-6" />
 </button>
 </div>

 <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4 custom-scrollbar">
 <div className="px-4 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Main Menu</div>

 {displayRole === 'client' ? (
 <NavItem icon={<LayoutDashboard />} label="Dashboard" active={window.location.pathname.includes('/client/dashboard')} href="/client/dashboard" />
 ) : (
 <NavItem icon={<LayoutDashboard />} label="Workspace" active={window.location.pathname.includes('/worker/dashboard')} href="/worker/dashboard" />
 )}

 <NavItem
 icon={<MessageSquare />}
 label="Messages"
 badge={2}
 active={window.location.pathname.includes('/messages')}
 href={displayRole === 'client' ? '/client/messages' : '/worker/messages'}
 />

 <div className="my-6 border-t border-slate-100/50 mx-4"></div>
 <div className="px-4 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Workspace</div>

 {displayRole === 'client' ? (
 <>
 <NavItem icon={<Sparkles />} label="Explore" href="/client/explore" active={window.location.pathname.includes('/client/explore')} />
 <NavItem icon={<ShoppingBag />} label="My Orders" href="/my-orders" active={window.location.pathname.includes('/my-orders')} />
 <NavItem icon={<Search />} label="Find Pros" href="/client/find-pros" active={window.location.pathname.includes('/client/find-pros')} />
 <NavItem icon={<User />} label="My Profile" href="/client/profile" active={window.location.pathname.includes('/client/profile')} />
 </>
 ) : (
 <>
 <NavItem icon={<Briefcase />} label="Job Requests" badge={3} />
 <NavItem icon={<Sparkles />} label="Portfolio" href="/worker/posts" active={window.location.pathname.includes('/worker/posts')} />
 <NavItem icon={<DollarSign />} label="Earnings" />
 <NavItem icon={<Star />} label="My Reviews" />
 <NavItem icon={<Calendar />} label="Schedule" />
 <NavItem icon={<User />} label="My Profile" href="/worker/profile" active={window.location.pathname.includes('/worker/profile')} />
 </>
 )}

 <div className="mt-auto pt-6">
 <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-4 mx-2 border border-orange-100">
 <div className="flex items-start gap-3">
 <div className="p-2 bg-white rounded-xl shadow-sm">
 <Sparkles className="w-5 h-5 text-orange-500" />
 </div>
 <div>
 <h4 className="font-bold text-slate-900 text-sm">Premium Plan</h4>
 <p className="text-xs text-slate-500 mt-1 mb-2">Unlock all features</p>
 <button className="text-xs font-bold text-orange-600 hover:text-orange-700">Upgrade Now &rarr;</button>
 </div>
 </div>
 </div>
 </div>
 </nav>

 <div className="p-6">
 <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-semibold group border border-transparent hover:border-red-100">
 <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
 <span>Sign Out</span>
 </button>
 </div>
 </aside>

 {/* --- Main Content --- */}
 <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative z-10">

 {/* Header */}
 <header className="bg-white/40 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b border-white/40 transition-all">
 <div className="flex items-center gap-4">
 <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-white/50 rounded-xl transition-colors">
 <Menu className="w-6 h-6" />
 </button>
 <div className="flex flex-col">
 <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
 {displayRole !== 'client' ? 'Pro Workspace' : 'Overview'}
 </h1>
 <p className="text-sm text-slate-500 font-medium hidden sm:block">
 {displayRole !== 'client' ? "Ready to make some money today?" : "Welcome back, manage your home services."}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <motion.div
 whileHover={{ scale: 1.02 }}
 className="hidden md:flex items-center bg-white/60 backdrop-blur-sm rounded-2xl px-5 py-2.5 border border-white/50 focus-within:border-orange-500/30 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all w-72 shadow-sm"
 >
 <Search className="w-4 h-4 text-slate-400" />
 <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm ml-3 w-full placeholder:text-slate-400 text-slate-700 font-medium" />
 </motion.div>

 <button className="relative p-2.5 bg-white/60 hover:bg-orange-50 text-slate-500 hover:text-orange-600 rounded-2xl transition-all active:scale-95 border border-white/50 shadow-sm">
 <Bell className="w-5 h-5" />
 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
 </button>

 <div className="flex items-center gap-3 pl-4 border-l border-slate-200/50">
 <div className="text-right hidden sm:block">
 <p className="text-sm font-bold text-slate-800 leading-none">{user.firstName}</p>
 <p className="text-xs text-slate-500 capitalize font-medium mt-1">{role}</p>
 </div>
 <div className="relative group cursor-pointer">
 <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all border-2 border-white ring-2 ring-transparent group-hover:ring-orange-200">
 {initials}
 </div>
 <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
 </div>
 </div>
 </div>
 </header>

 {/* Dashboard Content */}
 <div className="flex-1 overflow-auto p-4 sm:p-8 custom-scrollbar">
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="max-w-7xl mx-auto space-y-8"
 >
 {children}
 </motion.div>
 </div>
 </main>
 </div>
 );
}
