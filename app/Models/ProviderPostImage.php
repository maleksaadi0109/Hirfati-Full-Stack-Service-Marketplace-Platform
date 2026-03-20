<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProviderPostImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_post_id',
        'image_path',
        'sort_order',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(ProviderPost::class, 'provider_post_id');
    }
}
