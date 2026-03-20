<?php

namespace App\Policies;

use App\Models\ProviderPost;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProviderPostPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
       return $user->provider !== null;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ProviderPost $providerPost): bool
    {
        return $user->provider?->id === $providerPost->provider_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->provider !=null;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ProviderPost $providerPost): bool
    {
        return $user->provider?->id === $providerPost->provider_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ProviderPost $providerPost): bool
    {
        return $user->provider?->id === $providerPost->provider_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ProviderPost $providerPost): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ProviderPost $providerPost): bool
    {
        return false;
    }
}
