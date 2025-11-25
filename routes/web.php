<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;


Route::get('/', function () {
    return Inertia::render('Landing', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Dynamic place detail route for /places/{slug}
Route::get('/places/{slug}', function ($slug) {
    return Inertia::render('places/[slug]', [
        'slug' => $slug,
    ]);
})->name('places.show');

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
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
