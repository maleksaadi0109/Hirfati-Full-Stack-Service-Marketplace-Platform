import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowLeft,
    Image as ImageIcon,
    MapPin,
    Sparkles,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PostCard, { Post } from '../../components/PostCard';
import DashboardLayout from '../../layouts/DashboardLayout';

interface ProviderPostsProps {
    providerId: string;
}

export default function ProviderPosts({ providerId }: ProviderPostsProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [providerDetails, setProviderDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWithAuth = async (url: string, options: any = {}) => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                ...options.headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };
            return await axios({ url, ...options, headers });
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                window.location.href = '/login';
            }
            throw error;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [postsRes, providerRes] = await Promise.all([
                    fetchWithAuth(`/api/client/providers/${providerId}/posts`, {
                        method: 'GET',
                    }),
                    fetchWithAuth(`/api/client/providers/${providerId}`, {
                        method: 'GET',
                    }),
                ]);

                let fetchedPosts = [];
                if (postsRes.data?.providerPosts?.data) {
                    fetchedPosts = postsRes.data.providerPosts.data;
                } else if (Array.isArray(postsRes.data?.providerPosts)) {
                    fetchedPosts = postsRes.data.providerPosts;
                }
                setPosts(fetchedPosts);

                if (providerRes.data?.provider) {
                    setProviderDetails(providerRes.data.provider);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load portfolio data.');
            } finally {
                setIsLoading(false);
            }
        };

        if (providerId) {
            fetchData();
        }
    }, [providerId]);

    const resolvePictureUrl = (value?: string | null) => {
        if (!value) return null;
        if (
            value.startsWith('http://') ||
            value.startsWith('https://') ||
            value.startsWith('/storage/')
        ) {
            return value;
        }
        return `/storage/${value}`;
    };

    const getProviderName = () => {
        if (!providerDetails?.user) return 'Professional';
        const user = providerDetails.user;
        if (user.first_name || user.last_name)
            return `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return user.name || 'Professional';
    };

    const providerName = getProviderName();
    const isFromFindPros =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('from') === 'find-pros';
    const backHref = isFromFindPros ? '/client/find-pros' : '/client/explore';
    const backLabel = isFromFindPros ? 'Back to Find Pros' : 'Back to Explore';

    const handleMessageClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const toastId = toast.loading('Starting conversation...');
            const res = await fetchWithAuth('/api/client/messages/initialize', {
                method: 'POST',
                data: { provider_id: providerId },
            });
            toast.dismiss(toastId);

            if (res.data?.data?.order_id) {
                window.location.href = `/client/messages?order=${res.data.data.order_id}`;
            }
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to start conversation. Please try again.');
        }
    };

    return (
        <DashboardLayout title={`${providerName}'s Portfolio`}>
            <Head title={`${providerName} Portfolio - Hirfati`} />

            {/* Gradient Background Mesh */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-orange-200/40 blur-[120px]" />
                <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-amber-100/50 blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 pt-4 pb-16">
                {/* Navigation / Back */}
                <div className="mb-6">
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-2 rounded-2xl bg-white/60 px-5 py-2.5 text-sm font-bold text-slate-600 backdrop-blur-md transition-all hover:bg-white hover:text-orange-600 hover:shadow-lg hover:shadow-orange-500/10"
                    >
                        <ArrowLeft className="h-4 w-4" /> {backLabel}
                    </Link>
                </div>

                {/* Provider Profile Header Summary */}
                {providerDetails ? (
                    <div className="relative mb-10 flex flex-col items-center gap-6 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl md:flex-row md:items-start">
                        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-100 opacity-50 blur-3xl" />

                        <div className="relative z-10 h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border-4 border-white bg-orange-50 shadow-xl">
                            {providerDetails.user?.picture ||
                            providerDetails.user?.picture_url ? (
                                <img
                                    src={
                                        resolvePictureUrl(
                                            providerDetails.user.picture ||
                                                providerDetails.user
                                                    .picture_url,
                                        ) || ''
                                    }
                                    alt={providerName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-orange-500">
                                    <User className="h-10 w-10" />
                                </div>
                            )}
                        </div>

                        <div className="relative z-10 flex-1 text-center md:text-left">
                            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black tracking-widest text-orange-600 uppercase">
                                <Sparkles className="h-3 w-3" />
                                Verified Provider
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                {providerName}
                            </h1>
                            <div className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 md:justify-start">
                                <MapPin className="h-4 w-4 text-orange-500" />
                                {providerDetails.user?.city ||
                                    'Location unavailable'}
                            </div>

                            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                                <button
                                    type="button"
                                    onClick={handleMessageClick}
                                    disabled={!providerDetails?.id}
                                    className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800"
                                >
                                    Contact
                                </button>
                                <Link
                                    href={`/client/providers/${providerId}`}
                                    className="rounded-xl bg-orange-50 px-6 py-2.5 text-sm font-bold text-orange-600 transition-all hover:bg-orange-100"
                                >
                                    Full Profile
                                </Link>
                            </div>
                        </div>

                        <div className="relative z-10 flex h-full w-full flex-row items-center justify-around gap-6 border-t border-slate-100 pt-6 md:w-auto md:flex-col md:justify-center md:border-t-0 md:border-l md:pt-0 md:pl-8">
                            <div className="text-center">
                                <p className="text-3xl font-black text-slate-900">
                                    {posts.length}
                                </p>
                                <p className="mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                    Projects
                                </p>
                            </div>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className="mb-10 flex animate-pulse items-center gap-6 rounded-[2.5rem] border border-slate-100 bg-white p-8">
                        <div className="h-28 w-28 rounded-full bg-slate-100" />
                        <div className="flex-1">
                            <div className="mb-4 h-8 w-1/3 rounded-lg bg-slate-100" />
                            <div className="h-4 w-1/4 rounded-lg bg-slate-100" />
                        </div>
                    </div>
                ) : null}

                {/* Portfolio Posts */}
                <h2 className="mb-6 flex items-center gap-3 text-2xl font-extrabold text-slate-900">
                    Portfolio
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
                        {posts.length}
                    </span>
                </h2>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="flex animate-pulse flex-col gap-4 rounded-2xl border border-white/60 bg-white/60 p-5 backdrop-blur-md"
                            >
                                <div className="aspect-video w-full rounded-xl bg-slate-100" />
                                <div className="h-6 w-3/4 rounded-lg bg-slate-100" />
                                <div className="mt-2 h-4 w-1/2 rounded-lg bg-slate-100" />
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/60 py-20 backdrop-blur-md">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-400 shadow-inner">
                            <ImageIcon className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900">
                            No Projects
                        </h3>
                        <p className="mt-2 max-w-sm text-center font-medium text-slate-500">
                            This professional hasn't published any portfolio
                            projects yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                showProviderInfo={false}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
