import { Head, Link } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Shield, Users, Star, Award, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import InputError from '@/components/input-error';
import axios from 'axios';

declare function route(name: string, params?: any, absolute?: boolean): string;

// Enhanced 3D Floating Shapes Component
const FloatingShapes = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Large animated gradient orbs */}
            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -80, 80, 0],
                    scale: [1, 1.3, 0.9, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ willChange: 'transform' }}
                className="absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/40 to-pink-500/40 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, -120, 80, 0],
                    y: [0, 100, -60, 0],
                    scale: [1, 1.2, 1.1, 1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ willChange: 'transform' }}
                className="absolute top-1/2 right-10 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, 60, -80, 0],
                    y: [0, -100, 50, 0],
                    scale: [1, 1.4, 0.8, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ willChange: 'transform' }}
                className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-yellow-500/25 to-orange-500/25 rounded-full blur-3xl"
            />
            {/* Floating geometric shapes with 3D effect */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        left: `${(i * 15) % 100}%`,
                        top: `${(i * 25) % 100}%`,
                    }}
                    animate={{
                        y: [0, -40, 0],
                        x: [0, 10, 0],
                        rotate: [0, 360],
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 8 + (i % 5),
                        repeat: Infinity,
                        delay: i % 3,
                        ease: "easeInOut"
                    }}
                >
                    <div
                        className={`${i % 3 === 0
                            ? 'bg-gradient-to-br from-orange-400/30 to-pink-400/30'
                            : i % 3 === 1
                                ? 'bg-gradient-to-br from-blue-400/30 to-purple-400/30'
                                : 'bg-gradient-to-br from-yellow-400/30 to-orange-400/30'
                            } ${i % 2 === 0 ? 'rounded-full' : 'rounded-lg rotate-45'} shadow-2xl`}
                        style={{
                            width: `${20 + (i * 10) % 60}px`,
                            height: `${20 + (i * 10) % 60}px`,
                        }}
                    />
                </motion.div>
            ))}
            {/* Animated grid pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>
        </div>
    );
};
const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};
const fadeInLeft: any = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] } }
};
const scaleIn: any = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] } }
};
const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
};
export default function Login({ status, canResetPassword }: { status?: string, canResetPassword?: boolean }) {
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [data, setDataState] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const setData = (key: string, value: any) => {
        setDataState(prev => ({ ...prev, [key]: value }));
        // Clear error for this field when user types
        if (errors[key as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    };



    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await axios.post('/api/login', {
                email: data.email,
                password: data.password,
            });

            const result = response.data;
            const userData = result.data?.user;
            const accessToken = result.data?.access_token;
            const loginStatus = result.data?.status;

            // Store token
            if (accessToken) {
                localStorage.setItem('access_token', accessToken);
            }
            // Store user data
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
            }

            // Handle status-based redirects
            if (loginStatus === 'pending') {
                // Pending provider → redirect to pending page
                window.location.href = '/pending-approval';
                return;
            }

            if (loginStatus === 'rejected') {
                // Rejected provider → redirect to re-upload page
                window.location.href = '/rejected-approval';
                return;
            }

            // Determine role-based redirect
            const role = userData?.role || userData?.data?.role;
            if (role === 'admin') {
                window.location.href = '/admin/craftsmen';
            } else if (role === 'provider') {
                window.location.href = '/worker/dashboard';
            } else {
                window.location.href = '/client/dashboard';
            }

        } catch (error: any) {
            setProcessing(false);

            if (error.response) {
                const status = error.response.status;
                const responseData = error.response.data;

                if (status === 422) {
                    // Validation errors
                    if (responseData.errors) {
                        const apiErrors: any = {};
                        if (responseData.errors.email) {
                            apiErrors.email = Array.isArray(responseData.errors.email)
                                ? responseData.errors.email[0]
                                : responseData.errors.email;
                        }
                        if (responseData.errors.password) {
                            apiErrors.password = Array.isArray(responseData.errors.password)
                                ? responseData.errors.password[0]
                                : responseData.errors.password;
                        }
                        setErrors(apiErrors);
                    } else if (responseData.message) {
                        // Check for specific messages from LoginUserAction
                        const msg = responseData.message;
                        if (msg.includes('suspended') || msg.includes('blocked')) {
                            window.location.href = '/account-suspended';
                            return;
                        }
                        if (msg.includes('under review') || msg.includes('pending')) {
                            window.location.href = '/pending-approval';
                            return;
                        }
                        setErrors({ email: msg });
                    }
                } else {
                    setErrors({ email: responseData?.message || 'Login failed. Please try again.' });
                }
            } else {
                setErrors({ email: 'Network error. Please check your connection.' });
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-white to-orange-50/30 font-sans selection:bg-orange-200 relative">
            <Head title="Sign In - Hirfati" />
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.015]">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>
            {/* Left Side - Enhanced Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 lg:p-16 xl:p-24 relative z-10 bg-white min-h-screen">
                <motion.div
                    id="login-form"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    style={{
                        perspective: '1000px',
                    }}
                    className="max-w-md mx-auto w-full"
                >
                    {/* Enhanced Logo & Back Link */}
                    <motion.div variants={fadeInUp} className="flex items-center justify-between mb-10">
                        <Link href="/" className="flex items-center gap-3 group">
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-xl ring-2 ring-orange-200 group-hover:ring-orange-400 transition-all">
                                    <img
                                        src="/images/hirfati-logo.jpg"
                                        alt="Hirfati Logo"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <motion.div
                                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </motion.div>
                            <div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-orange-900 bg-clip-text text-transparent tracking-tight">
                                    Hirfati
                                </span>
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
                    {/* Enhanced Welcome Header */}
                    <motion.div variants={fadeInLeft} className="mb-10">
                        <motion.div
                            className="flex items-center gap-3 mb-6"
                            initial={{ width: 0 }}
                            animate={{ width: 'auto' }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <div className="h-1 w-12 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 rounded-full shadow-lg shadow-orange-500/50" />
                            <span className="text-orange-600 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Welcome back
                            </span>
                        </motion.div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight leading-[1.1]">
                            Sign in to your<br />
                            <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                                account
                            </span>
                        </h1>
                        <p className="text-slate-600 text-lg font-medium">
                            Enter your credentials to access your dashboard and start growing.
                        </p>
                    </motion.div>
                    {/* Enhanced Status Message */}
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="mb-6 flex items-center gap-3 text-sm font-medium text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200 shadow-lg shadow-green-100"
                        >
                            <motion.div
                                className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="w-5 h-5 text-white" />
                            </motion.div>
                            {status}
                        </motion.div>
                    )}
                    {/* Enhanced Form with 3D effect */}
                    <motion.form
                        variants={scaleIn}
                        onSubmit={submit}
                        className="space-y-6"
                    >
                        <motion.div
                            className="space-y-2"
                        >
                            <Label htmlFor="email" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4 text-orange-500" />
                                Email Address
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    >
                                        <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                    </motion.div>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="w-full h-14 pl-12 pr-4 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md focus:shadow-lg outline-none"
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="name@example.com"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </motion.div>
                        <motion.div
                            className="space-y-2"
                        >
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-orange-500" />
                                    Password
                                </Label>
                                <motion.div whileHover={{ x: 3 }} style={{ transform: 'translateZ(20px)' }} className="relative z-50">
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors block p-2 -mr-2"
                                    >
                                        Forgot password?
                                    </Link>
                                </motion.div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    className="w-full h-14 pl-12 pr-12 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md focus:shadow-lg outline-none"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowPassword(!showPassword);
                                    }}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center z-50 cursor-pointer text-slate-400 hover:text-orange-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </motion.div>
                        {/* Enhanced Remember Me */}
                        <div className="flex items-center justify-between pt-2">
                            <motion.label
                                className="flex items-center cursor-pointer group"
                                whileHover={{ x: 3 }}
                            >
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                    className="border-2 border-slate-300 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-orange-600 data-[state=checked]:to-orange-500 data-[state=checked]:border-orange-600 rounded-lg w-5 h-5 shadow-sm"
                                />
                                <span className="ml-3 text-sm text-slate-600 font-semibold group-hover:text-slate-900 transition-colors">
                                    Remember me for 30 days
                                </span>
                            </motion.label>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                disabled={processing}
                                className="relative w-full h-14 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-700 hover:via-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign in
                                            <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                                {/* Animated gradient overlay */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-600"
                                    initial={{ x: '100%' }}
                                    whileHover={{ x: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                                {/* Shine effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                    style={{ transform: 'skewX(-20deg)' }}
                                />
                            </Button>
                        </motion.div>
                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 font-semibold">New to Hirfati?</span>
                            </div>
                        </div>
                        {/* Enhanced Create Account Link */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link
                                href="/register"
                                className="group relative w-full h-14 flex items-center justify-center border-2 border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-600 font-bold rounded-xl transition-all hover:bg-gradient-to-br from-orange-50 to-pink-50 shadow-sm hover:shadow-lg overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Create an account
                                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                </span>
                                {/* Border gradient on hover */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                            </Link>
                        </motion.div>
                    </motion.form>
                    {/* Trust badges */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-10 grid grid-cols-3 gap-4"
                    >
                        {[
                            { icon: Shield, label: 'Secure' },
                            { icon: Users, label: '10K+ Users' },
                            { icon: Award, label: 'Trusted' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -3, scale: 1.05 }}
                                className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
                            >
                                <item.icon className="w-5 h-5 text-orange-600" />
                                <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
                {/* Footer Copyright - Mobile Only */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-center lg:hidden"
                >
                    <p className="text-xs text-slate-400">&copy; 2025 Hirfati. All rights reserved.</p>
                </motion.div>
            </div>
            {/* Right Side - Enhanced 3D Visuals */}
            <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden sticky top-0 h-screen">
                {/* 3D Background */}
                <div className="absolute inset-0">
                    <FloatingShapes />
                    {/* Enhanced gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-orange-900/40 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-12 xl:p-20 z-10">
                    {/* Top Stats with 3D cards */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-4 flex-wrap"
                    >
                        {[
                            { icon: Users, value: '10K+', label: 'Users', color: 'from-orange-400 to-orange-600' },
                            { icon: Shield, value: 'Secure', label: 'Platform', color: 'from-green-400 to-green-600' },
                            { icon: Star, value: '4.9/5', label: 'Rating', color: 'from-yellow-400 to-yellow-600' }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.7 + idx * 0.1 }}
                                whileHover={{ y: -5, scale: 1.05 }}
                                className="relative group"
                            >
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
                    {/* Center Content with enhanced 3D */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="max-w-lg"
                    >
                        <div className="mb-10">
                            <motion.div
                                initial={{ scale: 0, x: -50 }}
                                animate={{ scale: 1, x: 0 }}
                                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                                whileHover={{ scale: 1.05 }}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/30 to-pink-500/30 backdrop-blur-xl px-5 py-3 rounded-full mb-8 border border-orange-500/30 shadow-2xl"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles className="w-5 h-5 text-orange-300" />
                                </motion.div>
                                <span className="text-orange-200 text-sm font-bold uppercase tracking-wider">Libya's #1 Service Platform</span>
                                <TrendingUp className="w-5 h-5 text-orange-300" />
                            </motion.div>
                            <motion.h2
                                className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.1]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                Master your craft.<br />
                                <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
                                    Build your future.
                                </span>
                            </motion.h2>
                            <motion.p
                                className="text-slate-300 text-xl leading-relaxed font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                Join thousands of professionals and clients connecting every day on Libya's premier marketplace.
                            </motion.p>
                        </div>
                        {/* Enhanced Testimonial Card with 3D */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 1, type: 'spring' }}
                            whileHover={{ scale: 1.03, y: -5 }}
                            className="relative group"
                        >
                            {/* 3D glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-pink-500/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl">
                                <div className="flex items-start gap-4">
                                    <motion.div
                                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-xl"
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        A
                                    </motion.div>
                                    <div>
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 1.2 + i * 0.1 }}
                                                >
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                </motion.div>
                                            ))}
                                        </div>
                                        <p className="text-white/95 text-sm leading-relaxed mb-3 font-medium">
                                            "Hirfati helped me grow my business by 300% in just 6 months. The platform is incredibly easy to use and the support is amazing!"
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold text-sm">Ahmed Hassan</span>
                                            <span className="text-slate-400 text-sm">• Professional Electrician</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span className="text-green-300 text-xs font-semibold">Verified Client</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        {/* Achievement badges */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            className="mt-8 flex items-center gap-4"
                        >
                            {[
                                { icon: Zap, label: 'Fast Setup', color: 'from-blue-400 to-blue-600' },
                                { icon: Award, label: 'Top Rated', color: 'from-purple-400 to-purple-600' }
                            ].map((badge, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -3, scale: 1.05 }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10"
                                >
                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center`}>
                                        <badge.icon className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-white text-sm font-semibold">{badge.label}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                    {/* Bottom Footer with enhanced links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4 }}
                        className="flex items-center gap-4 text-slate-400 text-sm"
                    >
                        <span>&copy; 2025 Hirfati Inc.</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        {['Privacy', 'Terms', 'Support'].map((link, idx) => (
                            <motion.a
                                key={link}
                                href="#"
                                whileHover={{ color: '#fff', scale: 1.05 }}
                                className="hover:text-white transition-colors"
                            >
                                {link}
                            </motion.a>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}