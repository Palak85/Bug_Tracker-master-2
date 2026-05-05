<?php

namespace App\Providers;

use App\Models\Bug;
use App\Models\Task;
use App\Observers\BugObserver;
use App\Observers\TaskObserver;
use Illuminate\Auth\Notifications\ResetPassword;
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
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });

        Bug::observe(BugObserver::class);
        Task::observe(TaskObserver::class);
    }
}
