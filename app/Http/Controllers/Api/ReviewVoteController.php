<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReviewVote;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewVoteController extends Controller
{
    public function store(Request $request, $reviewId)
    {
        try {
            $validated = $request->validate([
                'vote_type' => 'nullable|in:helpful,unhelpful'
            ]);

            $user = auth()->user();

            if (!$user) {
                return response()->json(['message' => 'No autenticado'], 401);
            }

            // Buscar el comentario/reseña
            $review = Review::findOrFail($reviewId);

            // Verificar que el usuario no sea el autor del comentario
            if ($user->id === $review->user_id) {
                return response()->json(['message' => 'No puedes votar tu propio comentario'], 403);
            }

            // Buscar voto existente
            $vote = ReviewVote::where('user_id', $user->id)
                ->where('review_id', $review->id)
                ->first();

            if ($vote) {
                // Si el voto es null, eliminar el voto anterior
                if ($validated['vote_type'] === null) {
                    $vote->delete();
                } else {
                    // De lo contrario, actualizar
                    $vote->update(['vote_type' => $validated['vote_type']]);
                }
            } else if ($validated['vote_type'] !== null) {
                // Crear nuevo voto solo si vote_type no es null
                ReviewVote::create([
                    'user_id' => $user->id,
                    'review_id' => $review->id,
                    'vote_type' => $validated['vote_type']
                ]);
            }

            // Obtener los conteos actualizados
            $helpfulCount = ReviewVote::where('review_id', $review->id)
                ->where('vote_type', 'helpful')
                ->count();

            $unhelpfulCount = ReviewVote::where('review_id', $review->id)
                ->where('vote_type', 'unhelpful')
                ->count();

            return response()->json([
                'message' => 'Voto procesado correctamente',
                'helpful_votes_count' => $helpfulCount,
                'unhelpful_votes_count' => $unhelpfulCount,
                'success' => true
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Comentario no encontrado'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error procesando voto: ' . $e->getMessage()], 500);
        }
    }
}
