<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provider extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'profession',
        'years_of_experience',
        'verification_document_path',
        'application_status',
        'bio',
        'hourly_rate',
        'is_available',
        'skills',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'hourly_rate' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function portfolios()
    {
        return $this->hasMany(Portfolio::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(CustomerOrder::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(ProviderAddress::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(ProviderPost::class);
    }
}
