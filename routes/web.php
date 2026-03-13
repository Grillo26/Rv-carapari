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
use App\Http\Controllers\Api\ReviewVoteController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\HotspotController;
use App\Http\Controllers\Admin\Asset3dController;


Route::get('/', function () {
    $places = \App\Models\Place::where('is_available', true)
        ->select(['id', 'title', 'slug', 'short_description as description', 'thumbnail'])
        ->with(['ratings', 'approvedReviews'])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($place) {
            $place->average_rating = $place->average_rating;
            $place->total_ratings = $place->total_ratings;
            $place->total_reviews = $place->total_reviews;
            return $place;
        });

    return Inertia::render('Landing', [
        'canRegister' => Features::enabled(Features::registration()),
        'places' => $places,
    ]);
})->name('home');

// Servir archivos 3D (GLB models)
Route::get('/images/3d/{filename}', function ($filename) {
    $path = public_path("images/3d/{$filename}");
    
    // Validar que el archivo existe y es un .glb
    if (!file_exists($path) || !str_ends_with($filename, '.glb')) {
        abort(404);
    }
    
    return response()
        ->file($path)
        ->header('Content-Type', 'model/gltf-binary')
        ->header('Content-Disposition', 'inline; filename="' . $filename . '"')
        ->header('Cache-Control', 'public, max-age=3600');
})->name('models.3d');

// Página de visualización de modelo 3D
Route::get('/model-3d/{id}', function ($id) {
    $model = \App\Models\Asset3d::findOrFail($id);
    $allAssets = \App\Models\Asset3d::active()->ordered()->get();
    $modelExists = \Illuminate\Support\Facades\Storage::disk('public')->exists($model->model_path);

    return Inertia::render('Model3D', [
        'model'       => $model,
        'allAssets'   => $allAssets,
        'modelExists' => $modelExists,
    ]);
})->name('model-3d.show');

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
    
    // Review votes - obtener votos del usuario (public, pero retorna datos útiles solo si autenticado)
    Route::get('/review-votes/user-votes/{placeId}', [ReviewVoteController::class, 'getUserVotesForPlace'])->name('review-votes.user-votes');
    
    // Reviews
    Route::get('/places/{place}/reviews', [ReviewController::class, 'index'])->name('reviews.index');
    
    Route::middleware('auth')->group(function () {
        Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
        Route::put('/reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
        Route::post('/reviews/{review}/vote', [ReviewController::class, 'vote'])->name('reviews.vote');
        
        // Review votes
        Route::post('/review-votes/{reviewId}', [ReviewVoteController::class, 'store'])->name('review-votes.store');
        
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

        // 3D Assets management
        Route::resource('assets3d', Asset3dController::class)->parameters(['assets3d' => 'asset3d']);
        Route::patch('assets3d/{asset3d}/toggle-active', [Asset3dController::class, 'toggleActive'])
            ->name('assets3d.toggle-active');

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

            // Hotspots management for place images
            Route::prefix('images/{image}')->name('images.')->group(function () {
                Route::resource('hotspots', HotspotController::class)->except(['show']);
                Route::patch('hotspots/{hotspot}/toggle-active', [HotspotController::class, 'toggleActive'])
                    ->name('hotspots.toggle-active');
            });
        });
    });
});

// Rutas para la demo de VR y el visor 360
Route::view('/vr-demo', 'vr_demo');
// Usar Inertia para el visor VR para que los enlaces desde Inertia funcionen correctamente
Route::get('/vr', function () {
    $placeId = request()->query('place_id');
    $imageParam = request()->query('image');
    $place = null;
    $hotspots = [];

    if ($placeId) {
        $place = \App\Models\Place::with(['activeImages'])->find($placeId);

        // Formatear las imágenes para el frontend
        if ($place && $place->activeImages) {
            $place->images = $place->activeImages->map(function($image) {
                return [
                    'id' => $image->id,
                    'title' => $image->title,
                    'url' => '/storage/' . $image->image_path,
                    'is_main' => $image->is_main
                ];
            });
        }

        // Cargar hotspots de la imagen actual
        if ($imageParam) {
            // Normalizar: quitar /storage/ del inicio para comparar con image_path en BD
            $imagePath = $imageParam;
            if (str_starts_with($imagePath, '/storage/')) {
                $imagePath = substr($imagePath, strlen('/storage/'));
            } elseif (str_starts_with($imagePath, 'storage/')) {
                $imagePath = substr($imagePath, strlen('storage/'));
            }
            // Quitar slash inicial si queda
            $imagePath = ltrim($imagePath, '/');

            $placeImage = \App\Models\PlaceImage::where('place_id', $placeId)
                ->where('image_path', $imagePath)
                ->first();

            if ($placeImage) {
                $hotspots = $placeImage->hotspots()
                    ->where('is_active', true)
                    ->with('asset3d')
                    ->orderBy('sort_order')
                    ->get()
                    ->map(function($hotspot) {
                        return [
                            'id'          => $hotspot->id,
                            'pos_x'       => $hotspot->pos_x,
                            'pos_y'       => $hotspot->pos_y,
                            'pos_z'       => $hotspot->pos_z,
                            'label'       => $hotspot->label,
                            'description' => $hotspot->description,
                            'asset_3d'    => $hotspot->asset3d ? [
                                'id'          => $hotspot->asset3d->id,
                                'name'        => $hotspot->asset3d->name,
                                'description' => $hotspot->asset3d->description,
                                'model_path'  => $hotspot->asset3d->model_path,
                                'is_active'   => $hotspot->asset3d->is_active,
                            ] : null,
                        ];
                    })->values()->all();
            }
        }
    }

    return Inertia::render('VR', [
        'image'    => $imageParam,
        'hotspots' => $hotspots,
        'place'    => $place ? [
            'id'     => $place->id,
            'title'  => $place->title,
            'images' => $place->images ?? []
        ] : null,
    ]);
});

require __DIR__.'/settings.php';
