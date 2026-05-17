import { Head, Link } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Shield, Users, Star, Award, CheckCircle, KeyRound, RefreshCw } from 'lucide-react';
import InputError from '@/components/input-error';

declare function route(name: string, params?: any, absolute?: boolean): string;

// Floating Shapes (matching forgot-password design)
const FloatingShapes = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
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

const CODE_LENGTH = 6;

export default function VerifyResetCode() {
    // Get email from URL search params
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') ?? '';

    const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // 3D tilt effect
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
            rect = document.getElementById('verify-code-form')?.getBoundingClientRect();
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

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    // Auto-focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        // Allow only digits
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError(null);

        // Auto-focus next input
        if (value && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
        if (pastedData.length === 0) return;

        const newCode = [...code];
        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }
        setCode(newCode);

        // Focus the input after the last pasted digit
        const focusIndex = Math.min(pastedData.length, CODE_LENGTH - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setError(null);

        const fullCode = code.join('');
        if (fullCode.length !== CODE_LENGTH) {
            setError('Please enter the complete 6-digit code.');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/password/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    code: fullCode,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result?.message ?? 'Invalid reset code.');
                // Shake the inputs
                setCode(Array(CODE_LENGTH).fill(''));
                inputRefs.current[0]?.focus();
                return;
            }

            // Code verified! Redirect to reset password page
            window.location.href = `/reset-password?email=${encodeURIComponent(email)}`;
        } catch {
            setError('Unable to connect to server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resendCode = async () => {
        if (resendCooldown > 0 || isResending) return;

        try {
            setIsResending(true);
            setError(null);
            setSuccessMessage(null);

            const response = await fetch('/api/password/send-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result?.message ?? 'Unable to resend code.');
                return;
            }

            setSuccessMessage('A new code has been sent to your email.');
            setResendCooldown(60); // 60 seconds cooldown
            setCode(Array(CODE_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } catch {
            setError('Unable to connect to server. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const codeComplete = code.every((digit) => digit !== '');

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-white to-orange-50/30 font-sans selection:bg-orange-200 relative">
            <Head title="Verify Reset Code - Hirfati" />

            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.015]">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 lg:p-16 xl:p-24 relative z-10 bg-white min-h-screen">
                <motion.div
                    id="verify-code-form"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    style={{
                        perspective: '1000px',
                    }}
                    className="max-w-md mx-auto w-full"
                >
                    {/* Logo & Back Link */}
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
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                href={route('password.request')}
                                className="flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-all group text-sm font-semibold bg-gradient-to-br from-slate-50 to-slate-100 hover:from-orange-50 hover:to-orange-100 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-orange-200 shadow-sm hover:shadow-md"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span>Back</span>
                            </Link>
                        </motion.div>
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
                                Verification
                            </span>
                        </motion.div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight leading-[1.1]">
                            Enter your<br />
                            <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                                reset code
                            </span>
                        </h1>
                        <p className="text-slate-600 text-lg font-medium">
                            We sent a 6-digit code to{' '}
                            <span className="font-bold text-slate-900">{email || 'your email'}</span>.
                            Enter it below to verify your identity.
                        </p>
                    </motion.div>

                    {/* Success Message */}
                    {successMessage && (
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
                                {successMessage}
                            </div>
                        </motion.div>
                    )}

                    {/* Code Input Form */}
                    <motion.form
                        variants={scaleIn}
                        onSubmit={submit}
                        className="space-y-8"
                        style={{
                            rotateX: rotateXSpring,
                            rotateY: rotateYSpring,
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        {/* 6-Digit Code Inputs */}
                        <motion.div
                            className="flex justify-center gap-3"
                            whileHover={{ z: 20 }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {Array.from({ length: CODE_LENGTH }).map((_, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                >
                                    <input
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={code[index]}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all shadow-sm hover:shadow-md focus:shadow-lg ${code[index]
                                                ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-200'
                                                : 'border-slate-200 bg-white text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                                            } ${error ? 'border-red-400 animate-shake' : ''}`}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        <InputError message={error ?? undefined} />

                        {/* Submit Button */}
                        <motion.div
                            whileHover={{ scale: 1.02, z: 30 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <Button
                                disabled={isSubmitting || !codeComplete}
                                className="relative w-full h-14 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-700 hover:via-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            Verify Code
                                            <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
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

                        {/* Resend Code */}
                        <div className="text-center">
                            <p className="text-slate-500 text-sm mb-2">Didn't receive the code?</p>
                            <motion.button
                                type="button"
                                onClick={resendCode}
                                disabled={resendCooldown > 0 || isResending}
                                className={`inline-flex items-center gap-2 text-sm font-semibold transition-all ${resendCooldown > 0 || isResending
                                        ? 'text-slate-400 cursor-not-allowed'
                                        : 'text-orange-600 hover:text-orange-700 hover:underline cursor-pointer'
                                    }`}
                                whileHover={resendCooldown <= 0 ? { scale: 1.05 } : {}}
                                whileTap={resendCooldown <= 0 ? { scale: 0.95 } : {}}
                            >
                                {isResending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className={`w-4 h-4 ${resendCooldown > 0 ? '' : 'group-hover:rotate-180 transition-transform'}`} />
                                )}
                                {resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : isResending
                                        ? 'Sending...'
                                        : 'Resend Code'
                                }
                            </motion.button>
                        </div>

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

            {/* Right Side - 3D Visuals */}
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
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/30 to-pink-500/30 backdrop-blur-xl px-5 py-3 rounded-full mb-8 border border-orange-500/30 shadow-2xl"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <KeyRound className="w-5 h-5 text-orange-300" />
                                </motion.div>
                                <span className="text-orange-200 text-sm font-bold uppercase tracking-wider">Almost There</span>
                            </motion.div>

                            <motion.h2
                                className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.1]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                Check your<br />
                                <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
                                    inbox now.
                                </span>
                            </motion.h2>

                            <motion.p
                                className="text-slate-300 text-xl leading-relaxed font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                We've sent a verification code to your email. Enter it to continue resetting your password.
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
