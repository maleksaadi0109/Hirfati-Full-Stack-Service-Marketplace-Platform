import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import {
    ArrowRight,
    Award,
    CheckCircle,
    Clock,
    GraduationCap,
    Hammer,
    Heart,
    Home,
    MapPin,
    Paintbrush,
    Search,
    Shield,
    Sparkles,
    Star,
    Users,
    Wrench,
    Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface LandingPageProps {
    onSearch: (query: string, category: string) => void;
    onNavigate: (page: string) => void;
}

const categories = [
    { id: 'all', name: 'All Categories', icon: Search },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'construction', name: 'Construction', icon: Hammer },
    { id: 'electrical', name: 'Electrical', icon: Zap },
    { id: 'painting', name: 'Painting', icon: Paintbrush },
    { id: 'home-services', name: 'Home Services', icon: Home },
    { id: 'moving', name: 'Moving', icon: ArrowRight },
];

const featuredServices = [
    {
        id: 1,
        name: 'Ahmed Hassan',
        service: 'Professional Electrician',
        rating: 4.9,
        reviews: 128,
        image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        price: 'From 50 LYD',
        location: 'Tripoli',
        verified: true,
    },
    {
        id: 2,
        name: 'Sarah Khaled',
        service: 'English Tutor',
        rating: 5.0,
        reviews: 85,
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        price: 'From 40 LYD/hr',
        location: 'Benghazi',
        verified: true,
    },
    {
        id: 3,
        name: 'Mohamed Ali',
        service: 'Plumbing Expert',
        rating: 4.8,
        reviews: 210,
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        price: 'From 60 LYD',
        location: 'Misrata',
        verified: true,
    },
    {
        id: 4,
        name: 'Layla Mahmoud',
        service: 'Interior Designer',
        rating: 4.9,
        reviews: 94,
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        price: 'Custom Quote',
        location: 'Tripoli',
        verified: true,
    },
];

const stats = [
    { icon: Users, value: '1M+', label: 'Active Users' },
    { icon: CheckCircle, value: '5M+', label: 'Tasks Completed' },
    { icon: Star, value: '4.9/5', label: 'Average Rating' },
    { icon: Award, value: '50K+', label: 'Verified Taskers' },
];

const valueProps = [
    {
        icon: Shield,
        title: 'Choose your Tasker',
        desc: 'Browse trusted Taskers by skills, reviews, and price. All profiles verified.',
        color: 'from-orange-500/15 to-orange-100',
        iconWrap: 'bg-orange-100 text-orange-600',
    },
    {
        icon: Clock,
        title: 'Schedule it',
        desc: 'Get your project done as soon as tomorrow. Flexible timing that works for you.',
        color: 'from-rose-500/15 to-rose-100',
        iconWrap: 'bg-rose-100 text-rose-600',
    },
    {
        icon: CheckCircle,
        title: 'Pay securely',
        desc: 'Pay directly through the حرفتي platform only when served. Your money is protected.',
        color: 'from-amber-500/15 to-amber-100',
        iconWrap: 'bg-amber-100 text-amber-600',
    },
];

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65 },
    },
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.08,
        },
    },
};

const MeshGradient = () => {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-80">
            <motion.div
                animate={{
                    x: [0, 60, -30, 0],
                    y: [0, -40, 50, 0],
                    scale: [1, 1.08, 0.95, 1],
                }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-orange-300/35 blur-[110px]"
            />
            <motion.div
                animate={{
                    x: [0, -70, 45, 0],
                    y: [0, 60, -30, 0],
                    scale: [1, 1.14, 0.92, 1],
                }}
                transition={{ duration: 24, repeat: Infinity }}
                className="absolute top-10 right-0 h-[32rem] w-[32rem] rounded-full bg-amber-200/30 blur-[120px]"
            />
            <motion.div
                animate={{
                    x: [0, 35, -45, 0],
                    y: [0, 30, -40, 0],
                    scale: [1, 0.95, 1.08, 1],
                }}
                transition={{ duration: 18, repeat: Infinity }}
                className="absolute bottom-0 left-1/3 h-[34rem] w-[34rem] rounded-full bg-rose-200/20 blur-[120px]"
            />
        </div>
    );
};

const ParallaxSection = ({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], [64, -64]);

    return (
        <motion.div ref={ref} style={{ y }} className={className}>
            {children}
        </motion.div>
    );
};

export function LandingPage({ onSearch, onNavigate }: LandingPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.scrollY > 20;
        }
        return false;
    });

    const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [
        Autoplay({ delay: 5000 }),
    ]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery, 'all');
    };

    const handleCategoryClick = (categoryId: string) => {
        onSearch('', categoryId);
    };

    return (
        <div
            className="flex flex-col bg-slate-50 selection:bg-orange-200 selection:text-slate-900"
            style={{ flex: '1 0 auto' }}
        >
            <nav
                className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled
                    ? 'border-b border-slate-200/70 bg-white/82 py-3 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] backdrop-blur-2xl'
                    : 'bg-transparent py-5'
                    }`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-orange-400/30 via-orange-200/10 to-transparent blur-md" />
                            <motion.div
                                animate={{
                                    boxShadow: scrolled
                                        ? '0 10px 26px -18px rgba(249,115,22,0.35)'
                                        : '0 20px 34px -20px rgba(249,115,22,0.5)',
                                }}
                                transition={{ duration: 0.3 }}
                                className="relative h-12 w-12 overflow-hidden rounded-2xl border border-orange-200/70 bg-white shadow-lg"
                            >
                                <img
                                    src="/images/hirfati-logo.jpg"
                                    alt="حرفتي Logo"
                                    className="h-full w-full object-cover"
                                />
                            </motion.div>
                        </div>
                        <div>
                            <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700 bg-clip-text text-2xl font-black tracking-tight text-transparent">
                                Hirfati
                            </span>
                            <div className="-mt-1 text-[10px] font-bold tracking-[0.24em] text-orange-600 uppercase">
                                حرفتي
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 sm:gap-3"
                    >
                        <a
                            href="/login"
                            className="hidden rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 hover:border-orange-100 hover:bg-orange-50/80 hover:text-orange-600 sm:block"
                        >
                            Sign In
                        </a>
                        <a
                            href="/login"
                            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_18px_30px_-16px_rgba(234,88,12,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_40px_-16px_rgba(234,88,12,0.9)] sm:px-6"
                        >
                            <span className="relative z-10">
                                Become a Tasker
                            </span>
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700"
                                initial={{ x: '100%' }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.28 }}
                            />
                        </a>
                    </motion.div>
                </div>
            </nav>

            <section className="relative overflow-hidden bg-[#faf8f5] pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28">
                <div className="pointer-events-none absolute inset-0">
                    <MeshGradient />
                </div>
                <div className="absolute inset-0 opacity-[0.03]">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
                            backgroundSize: '42px 42px',
                        }}
                    />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-slate-50" />

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="max-w-2xl"
                        >
                            <motion.div
                                variants={fadeInUp}
                                className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-800 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:mb-8"
                            >
                                <Sparkles className="h-4 w-4 text-orange-500" />
                                Trusted by 1M+ Libyans for everyday help
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="max-w-xl text-5xl leading-[0.98] font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl xl:text-[5.35rem]"
                            >
                                Get help.
                                <br />
                                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                                    Gain happiness.
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="mt-6 max-w-xl text-base leading-8 font-medium text-slate-600 sm:mt-8 sm:text-lg lg:text-xl"
                            >
                                Connect with trusted local experts for home
                                repairs, errands, learning, and everyday tasks.{' '}
                                <span className="font-semibold text-slate-900">
                                    Fast, polished, and reliable.
                                </span>
                            </motion.p>

                            <motion.form
                                variants={fadeInUp}
                                onSubmit={handleSearch}
                                className="mt-8 max-w-2xl sm:mt-10"
                            >
                                <div className="rounded-[2rem] border border-white/70 bg-white/80 p-2.5 shadow-[0_30px_70px_-28px_rgba(234,88,12,0.35)] ring-1 ring-orange-100/70 backdrop-blur-2xl">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.4rem] px-4 py-3 sm:px-5">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 shadow-inner shadow-orange-100">
                                                <Search className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="What do you need help with?"
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-12 w-full border-none bg-transparent text-base font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 sm:text-lg"
                                            />
                                        </div>
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="inline-flex h-14 items-center justify-center rounded-[1.3rem] bg-slate-900 px-6 text-base font-bold text-white shadow-[0_18px_36px_-16px_rgba(15,23,42,0.65)] transition-all hover:bg-orange-600 hover:shadow-[0_20px_40px_-16px_rgba(234,88,12,0.7)] sm:px-8"
                                        >
                                            Get Help
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap items-center gap-2.5 pl-1 text-sm font-medium sm:mt-6">
                                    <span className="mr-1 inline-flex items-center gap-1 text-slate-500">
                                        <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                                        Popular:
                                    </span>
                                    {[
                                        'Cleaning',
                                        'Mounting',
                                        'Moving',
                                        'Repairs',
                                    ].map((tag) => (
                                        <motion.button
                                            key={tag}
                                            type="button"
                                            whileHover={{ y: -2, scale: 1.03 }}
                                            whileTap={{ scale: 0.96 }}
                                            onClick={() => setSearchQuery(tag)}
                                            className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-slate-600 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-slate-900"
                                        >
                                            {tag}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.form>

                            <motion.div
                                variants={fadeInUp}
                                className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5"
                            >
                                {stats.slice(0, 3).map((stat) => {
                                    const Icon = stat.icon;

                                    return (
                                        <motion.div
                                            key={stat.label}
                                            whileHover={{ y: -4 }}
                                            className="rounded-[1.7rem] border border-white/80 bg-white/75 p-4 shadow-[0_20px_44px_-30px_rgba(15,23,42,0.3)] ring-1 ring-slate-100/80 backdrop-blur-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-black text-slate-900">
                                                        {stat.value}
                                                    </div>
                                                    <div className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                        {stat.label}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30, rotateY: 8 }}
                            animate={{ opacity: 1, x: 0, rotateY: 0 }}
                            transition={{ duration: 1 }}
                            className="relative"
                            style={{ perspective: '1400px' }}
                        >
                            <div className="relative mx-auto w-full max-w-[38rem] lg:max-w-none">
                                <motion.div
                                    whileHover={{
                                        rotateY: -3,
                                        rotateX: 3,
                                        scale: 1.008,
                                    }}
                                    className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/30 shadow-[0_40px_90px_-34px_rgba(15,23,42,0.45)] ring-1 ring-white/60"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-orange-200/20" />
                                    <img
                                        src="/images/hero-handyman.jpg"
                                        alt="Professional handyman at work"
                                        className="h-[25rem] w-full object-cover sm:h-[31rem] lg:h-[39rem]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/15 to-white/10" />

                                    <div className="absolute inset-x-5 top-5 flex items-start justify-between sm:inset-x-6 sm:top-6">
                                        <div className="rounded-full border border-white/25 bg-white/15 px-3 py-2 text-xs font-bold tracking-[0.2em] text-white uppercase backdrop-blur-xl sm:px-4">
                                            Premium local marketplace
                                        </div>
                                        <div className="hidden rounded-2xl border border-white/20 bg-slate-950/35 px-4 py-3 text-right text-white/90 shadow-lg backdrop-blur-xl sm:block">
                                            <div className="text-[11px] font-semibold tracking-[0.2em] text-orange-200 uppercase">
                                                Response time
                                            </div>
                                            <div className="mt-1 text-lg font-black">
                                                Within minutes
                                            </div>
                                        </div>
                                    </div>

                                    <motion.div
                                        initial={{ y: 24, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay: 0.35,
                                            duration: 0.75,
                                        }}
                                        className="absolute right-5 bottom-5 left-5 rounded-[2rem] border border-white/25 bg-white/88 p-5 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.55)] backdrop-blur-2xl sm:right-6 sm:bottom-6 sm:left-6 sm:p-6"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex -space-x-3">
                                                    {featuredServices
                                                        .slice(0, 3)
                                                        .map((service) => (
                                                            <img
                                                                key={service.id}
                                                                src={
                                                                    service.image
                                                                }
                                                                alt={
                                                                    service.name
                                                                }
                                                                className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-md sm:h-12 sm:w-12"
                                                            />
                                                        ))}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base font-black text-slate-900">
                                                            Excellent
                                                        </span>
                                                        <div className="flex items-center text-orange-500">
                                                            {Array.from({
                                                                length: 5,
                                                            }).map(
                                                                (_, index) => (
                                                                    <Star
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="h-3.5 w-3.5 fill-current"
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-500">
                                                        Based on 10,000+
                                                        verified reviews
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 sm:w-auto">
                                                <div className="rounded-2xl bg-orange-50 px-4 py-3">
                                                    <div className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
                                                        Available today
                                                    </div>
                                                    <div className="mt-1 text-sm font-bold text-slate-900">
                                                        300+ taskers online
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl bg-slate-100 px-4 py-3">
                                                    <div className="text-[11px] font-bold tracking-[0.18em] text-slate-500 uppercase">
                                                        Top cities
                                                    </div>
                                                    <div className="mt-1 text-sm font-bold text-slate-900">
                                                        Tripoli, Benghazi
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.45, duration: 0.65 }}
                                    className="absolute top-10 -left-3 hidden rounded-[1.6rem] border border-white/60 bg-white/82 p-4 shadow-[0_30px_60px_-32px_rgba(15,23,42,0.4)] backdrop-blur-xl sm:block lg:-left-10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold tracking-[0.18em] text-slate-400 uppercase">
                                                Instant match
                                            </div>
                                            <div className="text-sm font-black text-slate-900">
                                                Book in a few taps
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.55, duration: 0.65 }}
                                    className="absolute top-24 -right-3 hidden rounded-[1.6rem] border border-orange-200/70 bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white shadow-[0_32px_70px_-28px_rgba(234,88,12,0.8)] sm:block lg:-right-8"
                                >
                                    <div className="text-[11px] font-bold tracking-[0.22em] text-orange-100 uppercase">
                                        Satisfaction
                                    </div>
                                    <div className="mt-1 text-2xl font-black">
                                        98%
                                    </div>
                                    <div className="text-sm text-orange-50/90">
                                        happy customer rate
                                    </div>
                                </motion.div>

                                <div className="absolute inset-x-10 -bottom-8 h-16 rounded-[3rem] bg-orange-900/15 blur-3xl" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-white py-20 sm:py-28">
                <div className="absolute -top-16 right-0 h-[34rem] w-[34rem] rounded-full bg-orange-50/80 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-[20rem] w-[20rem] rounded-full bg-amber-50 blur-3xl" />

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
                    >
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50/70 px-4 py-2 text-sm font-semibold text-orange-700">
                            <Sparkles className="h-4 w-4" />
                            Explore what people book most
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                            Popular projects in{' '}
                            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                                your area
                            </span>
                        </h2>
                        <p className="mt-4 text-base leading-7 font-medium text-slate-600 sm:text-lg">
                            Browse categories with stronger local demand and
                            connect to vetted professionals faster.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6"
                    >
                        {categories.map((category) => {
                            const Icon = category.icon;

                            return (
                                <motion.button
                                    key={category.id}
                                    variants={fadeInUp}
                                    whileHover={{ y: -6, scale: 1.015 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() =>
                                        handleCategoryClick(category.id)
                                    }
                                    className="group relative flex min-h-[11.5rem] flex-col items-start justify-between overflow-hidden rounded-[2rem] border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-5 text-left shadow-[0_20px_40px_-32px_rgba(15,23,42,0.25)] transition-all duration-300 hover:border-orange-200 hover:shadow-[0_30px_60px_-28px_rgba(234,88,12,0.22)] sm:min-h-[12.5rem] sm:p-6"
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.18),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(253,186,116,0.18),_transparent_36%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 shadow-inner shadow-orange-100 transition-transform duration-300 group-hover:scale-110">
                                        <Icon
                                            className="h-7 w-7"
                                            strokeWidth={1.7}
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="text-lg font-black text-slate-900 sm:text-xl">
                                            {category.name}
                                        </div>
                                        <div className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors group-hover:text-orange-600">
                                            Explore now
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            <section
                id="how-it-works"
                className="relative overflow-hidden bg-[#faf8f5] py-20 sm:py-28"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.24, 0.42, 0.24],
                    }}
                    transition={{ duration: 9, repeat: Infinity }}
                    className="absolute top-10 -left-16 h-[24rem] w-[24rem] rounded-full bg-orange-200/35 blur-[110px]"
                />
                <div className="absolute top-0 right-0 h-[28rem] w-[28rem] rounded-full bg-amber-100/50 blur-[110px]" />

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mx-auto mb-14 max-w-3xl text-center sm:mb-20"
                    >
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm">
                            <Zap className="h-4 w-4" />
                            Simple and fast
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                            Everyday life made{' '}
                            <span className="text-orange-600">easier</span>
                        </h2>
                        <p className="mt-4 text-base leading-7 font-medium text-slate-600 sm:text-lg">
                            Three clean steps to get trusted help without the
                            usual hassle.
                        </p>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
                        {valueProps.map((item, index) => (
                            <ParallaxSection key={item.title}>
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                    className="group relative h-full"
                                >
                                    <div className="relative flex h-full min-h-[20rem] flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-7 shadow-[0_26px_50px_-34px_rgba(15,23,42,0.28)] ring-1 ring-slate-100/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_36px_70px_-34px_rgba(15,23,42,0.34)] sm:p-8">
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-70`}
                                        />
                                        <div className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-sm font-black text-slate-400 shadow-sm transition-all duration-300 group-hover:text-orange-600">
                                            {index + 1}
                                        </div>
                                        <div className="relative">
                                            <div
                                                className={`mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${item.iconWrap} shadow-inner shadow-white/60 transition-transform duration-300 group-hover:scale-110`}
                                            >
                                                <item.icon
                                                    className="h-8 w-8"
                                                    strokeWidth={1.7}
                                                />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 transition-colors duration-300 group-hover:text-orange-600">
                                                {item.title}
                                            </h3>
                                            <p className="mt-4 text-base leading-7 font-medium text-slate-600">
                                                {item.desc}
                                            </p>
                                        </div>
                                        <div className="relative mt-auto pt-8">
                                            <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300 group-hover:w-28" />
                                        </div>
                                    </div>
                                </motion.div>
                            </ParallaxSection>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-white py-20 sm:py-28">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-orange-50/70 to-transparent" />
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 flex flex-col gap-5 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
                                <Award className="h-4 w-4" />
                                Top-rated professionals
                            </div>
                            <h2 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                                Featured{' '}
                                <span className="text-orange-600">
                                    professionals
                                </span>
                            </h2>
                            <p className="mt-4 text-base leading-7 font-medium text-slate-600 sm:text-lg">
                                Skilled people with strong ratings, verified
                                profiles, and polished service quality.
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onNavigate('services')}
                            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50"
                        >
                            See all
                            <ArrowRight className="h-4 w-4 text-orange-600 transition-transform group-hover:translate-x-1" />
                        </motion.button>
                    </div>

                    <div className="-m-4 overflow-hidden p-4" ref={emblaRef}>
                        <div className="flex gap-6">
                            {featuredServices.map((service, index) => (
                                <div
                                    key={service.id}
                                    className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%]"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.08 }}
                                        whileHover={{ y: -8 }}
                                        className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_26px_50px_-36px_rgba(15,23,42,0.28)] transition-all duration-300 hover:border-orange-200 hover:shadow-[0_36px_70px_-34px_rgba(234,88,12,0.28)]"
                                    >
                                        <div className="relative px-6 pt-6">
                                            <div className="absolute inset-x-6 top-0 h-24 rounded-b-[1.6rem] bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50" />
                                            {service.verified && (
                                                <div className="absolute top-5 right-5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white shadow-md">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500">
                                                        <CheckCircle
                                                            className="h-3 w-3 text-white"
                                                            strokeWidth={3}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="relative flex items-start gap-4">
                                                <div className="relative">
                                                    <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-slate-50 shadow-lg">
                                                        <img
                                                            src={service.image}
                                                            alt={service.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2 border-white bg-green-500 shadow-md" />
                                                </div>
                                                <div className="min-w-0 flex-1 pt-2">
                                                    <h4 className="truncate text-lg font-black text-slate-900 transition-colors group-hover:text-orange-600">
                                                        {service.name}
                                                    </h4>
                                                    <p className="mt-1 text-sm font-semibold text-slate-500">
                                                        {service.service}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2 text-sm">
                                                        <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                                                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                                                            {service.rating}
                                                        </span>
                                                        <span className="text-slate-400">
                                                            ({service.reviews}{' '}
                                                            reviews)
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {service.location}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-1 flex-col px-6 pt-5 pb-6">
                                            <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4 text-sm leading-6 font-medium text-slate-600">
                                                Professional, punctual, and
                                                highly rated by repeat customers
                                                looking for dependable quality.
                                            </div>
                                            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                                                <div>
                                                    <div className="text-xs font-bold tracking-[0.18em] text-slate-400 uppercase">
                                                        Starting price
                                                    </div>
                                                    <div className="mt-1 text-lg font-black text-slate-950">
                                                        {service.price}
                                                    </div>
                                                </div>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3.5 py-2 text-sm font-bold text-orange-600 transition-colors group-hover:bg-orange-100">
                                                    View Profile
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.16),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.12),_transparent_28%)]" />
                <div className="absolute top-1/2 left-1/2 h-[34rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/8 blur-[120px]" />

                <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/8 via-white/[0.05] to-white/[0.03] p-8 shadow-[0_40px_100px_-50px_rgba(15,23,42,0.8)] backdrop-blur-xl sm:p-10 lg:p-14">
                        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90"
                                >
                                    <Heart className="h-4 w-4 fill-current text-pink-400" />
                                    Join our community
                                </motion.div>
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="text-4xl leading-[1.02] font-black text-white sm:text-5xl lg:text-6xl"
                                >
                                    Don't just dream it.
                                    <br />
                                    <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                                        Task it.
                                    </span>
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
                                >
                                    Join a growing community getting everything
                                    from quick fixes to bigger projects done
                                    with trusted professionals.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-8 flex flex-col gap-3 sm:flex-row"
                                >
                                    <motion.a
                                        href="/login"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-base font-bold text-white shadow-[0_24px_50px_-20px_rgba(234,88,12,0.8)] transition-all hover:from-orange-500 hover:to-orange-500"
                                    >
                                        Get Started
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </motion.a>
                                    <motion.button
                                        type="button"
                                        onClick={() => {
                                            const howItWorks =
                                                document.getElementById(
                                                    'how-it-works',
                                                );
                                            howItWorks?.scrollIntoView({
                                                behavior: 'smooth',
                                            });
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/8 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/14"
                                    >
                                        See How It Works
                                    </motion.button>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.18 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                {stats.map((stat) => {
                                    const Icon = stat.icon;

                                    return (
                                        <div
                                            key={stat.label}
                                            className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5 shadow-inner shadow-white/5"
                                        >
                                            <Icon className="h-7 w-7 text-orange-400" />
                                            <div className="mt-4 text-2xl font-black text-white">
                                                {stat.value}
                                            </div>
                                            <div className="mt-1 text-sm font-medium text-slate-400">
                                                {stat.label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="relative overflow-hidden border-t border-slate-100 bg-white pt-16 pb-8 sm:pt-20 sm:pb-10">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-orange-50/60 to-transparent" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 grid gap-8 lg:grid-cols-[1.2fr_repeat(4,0.8fr)] lg:gap-10">
                        <div className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-white to-orange-50/40 p-6 shadow-[0_24px_50px_-34px_rgba(15,23,42,0.2)]">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="h-12 w-12 overflow-hidden rounded-2xl border border-orange-200/60 shadow-sm">
                                    <img
                                        src="/images/hirfati-logo.jpg"
                                        alt="حرفتي Logo"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-slate-900">
                                        Hirfati
                                    </div>
                                    <div className="text-xs font-bold tracking-[0.18em] text-orange-600 uppercase">
                                        Trusted local help
                                    </div>
                                </div>
                            </div>
                            <p className="max-w-sm text-sm leading-7 font-medium text-slate-600">
                                Connecting communities with trusted
                                professionals across Libya through a vibrant,
                                reliable marketplace.
                            </p>
                            <div className="mt-6 flex gap-3">
                                {[1, 2, 3, 4].map((item) => (
                                    <motion.a
                                        key={item}
                                        href="#"
                                        whileHover={{ scale: 1.08, y: -2 }}
                                        whileTap={{ scale: 0.94 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        <div className="h-4 w-4 rounded-full bg-current" />
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        <FooterColumn
                            title="Discover"
                            links={[
                                'Become a Tasker',
                                'Services By City',
                                'All Services',
                                'Elite Taskers',
                            ]}
                        />
                        <FooterColumn
                            title="Company"
                            links={[
                                'About Us',
                                'Careers',
                                'Press',
                                'Contact Us',
                            ]}
                        />
                        <FooterColumn
                            title="Learn More"
                            links={[
                                'How it Works',
                                'Safety',
                                'Blog',
                                'Terms & Privacy',
                            ]}
                        />

                        <div>
                            <h5 className="text-sm font-black tracking-[0.16em] text-slate-900 uppercase">
                                Download App
                            </h5>
                            <p className="mt-4 text-sm leading-7 font-medium text-slate-600">
                                Get the best Hirfati experience on the go.
                            </p>
                            <div className="mt-5 flex flex-col gap-3">
                                {['App Store', 'Google Play'].map((store) => (
                                    <motion.a
                                        key={store}
                                        href="#"
                                        whileHover={{ scale: 1.03, y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-[0_18px_30px_-20px_rgba(15,23,42,0.55)] transition-all hover:bg-slate-800"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12">
                                            <div className="h-4 w-4 rounded bg-white/80" />
                                        </div>
                                        {store}
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-center text-sm text-slate-400 sm:flex-row sm:text-left">
                        <div>
                            &copy; 2025 حرفتي (Hirfati). All rights reserved.
                        </div>
                        <div className="flex gap-5 sm:gap-6">
                            {['Privacy', 'Terms', 'Cookies'].map((item) => (
                                <a
                                    key={item}
                                    href="#"
                                    className="transition-colors hover:text-orange-600"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
    return (
        <div>
            <h5 className="text-sm font-black tracking-[0.16em] text-slate-900 uppercase">
                {title}
            </h5>
            <ul className="mt-4 space-y-3 text-sm font-medium text-slate-600">
                {links.map((link) => (
                    <li key={link}>
                        <motion.a
                            href="#"
                            whileHover={{ x: 3 }}
                            className="inline-flex items-center gap-2 transition-colors hover:text-orange-600"
                        >
                            {link}
                        </motion.a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
