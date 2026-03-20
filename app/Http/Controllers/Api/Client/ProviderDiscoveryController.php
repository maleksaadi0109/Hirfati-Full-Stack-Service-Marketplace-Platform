<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Provider;
use App\Http\Resources\Auth\ProviderResource;

class ProviderDiscoveryController extends Controller
{
    public function index(Request $request)
    {
        // Start building the query with eloquent eager loading
        $query = Provider::query()
            ->with('user')
            ->where('application_status', 'approved');

        // Text Search Filter (q)
        if ($request->filled('q')) {
            $searchTerm = $request->q;
            $query->where(function ($q) use ($searchTerm) {
                // Search in Provider columns
                $q->where('profession', 'like', "%{$searchTerm}%")
                  ->orWhere('skills', 'like', "%{$searchTerm}%")
                  // Search in User columns via relationship
                  ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                      $userQuery->where('name', 'like', "%{$searchTerm}%")
                                ->orWhere('first_name', 'like', "%{$searchTerm}%")
                                ->orWhere('last_name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Category Filter
        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('profession', $request->category);
        }

        // City Filter
        if ($request->filled('city')) {
            $query->whereHas('user', function ($userQuery) use ($request) {
                $userQuery->where('city', $request->city);
            });
        }

        // Min Rate Filter
        if ($request->filled('min_rate')) {
            $query->where('hourly_rate', '>=', $request->min_rate);
        }

        // Max Rate Filter
        if ($request->filled('max_rate')) {
            $query->where('hourly_rate', '<=', $request->max_rate);
        }

        // Verified Only Filter 
        // Note: application_status='approved' typically implies verification, 
        // but if verified_only is specifically requested, we ensure standard criteria are strict.
        if ($request->boolean('verified_only')) {
            $query->whereNotNull('verification_document_path');
        }

        // Sorting
        $sort = $request->input('sort', 'latest');
        if ($sort === 'lowest_rate') {
            $query->orderBy('hourly_rate', 'asc');
        } elseif ($sort === 'highest_rate') {
            $query->orderBy('hourly_rate', 'desc');
        } else {
            // Default to latest
            $query->latest();
        }

        // Paginate results (10 per page)
        $providers = $query->paginate(10);

        return response()->json([
            'providers' => ProviderResource::collection($providers)->response()->getData(true),
        ]);
    }
}
