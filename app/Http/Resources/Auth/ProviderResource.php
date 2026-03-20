<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProviderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'providerId' => $this->id,
            'id' => $this->user?->id,
            'firstName' => $this->user?->first_name,
            'lastName' => $this->user?->last_name,
            'email' => $this->user?->email,
            'phoneNumber' => $this->user?->phone_number,
            'role' => $this->user?->role,
            'city' => $this->user?->city,
            'latitude' => $this->user?->latitude,
            'longitude' => $this->user?->longitude,
            'picture' => $this->user?->picture ? \Illuminate\Support\Facades\Storage::disk('public')->url($this->user->picture) : null,
            'birthday' => $this->user?->birthday ? \Carbon\Carbon::parse($this->user->birthday)->format('Y-m-d') : null,
            'profession' => $this->profession,
            'yearsOfExperience' => $this->years_of_experience,
            'verificationDocumentPath' => $this->verification_document_path,
            'applicationStatus' => $this->application_status,
            'bio' => $this->bio,
            'hourlyRate' => $this->hourly_rate,
            'isAvailable' => $this->is_available,
            'skills'=>$this->skills,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'firstName' => $this->user->first_name,
                    'lastName' => $this->user->last_name,
                    'email' => $this->user->email,
                    'phoneNumber' => $this->user->phone_number,
                    'role' => $this->user->role,
                ];
            }),
        ];
    }
}
