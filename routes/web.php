<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\Admin\PlaceController as AdminPlaceController;
use App\Http\Controllers\Admin\PlaceImageController;
use App\Http\Controllers\Admin\UserController;


Route::get('/', function () {
    return Inertia::render('Landing', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Public places routes
Route::get('/places', [PlaceController::class, 'index'])->name('places.index');
Route::get('/places/{slug}', [PlaceController::class, 'show'])->name('places.show');

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Admin routes for places management
    Route::prefix('admin')->name('admin.')->group(function () {
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
