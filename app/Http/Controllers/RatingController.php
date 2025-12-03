<?php

namespace App\Http\Controllers;

use App\Models\Place;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RatingController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Store a newly created rating or update existing one.
     */
    public function store(Request $request)
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $place = Place::findOrFail($request->place_id);
        
        // Update or create rating
        $rating = Rating::updateOrCreate(
            [
                'place_id' => $place->id,
                'user_id' => Auth::id(),
            ],
            [
                'rating' => $request->rating,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Calificación guardada exitosamente',
            'rating' => $rating,
            'place_stats' => [
                'average_rating' => $place->average_rating,
                'total_ratings' => $place->total_ratings,
            ]
        ]);
    }

    /**
     * Get rating statistics for a place.
     */
    public function show(Place $place)
    {
        $stats = [
            'average_rating' => $place->average_rating,
            'total_ratings' => $place->total_ratings,
            'rating_distribution' => $place->rating_distribution,
            'user_rating' => Auth::check() ? $place->getUserRating(Auth::id()) : null,
        ];

        return response()->json($stats);
    }

    /**
     * Remove user's rating for a place.
     */
    public function destroy(Place $place)
    {
        $deleted = Rating::where('place_id', $place->id)
            ->where('user_id', Auth::id())
            ->delete();

        if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => 'Calificación eliminada exitosamente',
                'place_stats' => [
                    'average_rating' => $place->average_rating,
                    'total_ratings' => $place->total_ratings,
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No se encontró la calificación'
        ], 404);
    }
}
