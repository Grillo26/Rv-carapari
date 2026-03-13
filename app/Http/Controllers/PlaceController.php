<?php

namespace App\Http\Controllers;

use App\Models\Asset3d;
use App\Models\Place;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlaceController extends Controller
{
    /**
     * Display a listing of available places.
     */
    public function index()
    {
        $places = Place::available()
            ->with(['mainImage'])
            ->ordered()
            ->get();

        return Inertia::render('Places/Index', [
            'places' => $places,
        ]);
    }

    /**
     * Display the specified place.
     */
    public function show($slug)
    {
        $place = Place::where('slug', $slug)
            ->available()
            ->with([
                'activeImages' => function ($query) {
                    $query->ordered();
                },
                'reviews.user',
                'ratings.user'
            ])
            ->firstOrFail();

        // Add rating and review statistics
        $place->loadCount(['ratings', 'approvedReviews']);
        $place->average_rating = $place->average_rating;
        $place->total_ratings = $place->total_ratings;
        $place->total_reviews = $place->total_reviews;

        // Get user's rating if authenticated
        $userRating = null;
        $userHasReview = false;
        if (auth()->check()) {
            $userRating = $place->ratings()->where('user_id', auth()->id())->value('rating');
            $userHasReview = $place->reviews()->where('user_id', auth()->id())->exists();
        }
        $place->user_rating = $userRating;
        $place->user_has_review = $userHasReview;

        // Get approved reviews
        $place->reviews = $place->approvedReviews()->with('user')->latest()->get();

        // Get all active 3D assets
        $assets3d = Asset3d::active()->ordered()->get();

        return Inertia::render('Places/[slug]', [
            'place'    => $place,
            'assets3d' => $assets3d,
        ]);
    }

    /**
     * Display the 360° viewer for a place.
     */
    public function show360($slug)
    {
        $place = Place::where('slug', $slug)
            ->available()
            ->firstOrFail();

        // Todas las imágenes 360° activas de este lugar
        $allImages = $place->images()
            ->where('type', 'main_360')
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('sort_order')
            ->get();

        $mapHotspots = function ($image) {
            return $image->hotspots()
                ->where('is_active', true)
                ->with('asset3d')
                ->orderBy('sort_order')
                ->get()
                ->map(fn($h) => [
                    'id'          => $h->id,
                    'pos_x'       => $h->pos_x,
                    'pos_y'       => $h->pos_y,
                    'pos_z'       => $h->pos_z,
                    'label'       => $h->label,
                    'description' => $h->description,
                    'asset_3d'    => $h->asset3d ? [
                        'id'          => $h->asset3d->id,
                        'name'        => $h->asset3d->name,
                        'description' => $h->asset3d->description,
                        'model_path'  => $h->asset3d->model_path,
                    ] : null,
                ])->values()->all();
        };

        $mapRoutes = function ($image) {
            return $image->routes()
                ->with('targetImage')
                ->get()
                ->map(fn($r) => [
                    'id'              => $r->id,
                    'target_image_id' => $r->target_image_id,
                    'pos_x'           => $r->pos_x,
                    'pos_y'           => $r->pos_y,
                    'pos_z'           => $r->pos_z,
                    'label'           => $r->label,
                ])->values()->all();
        };

        $images360 = $allImages->map(fn($img) => [
            'id'        => $img->id,
            'title'     => $img->title,
            'image_url' => '/storage/' . $img->image_path,
            'is_main'   => $img->is_main,
            'hotspots'  => $mapHotspots($img),
            'routes'    => $mapRoutes($img),
        ])->values()->all();

        // Imagen inicial: la principal o la primera disponible
        $mainImage = $allImages->firstWhere('is_main', true) ?? $allImages->first();

        return Inertia::render('Places/Viewer360', [
            'place'     => [
                'id'    => $place->id,
                'title' => $place->title,
                'slug'  => $place->slug,
            ],
            'image'     => $mainImage ? '/storage/' . $mainImage->image_path : null,
            'hotspots'  => $mainImage ? $mapHotspots($mainImage) : [],
            'routes'    => $mainImage ? $mapRoutes($mainImage) : [],
            'images360' => $images360,
        ]);
    }
}
