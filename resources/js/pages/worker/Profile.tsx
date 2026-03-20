import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Award,
    Briefcase,
    Camera,
    CheckCircle2,
    DollarSign,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Save,
    Sparkles,
    User,
    PlusCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

type SavedAddress = {
    id: number;
    label: string | null;
    address_line_1: string;
    address_line_2: string | null;
    is_default: boolean;
};

export default function Profile() {
    const { auth } = usePage<any>().props;
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Addresses state
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [isAddressesLoading, setIsAddressesLoading] = useState(true);

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

    const splitName = (user: any) => {
        const firstName = user?.first_name || user?.firstName || '';
        const lastName = user?.last_name || user?.lastName || '';

        if (firstName || lastName) {
            return {
                first_name: firstName,
                last_name: lastName,
            };
        }

        const fullName = String(user?.name || '').trim();
        if (!fullName) {
            return { first_name: '', last_name: '' };
        }

        const parts = fullName.split(/\s+/);

        return {
            first_name: parts[0] || '',
            last_name: parts.slice(1).join(' '),
        };
    };

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        birthday: '',
        city: '',
        bio: '',
        hourly_rate: '',
        skills: '',
        is_available: true,
        picture: null as File | null,
    });

    useEffect(() => {
        const user = auth?.user || auth?.user?.data;
        if (user) {
            const nameParts = splitName(user);
            setFormData({
                first_name: nameParts.first_name,
                last_name: nameParts.last_name,
                email: user.email || '',
                phone_number: user.phone_number || user.phone || '',
                birthday: user.birthday || '',
                city: user.city || '',
                bio: user.provider?.bio || user.provider?.bio || '',
                hourly_rate:
                    user.provider?.hourly_rate ||
                    user.provider?.hourlyRate ||
                    '',
                skills: Array.isArray(user.provider?.skills)
                    ? user.provider.skills.join(', ')
                    : user.provider?.skills || '',
                is_available:
                    user.provider?.is_available ??
                    user.provider?.isAvailable ??
                    true,
                picture: null,
            });
            if (user.picture || user.picture_url || user.avatar_url) {
                setPreviewImage(
                    resolvePictureUrl(
                        user.picture_url || user.picture || user.avatar_url,
                    ),
                );
            }
        }
    }, [auth]);

    // Fetch addresses from identical backend
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const headers = token
                    ? { Authorization: `Bearer ${token}` }
                    : undefined;

                const response = await axios.get('/api/provider/addresses', {
                    headers,
                });

                const addresses = response.data?.data?.addresses;
                setSavedAddresses(Array.isArray(addresses) ? addresses : []);
            } catch (error) {
                console.error('Failed to load addresses:', error);
                setSavedAddresses([]);
            } finally {
                setIsAddressesLoading(false);
            }
        };

        fetchAddresses();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, picture: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setErrors({});

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null) {
                    if (key === 'is_available') {
                        data.append(key, value ? '1' : '0');
                    } else if (key === 'picture' && value instanceof File) {
                        data.append(key, value);
                    } else {
                        data.append(key, String(value));
                    }
                }
            });

            const token = localStorage.getItem('access_token');
            await axios.post('/api/provider/profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage({
                type: 'success',
                text: 'Profile updated successfully!',
            });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setMessage({
                    type: 'error',
                    text: 'Failed to update profile. Please try again.',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <DashboardLayout title="My Profile">
            <Head title="My Profile - Hirfati" />

            {/* Gradient Background Mesh */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-100/50 blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl pb-16 pt-4">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    className="mb-10 px-4"
                >
                    <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-slate-900">
                        <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                            Account Settings
                        </span>
                    </h1>
                    <p className="mt-2 text-lg font-medium text-slate-500">
                        Manage your professional presence and personal details.
                    </p>
                </motion.div>

                <div className="px-4">
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -20, height: 0 }}
                                className={`mb-8 flex items-center gap-4 rounded-2xl p-5 text-sm font-bold shadow-lg backdrop-blur-md ${message.type === 'success' ? 'border border-green-200 bg-green-50/90 text-green-700 shadow-green-100' : 'border border-red-200 bg-red-50/90 text-red-700 shadow-red-100'}`}
                            >
                                {message.type === 'success' ? (
                                    <CheckCircle2 className="h-6 w-6" />
                                ) : (
                                    <AlertCircle className="h-6 w-6" />
                                )}
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="px-4">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid gap-8 lg:grid-cols-[380px_1fr]"
                    >
                        {/* LEFT COLUMN: Profile Summary & State */}
                        <div className="space-y-8">
                            {/* Profile Photo Card */}
                            <motion.div
                                variants={itemVariants}
                                className="relative overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/70 backdrop-blur-2xl shadow-xl shadow-slate-200/50"
                            >
                                {/* Card Header Gradient Cover */}
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-orange-500 to-amber-400 opacity-90" />
                                
                                <div className="relative pt-16 pb-8 px-8 flex flex-col items-center text-center">
                                    <div className="group relative z-10 mb-6">
                                        <div className="h-36 w-36 overflow-hidden rounded-full ring-4 ring-white shadow-xl bg-slate-100">
                                            {previewImage ? (
                                                <img
                                                    src={previewImage}
                                                    alt="Profile"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-50">
                                                    <User className="h-16 w-16 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute bottom-2 right-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-all hover:scale-110 hover:bg-orange-600">
                                            <Camera className="h-5 w-5" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    </div>
                                    
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                        {`${formData.first_name} ${formData.last_name}`.trim() || 'Professional'}
                                    </h2>
                                    <p className="mt-1 flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                        <Award className="h-3.5 w-3.5" /> Service Provider
                                    </p>
                                    
                                    <div className="mt-4 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                                    
                                    <div className="mt-6 w-full space-y-4">
                                        <div className="rounded-2xl border border-white bg-white/60 px-4 py-3 text-left shadow-sm backdrop-blur-sm transition-all hover:bg-white/80">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                        Location
                                                    </p>
                                                    <p className="truncate text-sm font-bold text-slate-800">
                                                        {formData.city || 'Add your service city'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    is_available: !prev.is_available,
                                                }))
                                            }
                                            className={`group flex h-14 w-full items-center justify-between rounded-2xl border px-5 text-sm font-black transition-all shadow-sm ${formData.is_available ? 'border-green-200 bg-green-50/80 text-green-700 hover:bg-green-50' : 'border-slate-200 bg-slate-50/80 text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <div className={`relative flex h-3 w-3 items-center justify-center`}>
                                                    <div className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${formData.is_available ? 'animate-ping bg-green-400' : 'bg-slate-300'}`}></div>
                                                    <div className={`relative inline-flex h-2 w-2 rounded-full ${formData.is_available ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                                                </div>
                                                {formData.is_available ? 'Available for Work' : 'Currently Busy'}
                                            </span>
                                            <div className={`relative h-6 w-11 rounded-full transition-colors ${formData.is_available ? 'bg-green-500' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-all shadow-sm ${formData.is_available ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN: Settings Forms */}
                        <div className="space-y-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info Card */}
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-[2.5rem] border border-white/60 bg-white/80 backdrop-blur-xl p-8 sm:p-10 shadow-xl shadow-slate-200/50"
                                >
                                    <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-6">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                            Basic Information
                                        </h3>
                                    </div>

                                    <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
                                        <div className="space-y-2.5">
                                            <label className="ml-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                                First Name
                                            </label>
                                            <div className="group relative">
                                                <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-600" />
                                                <input
                                                    value={formData.first_name}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            first_name: e.target.value,
                                                        }))
                                                    }
                                                    className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 pr-4 pl-12 font-bold text-slate-800 transition-all outline-none focus:border-orange-500 focus:bg-white focus:shadow-lg focus:shadow-orange-500/10"
                                                    placeholder="First name"
                                                />
                                            </div>
                                            {errors.first_name && (
                                                <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1.5"><AlertCircle className="w-3 h-3" /> {errors.first_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="ml-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                                Last Name
                                            </label>
                                            <div className="group relative">
                                                <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-600" />
                                                <input
                                                    value={formData.last_name}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            last_name: e.target.value,
                                                        }))
                                                    }
                                                    className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 pr-4 pl-12 font-bold text-slate-800 transition-all outline-none focus:border-orange-500 focus:bg-white focus:shadow-lg focus:shadow-orange-500/10"
                                                    placeholder="Last name"
                                                />
                                            </div>
                                            {errors.last_name && (
                                                <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1.5"><AlertCircle className="w-3 h-3" /> {errors.last_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="ml-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                                Email Address
                                            </label>
                                            <div className="group relative opacity-70">
                                                <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    value={formData.email}
                                                    readOnly
                                                    className="h-14 w-full cursor-not-allowed rounded-2xl border-2 border-slate-100 bg-slate-100/50 pr-4 pl-12 font-bold text-slate-600 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="ml-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                                Phone Number
                                            </label>
                                            <div className="group relative">
                                                <Phone className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-600" />
                                                <input
                                                    value={formData.phone_number}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            phone_number: e.target.value,
                                                        }))
                                                    }
                                                    className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 pr-4 pl-12 font-bold text-slate-800 transition-all outline-none focus:border-orange-500 focus:bg-white focus:shadow-lg focus:shadow-orange-500/10"
                                                    placeholder="09..."
                                                />
                                            </div>
                                            {errors.phone_number && (
                                                <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1.5"><AlertCircle className="w-3 h-3" /> {errors.phone_number}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2.5 sm:col-span-2">
                                            <label className="ml-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                                Location / City
                                            </label>
                                            <div className="group relative">
                                                <MapPin className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-600" />
                                                <input
                                                    value={formData.city}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            city: e.target.value,
                                                        }))
                                                    }
                                                    className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 pr-4 pl-12 font-bold text-slate-800 transition-all outline-none focus:border-orange-500 focus:bg-white focus:shadow-lg focus:shadow-orange-500/10"
                                                    placeholder="Tripoli, Benghazi, Misrata, etc."
                                                />
                                            </div>
                                            {errors.city && (
                                                <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1.5"><AlertCircle className="w-3 h-3" /> {errors.city}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Professional Details Card */}
                                <motion.div
                                    variants={itemVariants}
                                    className="space-y-8 rounded-[2.5rem] border border-white/60 bg-white/80 backdrop-blur-xl p-8 sm:p-10 shadow-xl shadow-slate-200/50"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                                <Briefcase className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                                Professional Profile
                                            </h3>
                                        </div>
                                        <div className="hidden sm:block rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-sm">
                                            Public Information
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-end">
                                            <label className="ml-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                                About Me / Bio
                                            </label>
                                        </div>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    bio: e.target.value,
                                                }))
                                            }
                                            className="h-36 w-full resize-none rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-4 leading-relaxed font-bold text-slate-800 transition-all outline-none focus:border-orange-500 focus:bg-white focus:shadow-lg focus:shadow-orange-500/10"
                                            placeholder="Describe your 10+ years of experience, types of services you provide, and what makes your work excellent..."
                                        />
                                        {errors.bio && (
                                            <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1.5"><AlertCircle className="w-3 h-3" /> {errors.bio}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
                                        <div className="space-y-2.5">
                                            <label className="ml-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                                Rate (LYD)
                                            </label>
                                            <div className="group relative">
                                                <DollarSign className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-600" />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.hourly_rate}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            hourly_rate: e.target.value,
                                                        }))
                                                    }
                                                    className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 pr-5 pl-12 text-lg font-black text-slate-900 transition-all outline-none focus:border-orange-500 focus:bg-white focus:shadow-lg focus:shadow-orange-500/10"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            {errors.hourly_rate && (
                                                <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1.5"><AlertCircle className="w-3 h-3" /> {errors.hourly_rate}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="ml-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                                Core Skills 
                                            </label>
                                            <div className="group relative">
                                                <Award className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-600" />
                                                <input
                                                    value={formData.skills}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            skills: e.target.value,
                                                        }))
                                                    }
                                                    className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 pr-5 pl-12 font-bold text-slate-800 transition-all outline-none focus:border-orange-500 focus:bg-white focus:shadow-lg focus:shadow-orange-500/10"
                                                    placeholder="Plumbing, Wiring, Tiling (Comma sep.)"
                                                />
                                            </div>
                                            {errors.skills && (
                                                <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1.5"><AlertCircle className="w-3 h-3" /> {errors.skills}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Save Actions Container */}
                                <motion.div 
                                    variants={itemVariants}
                                    className="flex justify-end pt-4"
                                >
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="group relative overflow-hidden flex h-14 items-center gap-3 rounded-2xl bg-slate-900 px-10 font-black text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] hover:shadow-orange-500/30 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        <div className="relative z-10 flex items-center gap-3">
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span>Saving Changes...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-5 w-5 transition-transform group-hover:rotate-12" />
                                                    <span>Save Profile</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </motion.div>
                            </form>

                            {/* Registered Addresses Card */}
                            <motion.div variants={itemVariants} className="rounded-[2.5rem] border border-white/60 bg-white/80 backdrop-blur-xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 mt-8">
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                            Saved Addresses
                                        </h2>
                                        <p className="mt-1 text-sm font-medium text-slate-500">
                                            Manage your saved locations for your profile.
                                        </p>
                                    </div>
                                    <Link
                                        href="/worker/addresses/create"
                                        className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-100 hover:text-orange-700"
                                    >
                                        <PlusCircle className="h-5 w-5" />{' '}
                                        Add New
                                    </Link>
                                </div>

                                {isAddressesLoading ? (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-sm font-bold text-slate-400 text-center">
                                        Loading saved addresses...
                                    </div>
                                ) : savedAddresses.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-sm font-bold text-slate-500 text-center">
                                        No saved location addresses found.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                        {savedAddresses.map((address) => {
                                            const cardClassName = address.is_default
                                                ? 'group relative rounded-2xl border-2 border-orange-200 bg-orange-50/40 p-5 shadow-sm transition-all hover:bg-orange-50/60'
                                                : 'rounded-2xl border-2 border-slate-100 bg-white/60 p-5 shadow-sm transition-all hover:border-slate-200 hover:bg-white';

                                            const pinClassName = address.is_default
                                                ? 'rounded-xl border border-orange-100 bg-white p-3 text-orange-600 shadow-sm'
                                                : 'rounded-xl border border-slate-100 bg-slate-50 p-3 text-slate-400';

                                            return (
                                                <div key={address.id} className={cardClassName}>
                                                    {address.is_default && (
                                                        <div className="absolute top-4 right-4">
                                                            <span className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-1 text-[10px] font-black text-white uppercase shadow-sm">
                                                                Default
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-start gap-4">
                                                        <div className={pinClassName}>
                                                            <MapPin className="h-6 w-6" />
                                                        </div>
                                                        <div className="pr-12">
                                                            <h4 className="font-extrabold text-slate-900">
                                                                {address.label || 'Saved Location'}
                                                            </h4>
                                                            <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-500">
                                                                {address.address_line_1}
                                                                {address.address_line_2 && (
                                                                    <>
                                                                        <br />
                                                                        {address.address_line_2}
                                                                    </>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className={`mt-5 flex items-center gap-4 border-t pt-4 ${address.is_default ? 'border-orange-200/60' : 'border-slate-100'}`}>
                                                        <Link
                                                            href={`/worker/addresses/${address.id}/edit`}
                                                            className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-800"
                                                        >
                                                            Edit
                                                        </Link>
                                                        {!address.is_default && (
                                                            <button className="text-sm font-bold text-orange-600 transition-colors hover:text-orange-800">
                                                                Set Default
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
