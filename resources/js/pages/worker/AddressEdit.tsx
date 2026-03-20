import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    Home,
    Landmark,
    MapPin,
    MapPinned,
    PenSquare,
    Star,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const labelOptions = [
    { value: 'Home', icon: Home },
    { value: 'Office', icon: Building2 },
    { value: 'Apartment', icon: Landmark },
    { value: 'Other', icon: MapPinned },
];

export default function AddressEdit() {
    const { addressId } = usePage<{ addressId?: string }>().props;

    const [formData, setFormData] = useState({
        label: 'Home',
        addressLine1: 'Al-Andalus, Tripoli',
        addressLine2: 'Building 45, Floor 2',
        city: 'Tripoli',
        latitude: '32.8319117060',
        longitude: '13.2744134261',
        isDefault: true,
        notes: 'Ring the bell and use the left entrance.',
    });

    const previewTitle = useMemo(
        () => formData.label || 'Saved Address',
        [formData.label],
    );
    const previewLine1 = useMemo(
        () =>
            formData.addressLine1 ||
            formData.city ||
            'Street, neighborhood, or nearby landmark',
        [formData.addressLine1, formData.city],
    );
    const previewLine2 = useMemo(() => {
        if (formData.addressLine2) return formData.addressLine2;
        if (formData.latitude && formData.longitude)
            return `Lat: ${formData.latitude}, Lng: ${formData.longitude}`;
        return 'Building, floor, apartment, or location notes';
    }, [formData.addressLine2, formData.latitude, formData.longitude]);

    const updateField = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <DashboardLayout title="Edit Address">
            <div className="space-y-8">
                <div className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-blue-50/30 to-slate-50 p-6 shadow-xl shadow-slate-200/40 sm:p-8">
                    <Link
                        href="/worker/profile"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-600"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to profile
                    </Link>

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl space-y-3">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-black tracking-[0.22em] text-slate-700 uppercase shadow-sm">
                                <PenSquare className="h-3.5 w-3.5" />
                                Edit address #{addressId || '1'}
                            </span>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                Refine the saved location details before final
                                API hookup.
                            </h1>
                            <p className="text-sm leading-6 font-medium text-slate-500 sm:text-base">
                                This page is frontend only. It uses mock
                                prefilled values so the full edit flow is ready
                                visually.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm">
                            <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                                Mode
                            </p>
                            <div className="mt-2 flex items-center gap-3 text-sm font-semibold text-slate-700">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                Editing preview state
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm sm:p-8">
                        <div className="mb-8 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">
                                    Update address
                                </h2>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Change the readable address, notes, or
                                    coordinates.
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                <MapPinned className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="mb-3 block text-sm font-bold text-slate-700">
                                    Address label
                                </label>
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    {labelOptions.map((option) => {
                                        const Icon = option.icon;
                                        const isActive =
                                            formData.label === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    updateField(
                                                        'label',
                                                        option.value,
                                                    )
                                                }
                                                className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                                                    isActive
                                                        ? 'border-slate-300 bg-slate-100 text-slate-800 shadow-sm'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/40'
                                                }`}
                                            >
                                                <Icon className="mb-3 h-5 w-5" />
                                                <div className="text-sm font-bold">
                                                    {option.value}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <Field
                                    label="Address line 1"
                                    placeholder="Street, area, or landmark"
                                    value={formData.addressLine1}
                                    onChange={(value) =>
                                        updateField('addressLine1', value)
                                    }
                                />
                                <Field
                                    label="Address line 2"
                                    placeholder="Building, floor, apartment"
                                    value={formData.addressLine2}
                                    onChange={(value) =>
                                        updateField('addressLine2', value)
                                    }
                                />
                                <Field
                                    label="City"
                                    placeholder="Tripoli"
                                    value={formData.city}
                                    onChange={(value) =>
                                        updateField('city', value)
                                    }
                                />
                                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                                    <p className="text-sm font-bold text-slate-700">
                                        Default address
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Decide if this should stay the primary
                                        service location.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateField(
                                                'isDefault',
                                                !formData.isDefault,
                                            )
                                        }
                                        className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                                            formData.isDefault
                                                ? 'bg-orange-600 text-white'
                                                : 'border border-slate-200 bg-white text-slate-600'
                                        }`}
                                    >
                                        <Star className="h-4 w-4" />
                                        {formData.isDefault
                                            ? 'Marked as default'
                                            : 'Mark as default'}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/60 p-5 sm:p-6">
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">
                                            Coordinates
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Keep the existing pin or replace it
                                            with new values.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-white p-3 text-slate-500 shadow-sm">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <Field
                                        label="Latitude"
                                        placeholder="32.8319"
                                        value={formData.latitude}
                                        onChange={(value) =>
                                            updateField('latitude', value)
                                        }
                                    />
                                    <Field
                                        label="Longitude"
                                        placeholder="13.2744"
                                        value={formData.longitude}
                                        onChange={(value) =>
                                            updateField('longitude', value)
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-3 block text-sm font-bold text-slate-700">
                                    Delivery notes
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.notes}
                                    onChange={(e) =>
                                        updateField('notes', e.target.value)
                                    }
                                    placeholder="Gate code, nearest shop, floor instructions, or anything useful for the professional."
                                    className="w-full rounded-3xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-sm font-medium text-slate-700 transition-all outline-none placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                                />
                            </div>

                            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                                <Link
                                    href="/worker/profile"
                                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-transform hover:-translate-y-0.5"
                                >
                                    Update address
                                </button>
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 text-white shadow-2xl shadow-slate-900/20">
                            <div className="bg-[radial-gradient(circle_at_top_right,_rgba(148,163,184,0.28),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(251,146,60,0.18),_transparent_40%)] p-6 sm:p-7">
                                <p className="text-xs font-black tracking-[0.22em] text-orange-300 uppercase">
                                    Live preview
                                </p>
                                <h3 className="mt-3 text-2xl font-black tracking-tight">
                                    Updated profile card
                                </h3>

                                <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-2xl border border-white/10 bg-white/15 p-3 text-orange-300">
                                                <MapPin className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white">
                                                    {previewTitle}
                                                </h4>
                                                <p className="mt-1 text-sm leading-6 text-slate-200">
                                                    {previewLine1}
                                                    <br />
                                                    {previewLine2}
                                                </p>
                                            </div>
                                        </div>

                                        {formData.isDefault && (
                                            <span className="rounded-full bg-orange-400/15 px-3 py-1 text-xs font-black tracking-[0.18em] text-orange-200 uppercase">
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    {formData.notes && (
                                        <div className="rounded-2xl bg-black/15 p-4 text-sm text-slate-200">
                                            {formData.notes}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
                            <h3 className="text-lg font-black text-slate-900">
                                Frontend-only behavior
                            </h3>
                            <div className="mt-4 space-y-3 text-sm font-medium text-slate-600">
                                <p>The page uses mock address data for now.</p>
                                <p>
                                    The route receives `addressId` so backend
                                    data can be connected later.
                                </p>
                                <p>
                                    The save button is visual only at this
                                    stage.
                                </p>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </DashboardLayout>
    );
}

function Field({
    label,
    placeholder,
    value,
    onChange,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-3 block text-sm font-bold text-slate-700">
                {label}
            </span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-sm font-medium text-slate-700 transition-all outline-none placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            />
        </label>
    );
}
