import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Bell,
    Calendar,
    Camera,
    CreditCard,
    ExternalLink,
    Loader2,
    Lock,
    Mail,
    MapPin,
    Phone,
    Settings,
    ShieldCheck,
    Star,
    User,
    X,
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

    // Attempt to get user data from auth or local storage
    const [localUserData] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem('user') ||
                    localStorage.getItem('herfati_user_data') ||
                    'null',
            );
        } catch {
            return null;
        }
    });

    const sessionUser = auth?.user || localUserData || {};

    const resolvePictureUrl = (value?: string | null) => {
        if (!value) return null;
        if (value.startsWith('http://') || value.startsWith('https://'))
            return value;
        if (value.startsWith('/storage/')) return value;
        return `/storage/${value}`;
    };

    const user = {
        name: `${sessionUser.first_name || sessionUser.firstName || 'Malek'} ${sessionUser.last_name || sessionUser.lastName || 'Saadi'}`.trim(),
        email: sessionUser.email || 'malek.saadi@example.com',
        phone:
            sessionUser.phoneNumber ||
            sessionUser.phone_number ||
            sessionUser.phone ||
            '+218 91 123 4567',
        location: sessionUser.city || sessionUser.location || 'Tripoli, Libya',
        avatar:
            resolvePictureUrl(sessionUser.picture) ||
            sessionUser.picture_url ||
            sessionUser.avatar_url ||
            'https://i.pravatar.cc/150?u=malek',
        birthday: sessionUser.birthday || '',
        joinedDate: sessionUser.created_at
            ? new Date(sessionUser.created_at).toLocaleDateString()
            : 'October 2023',
        stats: {
            totalJobs: 12, // Dummy data for now
            spent: '2,450 LYD',
            rating: 4.9,
        },
    };

    const [activeTab, setActiveTab] = useState('profile');

    // Form State
    const [formData, setFormData] = useState({
        first_name: sessionUser.first_name || sessionUser.firstName || '',
        last_name: sessionUser.last_name || sessionUser.lastName || '',
        email: sessionUser.email || '',
        phone_number:
            sessionUser.phoneNumber ||
            sessionUser.phone_number ||
            sessionUser.phone ||
            '',
        city: sessionUser.city || sessionUser.location || '',
        birthday: sessionUser.birthday || '',
    });
    const [pictureFile, setPictureFile] = useState<File | null>(null);
    const [picturePreview, setPicturePreview] = useState<string | null>(null);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [isAddressesLoading, setIsAddressesLoading] = useState(true);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const headers = token
                    ? { Authorization: `Bearer ${token}` }
                    : undefined;

                const response = await axios.get('/api/client/addresses', {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setSaveStatus({ type: null, message: '' });

        try {
            const token = localStorage.getItem('access_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    submitData.append(key, value as string);
                }
            });
            if (pictureFile) {
                submitData.append('picture', pictureFile);
            }

            // use _method=PUT to send FormData as a PUT request in Laravel
            submitData.append('_method', 'PUT');

            const response = await axios.post(
                '/api/client/profile/update',
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        ...headers,
                    },
                },
            );

            // The controller directly returns the raw User model inside data
            if (response.data.data) {
                const updatedUser = {
                    ...sessionUser,
                    ...response.data.data,
                    picture: response.data.data.picture || sessionUser.picture,
                    picture_url:
                        response.data.data.picture_url ||
                        resolvePictureUrl(response.data.data.picture) ||
                        resolvePictureUrl(sessionUser.picture),
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setPictureFile(null);
            }

            setSaveStatus({
                type: 'success',
                message: 'Profile updated successfully!',
            });

            // Hide success message after 3 seconds
            setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
        } catch (error: any) {
            console.error('Profile update error:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Failed to update profile. Please try again.';
            setSaveStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout title="My Profile">
            <div className="mx-auto min-h-screen max-w-7xl bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                    {/* Left Sidebar Column (25%) */}
                    <div className="sticky top-24 space-y-6 lg:col-span-3">
                        {/* Navigation Sidebar */}
                        <div className="rounded-xl bg-white p-4 shadow-md">
                            <h3 className="mb-4 px-4 pt-2 text-sm font-semibold text-gray-900">
                                Account Settings
                            </h3>
                            <div className="space-y-1">
                                {[
                                    {
                                        id: 'profile',
                                        icon: <User className="h-5 w-5" />,
                                        label: 'Personal Info',
                                    },
                                    {
                                        id: 'billing',
                                        icon: (
                                            <CreditCard className="h-5 w-5" />
                                        ),
                                        label: 'Billing & Payments',
                                    },
                                    {
                                        id: 'security',
                                        icon: <Lock className="h-5 w-5" />,
                                        label: 'Security',
                                    },
                                    {
                                        id: 'notifications',
                                        icon: <Bell className="h-5 w-5" />,
                                        label: 'Notifications',
                                    },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors duration-200 ${
                                            activeTab === tab.id
                                                ? 'bg-orange-50 text-orange-600'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {tab.icon}
                                            <span className="text-sm font-medium">
                                                {tab.label}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Premium Member Card */}
                        <div className="relative overflow-hidden rounded-xl bg-slate-900 p-6 text-white shadow-md">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ShieldCheck className="h-24 w-24 text-white" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-white/10 backdrop-blur-sm">
                                    <Star className="h-5 w-5 fill-orange-400 text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">
                                        Premium Client
                                    </h3>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-300">
                                        Enjoy priority support and waived
                                        service fees on all bookings.
                                    </p>
                                </div>
                                <button className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600">
                                    View Benefits
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Main Content Column (75%) */}
                    <div className="space-y-6 lg:col-span-9">
                        {/* Hero Profile Section */}
                        <div className="flex flex-col items-center gap-8 rounded-xl bg-white p-8 shadow-md md:flex-row md:items-start">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="relative h-32 w-32 md:h-40 md:w-40">
                                    <img
                                        src={picturePreview || user.avatar}
                                        alt={user.name}
                                        className="h-full w-full cursor-zoom-in rounded-full border-4 border-white object-cover shadow-lg"
                                        onClick={() =>
                                            setIsPhotoModalOpen(true)
                                        }
                                    />
                                    <label
                                        htmlFor="profile-upload"
                                        className="absolute right-1 bottom-1 flex cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white p-2.5 text-gray-700 shadow-md transition-colors hover:bg-gray-50 hover:text-orange-600"
                                    >
                                        <Camera className="h-5 w-5" />
                                        <input
                                            type="file"
                                            id="profile-upload"
                                            accept=".jpg,.jpeg,.png,.webp"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (
                                                    e.target.files &&
                                                    e.target.files[0]
                                                ) {
                                                    setPictureFile(
                                                        e.target.files[0],
                                                    );
                                                    setPicturePreview(
                                                        URL.createObjectURL(
                                                            e.target.files[0],
                                                        ),
                                                    );
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="w-full flex-1 space-y-4 text-center md:text-left">
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    <div>
                                        <div className="mb-2 flex items-center justify-center gap-3 md:justify-start">
                                            <h1 className="text-3xl font-bold text-gray-900">
                                                {user.name}
                                            </h1>
                                            <ShieldCheck className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center gap-2 text-gray-600 md:justify-start">
                                            <MapPin className="h-4 w-4 text-orange-600" />
                                            <span>{user.location}</span>
                                            <span className="hidden px-2 sm:inline">
                                                •
                                            </span>
                                            <Calendar className="h-4 w-4 text-orange-600" />
                                            <span>
                                                Joined {user.joinedDate}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-orange-700"
                                    >
                                        <Settings className="h-4 w-4" /> Edit
                                        Profile
                                    </button>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {user.stats.totalJobs}
                                        </div>
                                        <div className="text-sm font-medium text-gray-500">
                                            Jobs Posted
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {user.stats.spent}
                                        </div>
                                        <div className="text-sm font-medium text-gray-500">
                                            Total Spent
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-center gap-1 md:justify-start">
                                            <span className="text-2xl font-bold text-gray-900">
                                                {user.stats.rating}
                                            </span>
                                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <div className="text-sm font-medium text-gray-500">
                                            Client Rating
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Switching Area */}
                        <div className="animate-in duration-300 fade-in">
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    {/* Personal Details Card */}
                                    <div className="rounded-xl bg-white p-8 shadow-md">
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-900">
                                                Personal Information
                                            </h2>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Manage your basic details and
                                                contact info.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            {/* First Name */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    First Name
                                                </label>
                                                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 transition-colors focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
                                                    <User className="h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="first_name"
                                                        value={
                                                            formData.first_name
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-full border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            {/* Last Name */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Last Name
                                                </label>
                                                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 transition-colors focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
                                                    <User className="h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="last_name"
                                                        value={
                                                            formData.last_name
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-full border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Email Address
                                                </label>
                                                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 transition-colors focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-full border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone Number */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Phone Number
                                                </label>
                                                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 transition-colors focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        name="phone_number"
                                                        value={
                                                            formData.phone_number
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-full border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            {/* Location / City */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    City / Location
                                                </label>
                                                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 transition-colors focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
                                                    <MapPin className="h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-full border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            {/* Birthday */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Birthday
                                                </label>
                                                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 transition-colors focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="date"
                                                        name="birthday"
                                                        value={
                                                            formData.birthday
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        max={
                                                            new Date()
                                                                .toISOString()
                                                                .split('T')[0]
                                                        }
                                                        className="w-full cursor-text border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {saveStatus.message && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${
                                                    saveStatus.type ===
                                                    'success'
                                                        ? 'border border-green-200 bg-green-50 text-green-700'
                                                        : 'border border-red-200 bg-red-50 text-red-700'
                                                }`}
                                            >
                                                {saveStatus.type ===
                                                'success' ? (
                                                    <ShieldCheck className="h-4 w-4" />
                                                ) : (
                                                    <Settings className="h-4 w-4" />
                                                )}
                                                {saveStatus.message}
                                            </motion.div>
                                        )}

                                        <div className="mt-8 flex justify-end">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={isSaving}
                                                className="flex min-w-[140px] items-center justify-center rounded-lg bg-orange-600 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                                        Saving...
                                                    </>
                                                ) : (
                                                    'Save Changes'
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Registered Addresses Card */}
                                    <div className="rounded-xl bg-white p-8 shadow-md">
                                        <div className="mb-6 flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    Saved Addresses
                                                </h2>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Manage locations for your
                                                    service requests.
                                                </p>
                                            </div>
                                            <Link
                                                href="/client/addresses/create"
                                                className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
                                            >
                                                <PlusCircle className="h-5 w-5" />{' '}
                                                Add New
                                            </Link>
                                        </div>

                                        {isAddressesLoading ? (
                                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                                                Loading saved addresses...
                                            </div>
                                        ) : savedAddresses.length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                                                No saved addresses found.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                {savedAddresses.map(
                                                    (address) => {
                                                        const cardClassName =
                                                            address.is_default
                                                                ? 'group relative rounded-xl border border-orange-200 bg-orange-50/50 p-5'
                                                                : 'rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300';

                                                        const pinClassName =
                                                            address.is_default
                                                                ? 'rounded-lg border border-orange-100 bg-white p-3 text-orange-600 shadow-sm'
                                                                : 'rounded-lg border border-gray-100 bg-gray-50 p-3 text-gray-400';

                                                        const dividerClassName =
                                                            address.is_default
                                                                ? 'mt-4 flex gap-4 border-t border-orange-100 pt-4'
                                                                : 'mt-4 flex gap-4 border-t border-gray-100 pt-4';

                                                        return (
                                                            <div
                                                                key={address.id}
                                                                className={
                                                                    cardClassName
                                                                }
                                                            >
                                                                {address.is_default && (
                                                                    <div className="absolute top-4 right-4">
                                                                        <span className="rounded-md bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                                                                            Default
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-start gap-4">
                                                                    <div
                                                                        className={
                                                                            pinClassName
                                                                        }
                                                                    >
                                                                        <MapPin className="h-6 w-6" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-gray-900">
                                                                            {address.label ||
                                                                                'Saved Address'}
                                                                        </h4>
                                                                        <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                                                            {
                                                                                address.address_line_1
                                                                            }
                                                                            {address.address_line_2 && (
                                                                                <>
                                                                                    <br />
                                                                                    {
                                                                                        address.address_line_2
                                                                                    }
                                                                                </>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={
                                                                        dividerClassName
                                                                    }
                                                                >
                                                                    {!address.is_default && (
                                                                        <button className="text-sm font-medium text-orange-600 hover:text-orange-800">
                                                                            Set
                                                                            Default
                                                                        </button>
                                                                    )}
                                                                    <Link
                                                                        href={`/client/addresses/${address.id}/edit`}
                                                                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                                                                    >
                                                                        Edit
                                                                    </Link>
                                                                    <button className="text-sm font-medium text-gray-500 hover:text-gray-700">
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'billing' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="rounded-xl bg-white p-12 text-center shadow-md"
                                >
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                        <CreditCard className="h-8 w-8" />
                                    </div>
                                    <h2 className="mb-2 text-2xl font-bold text-gray-900">
                                        Billing Center
                                    </h2>
                                    <p className="mx-auto mb-8 max-w-md text-gray-500">
                                        Manage your payment methods, view
                                        transaction history, and download
                                        invoices.
                                    </p>
                                    <Link
                                        href="/billing"
                                        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-orange-700"
                                    >
                                        Go to Billing Dashboard
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                </motion.div>
                            )}

                            {(activeTab === 'security' ||
                                activeTab === 'notifications') && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-xl bg-white p-12 text-center shadow-md"
                                >
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-gray-400">
                                        {activeTab === 'security' ? (
                                            <Lock className="h-8 w-8" />
                                        ) : (
                                            <Bell className="h-8 w-8" />
                                        )}
                                    </div>
                                    <h2 className="mb-2 text-2xl font-bold text-gray-900 capitalize">
                                        {activeTab} Settings
                                    </h2>
                                    <p className="text-gray-500">
                                        These settings are currently being
                                        updated and will be available soon.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {isPhotoModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setIsPhotoModalOpen(false)}
                    >
                        <div
                            className="relative w-full max-w-3xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setIsPhotoModalOpen(false)}
                                className="absolute -top-12 right-0 text-white transition-colors hover:text-gray-200"
                                aria-label="Close photo preview"
                            >
                                <X className="h-7 w-7" />
                            </button>
                            <img
                                src={picturePreview || user.avatar}
                                alt={`${user.name} profile`}
                                className="max-h-[80vh] w-full rounded-xl object-contain"
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

const PlusCircle = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);
