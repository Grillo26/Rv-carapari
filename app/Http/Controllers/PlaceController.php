<?php

namespace App\Http\Controllers;

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

        return Inertia::render('Places/[slug]', [
            'place' => $place,
        ]);
    }
}
