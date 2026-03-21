<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\Auth\EmailVerificationController;

Route::middleware('auth:sanctum','role:customer')->group(function () {
    Route::put('/client/profile/update', [\App\Http\Controllers\Api\Client\UpdateUserInfoController::class, 'update'])->middleware('throttle:client-profile-update');
    Route::get('/client/addresses', [\App\Http\Controllers\Api\Client\CustomerAddressController::class, 'index']);
    Route::post('/client/addresses', [\App\Http\Controllers\Api\Client\CustomerAddressController::class, 'store']);
    Route::get('/client/addresses/{address}', [\App\Http\Controllers\Api\Client\CustomerAddressController::class, 'show']);
    Route::put('/client/addresses/{address}', [\App\Http\Controllers\Api\Client\CustomerAddressController::class, 'update']);
    Route::delete('/client/addresses/{address}', [\App\Http\Controllers\Api\Client\CustomerAddressController::class, 'destroy']);
    Route::put('/client/addresses/{address}/default', [\App\Http\Controllers\Api\Client\CustomerAddressController::class, 'setDefault']);

    // Order Routes
    Route::get('/client/orders', [\App\Http\Controllers\Api\Client\OrderController::class, 'index']);
    Route::post('/client/orders', [\App\Http\Controllers\Api\Client\ServiceOrderController::class, 'store']);
    Route::get('/client/orders/{order}', [\App\Http\Controllers\Api\Client\OrderController::class, 'show']);
    Route::patch('/client/orders/{order}/cancel', [\App\Http\Controllers\Api\Client\OrderController::class, 'cancel']);

    // Message Routes
    Route::post('/client/messages/initialize', [\App\Http\Controllers\Api\Messages\MessageController::class, 'initializeConversation']);
    Route::get('/client/messages', [\App\Http\Controllers\Api\Messages\MessageController::class, 'index']);
    Route::get('/client/messages/{order}', [\App\Http\Controllers\Api\Messages\MessageController::class, 'fetchMessages']);
    Route::post('/client/messages/{order}', [\App\Http\Controllers\Api\Messages\MessageController::class, 'store']);

    // Find Pros Discovery
    Route::get('/client/providers', [\App\Http\Controllers\Api\Client\ProviderDiscoveryController::class, 'index']);

    // Provider Posts for Customers
    Route::get('/client/posts', [\App\Http\Controllers\Api\Provider\ProviderPostController::class, 'customerAllPosts']);
    Route::get('/client/providers/{provider}/posts', [\App\Http\Controllers\Api\Provider\ProviderPostController::class, 'customerProviderPosts']);
    Route::get('/client/providers/{provider}', [\App\Http\Controllers\Api\Provider\ProviderController::class, 'showCustomerProfile']);
    Route::get('/client/dashboard-summary', [\App\Http\Controllers\Api\Client\DashboardSummaryController::class, '__invoke']);
});
