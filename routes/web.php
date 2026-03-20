<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('marketplace/index');
})->name('home');

Route::get('/onboarding', function () {
    return Inertia::render('auth/Onboarding');
})->name('onboarding');


  


Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function (Request $request) {
        return match ($request->user()?->role) {
            'provider' => redirect()->route('worker.dashboard'),
            'admin' => redirect()->route('admin.craftsmen'),
            default => redirect()->route('client.dashboard'),
        };
    })->name('dashboard');

  



   Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/craftsmen', function () {
        return Inertia::render('admin/craftsmen');
    })->name('admin.craftsmen');

    // Second Route
    Route::get('/admin/craftsmen/{provider}', function () {
        return Inertia::render('admin/craftsman-detail');
    })->name('admin.craftsman-detail');

});
     
});

// ─── Web Logout (session-based, no CSRF issues) ─────────────────────
Route::post('/web-logout', function (Request $request) {
    // Delete all Sanctum tokens for this user
    if ($user = $request->user()) {
        $user->tokens()->delete();
    }

    // Destroy the web session
    \Illuminate\Support\Facades\Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/login');
})->middleware('auth')->name('web.logout');

require __DIR__.'/settings.php';
