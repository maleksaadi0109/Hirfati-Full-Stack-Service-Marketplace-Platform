import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Calendar, LayoutGrid, User } from 'lucide-react';
import { useState } from 'react';
import ImageGallery from './ImageGallery';

export interface PostImage {
    id: number;
    image_path: string;
    image_url: string;
    sort_order: number;
}

export interface Post {
    id: number;
    provider_id: number;
    provider_name?: string;
    provider_picture?: string;
    title: string;
    description: string;
    category: string;
    images: PostImage[];
    is_published: boolean;
    created_at: string;
    provider?: {
        id: number;
        user?: {
            name: string;
            first_name?: string;
            last_name?: string;
            city?: string;
            picture?: string;
            picture_url?: string;
        };
    };
}

interface PostCardProps {
    post: Post;
    showProviderInfo?: boolean;
}

export default function PostCard({
    post,
    showProviderInfo = true,
}: PostCardProps) {
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [initialImageIndex, setInitialImageIndex] = useState(0);

    const formattedDate = new Date(post.created_at).toLocaleDateString(
        'en-US',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        },
    );

    const getProviderName = () => {
        if (post.provider_name) return post.provider_name;
        const user = post.provider?.user;
        if (user) {
            if (user.first_name || user.last_name)
                return `${user.first_name || ''} ${user.last_name || ''}`.trim();
            return user.name;
        }
        return 'Unknown Provider';
    };

    const getProviderAvatar = () => {
        const pic =
            post.provider_picture ||
            post.provider?.user?.picture_url ||
            post.provider?.user?.picture;
        if (!pic) return null;
        if (pic.startsWith('http')) return pic;
        if (pic.startsWith('/storage/')) return pic;
        return `/storage/${pic}`;
    };

    const images = post.images || [];

    const handleImageClick = (index: number) => {
        setInitialImageIndex(index);
        setGalleryOpen(true);
    };

    return (
        <>
            <motion.div
                whileHover={{ y: -4 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-orange-500/10"
            >
                {images.length > 0 ? (
                    <div
                        className="relative aspect-video w-full cursor-pointer overflow-hidden bg-slate-100"
                        onClick={() => handleImageClick(0)}
                    >
                        <img
                            src={
                                images[0].image_url || getProviderAvatar()
                                    ? images[0].image_path.startsWith('/') ||
                                      images[0].image_path.startsWith('http')
                                        ? images[0].image_path
                                        : `/storage/${images[0].image_path}`
                                    : ''
                            }
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {images.length > 1 && (
                            <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-md">
                                <LayoutGrid className="h-3.5 w-3.5" />+
                                {images.length - 1}
                            </div>
                        )}
                        {post.category && (
                            <div className="absolute top-3 left-3 rounded-lg bg-white/90 px-3 py-1 text-xs font-black tracking-wide text-orange-600 uppercase shadow-sm backdrop-blur-md">
                                {post.category}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-slate-50">
                        <span className="text-sm font-medium text-slate-400">
                            No images
                        </span>
                    </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                    {showProviderInfo && (
                        <Link
                            href={`/client/providers/${post.provider_id || post.provider?.id}`}
                            className="mb-4 flex items-center gap-3 transition-colors hover:text-orange-600"
                        >
                            <div className="h-8 w-8 overflow-hidden rounded-full bg-orange-100 shadow-inner">
                                {getProviderAvatar() ? (
                                    <img
                                        src={getProviderAvatar()!}
                                        alt={getProviderName()}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-orange-100 text-orange-600">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm leading-none font-bold text-slate-900">
                                    {getProviderName()}
                                </p>
                                <p className="mt-0.5 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                                    Professional
                                </p>
                            </div>
                        </Link>
                    )}

                    <h3 className="line-clamp-1 text-lg font-extrabold text-slate-900">
                        {post.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed font-medium text-slate-500">
                        {post.description}
                    </p>

                    <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Calendar className="h-3.5 w-3.5" />
                            {formattedDate}
                        </div>
                    </div>
                </div>
            </motion.div>

            <ImageGallery
                images={images.map((img) => ({
                    ...img,
                    image_url:
                        img.image_url ||
                        (img.image_path.startsWith('/') ||
                        img.image_path.startsWith('http')
                            ? img.image_path
                            : `/storage/${img.image_path}`),
                }))}
                isOpen={galleryOpen}
                initialIndex={initialImageIndex}
                onClose={() => setGalleryOpen(false)}
            />
        </>
    );
}
