<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        then: function () {
            \Illuminate\Support\Facades\Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/Auth/api_auth.php'));

            \Illuminate\Support\Facades\Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/Admin/api_admin.php'));

            \Illuminate\Support\Facades\Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/Provider/api_provider.php'));
             \Illuminate\Support\Facades\Route::middleware('web')
             ->group(base_path('routes/Customer/Customer_web.php'));

             \Illuminate\Support\Facades\Route::middleware('web')
                ->group(base_path('routes/Provider/provider_web.php'));

             \Illuminate\Support\Facades\Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/Customer/api_customer.php'));

        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->statefulApi();

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class, 
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'rejected_provider'=> \App\Http\Middleware\Provider\EnsureProviderRejected::class,
            'pending_provider'=> \App\Http\Middleware\Provider\EnsureProviderPending::class,
            'status'=>\App\Http\Middleware\Provider\CheckProviderStatus::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $exceptpion, $request) {
            // Handle error responses with Inertia error page for non-JSON requests
            if (! $request->expectsJson() && in_array($response->getStatusCode(), [500, 503, 404, 403, 401, 419, 422, 429])) {
                return Inertia::render('Error', ['status' => $response->getStatusCode()])
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
            }

            return $response;
        });
    })->create();
