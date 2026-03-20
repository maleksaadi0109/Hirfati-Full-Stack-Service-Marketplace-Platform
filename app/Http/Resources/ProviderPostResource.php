<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProviderPostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $resolveStorageUrl = function (?string $path): ?string {
            if (!$path) {
                return null;
            }

            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '/storage/')) {
                return $path;
            }

            return asset('storage/'.$path);
        };

        $images = $this->images->map(function ($image) {
            $path = $image->image_path;

            if (!$path) {
                return null;
            }

            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '/storage/')) {
                $url = $path;
            } else {
                $url = asset('storage/'.$path);
            }

            return [
                'id' => $image->id,
                'image_path' => $path,
                'image_url' => $url,
                'sort_order' => $image->sort_order,
            ];
        })->filter()->values();

        $providerUser = $this->provider?->user;
        $providerPicture = $providerUser?->picture;

        return [
            'id' => $this->id,
            'provider_id' => $this->provider_id,
            'provider_name' => $this->provider?->user?->name,
            'provider_picture' => $this->provider?->user?->picture,
            'provider_picture_url' => $resolveStorageUrl($providerPicture),
            'provider' => $this->provider ? [
                'id' => $this->provider->id,
                'category' => $this->provider->profession,
                'user' => $providerUser ? [
                    'id' => $providerUser->id,
                    'name' => $providerUser->name,
                    'first_name' => $providerUser->first_name,
                    'last_name' => $providerUser->last_name,
                    'city' => $providerUser->city,
                    'picture' => $providerPicture,
                    'picture_url' => $resolveStorageUrl($providerPicture),
                ] : null,
            ] : null,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'images' => $images,
            'is_published' => $this->is_published,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
        ];
    }
}
