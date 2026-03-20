<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orderId' => $this->order_id,
            'senderId' => $this->sender_id,
            'senderName' => $this->sender?->name,
            'receiverId' => $this->receiver_id,
            'content' => $this->content,
            'type' => $this->type ?? 'text',
            'fileUrl' => $this->file_path ? asset('storage/' . $this->file_path) : null,
            'fileMime' => $this->file_mime,
            'fileSize' => $this->file_size,
            'audioDuration' => $this->audio_duration,
            'isRead' => (bool) $this->is_read,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
