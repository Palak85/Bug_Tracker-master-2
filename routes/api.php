<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BugController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\MilestoneController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\StatsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Auth routes — rate limited to 10 requests/min per IP to prevent brute-force
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    Route::get('/users', function () {
        return \App\Models\User::where('is_approved', true)->select('id', 'name', 'role')->get();
    });

    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('milestones', MilestoneController::class)->except(['index', 'show']);
    Route::apiResource('bugs', BugController::class);
    Route::apiResource('tasks', \App\Http\Controllers\TaskController::class);
    Route::apiResource('comments', CommentController::class)->only(['index', 'store', 'destroy']);
    Route::get('/activities', ActivityController::class);

    // Notifications
    Route::get('/notifications',             [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count',[NotificationController::class, 'unreadCount']);
    Route::post('/notifications/mark-read',  [NotificationController::class, 'markRead']);
    


    // Admin Routes
    Route::middleware('admin')->group(function () {
        Route::get('/stats', StatsController::class);
        Route::get('/admin/export-bugs', [\App\Http\Controllers\Api\AdminController::class, 'exportBugs']);
        Route::get('/admin/users', [\App\Http\Controllers\Api\AdminController::class, 'index']);
        Route::patch('/admin/users/{user}/approve', [\App\Http\Controllers\Api\AdminController::class, 'approve']);
        Route::delete('/admin/users/{user}', [\App\Http\Controllers\Api\AdminController::class, 'destroy']);
    });
});

