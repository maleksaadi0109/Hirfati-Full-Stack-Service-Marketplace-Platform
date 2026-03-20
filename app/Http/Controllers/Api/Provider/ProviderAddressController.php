<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Models\ProviderAddress;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;

class ProviderAddressController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $user = $request->user();
        $provider = $user?->provider;

        if (!$provider) {
            return $this->error('Provider profile not found.', 404);
        }

        $addresses = $provider->addresses()->latest()->get();

        return $this->success('Addresses retrieved successfully.', [
            'addresses' => $addresses,
            'fallback' => [
                'city' => $user->city,
                'latitude' => $user->latitude,
                'longitude' => $user->longitude,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $provider = $user?->provider;

        if (!$provider) {
            return $this->error('Provider profile not found.', 404);
        }

        $validated = $request->validate([
            'label'          => ['nullable', 'string', 'max:255'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city'           => ['nullable', 'string', 'max:100'],
            'latitude'       => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'      => ['nullable', 'numeric', 'between:-180,180'],
            'notes'          => ['nullable', 'string'],
            'is_default'     => ['boolean'],
        ]);

        $isDefault = $validated['is_default'] ?? false;

        // If this is the first address, make it default automatically
        if ($provider->addresses()->count() === 0) {
            $isDefault = true;
        }

        // If marking as default, unset others
        if ($isDefault) {
            $provider->addresses()->update(['is_default' => false]);
        }

        $address = $provider->addresses()->create(array_merge($validated, ['is_default' => $isDefault]));

        return $this->success('Address added successfully.', ['address' => $address], 201);
    }

    public function show(Request $request, ProviderAddress $address)
    {
        $provider = $request->user()->provider;

        if (!$provider || $address->provider_id !== $provider->id) {
            return $this->error('Address not found.', 404);
        }

        return $this->success('Address retrieved successfully.', ['address' => $address]);
    }

    public function update(Request $request, ProviderAddress $address)
    {
        $provider = $request->user()->provider;

        if (!$provider || $address->provider_id !== $provider->id) {
            return $this->error('Address not found.', 404);
        }

        $validated = $request->validate([
            'label'          => ['nullable', 'string', 'max:255'],
            'address_line_1' => ['sometimes', 'required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city'           => ['nullable', 'string', 'max:100'],
            'latitude'       => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'      => ['nullable', 'numeric', 'between:-180,180'],
            'notes'          => ['nullable', 'string'],
            'is_default'     => ['boolean'],
        ]);

        $isDefault = $validated['is_default'] ?? $address->is_default;

        if ($isDefault && !$address->is_default) {
            $provider->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        } elseif (!$isDefault && $address->is_default) {
            // Can't unset the only default if it's the last one, optionally handle here
            // Currently letting them unset it.
        }

        $address->update(array_merge($validated, ['is_default' => $isDefault]));

        return $this->success('Address updated successfully.', ['address' => $address]);
    }

    public function destroy(Request $request, ProviderAddress $address)
    {
        $provider = $request->user()->provider;

        if (!$provider || $address->provider_id !== $provider->id) {
            return $this->error('Address not found.', 404);
        }

        $address->delete();

        // If a default was deleted, assign randomly another as default
        if ($address->is_default) {
            /** @var \App\Models\ProviderAddress|null $nextAddress */
            $nextAddress = $provider->addresses()->first();
            if ($nextAddress) {
                $nextAddress->update(['is_default' => true]);
            }
        }

        return $this->success('Address deleted successfully.');
    }

    public function setDefault(Request $request, ProviderAddress $address)
    {
        $provider = $request->user()->provider;

        if (!$provider || $address->provider_id !== $provider->id) {
            return $this->error('Address not found.', 404);
        }

        $provider->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return $this->success('Default address updated successfully.');
    }
}
