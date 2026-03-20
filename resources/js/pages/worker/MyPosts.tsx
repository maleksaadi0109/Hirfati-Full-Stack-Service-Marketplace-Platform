import React, { useEffect, useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, Sparkles, Image as ImageIcon, X, AlertCircle, Edit2, Trash2, MoreVertical } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PostCard, { Post, PostImage } from '../../components/PostCard';
import { toast } from 'sonner';

export default function MyPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals Default State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  
  const [selectedPostToDelete, setSelectedPostToDelete] = useState<number | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImagesToKeep, setExistingImagesToKeep] = useState<PostImage[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('/api/provider/posts', { method: 'GET' });
      let fetchedPosts = [];
      if (response.data?.providerPosts?.data) {
        fetchedPosts = response.data.providerPosts.data;
      } else if (Array.isArray(response.data?.providerPosts)) {
        fetchedPosts = response.data.providerPosts;
      }
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching my posts:', error);
      toast.error('Failed to load your posts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setImages([]);
    previewUrls.forEach(url => {
        if (!url.startsWith('http') && !url.startsWith('/storage')) {
            URL.revokeObjectURL(url);
        }
    });
    setPreviewUrls([]);
    setExistingImagesToKeep([]);
    setEditingPostId(null);
    setFormErrors({});
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (post: Post) => {
    resetForm();
    setEditingPostId(post.id);
    setTitle(post.title || '');
    setDescription(post.description || '');
    setCategory(post.category || '');
    
    // In this simplified update logic, we let the user re-upload all images for update
    // or we could show existing images. To keep it robust, the backend currently deletes old images if new ones are uploaded.
    // So if `images` is empty during update, backend keeps old images.
    
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Check limit
    if (images.length + files.length > 6) {
      toast.error('You can only upload up to 6 images per post.');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previewUrls];
    if (!newPreviews[index].startsWith('http') && !newPreviews[index].startsWith('/storage')) {
      URL.revokeObjectURL(newPreviews[index]); // Free memory
    }
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    if (!editingPostId && images.length === 0) {
      toast.error('Please add at least one image.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    if (description) formData.append('description', description);
    if (category) formData.append('category', category);
    
    if (images.length > 0) {
       images.forEach((image, index) => {
         formData.append(`images[${index}]`, image);
       });
    }

    try {
      if (editingPostId) {
        formData.append('_method', 'PUT');
        await fetchWithAuth(`/api/provider/posts/${editingPostId}`, {
            method: 'POST', // Use POST with _method=PUT to support FormData parsing in Laravel
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Post updated successfully!');
      } else {
        await fetchWithAuth('/api/provider/posts', {
            method: 'POST',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Post created successfully!');
      }

      setIsModalOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        toast.error('Please check the form for errors.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save post.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePost = async () => {
    if (!selectedPostToDelete) return;
    setIsSubmitting(true);
    
    // Optimistic UI updates
    const previousPosts = [...posts];
    setPosts(posts.filter(p => p.id !== selectedPostToDelete));
    
    try {
      await fetchWithAuth(`/api/provider/posts/${selectedPostToDelete}`, { method: 'DELETE' });
      toast.success('Post deleted successfully');
      setSelectedPostToDelete(null);
    } catch (error) {
      // Revert UI on failure
      setPosts(previousPosts);
      console.error('Error deleting post:', error);
      toast.error('Failed to delete the post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="My Posts">
      <Head title="My Portfolio - Hirfati" />

      {/* Gradient Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-100/50 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl pb-16 pt-4 px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 p-6 lg:p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-orange-100/50 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
          
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 font-bold text-xs uppercase tracking-wider mb-4 border border-orange-100 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Portfolio
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              My <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Work</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Showcase your recent projects, build trust, and attract more clients.
            </p>
          </div>
          
          <div className="relative z-10 w-full sm:w-auto">
            <button
              onClick={openCreateModal}
              className="group relative overflow-hidden flex w-full sm:w-auto h-14 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 font-black text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] hover:shadow-orange-500/30 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <span>Create Post</span>
              </div>
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/60 bg-white/60 p-5 animate-pulse flex flex-col gap-4 backdrop-blur-md">
                <div className="w-full aspect-video bg-slate-100 rounded-xl" />
                <div className="h-6 w-3/4 bg-slate-100 rounded-lg" />
                <div className="h-4 w-1/2 bg-slate-100 rounded-lg mt-2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-inner text-orange-400">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">Portfolio is Empty</h3>
            <p className="text-slate-500 mt-2 font-medium max-w-sm text-center mb-8">
              You haven't posted any of your work yet. Add impressive photos to attract more customers.
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Start Posting
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {posts.map((post) => (
              <div key={post.id} className="relative group">
                <PostCard post={post} showProviderInfo={false} />
                
                {/* Edit / Delete actions overlay */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                   <button 
                     onClick={(e) => { e.stopPropagation(); openEditModal(post); }} 
                     className="p-2 bg-white/90 backdrop-blur-md text-slate-700 hover:text-orange-600 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-100"
                     title="Edit Post"
                   >
                     <Edit2 className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setSelectedPostToDelete(post.id); }} 
                     className="p-2 bg-white/90 backdrop-blur-md text-slate-700 hover:text-red-600 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-100"
                     title="Delete Post"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {selectedPostToDelete && (
           <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => !isSubmitting && setSelectedPostToDelete(null)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="relative w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl z-10 text-center"
             >
               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <AlertCircle className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-extrabold text-slate-900 mb-2">Delete this post?</h3>
               <p className="text-slate-500 font-medium text-sm mb-8">
                 This action cannot be undone. It will permanently remove the post and its images from your portfolio.
               </p>
               
               <div className="flex gap-3 justify-center">
                 <button 
                   onClick={() => setSelectedPostToDelete(null)}
                   disabled={isSubmitting}
                   className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={deletePost}
                   disabled={isSubmitting}
                   className="flex-1 py-3.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 flex justify-center items-center gap-2"
                 >
                   {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
                 </button>
               </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Create / Edit Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-[2.5rem] bg-white shadow-2xl p-6 sm:p-10 z-10 my-8 flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="absolute right-6 top-6 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition-colors"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 flex-shrink-0">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {editingPostId ? 'Edit Post' : 'Create New Post'}
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {editingPostId ? 'Update your project details and images.' : 'Showcase your skills to potential clients.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-6">
                  {/* Images Upload */}
                  <div>
                    <label className="mb-2 ml-1 block text-[11px] font-black tracking-widest text-slate-400 uppercase">
                      Project Photos (Max 6) {!editingPostId && <span className="text-red-500">*</span>}
                    </label>
                    <p className="text-[10px] text-slate-400 mb-2 ml-1">
                      {editingPostId && 'Uploading new photos will overwrite the existing ones for this post.'}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {previewUrls.map((url, i) => (
                        <div key={i} className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-slate-100 group">
                          <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      ))}
                      
                      {previewUrls.length < 6 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition-all"
                        >
                          <Plus className="h-6 w-6 mb-1" />
                          <span className="text-[10px] font-bold">Add Photo</span>
                        </button>
                      )}
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2.5">
                    <label className="ml-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Modern Kitchen Plumbing Renovation"
                      className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 font-bold text-slate-800 transition-all outline-none focus:border-orange-500 focus:bg-white focus:shadow-lg focus:shadow-orange-500/10"
                    />
                    {formErrors.title && (
                      <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3"/> {formErrors.title[0]}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2.5">
                    <label className="ml-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                      Category
                    </label>
                    <input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Plumbing, Electrical, Cleaning"
                      className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 font-bold text-slate-800 transition-all outline-none focus:border-orange-500 focus:bg-white focus:shadow-lg focus:shadow-orange-500/10"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2.5">
                    <label className="ml-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell customers about the work done, materials used, etc..."
                      className="h-32 w-full resize-none rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-5 font-bold text-slate-800 transition-all outline-none focus:border-orange-500 focus:bg-white focus:shadow-lg focus:shadow-orange-500/10"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3 flex-shrink-0 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="h-14 rounded-2xl px-6 font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-8 font-black text-white hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-70 w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> {editingPostId ? 'Updating...' : 'Publishing...'}
                      </>
                    ) : (
                      editingPostId ? 'Update Post' : 'Publish Post'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
