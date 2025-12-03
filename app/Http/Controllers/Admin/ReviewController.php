<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\Review;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    // Constructor removed - middleware applied at route level

    /**
     * Display a listing of all reviews with statistics.
     */
    public function index(Request $request)
    {
        $query = Review::with(['user', 'place', 'approver'])
            ->withCount(['helpfulVotes', 'unhelpfulVotes']);

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'pending') {
                $query->where('is_approved', false);
            } elseif ($request->status === 'approved') {
                $query->where('is_approved', true);
            }
        }

        // Filter by place
        if ($request->has('place_id') && $request->place_id) {
            $query->where('place_id', $request->place_id);
        }

        // Search by content or user name
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('content', 'like', '%' . $request->search . '%')
                  ->orWhere('title', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function ($userQuery) use ($request) {
                      $userQuery->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate(15);

        // Get statistics
        $stats = [
            'total_reviews' => Review::count(),
            'pending_reviews' => Review::where('is_approved', false)->count(),
            'approved_reviews' => Review::where('is_approved', true)->count(),
            'total_ratings' => Rating::count(),
            'average_rating' => Rating::avg('rating'),
        ];

        // Get places for filter dropdown
        $places = Place::select('id', 'title')->orderBy('title')->get();

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
            'stats' => $stats,
            'places' => $places,
            'filters' => $request->only(['status', 'place_id', 'search'])
        ]);
    }

    /**
     * Display detailed statistics for a specific place.
     */
    public function show(Place $place)
    {
        $place->load(['activeImages']);

        // Get reviews with user info and votes
        $reviews = $place->reviews()
            ->with(['user', 'approver'])
            ->withCount(['helpfulVotes', 'unhelpfulVotes'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get ratings statistics
        $ratingStats = [
            'average_rating' => $place->average_rating,
            'total_ratings' => $place->total_ratings,
            'rating_distribution' => $place->rating_distribution,
        ];

        // Get detailed rating breakdown
        $ratingDetails = Rating::where('place_id', $place->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get review statistics
        $reviewStats = [
            'total_reviews' => $reviews->count(),
            'approved_reviews' => $reviews->where('is_approved', true)->count(),
            'pending_reviews' => $reviews->where('is_approved', false)->count(),
            'helpful_votes_total' => $reviews->sum('helpful_votes_count'),
            'unhelpful_votes_total' => $reviews->sum('unhelpful_votes_count'),
        ];

        return Inertia::render('Admin/Reviews/Show', [
            'place' => $place,
            'reviews' => $reviews,
            'ratings' => $ratingDetails,
            'ratingStats' => $ratingStats,
            'reviewStats' => $reviewStats,
        ]);
    }

    /**
     * Approve a review.
     */
    public function approve(Review $review)
    {
        $review->update([
            'is_approved' => true,
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Reseña aprobada exitosamente');
    }

    /**
     * Disapprove a review.
     */
    public function disapprove(Review $review)
    {
        $review->update([
            'is_approved' => false,
            'approved_at' => null,
            'approved_by' => null,
        ]);

        return back()->with('success', 'Reseña desaprobada exitosamente');
    }

    /**
     * Remove the specified review.
     */
    public function destroy(Review $review)
    {
        $review->delete();
        return back()->with('success', 'Reseña eliminada exitosamente');
    }

    /**
     * Get dashboard statistics for reviews and ratings.
     */
    public function dashboard()
    {
        // Overall statistics
        $overallStats = [
            'total_places' => Place::count(),
            'total_reviews' => Review::count(),
            'pending_reviews' => Review::where('is_approved', false)->count(),
            'total_ratings' => Rating::count(),
            'average_rating' => round(Rating::avg('rating') ?? 0, 2),
        ];

        // Top rated places
        $topRatedPlaces = Place::select([
                'places.id',
                'places.title',
                'places.slug',
                'places.thumbnail'
            ])
            ->selectRaw('COALESCE(AVG(ratings.rating), 0) as avg_rating')
            ->selectRaw('COUNT(ratings.id) as rating_count')
            ->leftJoin('ratings', 'places.id', '=', 'ratings.place_id')
            ->groupBy('places.id', 'places.title', 'places.slug', 'places.thumbnail')
            ->having('rating_count', '>=', 1)
            ->orderBy('avg_rating', 'desc')
            ->orderBy('rating_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($place) {
                $place->avg_rating = (float) $place->avg_rating;
                return $place;
            });

        // If no places with ratings, get top places by creation date
        if ($topRatedPlaces->isEmpty()) {
            $topRatedPlaces = Place::select([
                    'places.id',
                    'places.title',
                    'places.slug',
                    'places.thumbnail'
                ])
                ->selectRaw('0 as avg_rating')
                ->selectRaw('0 as rating_count')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($place) {
                    $place->avg_rating = 0.0;
                    $place->rating_count = 0;
                    return $place;
                });
        }

        // Recent reviews
        $recentReviews = Review::with(['user', 'place'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Rating distribution across all places
        $ratingDistribution = Rating::select('rating', DB::raw('COUNT(*) as count'))
            ->groupBy('rating')
            ->orderBy('rating')
            ->get()
            ->pluck('count', 'rating')
            ->toArray();

        // Ensure all rating values 1-5 are present
        for ($i = 1; $i <= 5; $i++) {
            if (!isset($ratingDistribution[$i])) {
                $ratingDistribution[$i] = 0;
            }
        }
        ksort($ratingDistribution);

        return Inertia::render('dashboard', [
            'overallStats' => $overallStats,
            'topRatedPlaces' => $topRatedPlaces,
            'recentReviews' => $recentReviews,
            'ratingDistribution' => $ratingDistribution,
        ]);
    }
}
