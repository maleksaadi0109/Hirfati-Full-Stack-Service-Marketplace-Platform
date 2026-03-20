import { Head, Link, router } from '@inertiajs/react';
import React, { FormEventHandler, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Shield, Users, Star, Award, CheckCircle, TrendingUp, User, Phone, MapPin, Check, Briefcase, UserCircle2, Upload, ArrowRight, ChevronLeft, AlertCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import axios from 'axios';
declare function route(name: string, params?: any, absolute?: boolean): string;

// Enhanced 3D Floating Shapes Component
const FloatingShapes = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <motion.div
                animate={{ x: [0, 100, -50, 0], y: [0, -80, 80, 0], scale: [1, 1.3, 0.9, 1] }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: 'transform' }}
                className="absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/40 to-pink-500/40 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, -120, 80, 0], y: [0, 100, -60, 0], scale: [1, 1.2, 1.1, 1] }}
                transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: 'transform' }}
                className="absolute top-1/2 right-10 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, 60, -80, 0], y: [0, -100, 50, 0], scale: [1, 1.4, 0.8, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: 'transform' }}
                className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-yellow-500/25 to-orange-500/25 rounded-full blur-3xl"
            />
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{ left: `${((i * 13) % 100)}%`, top: `${((i * 19 + 5) % 100)}%` }}
                    animate={{ y: [0, -40, 0], rotate: [0, 360], opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                    transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                >
                    <div
                        className={`${i % 3 === 0 ? 'bg-gradient-to-br from-orange-400/30 to-pink-400/30' : i % 3 === 1 ? 'bg-gradient-to-br from-blue-400/30 to-purple-400/30' : 'bg-gradient-to-br from-yellow-400/30 to-orange-400/30'} ${i % 2 === 0 ? 'rounded-full' : 'rounded-lg rotate-45'} shadow-2xl`}
                        style={{ width: `${20 + (i * 7) % 50}px`, height: `${20 + (i * 7) % 50}px` }}
                    />
                </motion.div>
            ))}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>
        </div>
    );
};

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const fadeInLeft = { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2 } } };
const scaleIn = { hidden: { scale: 0.95, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { duration: 0.5, delay: 0.3 } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };

const PROFESSIONS = ['Plumber', 'Electrician', 'Cleaner', 'Painter', 'Carpenter', 'Mover', 'AC Technician', 'Handyman'];

const InputWrapper = ({ icon }: { icon: React.ReactNode }) => (
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
            {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" })}
        </motion.div>
    </div>
);

type Role = 'client' | 'professional' | null;

export default function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);

    // Verification state
    const [pendingToken, setPendingToken] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [verifyError, setVerifyError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Location detection state
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [data, setDataState] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: null as Role,
        profession: '',
        experience: '',
        id_document: null as File | null,
        picture: null as File | null,
        birthday: '',
    });

    const setData = (key: string, value: any) => {
        setDataState(prev => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };

    const totalSteps = 5; // Step 1: Basic Info, Step 2: Role, Step 3: Location, Step 4: Profile Details, Step 5: Verification

    const detectLocation = () => {
        setIsDetecting(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                    setIsDetecting(false);
                },
                (error) => {
                    let errorMessage = "Could not detect location. Please try again later.";
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = "Location access was denied. Please allow location access in your browser or address bar.";
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMessage = "Location information is unavailable on this device or network.";
                    } else if (error.code === error.TIMEOUT) {
                        errorMessage = "The location request timed out.";
                    }
                    console.error("Geolocation Error:", error.message);
                    alert(errorMessage);
                    setIsDetecting(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
            setIsDetecting(false);
        }
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!data.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!data.last_name.trim()) newErrors.last_name = 'Last name is required';
        if (!data.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!data.email.trim()) newErrors.email = 'Email is required';
        if (!data.password) newErrors.password = 'Password is required';
        if (data.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (data.password !== data.password_confirmation) newErrors.password_confirmation = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!data.role) newErrors.role = 'Please select your role';
        if (data.role === 'professional' && !data.profession) newErrors.profession = 'Please select your profession';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!validateStep1()) return;
            setDirection(1);
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!validateStep2()) return;
            setDirection(1);
            setCurrentStep(3);
        } else if (currentStep === 3) {
            setDirection(1);
            setCurrentStep(4);
        } else if (currentStep === 4) {
            handleSubmitRegistration();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setDirection(-1);
            setCurrentStep(c => c - 1);
        }
    };

    const handleSubmitRegistration = async () => {
        setIsLoading(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('first_name', data.first_name);
            formData.append('last_name', data.last_name);
            formData.append('phone_number', data.phone);
            formData.append('email', data.email);
            formData.append('password', data.password);
            formData.append('password_confirmation', data.password_confirmation);

            if (data.role) {
                formData.append('role', data.role);
            }
            if (data.profession) {
                formData.append('profession', data.profession);
            }
            if (data.experience) {
                formData.append('experience', data.experience);
            }
            if (location) {
                formData.append('latitude', location.lat.toString());
                formData.append('longitude', location.lng.toString());
            }
            if (data.id_document) {
                formData.append('id_document', data.id_document);
            }
            if (data.picture instanceof File) {
                formData.append('picture', data.picture);
            }
            if (data.birthday) {
                formData.append('birthday', data.birthday);
            }

            const response = await axios.post('/api/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.data?.pending_token) {
                setPendingToken(response.data.data.pending_token);
                setDirection(1);
                setCurrentStep(5); // Go to verification step
            }
        } catch (error: unknown) {
            setIsLoading(false);
            if (axios.isAxiosError(error) && error.response?.data?.errors) {
                const apiErrors = error.response.data.errors;
                const formattedErrors: Record<string, string> = {};
                Object.keys(apiErrors).forEach(key => {
                    const fieldName = key === 'phone_number' ? 'phone' : key;
                    formattedErrors[fieldName] = apiErrors[key][0];
                });
                setErrors(formattedErrors);
                // Go back to step 1 if there are basic field errors
                if (formattedErrors.first_name || formattedErrors.last_name || formattedErrors.phone || formattedErrors.email || formattedErrors.password) {
                    setCurrentStep(1);
                }
            } else if (axios.isAxiosError(error) && error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else {
                setErrors({ general: 'An error occurred during registration. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const [showPendingApproval, setShowPendingApproval] = useState(false);

    const handleVerify = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setVerifyError('Please enter the 6-digit code from your email.');
            return;
        }
        setIsVerifying(true);
        setVerifyError('');

        try {
            const response = await axios.post('/api/register/verify', {
                pending_token: pendingToken,
                code: verificationCode,
            });

            const result = response.data;
            const accessToken = result.data?.access_token;
            const userData = result.data?.user;

            if (accessToken) localStorage.setItem('access_token', accessToken);
            if (userData) localStorage.setItem('user', JSON.stringify(userData));

            // Role-based redirect
            const role = userData?.role || userData?.data?.role;
            if (role === 'provider') {
                window.location.href = '/pending-approval';
            } else {
                window.location.href = '/client/dashboard';
            }
        } catch (error: unknown) {
            setIsVerifying(false);
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setVerifyError(error.response.data.message);
            } else {
                setVerifyError('Verification failed. Please try again.');
            }
        }
    };

    const handleResendCode = async () => {
        if (!pendingToken) return;
        try {
            await axios.post('/register/resend', { pending_token: pendingToken });
            setVerifyError('');
            alert('Verification code resent to your email!');
        } catch (error: any) {
            if (error.response?.data?.message) {
                setVerifyError(error.response.data.message);
            }
        }
    };

    const calculatePasswordStrength = (password: string) => {
        let score = 0;
        if (!password) return score;
        if (password.length >= 8) score += 20;
        if (password.length >= 12) score += 20;
        if (/[A-Z]/.test(password)) score += 20;
        if (/[0-9]/.test(password)) score += 20;
        if (/[^A-Za-z0-9]/.test(password)) score += 20;
        return Math.min(100, score);
    };

    const getStrengthColor = (score: number) => {
        if (score === 0) return 'bg-slate-200';
        if (score <= 40) return 'bg-red-500';
        if (score <= 60) return 'bg-yellow-500';
        if (score <= 80) return 'bg-green-400';
        return 'bg-green-600';
    };

    const getStrengthText = (score: number) => {
        if (score === 0) return '';
        if (score <= 40) return 'Weak';
        if (score <= 60) return 'Fair';
        if (score <= 80) return 'Good';
        return 'Strong';
    };

    const slideVariants = {
        enter: (d: number) => ({ x: d > 0 ? 30 : -30, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 30 : -30, opacity: 0 })
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-white to-orange-50/30 font-sans selection:bg-orange-200 relative">
            <Head title="Sign Up - Hirfati" />

            <div className="absolute inset-0 opacity-[0.015]">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 lg:p-16 xl:p-24 relative z-10 bg-white min-h-screen">
                <motion.div
                    id="register-form"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="max-w-md mx-auto w-full py-10"
                >
                    {/* Logo & Back Link */}
                    <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <motion.div className="relative" whileHover={{ scale: 1.05, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-xl ring-2 ring-orange-200 group-hover:ring-orange-400 transition-all">
                                    <img src="/images/hirfati-logo.jpg" alt="Hirfati Logo" className="w-full h-full object-cover" />
                                </div>
                            </motion.div>
                            <div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-orange-900 bg-clip-text text-transparent tracking-tight">Hirfati</span>
                                <div className="text-[10px] text-orange-600 font-semibold -mt-0.5">حرفتي</div>
                            </div>
                        </Link>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-all group text-sm font-semibold bg-gradient-to-br from-slate-50 to-slate-100 hover:from-orange-50 hover:to-orange-100 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-orange-200 shadow-sm hover:shadow-md"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span>Back</span>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Progress Indicator */}
                    <motion.div variants={fadeInUp} className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center gap-2 flex-1">
                                    <div className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${step <= currentStep ? 'bg-orange-500' : 'bg-slate-200'}`} />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 font-semibold">Step {currentStep} of {totalSteps}</p>
                    </motion.div>

                    {/* Header */}
                    {currentStep <= 2 && (
                        <motion.div variants={fadeInLeft} className="mb-8">
                            <motion.div className="flex items-center gap-3 mb-6" initial={{ width: 0 }} animate={{ width: 'auto' }} transition={{ delay: 0.3, duration: 0.6 }}>
                                <div className="h-1 w-12 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 rounded-full shadow-lg shadow-orange-500/50" />
                                <span className="text-orange-600 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    {currentStep === 1 ? 'Start your journey' : 'Choose your role'}
                                </span>
                            </motion.div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight leading-[1.1]">
                                {currentStep === 1 ? (
                                    <>Create your<br /><span className="bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500 bg-clip-text text-transparent">account</span></>
                                ) : (
                                    <>Tell us about<br /><span className="bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500 bg-clip-text text-transparent">yourself</span></>
                                )}
                            </h1>
                            <p className="text-slate-600 text-lg font-medium">
                                {currentStep === 1 ? 'Join thousands of professionals and grow your business today.' : 'This helps us personalize your experience.'}
                            </p>
                        </motion.div>
                    )}

                    {/* General Error */}
                    {errors.general && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 flex items-center gap-3 text-sm font-medium text-red-700 bg-red-50 p-4 rounded-2xl border border-red-200"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {errors.general}
                        </motion.div>
                    )}

                    {/* Form Content */}
                    <motion.div
                        variants={scaleIn}
                    >
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: "easeOut" }}
                            >
                                {/* STEP 1: Basic Info */}
                                {currentStep === 1 && (
                                    <div className="space-y-5">
                                        {/* Name Row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <motion.div className="space-y-2 relative">
                                                <Label htmlFor="first_name" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                    First Name
                                                </Label>
                                                <div className="relative group">
                                                    <InputWrapper icon={<User />} />
                                                    <input id="first_name" name="first_name" value={data.first_name} onChange={e => setData('first_name', e.target.value)} required placeholder="e.g. John" className={`w-full h-14 pl-12 pr-10 border-2 focus:ring-2 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md outline-none ${errors.first_name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : data.first_name ? 'border-green-300 focus:border-green-500 focus:ring-green-200' : 'border-slate-200 focus:border-orange-500 focus:ring-orange-200'}`} autoFocus />
                                                    {data.first_name && !errors.first_name && (
                                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <InputError message={errors.first_name} className="absolute -bottom-5" />
                                            </motion.div>

                                            <motion.div className="space-y-2 relative">
                                                <Label htmlFor="last_name" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                    Last Name
                                                </Label>
                                                <div className="relative group">
                                                    <InputWrapper icon={<User />} />
                                                    <input id="last_name" name="last_name" value={data.last_name} onChange={e => setData('last_name', e.target.value)} required placeholder="e.g. Doe" className={`w-full h-14 pl-12 pr-10 border-2 focus:ring-2 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md outline-none ${errors.last_name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : data.last_name ? 'border-green-300 focus:border-green-500 focus:ring-green-200' : 'border-slate-200 focus:border-orange-500 focus:ring-orange-200'}`} />
                                                    {data.last_name && !errors.last_name && (
                                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <InputError message={errors.last_name} className="absolute -bottom-5" />
                                            </motion.div>
                                        </div>

                                        <motion.div className="space-y-2 relative pt-2">
                                            <Label htmlFor="phone" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                Phone Number
                                            </Label>
                                            <div className="relative group">
                                                <InputWrapper icon={<Phone />} />
                                                <input id="phone" type="tel" name="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} required placeholder="+218 9x xxx xxxx" className={`w-full h-14 pl-12 pr-10 border-2 focus:ring-2 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md outline-none ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : data.phone ? 'border-green-300 focus:border-green-500 focus:ring-green-200' : 'border-slate-200 focus:border-orange-500 focus:ring-orange-200'}`} />
                                                {data.phone && !errors.phone && (
                                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <InputError message={errors.phone} className="absolute -bottom-5" />
                                        </motion.div>

                                        <motion.div className="space-y-2 relative pt-2">
                                            <Label htmlFor="email" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                Email Address
                                            </Label>
                                            <div className="relative group">
                                                <InputWrapper icon={<Mail />} />
                                                <input id="email" type="email" name="email" value={data.email} onChange={e => setData('email', e.target.value)} required placeholder="name@example.com" className={`w-full h-14 pl-12 pr-10 border-2 focus:ring-2 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md outline-none ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : data.email ? 'border-green-300 focus:border-green-500 focus:ring-green-200' : 'border-slate-200 focus:border-orange-500 focus:ring-orange-200'}`} />
                                                {data.email && !errors.email && (
                                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <InputError message={errors.email} className="absolute -bottom-5" />
                                        </motion.div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                                            <motion.div className="space-y-2 relative">
                                                <Label htmlFor="password" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                    Password
                                                </Label>
                                                <div className="relative group">
                                                    <InputWrapper icon={<Lock />} />
                                                    <input id="password" type={showPassword ? "text" : "password"} name="password" value={data.password} className={`w-full h-14 pl-12 pr-12 border-2 focus:ring-2 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md outline-none ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-orange-500 focus:ring-orange-200'}`} onChange={(e) => setData('password', e.target.value)} placeholder="••••••••" required />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center z-50 text-slate-400 hover:text-orange-600 transition-colors">
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>

                                                {data.password && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5 absolute w-full -bottom-6">
                                                        <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className={`h-full ${getStrengthColor(calculatePasswordStrength(data.password))}`}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.max(10, calculatePasswordStrength(data.password))}%` }}
                                                                transition={{ duration: 0.3 }}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                                <InputError message={errors.password} className="absolute -bottom-5" />
                                            </motion.div>

                                            <motion.div className="space-y-2 relative">
                                                <Label htmlFor="password_confirmation" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                    Confirm Password
                                                </Label>
                                                <div className="relative group">
                                                    <InputWrapper icon={<Shield />} />
                                                    <input id="password_confirmation" type={showConfirmPassword ? "text" : "password"} name="password_confirmation" value={data.password_confirmation} className={`w-full h-14 pl-12 pr-12 border-2 focus:ring-2 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md outline-none ${errors.password_confirmation ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : (data.password_confirmation && data.password === data.password_confirmation) ? 'border-green-300 focus:border-green-500 focus:ring-green-200' : 'border-slate-200 focus:border-orange-500 focus:ring-orange-200'}`} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="••••••••" required />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center z-50 text-slate-400 hover:text-orange-600 transition-colors">
                                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                <InputError message={errors.password_confirmation} className="absolute -bottom-5" />
                                            </motion.div>
                                        </div>

                                        <motion.div whileHover={{ scale: 1.02 }} className="pt-8">
                                            <Button type="button" onClick={handleNext} className="w-full h-14 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-2 group">
                                                Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </motion.div>
                                    </div>
                                )}

                                {/* STEP 2: Role Selection */}
                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <motion.button
                                                type="button"
                                                onClick={() => setData('role', 'client')}
                                                whileHover={{ y: -4, scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`relative p-6 sm:p-8 rounded-2xl border-2 text-left transition-all overflow-hidden group ${data.role === 'client' ? 'border-orange-500 bg-orange-50/50 shadow-[0_8px_30px_rgb(249,115,22,0.12)]' : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100/50'}`}
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br from-orange-400/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 ${data.role === 'client' ? 'opacity-100' : 'group-hover:opacity-100'}`} />
                                                <div className="relative z-10">
                                                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 transition-all duration-500 shadow-sm ${data.role === 'client' ? 'bg-gradient-to-tr from-orange-600 to-orange-400 text-white shadow-orange-500/40 rotate-[-5deg] scale-110' : 'bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 group-hover:border-orange-200 group-hover:rotate-[-5deg] group-hover:scale-110'}`}>
                                                        <UserCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                                                        {data.role === 'client' && (
                                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-white rounded-full text-orange-500 drop-shadow-md border border-orange-100">
                                                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                    <h3 className="font-bold text-xl sm:text-2xl text-slate-900 mb-1.5 sm:mb-2 group-hover:text-orange-600 transition-colors">Hire a Pro</h3>
                                                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">Find trusted experts and get tasks done.</p>
                                                </div>
                                                <div className={`absolute top-0 right-0 p-4 transition-transform duration-500 ${data.role === 'client' ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-4 -translate-y-4 opacity-0 group-hover:translate-x-0 group-hover:-translate-y-0 group-hover:opacity-100'}`}>
                                                    <div className="w-24 h-24 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-full blur-2xl" />
                                                </div>
                                            </motion.button>

                                            <motion.button
                                                type="button"
                                                onClick={() => setData('role', 'professional')}
                                                whileHover={{ y: -4, scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`relative p-6 sm:p-8 rounded-2xl border-2 text-left transition-all overflow-hidden group ${data.role === 'professional' ? 'border-orange-500 bg-orange-50/50 shadow-[0_8px_30px_rgb(249,115,22,0.12)]' : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100/50'}`}
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br from-orange-400/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 ${data.role === 'professional' ? 'opacity-100' : 'group-hover:opacity-100'}`} />
                                                <div className="relative z-10">
                                                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 transition-all duration-500 shadow-sm ${data.role === 'professional' ? 'bg-gradient-to-tr from-pink-600 to-orange-500 text-white shadow-orange-500/40 rotate-[5deg] scale-110' : 'bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 group-hover:border-orange-200 group-hover:rotate-[5deg] group-hover:scale-110'}`}>
                                                        <Briefcase className="w-7 h-7 sm:w-8 sm:h-8" />
                                                        {data.role === 'professional' && (
                                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-white rounded-full text-orange-500 drop-shadow-md border border-orange-100">
                                                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                    <h3 className="font-bold text-xl sm:text-2xl text-slate-900 mb-1.5 sm:mb-2 group-hover:text-orange-600 transition-colors">Offer Services</h3>
                                                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">Find new customers and grow your business.</p>
                                                </div>
                                                <div className={`absolute top-0 right-0 p-4 transition-transform duration-500 ${data.role === 'professional' ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-4 -translate-y-4 opacity-0 group-hover:translate-x-0 group-hover:-translate-y-0 group-hover:opacity-100'}`}>
                                                    <div className="w-24 h-24 bg-gradient-to-bl from-pink-500/20 to-transparent rounded-full blur-2xl" />
                                                </div>
                                            </motion.button>
                                        </div>
                                        {errors.role && <p className="text-sm text-red-500 font-bold text-center mt-2 bg-red-50 py-2 rounded-lg">{errors.role}</p>}

                                        {/* Professional-specific fields */}
                                        <AnimatePresence mode="wait">
                                            {data.role === 'professional' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-4 pt-4 border-t border-slate-100"
                                                >
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                            <Briefcase className="w-4 h-4 text-orange-500" /> Profession
                                                        </Label>
                                                        <select
                                                            value={data.profession}
                                                            onChange={(e) => setData('profession', e.target.value)}
                                                            className="w-full h-14 px-4 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 font-medium shadow-sm outline-none appearance-none cursor-pointer"
                                                        >
                                                            <option value="">Select profession...</option>
                                                            {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                                        </select>
                                                        <InputError message={errors.profession} />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700 font-bold text-sm">Years of Experience (Optional)</Label>
                                                        <input
                                                            type="number" min="0" value={data.experience}
                                                            onChange={(e) => setData('experience', e.target.value)}
                                                            placeholder="e.g. 5"
                                                            className="w-full h-14 px-4 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm outline-none"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                            <Upload className="w-4 h-4 text-orange-500" /> Verification ID (Optional)
                                                        </Label>
                                                        <input
                                                            type="file"
                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                            onChange={(e) => setData('id_document', e.target.files?.[0] || null)}
                                                            className="w-full p-3 border-2 border-orange-200 border-dashed focus:border-orange-500 rounded-xl bg-white/60 transition-all text-slate-600 font-medium shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer"
                                                        />
                                                        {data.id_document && (
                                                            <p className="text-sm text-green-600 font-semibold flex items-center gap-2">
                                                                <Check className="w-4 h-4" /> {data.id_document.name}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-slate-400">Upload your ID or certification to speed up approval.</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="flex gap-3 pt-4">
                                            <Button type="button" variant="outline" onClick={handleBack} className="flex-1 h-14 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:border-orange-300 hover:text-orange-600 transition-all">
                                                <ChevronLeft className="w-4 h-4 mr-2" /> Back
                                            </Button>
                                            <Button
                                                type="button" onClick={handleNext} disabled={isLoading}
                                                className="flex-[2] h-14 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                                {isLoading ? 'Creating Account...' : 'Continue'}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: Location Details */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-6">
                                            <motion.div
                                                className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30"
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <MapPin className="w-10 h-10 text-white" />
                                            </motion.div>
                                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Your Location</h2>
                                            <p className="text-slate-600 font-medium">
                                                Helping us know your location allows us to connect you with {data.role === 'client' ? 'professionals' : 'clients'} near you.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <Button
                                                type="button" variant="outline" onClick={detectLocation} disabled={isDetecting}
                                                className={`w-full h-16 rounded-xl border-2 transition-all shadow-sm flex items-center justify-center gap-3 font-bold text-lg bg-white ${location ? 'border-green-500 text-green-700 hover:bg-green-100 hover:border-green-600' : 'border-orange-200 text-orange-600 hover:border-orange-400 hover:bg-orange-50'}`}
                                            >
                                                {isDetecting ? (
                                                    <><Loader2 className="w-6 h-6 animate-spin text-orange-500" /> Detecting Location...</>
                                                ) : location ? (
                                                    <><CheckCircle className="w-6 h-6 text-green-600" /> Location Detected Successfully</>
                                                ) : (
                                                    <><MapPin className="w-6 h-6" /> Auto-Detect My Location</>
                                                )}
                                            </Button>

                                            <div className="flex gap-3 pt-4">
                                                <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading} className="flex-1 h-14 bg-white rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all">
                                                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                                                </Button>
                                                <Button
                                                    type="button" onClick={handleNext} disabled={isLoading}
                                                    className="flex-[2] h-14 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-2"
                                                >
                                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                                    {location ? 'Continue' : 'Skip & Continue'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: Profile Details */}
                                {currentStep === 4 && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-6">
                                            <motion.div
                                                className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30"
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <UserCircle2 className="w-10 h-10 text-white" />
                                            </motion.div>
                                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Up Your Profile (Optional)</h2>
                                            <p className="text-slate-600 font-medium">Add a picture and birthday to complete your profile.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2 flex flex-col items-center">
                                                <Label className="text-slate-700 font-bold text-sm">Profile Picture</Label>
                                                <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 hover:border-orange-200 transition-colors shadow-inner flex items-center justify-center bg-slate-50">
                                                    {data.picture instanceof File ? (
                                                        <img src={URL.createObjectURL(data.picture)} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserCircle2 className="w-16 h-16 text-slate-300" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                        <label htmlFor="picture" className="text-white text-xs font-bold cursor-pointer absolute inset-0 flex items-center justify-center">
                                                            {data.picture ? 'Change' : 'Upload'}
                                                        </label>
                                                        <input
                                                            id="picture" type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden"
                                                            onChange={(e) => setData('picture', e.target.files?.[0] || null)}
                                                        />
                                                    </div>
                                                </div>
                                                {data.picture instanceof File && (
                                                    <button type="button" onClick={() => setData('picture', null)} className="text-xs text-red-500 hover:text-red-700 font-bold mt-2">
                                                        Remove Picture
                                                    </button>
                                                )}
                                                <InputError message={errors.picture} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="birthday" className="text-slate-700 font-bold text-sm">Birthday</Label>
                                                <input
                                                    type="date" id="birthday" value={data.birthday} onChange={(e) => setData('birthday', e.target.value)}
                                                    max={new Date().toISOString().split('T')[0]}
                                                    className="w-full h-14 px-4 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 font-medium shadow-sm outline-none cursor-text"
                                                />
                                                <InputError message={errors.birthday} />
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading} className="flex-1 h-14 bg-white rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all">
                                                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                                                </Button>
                                                <Button
                                                    type="button" onClick={handleNext} disabled={isLoading}
                                                    className="flex-[2] h-14 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-2"
                                                >
                                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                                    {isLoading ? 'Creating Account...' : (data.picture || data.birthday ? 'Create Account' : 'Skip & Create Account')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 5: Email Verification */}
                                {currentStep === 5 && (
                                    <div className="space-y-6">
                                        <div className="text-center mb-6">
                                            <motion.div
                                                className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30"
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <Mail className="w-10 h-10 text-white" />
                                            </motion.div>
                                            <p className="text-slate-600 font-medium">
                                                We sent a code to <span className="font-bold text-slate-900">{data.email}</span>
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-bold text-sm">Verification Code</Label>
                                            <input
                                                type="text"
                                                value={verificationCode}
                                                onChange={(e) => {
                                                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                                    setVerifyError('');
                                                }}
                                                className="w-full h-16 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all text-slate-900 font-bold text-center text-3xl tracking-[0.5em] placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-base"
                                                placeholder="000000"
                                                maxLength={6}
                                                autoFocus
                                            />
                                            {verifyError && (
                                                <div className="flex items-center gap-2 text-red-500 text-sm font-semibold mt-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {verifyError}
                                                </div>
                                            )}
                                        </div>

                                        <motion.div whileHover={{ scale: 1.02 }}>
                                            <Button
                                                type="button" onClick={handleVerify}
                                                disabled={isVerifying || verificationCode.length !== 6}
                                                className="w-full h-14 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-60"
                                            >
                                                {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                                {isVerifying ? 'Verifying...' : 'Verify & Complete'}
                                            </Button>
                                        </motion.div>

                                        <button
                                            type="button"
                                            onClick={handleResendCode}
                                            className="w-full text-center text-sm text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                                        >
                                            Didn't receive the code? Resend
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Sign in link */}
                        {currentStep < 5 && (
                            <div className="mt-6">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-slate-500 font-semibold">Already have an account?</span>
                                    </div>
                                </div>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Link href="/login" className="group relative w-full h-14 flex items-center justify-center border-2 border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-600 font-bold rounded-xl transition-all shadow-sm overflow-hidden">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Sign In
                                            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                        </span>
                                    </Link>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            {/* Right Side - Visuals */}
            <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden sticky top-0 h-screen">
                <div className="absolute inset-0">
                    <FloatingShapes />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-orange-900/40 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-between p-12 xl:p-20 z-10">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex items-center gap-4 flex-wrap">
                        {[
                            { icon: Users, value: '10K+', label: 'Users', color: 'from-orange-400 to-orange-600' },
                            { icon: Shield, value: 'Secure', label: 'Platform', color: 'from-green-400 to-green-600' },
                            { icon: Star, value: '4.9/5', label: 'Rating', color: 'from-yellow-400 to-yellow-600' }
                        ].map((stat, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, scale: 0.8, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.7 + idx * 0.1 }} whileHover={{ y: -5, scale: 1.05 }} className="relative group" style={{ transformStyle: 'preserve-3d' }}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
                                <div className="relative bg-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/20 shadow-2xl">
                                    <div className="flex items-center gap-2">
                                        <stat.icon className="w-5 h-5 text-white" />
                                        <span className="text-white font-bold">{stat.value}</span>
                                        <span className="text-slate-300 text-sm">{stat.label}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="max-w-lg">
                        <div className="mb-10">
                            <motion.div
                                initial={{ scale: 0, x: -50 }} animate={{ scale: 1, x: 0 }} transition={{ delay: 0.5, type: 'spring', stiffness: 200 }} whileHover={{ scale: 1.05 }}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/30 to-pink-500/30 backdrop-blur-xl px-5 py-3 rounded-full mb-8 border border-orange-500/30 shadow-2xl"
                            >
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                                    <Sparkles className="w-5 h-5 text-orange-300" />
                                </motion.div>
                                <span className="text-orange-200 text-sm font-bold uppercase tracking-wider">Libya's #1 Service Platform</span>
                                <TrendingUp className="w-5 h-5 text-orange-300" />
                            </motion.div>

                            <motion.h2 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.1]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                                Join the elite.<br />
                                <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
                                    Start today.
                                </span>
                            </motion.h2>

                            <motion.p className="text-slate-300 text-xl leading-relaxed font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                                Connect with top clients, showcase your skills, and take your career to new heights with Hirfati.
                            </motion.p>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="flex items-center gap-4 text-slate-400 text-sm">
                        <span>&copy; 2025 Hirfati Inc.</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        {['Privacy', 'Terms', 'Support'].map((link) => (
                            <motion.a key={link} href="#" whileHover={{ color: '#fff', scale: 1.05 }} className="hover:text-white transition-colors">{link}</motion.a>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}