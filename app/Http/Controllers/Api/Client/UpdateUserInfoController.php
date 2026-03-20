<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;
use App\Http\Requests\Client\UpdateClientInfoRequest;

class UpdateUserInfoController extends Controller
{
    use ApiResponses;
    public function update(UpdateClientInfoRequest $request) {
        $user = $request->user();

        $validated = $request->validated();

        if ($request->hasFile('picture')) {
            if ($user->picture && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->picture)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->picture);
            }

            $validated['picture'] = $request->file('picture')
                ->storeAs('profile_pictures', \Illuminate\Support\Str::uuid()->toString() . '.' . $request->file('picture')->extension(), 'public');
        }
        
        if (!empty($validated)) {
            $user->update($validated);
        }

        $data = $user->toArray();
        $data['picture_url'] = $user->picture ? asset('storage/'.$user->picture) : null;

        return $this->ok('Profile updated successfully.', $data);
    }
}
