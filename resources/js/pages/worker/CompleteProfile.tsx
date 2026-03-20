import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, Sparkles, ArrowRight, 
    User, Award, Star, DollarSign, 
    Clock, Check, AlertCircle, Loader2,
    CheckCircle2
} from 'lucide-react';
import axios from 'axios';

export default function CompleteProfile() {
    const { auth } = usePage<any>().props;
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [data, setData] = useState({
        bio: '',
        hourly_rate: '',
        skills: '',
        is_available: true
    });

    // Check if user already has profile data
    useEffect(() => {
        const user = auth?.user || JSON.parse(localStorage.getItem('user') || 'null');
        if (user?.provider) {
            setData({
                bio: user.provider.bio || '',
                hourly_rate: user.provider.hourlyRate || user.provider.hourly_rate || '',
                skills: user.provider.skills || '',
                is_available: user.provider.isAvailable ?? true
            });
        }
    }, [auth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('bio', data.bio);
            formData.append('hourly_rate', data.hourly_rate);
            formData.append('skills', data.skills);
            formData.append('is_available', data.is_available ? '1' : '0');

            await axios.post('/api/provider/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            setIsSubmitted(true);
            setTimeout(() => {
                window.location.href = '/worker/dashboard';
            }, 2000);
        } catch (error: any) {
            setIsLoading(false);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: 'Failed to update profile. Please try again.' });
            }
        }
    };

    const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-[2.5rem] p-12 text-center max-w-md shadow-2xl"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Profile Updated!</h2>
                    <p className="text-slate-500 font-medium">Your professional profile is now complete. Redirecting you to your workspace...</p>
                    <div className="mt-8 flex justify-center">
                        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900 relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
            <Head title="Complete Your Profile - Hirfati" />
            
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-orange-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-100/30 rounded-full blur-3xl" />
            </div>

            <motion.div 
                initial="hidden" animate="visible" variants={fadeInUp}
                className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60 relative z-10 overflow-hidden"
            >
                {/* Header Side Color Strip */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-orange-600 to-pink-500" />

                <div className="p-8 sm:p-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Professional Profile</h1>
                            <p className="text-slate-500 font-medium mt-1">Complete these details to stand out to clients.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {errors.general && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-shake">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {errors.general}
                            </div>
                        )}

                        {/* Bio Field */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-700 ml-1 flex items-center gap-2">
                                <User className="w-4 h-4 text-orange-500" /> Professional Bio
                            </label>
                            <textarea
                                value={data.bio}
                                onChange={e => setData(prev => ({ ...prev, bio: e.target.value }))}
                                className={`w-full h-32 px-5 py-4 bg-slate-50 border-2 rounded-2xl focus:ring-4 focus:ring-orange-500/10 outline-none transition-all resize-none font-medium text-slate-900 placeholder:text-slate-400 ${errors.bio ? 'border-red-200' : 'border-slate-100 focus:border-orange-500'}`}
                                placeholder="Tell clients about your experience, specializations, and what makes you unique..."
                            />
                            {errors.bio && <p className="text-xs text-red-500 font-bold ml-2">{errors.bio}</p>}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            {/* Hourly Rate */}
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-700 ml-1 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-orange-500" /> Hourly Rate (LYD)
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.hourly_rate}
                                        onChange={e => setData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                                        className={`w-full h-14 pl-12 pr-5 bg-slate-50 border-2 rounded-2xl focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-bold text-slate-900 ${errors.hourly_rate ? 'border-red-200' : 'border-slate-100 focus:border-orange-500'}`}
                                        placeholder="0.00"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-orange-500 transition-colors italic">LYD</div>
                                </div>
                                {errors.hourly_rate && <p className="text-xs text-red-500 font-bold ml-2">{errors.hourly_rate}</p>}
                            </div>

                            {/* Availability Toggle */}
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-700 ml-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-500" /> Availability Status
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setData(prev => ({ ...prev, is_available: !prev.is_available }))}
                                    className={`w-full h-14 px-5 rounded-2xl border-2 font-bold transition-all flex items-center justify-between group ${data.is_available ? 'bg-green-50 border-green-100 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full animate-pulse ${data.is_available ? 'bg-green-500' : 'bg-slate-300'}`} />
                                        {data.is_available ? 'Available Now' : 'Offline / Busy'}
                                    </span>
                                    <div className={`w-12 h-6 rounded-full relative transition-colors ${data.is_available ? 'bg-green-500' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${data.is_available ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Skills Field */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-700 ml-1 flex items-center gap-2">
                                <Award className="w-4 h-4 text-orange-500" /> Core Skills
                            </label>
                            <input
                                type="text"
                                value={data.skills}
                                onChange={e => setData(prev => ({ ...prev, skills: e.target.value }))}
                                className={`w-full h-14 px-5 bg-slate-50 border-2 rounded-2xl focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 ${errors.skills ? 'border-red-200' : 'border-slate-100 focus:border-orange-500'}`}
                                placeholder="E.g. Pipe Repair, Leak Detection, Industrial Wiring..."
                            />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">Separate skills with commas</p>
                            {errors.skills && <p className="text-xs text-red-500 font-bold ml-2">{errors.skills}</p>}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 bg-slate-900 hover:bg-orange-600 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 active:scale-95 transition-all text-xl flex items-center justify-center gap-3 group disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Updating Profile...
                                    </>
                                ) : (
                                    <>
                                        Finish Setup
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            <p className="text-center text-slate-400 text-xs font-bold mt-6 uppercase tracking-widest">Hirfati Trusted Professional Agreement</p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
