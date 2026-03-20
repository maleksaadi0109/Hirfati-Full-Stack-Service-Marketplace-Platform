<?php

namespace App\Http\Controllers\Api\Messages;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Messages\SendMessageRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\CustomerOrder;
use App\Models\Message;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $user = $request->user();
        $ordersQuery = match ($user?->role) {
            'customer' => CustomerOrder::query()->where('customer_id', $user?->customer?->id),
            'provider' => CustomerOrder::query()->where('provider_id', $user?->provider?->id),
            default => null,
        };

        if (!$ordersQuery) {
            return $this->error('Messaging profile not found.', 404);
        }

        $orders = $ordersQuery
            ->with(['provider.user', 'messages' => function ($query) {
                $query->latest();
            }, 'customer.user'])
            ->latest()
            ->get()
            ->filter(function (CustomerOrder $order) use ($user) {
                return $this->resolveContactUser($user->id, $order) !== null;
            })
            ->map(function (CustomerOrder $order) use ($user) {
                $order->setAttribute('other_user', $this->resolveContactUser($user->id, $order));
                $order->setAttribute('last_message', $order->messages->first());
                $order->setAttribute(
                    'unread_count',
                    $order->messages
                        ->where('receiver_id', $user->id)
                        ->where('is_read', false)
                        ->count()
                );

                return $order;
            })
            ->values();

        return $this->ok('Conversations retrieved successfully.', [
            'conversations' => ConversationResource::collection($orders),
        ]);
    }

    public function initializeConversation(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'provider_id' => 'required|exists:providers,id',
        ]);

        $customerId = $user->customer?->id;
        if (!$customerId) {
            return $this->error('Only customers can initialize conversations.', 403);
        }

        // Check if there is already an order/conversation
        $existingOrder = CustomerOrder::where('customer_id', $customerId)
            ->where('provider_id', $request->provider_id)
            ->latest()
            ->first();

        if ($existingOrder) {
            return $this->ok('Conversation found', ['order_id' => $existingOrder->id]);
        }

        // Get Provider
        $provider = \App\Models\Provider::find($request->provider_id);

        // Create an inquiry order
        $order = CustomerOrder::create([
            'customer_id' => $customerId,
            'provider_id' => $request->provider_id,
            'service_name' => $provider->profession ?? 'General Inquiry',
            'scheduled_at' => now()->addDays(1),
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal' => 0,
            'fees' => 0,
            'total' => 0,
        ]);

        return $this->ok('Conversation created', ['order_id' => $order->id]);
    }

    public function fetchMessages(Request $request, CustomerOrder $order)
    {
        $user = $request->user();

        if (!$this->canAccessOrderMessages($user->id, $order)) {
            return $this->error('You are not allowed to view these messages.', 403);
        }

        $messages = $order->messages()
            ->with(['sender', 'receiver'])
            ->orderBy('created_at')
            ->get();

        $order->messages()
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $contactUser = $this->resolveContactUser($user->id, $order);

        return $this->ok('Messages retrieved successfully.', [
            'messages' => MessageResource::collection($messages),
            'contact' => [
                'id' => $contactUser?->id,
                'name' => $contactUser?->name,
                'avatar' => $this->resolveAvatarUrl($contactUser?->picture),
                'service' => $order->service_name,
            ],
        ]);
    }

    public function store(SendMessageRequest $request, CustomerOrder $order)
    {
        $user = $request->user();
        $validated = $request->validated();

        if (!$this->canAccessOrderMessages($user->id, $order)) {
            return $this->error('You are not allowed to send messages for this order.', 403);
        }

        $receiverId = $this->resolveContactUser($user->id, $order)?->id;

        if (!$receiverId) {
            return $this->error('Receiver not found for this order.', 404);
        }
        $filePath = null;
        $fileMime = null;
        $fileSize = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileMime = $file->getClientMimeType();
            $fileSize = $file->getSize();
            $filePath = $file->store('chat_media', 'public');
        }

        $message = Message::create([
            'order_id'       => $order->id,
            'sender_id'      => $user->id,
            'receiver_id'    => $receiverId,
            'content'        => $validated['content'] ?? '',
            'type'           => $request->hasFile('file') ? ($validated['type'] ?? 'file') : 'text',
            'file_path'      => $filePath,
            'file_mime'      => $fileMime,
            'file_size'      => $fileSize,
            'audio_duration' => $validated['audio_duration'] ?? null,
            'is_read'        => false,
        ]);

        $message->load(['sender', 'receiver']);

        broadcast(new MessageSent($message))->toOthers();

        return $this->success('Message sent successfully.', [
            'message' => new MessageResource($message),
        ], 201);
    }

    private function canAccessOrderMessages(int $userId, CustomerOrder $order): bool
    {
        return (int) $order->customer?->user_id === $userId
            || (int) $order->provider?->user_id === $userId;
    }

    private function resolveContactUser(int $userId, CustomerOrder $order)
    {
        if ((int) $order->customer?->user_id === $userId) {
            return $order->provider?->user;
        }

        if ((int) $order->provider?->user_id === $userId) {
            return $order->customer?->user;
        }

        return null;
    }

    private function resolveAvatarUrl(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, '/storage/')) {
            return $value;
        }

        return asset('storage/'.$value);
    }
}
