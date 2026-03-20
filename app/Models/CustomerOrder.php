<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'provider_id',
        'address_id',
        'service_name',
        'scheduled_at',
        'notes',
        'status',
        'payment_status',
        'subtotal',
        'fees',
        'total',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'fees' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(CustomerAddress::class, 'address_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'order_id');
    }
}
