<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\Admin\PlaceController as AdminPlaceController;
use App\Http\Controllers\Admin\PlaceImageController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;


Route::get('/', function () {
    $places = \App\Models\Place::where('is_available', true)
        ->select(['id', 'title', 'slug', 'short_description as description', 'thumbnail'])
        ->orderBy('created_at', 'desc')
        ->get();

    return Inertia::render('Landing', [
        'canRegister' => Features::enabled(Features::registration()),
        'places' => $places,
    ]);
})->name('home');

// Public places routes
Route::get('/places', [PlaceController::class, 'index'])->name('places.index');
Route::get('/places/{slug}', [PlaceController::class, 'show'])->name('places.show');

// Public API routes for ratings and reviews
Route::prefix('api')->group(function () {
    // Ratings (requires authentication)
    Route::middleware('auth')->group(function () {
        Route::post('/ratings', [RatingController::class, 'store'])->name('ratings.store');
        Route::delete('/places/{place}/rating', [RatingController::class, 'destroy'])->name('ratings.destroy');
    });
    
    // Rating statistics (public)
    Route::get('/places/{place}/ratings', [RatingController::class, 'show'])->name('ratings.show');
    
    // Reviews
    Route::get('/places/{place}/reviews', [ReviewController::class, 'index'])->name('reviews.index');
    
    Route::middleware('auth')->group(function () {
        Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
        Route::put('/reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
        Route::post('/reviews/{review}/vote', [ReviewController::class, 'vote'])->name('reviews.vote');
        
        // Admin only
        Route::middleware('admin')->group(function () {
            Route::post('/reviews/{review}/approve', [ReviewController::class, 'approve'])->name('reviews.approve');
        });
    });
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('dashboard', [AdminReviewController::class, 'dashboard'])
        ->name('dashboard');

    // Admin routes for places management
    Route::prefix('admin')->name('admin.')->group(function () {
        // Test route for admin reviews system
        Route::get('reviews/test', function () {
            return Inertia::render('Admin/Reviews/Test');
        })->name('reviews.test');

        // Reviews management
        Route::resource('reviews', AdminReviewController::class);
        Route::patch('reviews/{review}/approve', [AdminReviewController::class, 'approve'])
            ->name('reviews.approve');
        Route::patch('reviews/{review}/disapprove', [AdminReviewController::class, 'disapprove'])
            ->name('reviews.disapprove');

        // Users management
        Route::resource('users', UserController::class);
        Route::patch('users/{user}/toggle-role', [UserController::class, 'toggleRole'])
            ->name('users.toggle-role');

        // Places management
        Route::resource('places', AdminPlaceController::class);
        Route::patch('places/{place}/toggle-availability', [AdminPlaceController::class, 'toggleAvailability'])
            ->name('places.toggle-availability');

        // Place images management
        Route::prefix('places/{place}')->name('places.')->group(function () {
            Route::resource('images', PlaceImageController::class)->except(['show']);
            Route::patch('images/{image}/toggle-active', [PlaceImageController::class, 'toggleActive'])
                ->name('images.toggle-active');
            Route::patch('images/{image}/set-main', [PlaceImageController::class, 'setAsMain'])
                ->name('images.set-main');
        });
    });
});

// Rutas para la demo de VR y el visor 360
Route::view('/vr-demo', 'vr_demo');
// Usar Inertia para el visor VR para que los enlaces desde Inertia funcionen correctamente
Route::get('/vr', function () {
    return Inertia::render('VR', [
        'image' => request()->query('image'),
    ]);
});

require __DIR__.'/settings.php';
