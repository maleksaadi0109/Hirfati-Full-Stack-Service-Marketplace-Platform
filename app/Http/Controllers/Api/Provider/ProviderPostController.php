<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\StoreProviderPostRequest;
use App\Http\Resources\ProviderPostResource;
use App\Models\Provider;
use App\Models\ProviderPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Policies\ProviderPostPolicy;

class ProviderPostController extends Controller
{
    public function store(StoreProviderPostRequest $request)
    {
         $this->authorize("create",ProviderPost::class);
        $data = $request->validated();
        $provider = $request->user()->provider;

        $post = DB::transaction(function () use ($request, $data, $provider) {
            $post = ProviderPost::create([
                'provider_id' => $provider->id,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'category' => $data['category'] ?? null,
                'is_published' => true,
            ]);

            foreach ($request->file('images', []) as $index => $image) {
                $path = $image->store('provider_posts', 'public');

                $post->images()->create([
                    'image_path' => $path,
                    'sort_order' => $index,
                ]);
            }

            return $post->load('images');
        });

        return response()->json([
            'message' => 'Post created successfully',
            'post' => new ProviderPostResource($post),
        ], 201);
    }
    public function update(Request $request, string $id)
    {
         $this->authorize("update",ProviderPost::class);
        $provider = $request->user()->provider;
        $post = ProviderPost::where('id', $id)->where('provider_id', $provider->id)->firstOrFail();

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
        ]);

        $post->update($data);

        // If new images are uploaded, delete old ones and store new.
        if ($request->hasFile('images')) {
            foreach ($post->images as $image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($image->image_path);
                $image->delete();
            }

            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('provider_posts', 'public');
                $post->images()->create([
                    'image_path' => $path,
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json([
            'message' => 'Post updated successfully',
            'post' => new ProviderPostResource($post->load('images')),
        ]);
    }

    public function destroy(Request $request, string $id)
    {
         $this->authorize("delete",ProviderPost::class);
        $provider = $request->user()->provider;
        $post = ProviderPost::where('id', $id)->where('provider_id', $provider->id)->firstOrFail();

        foreach ($post->images as $image) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        $post->delete();

        return response()->json([
            'message' => 'Post deleted successfully',
        ]);
    }

    public function index(Request $request)
    {
        $this->authorize("viewAny",ProviderPost::class);
        $provider = $request->user()?->provider;

        if (!$provider) {
            return response()->json([
                'message' => 'Provider profile not found.',
            ], 404);
        }

        $providerPosts = ProviderPost::query()
            ->where('provider_id', $provider->id)
            ->with([
                'provider.user',
                'images' => function ($query) {
                    $query->orderBy('sort_order');
                },
            ])
            ->latest()
            ->get();

        return response()->json([
            'providerPosts' => ProviderPostResource::collection($providerPosts),
        ]);
    }

    public function customerProviderPosts(string $provider)
    {
        $providerModel = Provider::findOrFail($provider);

        $providerPosts = ProviderPost::query()
            ->where('provider_id', $providerModel->id)
            ->where('is_published', true)
            ->with([
                'provider.user',
                'images' => function ($query) {
                    $query->orderBy('sort_order');
                },
            ])
            ->latest()
            ->get();

        return response()->json([
            'providerPosts' => ProviderPostResource::collection($providerPosts),
        ]);
    }

    public function customerAllPosts(Request $request)
    {
        
        $query = ProviderPost::query()
            ->where('is_published', true)
            ->with([
                'provider.user',
                'images' => function ($q) {
                    $q->orderBy('sort_order');
                },
            ]);
     
        if ($request->filled('q')) {
            $searchTerm = $request->q;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('category', 'like', "%{$searchTerm}%")
                  ->orWhereHas('provider.user', function ($q2) use ($searchTerm) {
                      $q2->where('name', 'like', "%{$searchTerm}%")
                         ->orWhere('first_name', 'like', "%{$searchTerm}%")
                         ->orWhere('last_name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        $providerPosts = $query->latest()->paginate(12);

        return response()->json([
            'providerPosts' => ProviderPostResource::collection($providerPosts),
        ]);
    }
}
