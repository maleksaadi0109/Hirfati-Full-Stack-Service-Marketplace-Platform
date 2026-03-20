<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Schema;

class Message extends Model
{
    protected $fillable = [
        'order_id',
        'sender_id',
        'receiver_id',
        'content',
        'message_text',
        'type',
        'file_path',
        'file_mime',
        'file_size',
        'audio_duration',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];
    protected $appends = ['file_url'];

    public function getFileUrlAttribute()
    {
    return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }

    protected static function booted(): void
    {
        static::saving(function (Message $message) {
            if (Schema::hasColumn('messages', 'message_text') && empty($message->message_text)) {
                $message->message_text = $message->content;
            }

            if (Schema::hasColumn('messages', 'content') && empty($message->content)) {
                $message->content = $message->message_text;
            }
        });
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(CustomerOrder::class, 'order_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
