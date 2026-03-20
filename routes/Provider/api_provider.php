<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Provider\ResubmitApplicationController;
use App\Http\Controllers\Api\Provider\ProviderController;
use App\Http\Controllers\Api\Provider\ProviderPostController;

/*
|--------------------------------------------------------------------------
| Provider API Routes
|--------------------------------------------------------------------------
|
| POST /provider/resubmit          → Resubmit rejected application
|
*/

Route::middleware(['auth:sanctum', 'rejected_provider'])->prefix('provider')->group(function () {
    Route::post('/resubmit', ResubmitApplicationController::class)->name('provider.resubmit');
});

Route::middleware(['auth:sanctum', 'role:provider'])->prefix('provider')->group(function () {
    Route::get('/messages', [\App\Http\Controllers\Api\Messages\MessageController::class, 'index']);
    Route::get('/messages/{order}', [\App\Http\Controllers\Api\Messages\MessageController::class, 'fetchMessages']);
    Route::post('/messages/{order}', [\App\Http\Controllers\Api\Messages\MessageController::class, 'store']);
    
    // Profile Update
    Route::post('/profile', [ProviderController::class, 'store'])->name('provider.profile.update');

    // Provider Posts
    Route::get('/posts', [ProviderPostController::class, 'index']);
    Route::post('/posts', [ProviderPostController::class, 'store']);
    Route::put('/posts/{post}', [ProviderPostController::class, 'update']);
    Route::delete('/posts/{post}', [ProviderPostController::class, 'destroy']);

    // Addresses
    Route::apiResource('/addresses', \App\Http\Controllers\Api\Provider\ProviderAddressController::class);
    Route::put('/addresses/{address}/default', [\App\Http\Controllers\Api\Provider\ProviderAddressController::class, 'setDefault']);
});