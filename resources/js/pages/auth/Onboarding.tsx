import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, MapPin, Check,
    ChevronLeft, Building2,
    UserCircle2, Sparkles, ArrowRight,
    User, Award, Star, Upload, Loader2, AlertCircle
} from 'lucide-react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';

// --- Types ---
type Role = 'client' | 'professional' | null;

interface FormData {
    city: string;
    address: string;
    role: Role;
    category: string;
    requestDetails: string;
    profession: string;
    yearsOfExperience: string;
    bio: string;
    referralSource: string;
    idDocument: File | null;
    picture: File | null;
    birthday: string;
}

type FormErrors = { [K in keyof FormData]?: string } & { role?: string; general?: string };

// --- Constants ---
const CITIES = ['Tripoli', 'Benghazi', 'Misrata', 'Zawiya', 'Sabha', 'Tobruk', 'Zliten'];
const REFERRAL_SOURCES = ['Facebook', 'Instagram', 'Friend Recommendation', 'Google Search', 'Advertisement'];
const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Carpentry', 'Moving', 'AC Repair', 'General Maintenance'];
const PROFESSIONS = ['Plumber', 'Electrician', 'Cleaner', 'Painter', 'Carpenter', 'Mover', 'AC Technician', 'Handyman'];

export default function Onboarding() {
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [errors, setErrors] = useState<FormErrors>({});
    const [pendingToken, setPendingToken] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationStep, setVerificationStep] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verifyError, setVerifyError] = useState('');

    const [formData, setFormData] = useState<FormData>({
        city: '',
        address: '',
        role: null,
        category: '',
        requestDetails: '',
        profession: '',
        yearsOfExperience: '',
        bio: '',
        referralSource: '',
        idDocument: null,
        picture: null,
        birthday: '',
    });

    // Get pending_token from URL query params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('pending_token');
        if (token) {
            setPendingToken(token);
        }
    }, []);

    const totalSteps = 5;

    // --- Handlers ---
    const updateForm = (key: keyof FormData, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [key]: value };
            if (key === 'role') {
                if (value === 'client') {
                    newData.profession = '';
                    newData.yearsOfExperience = '';
                    newData.bio = '';
                    newData.idDocument = null;
                } else {
                    newData.category = '';
                    newData.requestDetails = '';
                }
            }
            return newData;
        });
        if (errors[key as keyof typeof errors] || (key === 'role' && errors.role)) {
            setErrors(prev => ({ ...prev, [key]: undefined, role: undefined }));
        }
    };

    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (step === 1) {
            if (!formData.city) newErrors.city = 'Please select a city';
        } else if (step === 2) {
            if (!formData.role) {
                newErrors.role = 'Please select a role to continue';
                isValid = false;
            } else if (formData.role === 'client') {
                if (!formData.category) newErrors.category = 'Service category is required';
            } else if (formData.role === 'professional') {
                if (!formData.profession) newErrors.profession = 'Profession is required';
                if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of exp. required';
            }
        } else if (step === 3) {
            // Profile details step
            if (formData.role === 'professional') {
                // Birthday/Photo optional but recommended
            }
        } else if (step === 4) {
            // ID document upload step for professionals
            if (formData.role === 'professional' && !formData.idDocument) {
                newErrors.idDocument = 'Please upload a verification document' as any;
                isValid = false;
            }
        } else if (step === 5) {
            if (!formData.referralSource) newErrors.referralSource = 'Please tell us where you heard about us';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
        }

        return isValid;
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) return;

        // For clients, skip provider-only steps
        if (currentStep === 2 && formData.role === 'client') {
            setDirection(1);
            setCurrentStep(5); // Skip to referral step
            return;
        }

        if (currentStep < totalSteps) {
            setDirection(1);
            setCurrentStep(c => c + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            // If client is going back from step 5, go to step 2
            if (currentStep === 5 && formData.role === 'client') {
                setDirection(-1);
                setCurrentStep(2);
                return;
            }
            setDirection(-1);
            setCurrentStep(c => c - 1);
        }
    };

    const handleComplete = async () => {
        if (pendingToken) {
            // For new registrations, we proceed to verification first.
            // The birthday/picture were already captured in the registration step if provided.
            setVerificationStep(true);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const data = new FormData();
            
            // Map frontend fields (birthday, picture + provider fields)
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== '') {
                    if (value instanceof File) {
                        data.append(key, value);
                    } else {
                        data.append(key, String(value));
                    }
                }
            });

            // Authenticated update via ProviderController
            await axios.post('/api/provider/profile', data, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            window.location.href = '/pending-approval';
        } catch (error: any) {
            setIsSubmitting(false);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: 'Failed to complete onboarding. Please try again.' });
            }
        }
    };

    const handleVerify = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setVerifyError('Please enter the 6-digit code from your email.');
            return;
        }

        setIsSubmitting(true);
        setVerifyError('');

        try {
            const response = await axios.post('/api/register/verify', {
                pending_token: pendingToken,
                code: verificationCode,
            });

            const result = response.data;
            const accessToken = result.data?.access_token;
            const userData = result.data?.user;

            if (accessToken) {
                localStorage.setItem('access_token', accessToken);
            }
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
            }

            // Provider → pending approval, Customer → dashboard
            const role = userData?.role || userData?.data?.role;
            if (role === 'provider') {
                window.location.href = '/pending-approval';
            } else {
                window.location.href = '/client/dashboard';
            }
        } catch (error: any) {
            setIsSubmitting(false);
            if (error.response?.data?.message) {
                setVerifyError(error.response.data.message);
            } else {
                setVerifyError('Verification failed. Please try again.');
            }
        }
    };

    const handleResendCode = async () => {
        if (!pendingToken) return;
        try {
            await axios.post('/api/register/resend', { pending_token: pendingToken });
            setVerifyError('');
            alert('Verification code resent to your email!');
        } catch (error: any) {
            if (error.response?.data?.message) {
                setVerifyError(error.response.data.message);
            }
        }
    };

    // --- Animation Variants ---
    const slideVariants = {
        enter: (direction: number) => ({ x: direction > 0 ? 20 : -20, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? 20 : -20, opacity: 0 })
    };

    // Verification Step UI
    if (verificationStep) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-slate-50 selection:bg-orange-200 overflow-hidden relative">
                <Head title="Verify Email - Hirfati" />
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-orange-200/20 rounded-full blur-3xl will-change-transform" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-100/30 rounded-full blur-3xl will-change-transform" />
                </div>

                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 relative z-10 p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Verify your email</h2>
                        <p className="text-slate-500">We sent a 6-digit code to your email. Enter it below to complete registration.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Verification Code</label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setVerificationCode(val);
                                    setVerifyError('');
                                }}
                                className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all text-slate-900 font-bold text-center text-2xl tracking-[0.5em] placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-base"
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

                        <button
                            onClick={handleVerify}
                            disabled={isSubmitting || verificationCode.length !== 6}
                            className="w-full h-14 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                            ) : (
                                <><Check className="w-5 h-5" /> Verify & Create Account</>
                            )}
                        </button>

                        <button
                            onClick={handleResendCode}
                            className="w-full text-center text-sm text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                        >
                            Didn't receive the code? Resend
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-slate-50 selection:bg-orange-200 overflow-hidden relative">
            <Head title="Setup Your Profile - Hirfati" />

            {/* Optimized Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-orange-200/20 rounded-full blur-3xl will-change-transform" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-100/30 rounded-full blur-3xl will-change-transform" />
            </div>

            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 relative z-10 flex flex-col max-h-[90vh]">

                {/* --- Header --- */}
                <div className="px-8 py-6 border-b border-slate-100 bg-white/50 rounded-t-3xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">H</div>
                            <span className="font-bold text-slate-800 text-lg tracking-tight">Hirfati</span>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Step {currentStep} / {totalSteps}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-orange-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                {/* --- Content Area --- */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 sm:p-10 relative custom-scrollbar">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full"
                        >
                            {/* STEP 1: Location */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Where are you located?</h2>
                                        <p className="text-slate-500">To find services nearby.</p>
                                    </div>
                                        <SelectField
                                            label="City" value={formData.city}
                                            onChange={(val: string) => updateForm('city', val)}
                                            options={CITIES} icon={<Building2 className="w-5 h-5" />}
                                            placeholder="Select city..." error={errors.city}
                                        />
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Address Details <span className="font-normal text-slate-400">(Optional)</span></label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => updateForm('address', e.target.value)}
                                            className="w-full h-28 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                                            placeholder="Neighborhood, street..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Role */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="mb-6">
                                        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">What brings you here?</h2>
                                        <p className="text-slate-500">I want to...</p>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <RoleCard
                                            selected={formData.role === 'client'}
                                            onClick={() => updateForm('role', 'client')}
                                            title="Hire a Pro" subtitle="Find trusted experts"
                                            icon={<UserCircle2 className="w-6 h-6" />}
                                        />
                                        <RoleCard
                                            selected={formData.role === 'professional'}
                                            onClick={() => updateForm('role', 'professional')}
                                            title="Offer Services" subtitle="Find new customers"
                                            icon={<Briefcase className="w-6 h-6" />}
                                        />
                                    </div>
                                    {errors.role && <p className="text-sm text-red-500 font-bold text-center mt-2">{errors.role}</p>}

                                    <AnimatePresence mode="wait">
                                        {formData.role === 'client' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4 pt-4 border-t border-slate-100 mt-4"
                                            >
                                                <SelectField
                                                    label="Service Category" value={formData.category}
                                                    onChange={(val: string) => updateForm('category', val)}
                                                    options={CATEGORIES} placeholder="Select..." error={errors.category}
                                                />
                                            </motion.div>
                                        )}
                                        {formData.role === 'professional' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4 pt-4 border-t border-slate-100 mt-4"
                                            >
                                                <div className="grid grid-cols-2 gap-4">
                                                    <SelectField
                                                        label="Profession" value={formData.profession}
                                                        onChange={(val: string) => updateForm('profession', val)}
                                                        options={PROFESSIONS} placeholder="Select..." error={errors.profession}
                                                    />
                                                    <InputField
                                                        label="Yrs Exp." type="number" value={formData.yearsOfExperience}
                                                        onChange={(val: string) => updateForm('yearsOfExperience', val)}
                                                        placeholder="5" error={errors.yearsOfExperience}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 ml-1">Bio <span className="font-normal text-slate-400">(Optional)</span></label>
                                                    <textarea
                                                        value={formData.bio}
                                                        onChange={(e) => updateForm('bio', e.target.value)}
                                                        className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none resize-none transition-all font-medium text-slate-900 focus:border-orange-500"
                                                        placeholder="Describe your skills..."
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* STEP 3: Profile Details (professionals only) */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <UserCircle2 className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Details</h2>
                                        <p className="text-slate-500 text-sm">Add a picture and your birthday to help clients trust you.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2 flex flex-col items-center">
                                            <label className="text-sm font-bold text-slate-700">Profile Picture</label>
                                            <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 hover:border-orange-200 transition-colors shadow-inner flex items-center justify-center bg-slate-50">
                                                {formData.picture ? (
                                                    <img src={URL.createObjectURL(formData.picture)} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserCircle2 className="w-12 h-12 text-slate-300" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <label htmlFor="picture" className="text-white text-[10px] font-bold cursor-pointer absolute inset-0 flex items-center justify-center">
                                                        {formData.picture ? 'Change' : 'Upload'}
                                                    </label>
                                                    <input
                                                        id="picture" type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden"
                                                        onChange={(e) => updateForm('picture', e.target.files?.[0] || null)}
                                                    />
                                                </div>
                                            </div>
                                            {formData.picture && (
                                                <button type="button" onClick={() => updateForm('picture', null)} className="text-[10px] text-red-500 hover:text-red-700 font-bold mt-1">
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="birthday" className="text-sm font-bold text-slate-700 ml-1">Birthday</label>
                                            <input
                                                type="date" id="birthday" value={formData.birthday} onChange={(e) => updateForm('birthday', e.target.value)}
                                                max={new Date().toISOString().split('T')[0]}
                                                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all text-slate-900 font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: ID Document Upload (professionals only) */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="mb-8 text-center">
                                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Upload className="w-7 h-7" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Verification ID</h2>
                                        <p className="text-slate-500 text-sm">We need to verify your identity before approving your application. Upload a clear photo of your ID or certificate.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) => updateForm('idDocument', e.target.files?.[0] || null)}
                                            className="w-full text-center p-4 border-2 border-orange-200 border-dashed focus:border-orange-500 rounded-2xl bg-white/60 transition-all text-slate-600 font-medium shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer"
                                        />
                                        {formData.idDocument && (
                                            <p className="text-sm text-green-600 font-semibold flex items-center gap-2 ml-1">
                                                <Check className="w-4 h-4" /> {formData.idDocument.name}
                                            </p>
                                        )}
                                        {errors.idDocument && <p className="text-xs text-red-500 font-bold ml-1">{errors.idDocument}</p>}
                                        <p className="text-xs text-slate-400 ml-1">Accepted formats: JPG, PNG, PDF. Max size: 2MB</p>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5: Referral */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div className="mb-8 text-center">
                                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Award className="w-7 h-7" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900">How did you hear about us?</h2>
                                    </div>
                                    <div className="space-y-2">
                                        {REFERRAL_SOURCES.map((source) => (
                                            <button
                                                key={source}
                                                onClick={() => updateForm('referralSource', source)}
                                                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${formData.referralSource === source
                                                    ? 'border-orange-500 bg-orange-50 text-orange-900 font-bold'
                                                    : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 text-slate-600 font-medium'
                                                    }`}
                                            >
                                                <span>{source}</span>
                                                {formData.referralSource === source && <Check className="w-5 h-5 text-orange-600" />}
                                            </button>
                                        ))}
                                        {errors.referralSource && <p className="text-sm text-center text-red-500 font-bold mt-2">{errors.referralSource}</p>}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* --- Footer --- */}
                <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl flex justify-between items-center">
                    <button
                        onClick={handleBack} disabled={currentStep === 1}
                        className={`text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                        onClick={handleNext}
                        className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
                    >
                        {currentStep === totalSteps ? (
                            <><Check className="w-4 h-4" /> Finish</>
                        ) : (
                            <>Continue <ArrowRight className="w-4 h-4" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Simplified Components ---
const InputField = ({ label, value, onChange, placeholder, type = "text", error, autoFocus = false }: any) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
        <input
            type={type} value={value} onChange={(e) => onChange(e.target.value)}
            className={`w-full h-12 px-4 bg-slate-50 border rounded-xl focus:ring-1 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium ${error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500'}`}
            placeholder={placeholder} autoFocus={autoFocus}
        />
        {error && <p className="text-xs text-red-500 font-bold ml-1">{error}</p>}
    </div>
);

const SelectField = ({ label, value, onChange, options, icon, placeholder, error }: any) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <select
                value={value} onChange={(e) => onChange(e.target.value)}
                className={`w-full h-12 ${icon ? 'pl-12' : 'pl-4'} pr-8 bg-slate-50 border rounded-xl focus:ring-1 outline-none appearance-none transition-all text-slate-900 font-medium cursor-pointer ${error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500'}`}
            >
                <option value="">{placeholder}</option>
                {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</div>
        </div>
        {error && <p className="text-xs text-red-500 font-bold ml-1">{error}</p>}
    </div>
);

const RoleCard = ({ selected, onClick, title, subtitle, icon }: any) => (
    <button
        onClick={onClick}
        className={`p-4 rounded-xl border-2 text-left transition-all ${selected
            ? 'border-orange-500 bg-orange-50 shadow-md'
            : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-slate-50'
            }`}
    >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${selected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {icon}
        </div>
        <h3 className="font-bold text-slate-900 mb-0.5">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
    </button>
);
