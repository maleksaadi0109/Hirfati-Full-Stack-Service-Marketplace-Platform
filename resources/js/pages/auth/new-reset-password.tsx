import { Head, Link } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Lock, Eye, EyeOff, Shield, Users, Star, Award, CheckCircle, KeyRound } from 'lucide-react';
import InputError from '@/components/input-error';

declare function route(name: string, params?: any, absolute?: boolean): string;

// Floating Shapes
const FloatingShapes = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -80, 80, 0],
                    scale: [1, 1.3, 0.9, 1],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: 'transform' }}
                className="absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/40 to-pink-500/40 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, -120, 80, 0],
                    y: [0, 100, -60, 0],
                    scale: [1, 1.2, 1.1, 1],
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: 'transform' }}
                className="absolute top-1/2 right-10 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, 60, -80, 0],
                    y: [0, -100, 50, 0],
                    scale: [1, 1.4, 0.8, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: 'transform' }}
                className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-yellow-500/25 to-orange-500/25 rounded-full blur-3xl"
            />

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

            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>
        </div>
    );
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2 } }
};

const scaleIn = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5, delay: 0.3 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
};

export default function NewResetPassword() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') ?? '';

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    // 3D tilt
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
    const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);
    const springConfig = { stiffness: 150, damping: 20 };
    const rotateXSpring = useSpring(rotateX, springConfig);
    const rotateYSpring = useSpring(rotateY, springConfig);

    useEffect(() => {
        let rect: DOMRect | undefined;
        let rafq: number;

        const updateRect = () => {
            rect = document.getElementById('reset-password-form')?.getBoundingClientRect();
        };

        updateRect();
        window.addEventListener('resize', updateRect);

        const handleMouseMove = (e: globalThis.MouseEvent) => {
            if (!rect) return;
            cancelAnimationFrame(rafq);
            rafq = requestAnimationFrame(() => {
                const centerX = rect!.left + rect!.width / 2;
                const centerY = rect!.top + rect!.height / 2;
                mouseX.set(e.clientX - centerX);
                mouseY.set(e.clientY - centerY);
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', updateRect);
            cancelAnimationFrame(rafq);
        };
    }, [mouseX, mouseY]);

    // Password strength indicator
    const getPasswordStrength = (pw: string) => {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
    };

    const strength = getPasswordStrength(password);
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setErrors({});

        if (password.length < 8) {
            setErrors({ password: 'Password must be at least 8 characters.' });
            return;
        }

        if (password !== passwordConfirmation) {
            setErrors({ password_confirmation: 'Passwords do not match.' });
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/password/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result?.errors && typeof result.errors === 'object') {
                    const newErrors: Record<string, string> = {};
                    Object.entries(result.errors).forEach(([field, messages]) => {
                        newErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
                    });
                    setErrors(newErrors);
                } else {
                    setErrors({ password: result?.message ?? 'Unable to reset password.' });
                }
                return;
            }

            setSuccess(true);
            // Redirect to login after a brief delay
            setTimeout(() => {
                window.location.href = route('login');
            }, 2000);
        } catch {
            setErrors({ password: 'Unable to connect to server. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-white to-orange-50/30 font-sans selection:bg-orange-200 relative">
            <Head title="Reset Password - Hirfati" />

            <div className="absolute inset-0 opacity-[0.015]">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 lg:p-16 xl:p-24 relative z-10 bg-white min-h-screen">
                <motion.div
                    id="reset-password-form"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    style={{ perspective: '1000px' }}
                    className="max-w-md mx-auto w-full"
                >
                    {/* Logo */}
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
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/FF8C00/FFFFFF?text=H';
                                        }}
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
                    </motion.div>

                    {/* Header */}
                    <motion.div variants={fadeInLeft} className="mb-10">
                        <motion.div
                            className="flex items-center gap-3 mb-6"
                            initial={{ width: 0 }}
                            animate={{ width: 'auto' }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <div className="h-1 w-12 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 rounded-full shadow-lg shadow-orange-500/50" />
                            <span className="text-orange-600 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                <KeyRound className="w-4 h-4" />
                                Final Step
                            </span>
                        </motion.div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight leading-[1.1]">
                            Create a new<br />
                            <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                                password
                            </span>
                        </h1>
                        <p className="text-slate-600 text-lg font-medium">
                            Your identity has been verified. Choose a strong password to secure your account.
                        </p>
                    </motion.div>

                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="mb-6"
                        >
                            <div className="flex items-center gap-3 text-sm font-medium text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200 shadow-lg shadow-green-100">
                                <motion.div
                                    className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </motion.div>
                                Password reset successfully! Redirecting to login...
                            </div>
                        </motion.div>
                    )}

                    {/* Form */}
                    <motion.form
                        variants={scaleIn}
                        onSubmit={submit}
                        className="space-y-6"
                        style={{
                            rotateX: rotateXSpring,
                            rotateY: rotateYSpring,
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        {/* Password Field */}
                        <motion.div
                            className="space-y-2"
                            whileHover={{ z: 20 }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <Label htmlFor="password" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                <Lock className="w-4 h-4 text-orange-500" />
                                New Password
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    className="w-full h-14 pl-12 pr-12 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md focus:shadow-lg outline-none"
                                    autoFocus
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center z-50 cursor-pointer text-slate-400 hover:text-orange-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {password.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-2"
                                >
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1.5 flex-1 rounded-full transition-all ${strength >= level ? strengthColors[strength] : 'bg-slate-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs font-semibold ${strength <= 1 ? 'text-red-500' :
                                            strength === 2 ? 'text-yellow-600' :
                                                strength === 3 ? 'text-blue-600' : 'text-green-600'
                                        }`}>
                                        {strengthLabels[strength]}
                                    </p>
                                </motion.div>
                            )}
                            <InputError message={errors.password} />
                        </motion.div>

                        {/* Confirm Password Field */}
                        <motion.div
                            className="space-y-2"
                            whileHover={{ z: 20 }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <Label htmlFor="password_confirmation" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                <Lock className="w-4 h-4 text-orange-500" />
                                Confirm Password
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    id="password_confirmation"
                                    type={showConfirmation ? "text" : "password"}
                                    value={passwordConfirmation}
                                    className={`w-full h-14 pl-12 pr-12 border-2 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md focus:shadow-lg outline-none ${passwordConfirmation && password === passwordConfirmation
                                            ? 'border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                                            : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                                        }`}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmation(!showConfirmation)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center z-50 cursor-pointer text-slate-400 hover:text-orange-600 transition-colors"
                                >
                                    {showConfirmation ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {/* Match indicator */}
                            {passwordConfirmation && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`flex items-center gap-1.5 text-xs font-semibold ${password === passwordConfirmation ? 'text-green-600' : 'text-red-500'
                                        }`}
                                >
                                    {password === passwordConfirmation ? (
                                        <>
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Passwords match
                                        </>
                                    ) : (
                                        'Passwords do not match'
                                    )}
                                </motion.div>
                            )}
                            <InputError message={errors.password_confirmation} />
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            whileHover={{ scale: 1.02, z: 30 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <Button
                                disabled={isSubmitting || success}
                                className="relative w-full h-14 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-700 hover:via-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            Reset Password
                                            <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-600"
                                    initial={{ x: '100%' }}
                                    whileHover={{ x: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                    style={{ transform: 'skewX(-20deg)' }}
                                />
                            </Button>
                        </motion.div>

                        {/* Divider */}
                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 font-semibold">Or</span>
                            </div>
                        </div>

                        {/* Back to Login */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <a
                                href={route('login')}
                                className="group relative w-full h-14 flex items-center justify-center border-2 border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-600 font-bold rounded-xl transition-all hover:bg-gradient-to-br from-orange-50 to-pink-50 shadow-sm hover:shadow-lg overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Back to Login
                                </span>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                            </a>
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

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-center lg:hidden"
                >
                    <p className="text-xs text-slate-400">&copy; 2025 Hirfati. All rights reserved.</p>
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
                    {/* Top Stats */}
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
                                style={{ transformStyle: 'preserve-3d' }}
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

                    {/* Center Content */}
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
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-xl px-5 py-3 rounded-full mb-8 border border-green-500/30 shadow-2xl"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <CheckCircle className="w-5 h-5 text-green-300" />
                                </motion.div>
                                <span className="text-green-200 text-sm font-bold uppercase tracking-wider">Identity Verified</span>
                            </motion.div>

                            <motion.h2
                                className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.1]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                Set your new<br />
                                <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
                                    password.
                                </span>
                            </motion.h2>

                            <motion.p
                                className="text-slate-300 text-xl leading-relaxed font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                Choose a strong, unique password to keep your account safe and secure.
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4 }}
                        className="flex items-center gap-4 text-slate-400 text-sm"
                    >
                        <span>&copy; 2025 Hirfati Inc.</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        {['Privacy', 'Terms', 'Support'].map((link) => (
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
