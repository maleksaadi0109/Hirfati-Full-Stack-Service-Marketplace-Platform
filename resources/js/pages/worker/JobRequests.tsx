import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Briefcase,
    Search,
    MapPin,
    Calendar,
    CheckCircle2,
    XCircle,
    PlayCircle,
    CheckSquare,
    MessageSquare,
    Loader2,
    Inbox
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import axios from 'axios';
import { toast } from 'sonner';

interface CustomerOrder {
    id: number;
    customer_id: number;
    service_name: string;
    scheduled_at: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    total: number;
    notes?: string;
    customer?: {
        id: number;
        user?: {
            first_name?: string;
            last_name?: string;
            name?: string;
            picture?: string;
            picture_url?: string;
        }
    };
    address?: {
        city: string;
        street: string;
    };
    created_at: string;
}

export default function JobRequests() {
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const tabs = [
        { id: 'all', label: 'All Requests' },
        { id: 'pending', label: 'Pending' },
        { id: 'confirmed', label: 'Confirmed' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
    ];

    const fetchWithAuth = async (url: string, options: any = {}) => {
        const token = localStorage.getItem('access_token');
        const headers = {
            ...options.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        return await axios({ url, ...options, headers });
    };

    const fetchJobRequests = async (page = 1, status = activeTab, search = searchQuery) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                ...(status !== 'all' && { status }),
                ...(search && { search })
            });

            const res = await fetchWithAuth(`/api/provider/job-requests?${params.toString()}`, { method: 'GET' });
            
            // Handle Laravel Pagination object
            const data = res.data?.data?.jobRequests || res.data?.jobRequests;
            if (data?.data) {
                setOrders(data.data);
                setPagination({
                    current_page: data.current_page,
                    last_page: data.last_page
                });
            } else {
                setOrders(data || []);
            }
        } catch (error) {
            console.error("Failed to load job requests:", error);
            toast.error("Failed to load job requests.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchJobRequests(1, activeTab, searchQuery);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [activeTab, searchQuery]);

    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        setActionLoading(orderId);
        try {
            await fetchWithAuth(`/api/provider/job-requests/${orderId}/status`, {
                method: 'PATCH',
                data: { status: newStatus }
            });
            toast.success(`Order marked as ${newStatus.replace('_', ' ')}.`);
            // Refresh list
            fetchJobRequests(pagination.current_page);
        } catch (error: any) {
            console.error("Status update failed:", error);
            toast.error(error.response?.data?.message || `Failed to update to ${newStatus}.`);
        } finally {
            setActionLoading(null);
        }
    };

    const getCustomerName = (c: CustomerOrder['customer']) => {
        if (!c?.user) return 'Unknown Customer';
        if (c.user.first_name || c.user.last_name) return `${c.user.first_name || ''} ${c.user.last_name || ''}`.trim();
        return c.user.name || 'Unknown Customer';
    };

    const resolvePictureUrl = (value?: string | null) => {
        if (!value) return null;
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/storage/')) {
            return value;
        }
        return `/storage/${value}`;
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
            case 'confirmed': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
            case 'in_progress': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
            case 'completed': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
            case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
            default: return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
        }
    };

    return (
        <DashboardLayout title="Job Requests">
            <Head title="Job Requests - Provider Dashboard" />

            {/* Gradient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-100/50 blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl pt-4 pb-16 px-4">
                
                <div className="mb-10 lg:flex lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-orange-600" />
                            Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Requests</span>
                        </h1>
                        <p className="mt-2 text-slate-600 font-medium">Manage and respond to your incoming customer bookings.</p>
                    </div>

                    {/* Search */}
                    <div className="mt-5 lg:mt-0 flex-1 max-w-md ml-auto">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by service or customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8 overflow-x-auto pb-4 hide-scrollbar">
                    <div className="flex gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                                    activeTab === tab.id
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                        : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60 backdrop-blur-sm'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse h-64">
                                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4" />
                                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-slate-200 rounded w-1/4 mb-6" />
                                <div className="h-10 bg-slate-200 rounded-xl w-full mt-auto" />
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-slate-200 py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Inbox className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No job requests found</h3>
                        <p className="mt-2 text-slate-500 font-medium max-w-sm">
                            {searchQuery ? "No results match your search." : "You do not have any requests in this category yet."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map((order) => {
                            const conf = getStatusConfig(order.status);
                            const customerName = getCustomerName(order.customer);
                            const picture = resolvePictureUrl(order.customer?.user?.picture || order.customer?.user?.picture_url);

                            return (
                                <div key={order.id} className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xl shadow-slate-200/30 flex flex-col hover:border-orange-200 transition-colors">
                                    
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                                                {picture ? (
                                                    <img src={picture} alt={customerName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-slate-400 font-bold bg-slate-50 border border-slate-200 rounded-full">
                                                        {customerName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-sm">{customerName}</h3>
                                                <div className="flex items-center text-xs text-slate-500 font-medium mt-0.5">
                                                    <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                                                    {order.address?.city || 'No city specified'}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${conf.bg} ${conf.text} ${conf.border}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="mb-6 flex-1">
                                        <h4 className="text-lg font-black text-slate-900 mb-2 truncate" title={order.service_name}>
                                            {order.service_name}
                                        </h4>
                                        <div className="flex flex-col gap-2 mt-3">
                                            <div className="flex items-center text-sm font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <Calendar className="w-4 h-4 mr-2.5 text-orange-500 shrink-0" />
                                                <span className="truncate">{new Date(order.scheduled_at).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center text-sm font-semibold text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
                                                <div className="w-4 h-4 mr-2.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">L</div>
                                                {Number(order.total).toFixed(2)} LYD
                                            </div>
                                        </div>
                                        {order.notes && (
                                            <div className="mt-4 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 border-dashed line-clamp-3">
                                                <span className="font-bold text-slate-700 block mb-1">Note:</span>
                                                "{order.notes}"
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                                        
                                        <Link 
                                            href={`/worker/messages?order=${order.id}`}
                                            className="flex items-center justify-center h-10 w-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
                                            title="Message Customer"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </Link>

                                        <div className="flex items-center gap-2 flex-1 justify-end">
                                            {order.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                        disabled={actionLoading === order.id}
                                                        className="px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" /> Decline
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                                        disabled={actionLoading === order.id}
                                                        className="px-4 py-2 bg-slate-900 border border-transparent text-white hover:bg-slate-800 text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {actionLoading === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        Accept
                                                    </button>
                                                </>
                                            )}

                                            {order.status === 'confirmed' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                        disabled={actionLoading === order.id}
                                                        className="h-10 w-10 flex items-center justify-center bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                                        title="Cancel Order"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                                                        disabled={actionLoading === order.id}
                                                        className="px-4 py-2 flex-1 bg-orange-600 text-white hover:bg-orange-700 text-xs font-bold rounded-xl shadow-md shadow-orange-600/20 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {actionLoading === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                                                        Start Work
                                                    </button>
                                                </>
                                            )}

                                            {order.status === 'in_progress' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                    disabled={actionLoading === order.id}
                                                    className="px-4 py-2 w-full bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                                                >
                                                    {actionLoading === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                                                    Mark as Completed
                                                </button>
                                            )}

                                            {(order.status === 'completed' || order.status === 'cancelled') && (
                                                <div className="px-4 py-2.5 bg-slate-50 border border-slate-100 text-slate-400 text-xs font-bold rounded-xl w-full text-center flex items-center justify-center gap-2">
                                                    {order.status === 'completed' ? <CheckSquare className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                    {order.status.replace('_', ' ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && pagination.last_page > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-4">
                        <button
                            disabled={pagination.current_page === 1}
                            onClick={() => fetchJobRequests(pagination.current_page - 1)}
                            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-bold text-slate-500">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>
                        <button
                            disabled={pagination.current_page === pagination.last_page}
                            onClick={() => fetchJobRequests(pagination.current_page + 1)}
                            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
