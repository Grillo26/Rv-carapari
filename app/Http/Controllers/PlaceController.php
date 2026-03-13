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

        // Imagen principal 360 (is_main = 1)
        $mainImage = $place->images()
            ->where('is_main', true)
            ->where('is_active', true)
            ->first();

        if (!$mainImage) {
            // Si no hay imagen marcada como principal, usar la primera activa
            $mainImage = $place->images()->where('is_active', true)->first();
        }

        $hotspots = [];
        if ($mainImage) {
            $hotspots = $mainImage->hotspots()
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
        }

        return Inertia::render('Places/Viewer360', [
            'place'     => [
                'id'    => $place->id,
                'title' => $place->title,
                'slug'  => $place->slug,
            ],
            'image'     => $mainImage ? '/storage/' . $mainImage->image_path : null,
            'hotspots'  => $hotspots,
        ]);
    }
}
