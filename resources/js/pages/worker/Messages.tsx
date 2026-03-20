import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CheckCheck,
    Download,
    MessageSquare,
    Mic,
    Paperclip,
    Phone,
    Search,
    Send,
    Sparkles,
    User,
    Video,
    X,
    ZoomIn,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import type { SharedData } from '../../types';

/* ─── Types ─── */
type Conversation = {
    orderId: number;
    service: string;
    contact: { id: number | null; name: string | null; avatar: string | null };
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
};

type ThreadMessage = {
    id: number;
    orderId: number;
    senderId: number;
    senderName: string | null;
    receiverId: number;
    content: string;
    type: 'text' | 'image' | 'audio' | 'file';
    fileUrl: string | null;
    fileMime: string | null;
    fileSize: number | null;
    audioDuration: number | null;
    isRead: boolean;
    createdAt: string | null;
};

type ThreadContact = {
    id: number | null;
    name: string | null;
    avatar: string | null;
    service: string | null;
};

type MessageSentEvent = {
    message?: {
        id?: number;
        order_id?: number;
        sender_id?: number;
        receiver_id?: number;
        content?: string;
        type?: string;
        file_url?: string;
        file_mime?: string;
        file_size?: number;
        audio_duration?: number;
        is_read?: boolean;
        created_at?: string;
        sender?: { name?: string | null };
    };
};

const normalizeMessage = (raw: any): ThreadMessage | null => {
    if (!raw) return null;

    return {
        id: Number(raw.id ?? 0),
        orderId: Number(raw.orderId ?? raw.order_id ?? 0),
        senderId: Number(raw.senderId ?? raw.sender_id ?? 0),
        senderName: raw.senderName ?? raw.sender?.name ?? null,
        receiverId: Number(raw.receiverId ?? raw.receiver_id ?? 0),
        content: String(raw.content ?? ''),
        type: (raw.type as ThreadMessage['type']) ?? 'text',
        fileUrl: raw.fileUrl ?? raw.file_url ?? null,
        fileMime: raw.fileMime ?? raw.file_mime ?? null,
        fileSize: raw.fileSize ?? raw.file_size ?? null,
        audioDuration: raw.audioDuration ?? raw.audio_duration ?? null,
        isRead: Boolean(raw.isRead ?? raw.is_read ?? false),
        createdAt: raw.createdAt ?? raw.created_at ?? null,
    };
};

/* ─── Main Component ─── */
export default function WorkerMessages() {
    const { auth } = usePage<SharedData>().props;
    const currentUserId = Number(auth.user.id);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ThreadMessage[]>([]);
    const [contact, setContact] = useState<ThreadContact | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    /* Lightbox State */
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const authHeaders = useMemo(() => {
        if (typeof window === 'undefined') return undefined;

        let storedUserId: number | null = null;
        try {
            const raw =
                localStorage.getItem('user') ||
                localStorage.getItem('herfati_user_data');
            if (raw) {
                const parsed = JSON.parse(raw);
                const id = Number(parsed?.id ?? parsed?.user_id ?? 0);
                if (!Number.isNaN(id) && id > 0) {
                    storedUserId = id;
                }
            }
        } catch {
            storedUserId = null;
        }

        if (storedUserId && storedUserId !== currentUserId) {
            return undefined;
        }

        const token = localStorage.getItem('access_token');
        return token ? { Authorization: `Bearer ${token}` } : undefined;
    }, [currentUserId]);

    const filteredConversations = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return conversations;
        return conversations.filter(
            (c) =>
                String(c.contact?.name ?? '')
                    .toLowerCase()
                    .includes(q) ||
                String(c.service ?? '')
                    .toLowerCase()
                    .includes(q) ||
                String(c.lastMessage ?? '')
                    .toLowerCase()
                    .includes(q),
        );
    }, [conversations, searchQuery]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const reloadThread = async (orderId: number) => {
        const res = await axios.get(`/api/provider/messages/${orderId}`, {
            headers: authHeaders,
        });
        const rawMessages =
            res.data?.data?.messages?.data ?? res.data?.data?.messages ?? [];

        setMessages(
            (Array.isArray(rawMessages) ? rawMessages : [])
                .map(normalizeMessage)
                .filter(Boolean) as ThreadMessage[],
        );
        setContact(res.data?.data?.contact ?? null);
        setConversations((cur) =>
            cur.map((c) =>
                c.orderId === orderId ? { ...c, unreadCount: 0 } : c,
            ),
        );
    };

    /* load conversations */
    useEffect(() => {
        const load = async () => {
            setIsLoadingConversations(true);
            setError(null);
            try {
                const res = await axios.get('/api/provider/messages', {
                    headers: authHeaders,
                });
                const items =
                    res.data?.data?.conversations?.data ??
                    res.data?.data?.conversations ??
                    [];
                setConversations(
                    (Array.isArray(items) ? items : []).map((conversation) => ({
                        ...conversation,
                        orderId: Number(conversation.orderId ?? 0),
                        service: String(conversation.service ?? ''),
                        lastMessage:
                            conversation.lastMessage === null ||
                            conversation.lastMessage === undefined
                                ? null
                                : String(conversation.lastMessage),
                        lastMessageAt: conversation.lastMessageAt ?? null,
                        unreadCount: Number(conversation.unreadCount ?? 0),
                    })),
                );
                if (!selectedOrderId && items.length > 0)
                    setSelectedOrderId(items[0].orderId);
            } catch {
                setError('Failed to load conversations.');
            } finally {
                setIsLoadingConversations(false);
            }
        };
        load();
    }, [authHeaders, selectedOrderId]);

    /* load thread */
    useEffect(() => {
        if (!selectedOrderId) {
            setMessages([]);
            setContact(null);
            return;
        }
        const load = async () => {
            setIsLoadingMessages(true);
            setError(null);
            try {
                await reloadThread(selectedOrderId);
            } catch {
                setError('Failed to load messages.');
            } finally {
                setIsLoadingMessages(false);
            }
        };
        load();
    }, [authHeaders, selectedOrderId]);

    useEffect(() => {
        if (!selectedOrderId) {
            return;
        }

        const interval = window.setInterval(() => {
            reloadThread(selectedOrderId).catch(() => undefined);
        }, 3000);

        return () => {
            window.clearInterval(interval);
        };
    }, [selectedOrderId, authHeaders]);

    /* realtime */
    useEffect(() => {
        const echo = (window as Window & { Echo?: any }).Echo;

        if (!echo || !currentUserId) {
            return;
        }

        const channel = echo.private(`chat.${currentUserId}`);

        channel.listen('.message.sent', (event: MessageSentEvent) => {
            if (!event.message) return;
            const msg: ThreadMessage = {
                id: Number(event.message.id ?? Date.now()),
                orderId: Number(event.message.order_id ?? 0),
                senderId: Number(event.message.sender_id ?? 0),
                senderName: event.message.sender?.name ?? null,
                receiverId: Number(event.message.receiver_id ?? currentUserId),
                content: String(event.message.content ?? ''),
                type: (event.message.type as ThreadMessage['type']) ?? 'text',
                fileUrl: event.message.file_url ?? null,
                fileMime: event.message.file_mime ?? null,
                fileSize: event.message.file_size ?? null,
                audioDuration: event.message.audio_duration ?? null,
                isRead: Boolean(event.message.is_read ?? false),
                createdAt: event.message.created_at ?? new Date().toISOString(),
            };
            const currentSelectedOrderId = selectedOrderId;
            setConversations((cur) => {
                if (!cur.find((c) => c.orderId === msg.orderId)) return cur;
                return cur
                    .map((c) =>
                        c.orderId === msg.orderId
                            ? {
                                  ...c,
                                  lastMessage:
                                      msg.content ||
                                      (msg.type === 'image'
                                          ? '📷 Photo'
                                          : '📎 File'),
                                  lastMessageAt: msg.createdAt,
                                  unreadCount:
                                      currentSelectedOrderId === msg.orderId
                                          ? 0
                                          : c.unreadCount + 1,
                              }
                            : c,
                    )
                    .sort(
                        (a, b) =>
                            new Date(b.lastMessageAt ?? 0).getTime() -
                            new Date(a.lastMessageAt ?? 0).getTime(),
                    );
            });
            if (currentSelectedOrderId === msg.orderId)
                setMessages((cur) => [...cur, msg]);
        });

        return () => {
            echo.leave(`chat.${currentUserId}`);
        };
    }, [currentUserId, selectedOrderId]);

    /* file selection */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setFilePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getFileType = (file: File): 'image' | 'audio' | 'file' => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('audio/')) return 'audio';
        return 'file';
    };

    /* send */
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !selectedOrderId ||
            (!newMessage.trim() && !selectedFile) ||
            isSending
        )
            return;
        setIsSending(true);
        try {
            const formData = new FormData();
            if (selectedFile) {
                formData.append('file', selectedFile);
                formData.append('type', getFileType(selectedFile));
            } else {
                formData.append('type', 'text');
            }
            formData.append('content', newMessage.trim());

            const res = await axios.post(
                `/api/provider/messages/${selectedOrderId}`,
                formData,
                {
                    headers: {
                        ...authHeaders,
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            const rawSent =
                res.data?.data?.message?.data ?? res.data?.data?.message;
            const sent = normalizeMessage(rawSent);
            if (!sent) throw new Error('Invalid message response');
            setMessages((cur) => [...cur, sent]);
            setConversations((cur) =>
                cur.map((c) =>
                    c.orderId === selectedOrderId
                        ? {
                              ...c,
                              lastMessage:
                                  sent.content ||
                                  (sent.type === 'image'
                                      ? '📷 Photo'
                                      : '📎 File'),
                              lastMessageAt: sent.createdAt,
                          }
                        : c,
                ),
            );
            setNewMessage('');
            clearFile();
            await reloadThread(selectedOrderId).catch(() => undefined);
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to send message.';
            setError(message);
        } finally {
            setIsSending(false);
        }
    };

    const getDateLabel = (d: string | null) => {
        if (!d) return '';
        const date = new Date(d);
        if (Number.isNaN(date.getTime())) return '';
        const now = new Date();
        if (now.toDateString() === date.toDateString()) return 'Today';
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (yesterday.toDateString() === date.toDateString())
            return 'Yesterday';
        return date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <DashboardLayout title="Worker Messages">
            {/* ── Image Lightbox Modal ── */}
            <AnimatePresence>
                {zoomImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZoomImage(null)}
                        className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                    >
                        <motion.button className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                            <X className="h-6 w-6" />
                        </motion.button>
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            src={zoomImage}
                            alt="Full size"
                            className="max-h-full max-w-full rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <div className="flex h-[calc(100vh-11rem)] min-h-[36rem]">
                    {/* ═══ LEFT SIDEBAR ═══ */}
                    <div className="flex w-[30%] max-w-[360px] min-w-[280px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/50">
                        <div className="space-y-4 border-b border-slate-200 p-6">
                            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                                Messages
                            </h2>
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-full border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-700 shadow-sm transition-all outline-none placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto [scrollbar-color:theme(colors.slate.200)_transparent] [scrollbar-width:thin]">
                            {isLoadingConversations ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                                    <p className="mt-3 text-xs font-medium text-slate-400">
                                        Loading...
                                    </p>
                                </div>
                            ) : filteredConversations.length ? (
                                filteredConversations.map((conv) => {
                                    const active =
                                        selectedOrderId === conv.orderId;
                                    return (
                                        <button
                                            key={conv.orderId}
                                            type="button"
                                            onClick={() =>
                                                setSelectedOrderId(conv.orderId)
                                            }
                                            className={`group flex w-full items-start gap-3.5 border-l-[3px] px-5 py-4 text-left transition-all ${active ? 'border-l-orange-500 bg-white shadow-[inset_0_1px_0_0_rgba(0,0,0,0.03),0_1px_3px_-1px_rgba(0,0,0,0.04)]' : 'border-l-transparent hover:bg-white/70'}`}
                                        >
                                            <CircleAvatar
                                                name={conv.contact.name}
                                                src={conv.contact.avatar}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <h3 className="truncate text-[13px] font-bold text-slate-900">
                                                        {conv.contact.name ??
                                                            'Customer'}
                                                    </h3>
                                                    <span className="shrink-0 text-[10px] font-medium text-slate-400">
                                                        {formatTime(
                                                            conv.lastMessageAt,
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-orange-500 uppercase">
                                                    {conv.service}
                                                </p>
                                                <div className="mt-1.5 flex items-center justify-between gap-2">
                                                    <p className="truncate text-xs text-slate-500">
                                                        {conv.lastMessage ??
                                                            'No messages yet'}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <MessageSquare className="h-10 w-10 text-slate-200" />
                                    <p className="mt-3 text-sm font-medium text-slate-400">
                                        No conversations yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══ RIGHT CHAT AREA ═══ */}
                    <div className="flex min-w-0 flex-1 flex-col bg-slate-50/30">
                        {selectedOrderId && contact ? (
                            <>
                                {/* header */}
                                <div className="sticky top-0 z-20 flex h-[4.5rem] items-center justify-between border-b border-slate-200 bg-white px-6">
                                    <div className="flex min-w-0 items-center gap-3.5">
                                        <CircleAvatar
                                            name={contact.name}
                                            src={contact.avatar}
                                            size="lg"
                                        />
                                        <div className="min-w-0">
                                            <h3 className="truncate text-[15px] font-bold text-slate-900">
                                                {contact.name ?? 'Customer'}
                                            </h3>
                                            <p className="mt-0.5 text-xs font-medium text-slate-500">
                                                {contact.service ??
                                                    'Service chat'}
                                                <span className="ml-2 inline-flex items-center gap-1 text-emerald-600">
                                                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                                    Online
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                        >
                                            <Phone className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                        >
                                            <Video className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* messages */}
                                <div className="flex-1 overflow-y-auto px-6 py-5 [scrollbar-color:theme(colors.slate.200)_transparent] [scrollbar-width:thin]">
                                    {isLoadingMessages ? (
                                        <div className="flex h-full items-center justify-center">
                                            <div className="h-7 w-7 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                                        </div>
                                    ) : messages.length ? (
                                        <AnimatePresence>
                                            {messages.map((msg, idx) => {
                                                const isMine =
                                                    msg.senderId ===
                                                    currentUserId;
                                                const prev =
                                                    idx > 0
                                                        ? messages[idx - 1]
                                                        : null;
                                                const curDate = getDateLabel(
                                                    msg.createdAt,
                                                );
                                                const prevDate = prev
                                                    ? getDateLabel(
                                                          prev.createdAt,
                                                      )
                                                    : '';
                                                const showSep =
                                                    curDate !== prevDate;
                                                return (
                                                    <div key={msg.id}>
                                                        {showSep && curDate && (
                                                            <div className="my-5 flex items-center gap-4">
                                                                <div className="h-px flex-1 bg-slate-200/70" />
                                                                <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                                                                    {curDate}
                                                                </span>
                                                                <div className="h-px flex-1 bg-slate-200/70" />
                                                            </div>
                                                        )}
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                y: 8,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                type: 'spring',
                                                                stiffness: 400,
                                                                damping: 30,
                                                            }}
                                                            className={`mb-3 flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            {!isMine && (
                                                                <div className="mt-auto mr-2 mb-5 shrink-0">
                                                                    <CircleAvatar
                                                                        name={
                                                                            contact.name
                                                                        }
                                                                        src={
                                                                            contact.avatar
                                                                        }
                                                                        size="sm"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div
                                                                className={`flex max-w-[65%] flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                                            >
                                                                <MessageBubble
                                                                    message={
                                                                        msg
                                                                    }
                                                                    isMine={
                                                                        isMine
                                                                    }
                                                                    onImageClick={
                                                                        setZoomImage
                                                                    }
                                                                />
                                                                <div
                                                                    className={`mt-1 flex items-center gap-1 px-0.5 text-[10px] text-slate-400 ${isMine ? 'flex-row-reverse' : ''}`}
                                                                >
                                                                    <span>
                                                                        {formatMsgTime(
                                                                            msg.createdAt,
                                                                        )}
                                                                    </span>
                                                                    {isMine &&
                                                                        msg.isRead && (
                                                                            <CheckCheck className="h-3 w-3 text-orange-400" />
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center text-center">
                                            <Sparkles className="h-10 w-10 text-orange-300" />
                                            <p className="mt-4 text-sm font-semibold text-slate-700">
                                                Start the conversation
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Send your first message to your
                                                customer.
                                            </p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* file preview bar */}
                                {selectedFile && (
                                    <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50 px-6 py-3">
                                        {filePreview ? (
                                            <img
                                                src={filePreview}
                                                alt="Preview"
                                                className="h-14 w-14 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-200">
                                                <Paperclip className="h-5 w-5 text-slate-500" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-700">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {(
                                                    selectedFile.size / 1024
                                                ).toFixed(1)}{' '}
                                                KB
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearFile}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {/* input */}
                                <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
                                    <form
                                        onSubmit={handleSend}
                                        className="flex items-end gap-2"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                        >
                                            <Paperclip className="h-[18px] w-[18px]" />
                                        </button>
                                        <div className="flex min-h-[2.75rem] flex-1 items-end rounded-full border border-slate-200 bg-slate-50 px-4 transition-all focus-within:border-orange-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/15">
                                            <textarea
                                                rows={1}
                                                value={newMessage}
                                                onChange={(e) =>
                                                    setNewMessage(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === 'Enter' &&
                                                        !e.shiftKey
                                                    ) {
                                                        e.preventDefault();
                                                        handleSend(e);
                                                    }
                                                }}
                                                placeholder="Type your message..."
                                                className="max-h-24 min-h-[2.5rem] w-full resize-none border-none bg-transparent py-2 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
                                            />
                                        </div>
                                        <motion.button
                                            type="submit"
                                            disabled={
                                                (!newMessage.trim() &&
                                                    !selectedFile) ||
                                                isSending
                                            }
                                            whileTap={{ scale: 0.9 }}
                                            className={`mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-all disabled:opacity-40 ${newMessage.trim() || selectedFile ? 'bg-orange-500 shadow-md shadow-orange-500/25 hover:bg-orange-600' : 'bg-slate-300'}`}
                                        >
                                            <Send className="h-4 w-4" />
                                        </motion.button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
                                    <MessageSquare className="h-9 w-9 text-orange-400" />
                                </div>
                                <h3 className="mt-5 text-xl font-bold text-slate-900">
                                    Select a conversation
                                </h3>
                                <p className="mt-1.5 max-w-xs text-sm text-slate-500">
                                    Choose an order conversation from the left
                                    to start chatting in realtime.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                >
                    {error}
                </motion.div>
            )}
        </DashboardLayout>
    );
}

/* ═══ Message Bubble ═══ */
function MessageBubble({
    message,
    isMine,
    onImageClick,
}: {
    message: ThreadMessage;
    isMine: boolean;
    onImageClick: (url: string) => void;
}) {
    const baseClass = isMine
        ? 'rounded-br-md bg-orange-500 text-white'
        : 'rounded-bl-md border border-slate-200/80 bg-white text-slate-800 shadow-sm';

    if (message.type === 'image' && message.fileUrl) {
        return (
            <div
                className={`group relative overflow-hidden rounded-2xl ${isMine ? 'rounded-br-md' : 'rounded-bl-md'}`}
            >
                <div
                    onClick={() => onImageClick(message.fileUrl!)}
                    className="relative cursor-zoom-in"
                >
                    <img
                        src={message.fileUrl}
                        alt="Shared image"
                        className="max-h-64 max-w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/10 group-hover:opacity-100">
                        <ZoomIn className="h-8 w-8 text-white drop-shadow-md" />
                    </div>
                </div>
                {message.content && (
                    <div
                        className={`rounded-b-2xl px-4 py-2 text-[13px] leading-relaxed ${isMine ? 'bg-orange-500 text-white' : 'border border-t-0 border-slate-200/80 bg-white text-slate-800'}`}
                    >
                        {message.content}
                    </div>
                )}
            </div>
        );
    }

    if (message.type === 'audio' && message.fileUrl) {
        return (
            <div className={`rounded-2xl ${baseClass} px-4 py-3`}>
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isMine ? 'bg-white/20' : 'bg-slate-100'}`}
                    >
                        <Mic
                            className={`h-4 w-4 ${isMine ? 'text-white' : 'text-slate-500'}`}
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <audio
                            controls
                            src={message.fileUrl}
                            className="h-8 w-full max-w-[200px]"
                        />
                        {message.audioDuration && (
                            <p
                                className={`mt-0.5 text-[10px] ${isMine ? 'text-white/70' : 'text-slate-400'}`}
                            >
                                {message.audioDuration}s
                            </p>
                        )}
                    </div>
                </div>
                {message.content && (
                    <p className="mt-2 text-[13px] leading-relaxed">
                        {message.content}
                    </p>
                )}
            </div>
        );
    }

    if (message.type === 'file' && message.fileUrl) {
        return (
            <div className={`rounded-2xl ${baseClass} px-4 py-3`}>
                <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                >
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isMine ? 'bg-white/20' : 'bg-slate-100'}`}
                    >
                        <Download
                            className={`h-4 w-4 ${isMine ? 'text-white' : 'text-slate-500'}`}
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">
                            Download File
                        </p>
                        {message.fileSize && (
                            <p
                                className={`text-[10px] ${isMine ? 'text-white/70' : 'text-slate-400'}`}
                            >
                                {(message.fileSize / 1024).toFixed(1)} KB
                            </p>
                        )}
                    </div>
                </a>
                {message.content && (
                    <p className="mt-2 text-[13px] leading-relaxed">
                        {message.content}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div
            className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${baseClass}`}
        >
            {message.content}
        </div>
    );
}

/* ═══ Circle Avatar ═══ */
function CircleAvatar({
    name,
    src,
    size = 'md',
}: {
    name: string | null;
    src: string | null;
    size?: 'sm' | 'md' | 'lg';
}) {
    const dims = {
        sm: 'h-8 w-8 text-[10px]',
        md: 'h-10 w-10 text-xs',
        lg: 'h-11 w-11 text-sm',
    }[size];
    const dotSize = { sm: 'h-2 w-2', md: 'h-2.5 w-2.5', lg: 'h-3 w-3' }[size];
    const initials = (name ?? 'U')
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    return (
        <div className="relative shrink-0">
            {src ? (
                <img
                    src={src}
                    alt={name ?? 'User'}
                    className={`${dims} rounded-full object-cover`}
                />
            ) : (
                <div
                    className={`${dims} flex items-center justify-center rounded-full bg-slate-800 font-bold text-white`}
                >
                    {initials || <User className="h-4 w-4" />}
                </div>
            )}
            <span
                className={`absolute right-0 bottom-0 block ${dotSize} rounded-full border-2 border-white bg-emerald-500`}
            />
        </div>
    );
}

/* ═══ Time helpers ═══ */
function formatTime(v: string | null) {
    if (!v) return '';
    const d = new Date(v);
    return Number.isNaN(d.getTime())
        ? ''
        : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatMsgTime(v: string | null) {
    if (!v) return '';
    const d = new Date(v);
    return Number.isNaN(d.getTime())
        ? ''
        : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
