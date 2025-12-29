<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Api\V1\Admin\OrderManagementController;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Controllers\ServiceController;



Route::prefix('v1')->group(function () {
   // --- Public Routes (متاح للكل من غير تسجيل دخول) ---
   // Public
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);

    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    Route::middleware('auth:sanctum')->group(function () {
        
        // --- Admin Routes (للأدمن فقط) ---
        // Admin Only (حماية مزدوجة: تسجيل دخول + رول أدمن)
    Route::middleware(['auth:sanctum', EnsureUserHasRole::class . ':admin'])->group(function () {
        Route::apiResource('services', ServiceController::class)->except(['index', 'show']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Customer
        Route::middleware(EnsureUserHasRole::class.':customer')->group(function () {
            Route::post('/orders', [CustomerOrderController::class, 'store']);
            Route::get('/orders/my', [CustomerOrderController::class, 'index']);
        });

        // Admin
        Route::middleware(EnsureUserHasRole::class.':admin')->prefix('admin')->group(function () {
            Route::get('/orders', [OrderManagementController::class, 'index']);
            Route::patch('/orders/{id}/status', [OrderManagementController::class, 'updateStatus']);
        });

        Route::middleware('auth:sanctum')->group(function () {
        
        // ✅ ضيف الراوت ده هنا (متاح لأي حد مسجل دخول)
        Route::get('/orders', [CustomerOrderController::class, 'index']);

    });
    });
});
});