import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, Search, Sparkles } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PostCard, { Post } from '../../components/PostCard';
import { toast } from 'sonner';

export default function ExplorePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWithAuth = async (url: string, options: any = {}) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      return await axios({ url, ...options, headers });
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
      throw error;
    }
  };

  const fetchPosts = async (pageNum: number, query: string = '') => {
    try {
      const qParam = query ? `&q=${encodeURIComponent(query)}` : '';
      const response = await fetchWithAuth(`/api/client/posts?page=${pageNum}${qParam}`);
      
      let newPosts: Post[] = [];
      let totalPages = 1;

      if (response.data?.providerPosts?.data) {
        newPosts = response.data.providerPosts.data;
        totalPages = response.data.providerPosts.meta?.last_page || 1;
      } else if (Array.isArray(response.data?.providerPosts)) {
        newPosts = response.data.providerPosts;
        setHasMore(false); // If it's not paginated, we don't have more
      }

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      if (pageNum >= totalPages) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts.');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, searchQuery);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce the search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setIsLoading(true);
      setPage(1);
      fetchPosts(1, value);
    }, 500); // 500ms debounce
  };

  const loadMore = () => {
    if (!hasMore || isFetchingMore) return;
    setIsFetchingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, searchQuery);
  };

  return (
    <DashboardLayout title="Explore Service Posts">
      <Head title="Explore - Hirfati" />

      {/* Gradient Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-100/50 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl pb-16 pt-4 px-4">
        {/* Header section matching existing Dashboard UI */}
        <div className="mb-8 p-6 lg:p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-orange-100/50 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 font-bold text-xs uppercase tracking-wider mb-4 border border-orange-100 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> Inspirations
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                Explore <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Latest Work</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                Discover amazing projects completed by our trusted professionals. Get inspired for your next home improvement.
              </p>
            </div>
            
            <div className="w-full md:w-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors focus-within:text-orange-600" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search projects..." 
                className="w-full md:w-72 h-14 pl-12 pr-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/60 bg-white/60 p-5 animate-pulse flex flex-col gap-4 backdrop-blur-md">
                <div className="w-full aspect-video bg-slate-100 rounded-xl" />
                <div className="h-6 w-3/4 bg-slate-100 rounded-lg" />
                <div className="h-4 w-1/2 bg-slate-100 rounded-lg mt-2" />
                <div className="h-8 w-full bg-slate-100 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-inner text-orange-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">No Projects Found</h3>
            <p className="text-slate-500 mt-2 font-medium max-w-sm text-center">
              {searchQuery ? `We couldn't find any projects matching "${searchQuery}". Try different keywords.` : "Providers haven't published any work to their portfolios. Check back later!"}
            </p>
          </div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {posts.map((post) => (
                <PostCard key={post.id} post={post} showProviderInfo={true} />
              ))}
            </motion.div>

            {hasMore ? (
              <div className="mt-16 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isFetchingMore}
                  className="group relative overflow-hidden flex h-14 items-center gap-3 rounded-2xl bg-white border border-slate-200 px-10 font-bold text-slate-700 shadow-sm transition-all hover:border-orange-200 hover:text-orange-600 hover:shadow-orange-500/10 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
                >
                  {isFetchingMore ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                      <span>Loading More...</span>
                    </>
                  ) : (
                    <span>Load More Projects</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-16 text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  You've reached the end
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
