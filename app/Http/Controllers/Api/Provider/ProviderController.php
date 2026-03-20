<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Provider\ProviderRequest;
use App\Models\Provider;
class ProviderController extends Controller
{
    public function store(ProviderRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        if (array_key_exists('first_name', $validated)) {
            $user->first_name = $validated['first_name'];
        }

        if (array_key_exists('last_name', $validated)) {
            $user->last_name = $validated['last_name'];
        }

        if (array_key_exists('phone_number', $validated)) {
            $user->phone_number = $validated['phone_number'];
        }

        if (array_key_exists('city', $validated)) {
            $user->city = $validated['city'];
        }

        $fullName = trim(($user->first_name ?? '').' '.($user->last_name ?? ''));
        if ($fullName !== '') {
            $user->name = $fullName;
        }

        // Handle profile picture upload
        if ($request->hasFile('picture')) {
            if ($user->picture && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->picture)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->picture);
            }

            $user->picture = $request->file('picture')
                ->storeAs('profile_pictures', \Illuminate\Support\Str::uuid()->toString() . '.' . $request->file('picture')->extension(), 'public');
        }

        // Update User birthday
        if (isset($validated['birthday'])) {
            $user->birthday = $validated['birthday'];
        }

        if ($user->isDirty()) {
            $user->save();
        }

        // Remove User-specific fields before updating Provider
        $providerData = collect($validated)
            ->except(['first_name', 'last_name', 'phone_number', 'city', 'birthday', 'picture'])
            ->toArray();

        // Update the provider profile for the authenticated user
        $provider = $user->provider()->updateOrCreate(
            ['user_id' => $user->id],
            array_filter($providerData, fn($value) => !is_null($value))
        );

        return response()->json([
            'message' => 'Provider profile updated successfully',
            'provider' => $provider,
            'user' => $user->only(['id', 'name', 'first_name', 'last_name', 'phone_number', 'city', 'picture', 'birthday']),
        ]);
    }
    public function showCustomerProfile(string $provider)
    {
        $providerModel = Provider::with(['user'])->findOrFail($provider);
        return response()->json([
            'provider' => $providerModel
        ]);
    }
}
