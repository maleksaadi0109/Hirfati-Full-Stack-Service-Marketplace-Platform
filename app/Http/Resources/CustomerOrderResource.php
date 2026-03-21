<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerOrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $statusProgress = [
            'pending' => 20,
            'confirmed' => 45,
            'in_progress' => 75,
            'completed' => 100,
            'cancelled' => 0,
        ];

        $location = trim(implode(', ', array_filter([
            $this->address ? $this->address->address_line_1 : null,
            $this->address ? $this->address->city : null,
        ])));

        return [
            'id' => $this->id,
            'service' => $this->service_name,
            'proName' => $this->provider?->user?->name ?? 'Professional',
            'proRating' => 5.0,
            'date' => $this->scheduled_at->format('Y-m-d'),
            'time' => $this->scheduled_at->format('h:i A'),
            'location' => $location !== '' ? $location : 'No address set',
            'status' => $this->status,
            'subtotal' => (float) $this->subtotal,
            'fees' => (float) $this->fees,
            'total' => (float) $this->total,
            'payment' => ucfirst($this->payment_status),
            'progress' => $statusProgress[$this->status] ?? 0,
            'proPicture' => $this->provider?->user?->picture 
                ? \Illuminate\Support\Facades\Storage::disk('public')->url($this->provider->user->picture) 
                : null,
            'customerPicture' => $this->customer?->user?->picture 
                ? \Illuminate\Support\Facades\Storage::disk('public')->url($this->customer->user->picture) 
                : null,
            'createdAt' => $this->created_at->toISOString(),
        ];
    }
}
