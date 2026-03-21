<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Provider Web Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::middleware(['auth','status'])->group(function () {
    
    // Worker Dashboard
    Route::get('/worker/dashboard', function () {
        return Inertia::render('worker/Dashboard');
    })->name('worker.dashboard');

    // Worker Messages
    Route::get('/worker/messages', function () {
        return Inertia::render('worker/Messages');
    })->name('worker.messages');

    // Complete Profile
    Route::get('/worker/complete-profile', function () {
        return Inertia::render('worker/CompleteProfile');
    })->name('worker.complete-profile');

    // Profile Management
    Route::get('/worker/profile', function () {
        return Inertia::render('worker/Profile');
    })->name('worker.profile');

    // Addresses
    Route::get('/worker/addresses/create', function () {
        return Inertia::render('worker/AddressCreate');
    })->name('worker.addresses.create');

    Route::get('/worker/addresses/{address}/edit', function (string $address) {
        return Inertia::render('worker/AddressEdit', [
            'addressId' => $address,
        ]);
    })->name('worker.addresses.edit');

    // Worker Posts
    Route::get('/worker/posts', function () {
        return Inertia::render('worker/MyPosts');
    })->name('worker.posts');

    // Worker Schedule
    Route::get('/worker/schedule', function () {
        return Inertia::render('worker/Schedule');
    })->name('worker.schedule');

    Route::get('/worker/job-requests', function () {
        return Inertia::render('worker/JobRequests');
    })->name('worker.job-requests');

});

// Pending Approval (Guest accessible to allow redirect after registration)
Route::get('/pending-approval', function () {
    return Inertia::render('auth/pending-approval');
})->name('pending-approval');

// Rejected Approval (Guest accessible)
Route::get('/rejected-approval', function () {
    return Inertia::render('auth/rejected-approval');
})->name('rejected-approval');
