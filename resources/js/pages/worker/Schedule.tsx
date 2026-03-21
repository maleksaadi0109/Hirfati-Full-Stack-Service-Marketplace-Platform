import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    CheckCircle2,
    XCircle,
    PlayCircle,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import axios from 'axios';
import { toast } from 'sonner';

type ScheduleOrder = {
    id: number;
    customer_name: string;
    service: string;
    scheduled_at: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    amount: string | number;
};

export default function ProviderSchedule() {
    const [orders, setOrders] = useState<ScheduleOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    // Calculate start and end of week (Sunday to Saturday)
    const weekStart = useMemo(() => {
        const d = new Date(currentDate);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }, [currentDate]);

    const weekEnd = useMemo(() => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + 6);
        return d;
    }, [weekStart]);

    const formatDateForApi = (date: Date) => {
        const d = new Date(date);
        const month = '' + (d.getMonth() + 1);
        const day = '' + d.getDate();
        const year = d.getFullYear();
        return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    };

    const fetchSchedule = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await axios.get('/api/provider/schedule', {
                params: {
                    from: formatDateForApi(weekStart),
                    to: formatDateForApi(weekEnd),
                    status: statusFilter
                },
                headers
            });
            setOrders(res.data.data.schedule || []);
        } catch (error) {
            console.error('Failed to fetch schedule', error);
            toast.error('Failed to load schedule.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [weekStart, weekEnd, statusFilter]);

    const handlePreviousWeek = () => {
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
    };

    const handleNextWeek = () => {
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
    };

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const token = localStorage.getItem('access_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.patch(`/api/provider/schedule/${orderId}/status`, {
                status: newStatus
            }, { headers });

            toast.success('Status updated successfully!');
            fetchSchedule(); // refresh UI
        } catch (error: any) {
            console.error('Update error', error);
            toast.error(error.response?.data?.message || 'Failed to update status.');
        } finally {
            setUpdatingId(null);
        }
    };

    // Group orders by Day
    const groupedOrders = useMemo(() => {
        const groups: Record<string, ScheduleOrder[]> = {};
        
        // Initialize days of the week to show them even if empty
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            groups[dateStr] = [];
        }

        orders.forEach(order => {
            if (!order.scheduled_at) return;
            const d = new Date(order.scheduled_at);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(order);
        });

        return groups;
    }, [orders, weekStart]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' };
            case 'confirmed': return { color: 'bg-blue-100 text-blue-700', label: 'Confirmed' };
            case 'in_progress': return { color: 'bg-orange-100 text-orange-700', label: 'In Progress' };
            case 'completed': return { color: 'bg-green-100 text-green-700', label: 'Completed' };
            case 'cancelled': return { color: 'bg-red-100 text-red-700', label: 'Cancelled' };
            default: return { color: 'bg-slate-100 text-slate-700', label: status };
        }
    };

    return (
        <DashboardLayout title="My Schedule">
            <Head title="My Schedule - Hirfati" />

            {/* Gradient Background Mesh */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200/40 blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl pb-16 pt-4">
                
                {/* Header & Controls */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 font-bold text-xs uppercase tracking-wider mb-4 border border-orange-100 shadow-sm">
                            <CalendarIcon className="w-4 h-4" /> Manage Schedule
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            My <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Weekly Planner</span>
                        </h1>
                    </div>

                    {/* Week Navigation */}
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <button onClick={handlePreviousWeek} className="p-2 hover:bg-white rounded-xl shadow-sm transition-colors text-slate-600">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="text-sm font-bold text-slate-800 text-center min-w-[140px]">
                            {weekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <button onClick={handleNextWeek} className="p-2 hover:bg-white rounded-xl shadow-sm transition-colors text-slate-600">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Status Filters */}
                <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
                    {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all capitalize shadow-sm ${statusFilter === status ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-20">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedOrders).map(([dateStr, dayOrders]) => (
                            <div key={dateStr} className="relative pl-4 sm:pl-8">
                                {/* Timeline Line */}
                                <div className="absolute left-[11px] sm:left-[27px] top-10 bottom-0 w-0.5 bg-slate-100"></div>
                                
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-white border-[4px] border-orange-500 shadow-sm relative z-10 flex-shrink-0" />
                                    <h2 className="text-xl font-extrabold text-slate-900">{dateStr}</h2>
                                    <div className="h-px flex-1 bg-slate-100 ml-4 hidden sm:block"></div>
                                </div>

                                <div className="pl-6 sm:pl-9 space-y-4">
                                    {dayOrders.length === 0 ? (
                                        <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 text-sm font-medium">
                                            No jobs scheduled for this day.
                                        </div>
                                    ) : (
                                        dayOrders.map((order) => {
                                            const scheduleTime = order.scheduled_at ? new Date(order.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time not set';
                                            const statusConfig = getStatusConfig(order.status);
                                            const isProcessing = updatingId === order.id;

                                            return (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    key={order.id} 
                                                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                                                >
                                                    {isProcessing && (
                                                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider ${statusConfig.color}`}>
                                                                    {statusConfig.label}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                                                                    <Clock className="w-4 h-4 text-orange-500" /> {scheduleTime}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-lg font-bold text-slate-900">{order.service}</h3>
                                                            <p className="text-sm text-slate-500 font-medium mb-4 flex items-center gap-1.5">
                                                                <MapPin className="w-4 h-4" /> Client: {order.customer_name}
                                                            </p>
                                                        </div>

                                                        <div className="text-left md:text-right">
                                                            <div className="text-2xl font-black text-slate-900">{Number(order.amount).toFixed(2)} LYD</div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between">
                                                        <div className="flex gap-2">
                                                            {/* Actions based on Status */}
                                                            {order.status === 'pending' && (
                                                                <>
                                                                    <button onClick={() => handleStatusUpdate(order.id, 'confirmed')} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-bold transition-colors">
                                                                        <CheckCircle2 className="w-4 h-4" /> Confirm
                                                                    </button>
                                                                    <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors">
                                                                        <XCircle className="w-4 h-4" /> Cancel
                                                                    </button>
                                                                </>
                                                            )}

                                                            {order.status === 'confirmed' && (
                                                                <>
                                                                    <button onClick={() => handleStatusUpdate(order.id, 'in_progress')} className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl text-sm font-bold transition-colors">
                                                                        <PlayCircle className="w-4 h-4" /> Start Work
                                                                    </button>
                                                                    <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold transition-colors">
                                                                         Cancel
                                                                    </button>
                                                                </>
                                                            )}

                                                            {order.status === 'in_progress' && (
                                                                <>
                                                                    <button onClick={() => handleStatusUpdate(order.id, 'completed')} className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl text-sm font-bold transition-colors">
                                                                        <CheckCircle2 className="w-4 h-4" /> Complete Work
                                                                    </button>
                                                                </>
                                                            )}
                                                            
                                                            {/* Re-open Cancelled or Completed? Usually just viewing, so no actions. */}
                                                        </div>

                                                        {/* Message Link */}
                                                        <Link 
                                                            href={`/worker/messages?order=${order.id}`}
                                                            className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl text-sm font-bold transition-colors"
                                                        >
                                                            <MessageSquare className="w-4 h-4" /> Message
                                                        </Link>
                                                    </div>
                                                </motion.div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
