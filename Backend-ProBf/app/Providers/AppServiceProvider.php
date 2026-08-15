<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($user, string $token) {
            $frontendUrl = rtrim(config('app.frontend_url'), '/');

            return "{$frontendUrl}/reinitialiser-mot-de-passe?token={$token}&email={$user->getEmailForPasswordReset()}";
        });

        VerifyEmail::createUrlUsing(function ($user) {
            return URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                ['id' => $user->getKey(), 'hash' => sha1($user->getEmailForVerification())]
            );
        });

        RateLimiter::for('message-send', function ($request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });

        // Un code TOTP n'a que 10^6 combinaisons possibles : limiteur serré
        // pour rendre le brute-force impraticable dans la fenêtre de 30s.
        RateLimiter::for('2fa-challenge', fn ($request) => Limit::perMinute(5)->by($request->ip()));
    }
}
