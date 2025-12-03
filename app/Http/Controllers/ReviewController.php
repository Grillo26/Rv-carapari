<?php

namespace App\Http\Controllers;

use App\Models\Place;
use App\Models\Review;
use App\Models\UserReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Get reviews for a specific place.
     */
    public function index(Request $request, Place $place)
    {
        $reviews = $place->approvedReviews()
            ->with(['user', 'userReviews'])
            ->withCount(['helpfulVotes', 'unhelpfulVotes'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * Store a new review.
     */
    public function store(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'title' => 'nullable|string|max:255',
            'content' => 'required|string|min:10|max:1000',
        ]);

        $place = Place::findOrFail($request->place_id);

        // Check if user already has a review for this place
        if ($place->reviews()->where('user_id', Auth::id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Ya has escrito una reseña para este lugar'
            ], 409);
        }

        $review = Review::create([
            'place_id' => $place->id,
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'is_approved' => false, // Requires admin approval
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reseña enviada exitosamente. Será revisada antes de publicarse.',
            'review' => $review->load('user')
        ]);
    }

    /**
     * Update an existing review.
     */
    public function update(Request $request, Review $review)
    {
        // Check if user owns this review
        if ($review->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para editar esta reseña'
            ], 403);
        }

        $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string|min:10|max:1000',
        ]);

        $review->update([
            'title' => $request->title,
            'content' => $request->content,
            'is_approved' => false, // Reset approval status
            'approved_at' => null,
            'approved_by' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reseña actualizada exitosamente. Será revisada antes de publicarse.',
            'review' => $review->load('user')
        ]);
    }

    /**
     * Delete a review.
     */
    public function destroy(Review $review)
    {
        // Check if user owns this review or is admin
        if ($review->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para eliminar esta reseña'
            ], 403);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reseña eliminada exitosamente'
        ]);
    }

    /**
     * Mark review as helpful or unhelpful.
     */
    public function vote(Request $request, Review $review)
    {
        $request->validate([
            'is_helpful' => 'required|boolean',
        ]);

        // Users can't vote on their own reviews
        if ($review->user_id === Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'No puedes votar en tu propia reseña'
            ], 409);
        }

        // Update or create vote
        UserReview::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'review_id' => $review->id,
            ],
            [
                'is_helpful' => $request->is_helpful,
            ]
        );

        $review->loadCount(['helpfulVotes', 'unhelpfulVotes']);

        return response()->json([
            'success' => true,
            'message' => 'Voto registrado exitosamente',
            'helpful_count' => $review->helpful_votes_count,
            'unhelpful_count' => $review->unhelpful_votes_count,
        ]);
    }

    /**
     * Approve a review (Admin only).
     */
    public function approve(Review $review)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para aprobar reseñas'
            ], 403);
        }

        $review->update([
            'is_approved' => true,
            'approved_at' => now(),
            'approved_by' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reseña aprobada exitosamente',
            'review' => $review->load(['user', 'approver'])
        ]);
    }
}
