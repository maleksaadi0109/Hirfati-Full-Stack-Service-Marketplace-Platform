<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $otherUser = $this->getAttribute('other_user');
        $lastMessage = $this->getAttribute('last_message');
        $unreadCount = (int) ($this->getAttribute('unread_count') ?? 0);

        return [
            'orderId' => $this->id,
            'service' => $this->service_name,
            'contact' => [
                'id' => $otherUser?->id,
                'name' => $otherUser?->name,
                'avatar' => $this->resolveAvatarUrl($otherUser?->picture),
            ],
            'lastMessage' => $lastMessage?->content,
            'lastMessageAt' => $lastMessage?->created_at?->toISOString(),
            'unreadCount' => $unreadCount,
        ];
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
