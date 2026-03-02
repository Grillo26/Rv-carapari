<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReviewVote;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReviewVoteController extends Controller
{
    public function getUserVotesForPlace(Request $request, $placeId)
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['votes' => []], 200);
        }

        // Obtener todos los votos del usuario para las reseñas de este lugar
        $votes = ReviewVote::whereIn('review_id', function ($query) use ($placeId) {
            $query->select('id')
                ->from('reviews')
                ->where('place_id', $placeId);
        })
        ->where('user_id', $user->id)
        ->get();

        // Formatear respuesta
        $votesArray = [];
        foreach ($votes as $vote) {
            $votesArray[$vote->review_id] = $vote->vote_type;
        }

        \Log::info('User votes for place loaded', ['userId' => $user->id, 'placeId' => $placeId, 'votesCount' => count($votesArray)]);

        return response()->json(['votes' => $votesArray], 200);
    }

    public function store(Request $request, $reviewId)
    {
        \Log::info('Vote request received', ['reviewId' => $reviewId, 'body' => $request->all()]);

        try {
            $validated = $request->validate([
                'vote_type' => 'nullable|in:helpful,unhelpful'
            ]);

            $user = auth()->user();

            if (!$user) {
                \Log::warning('Unauthenticated vote attempt');
                return response()->json(['message' => 'No autenticado'], 401);
            }

            \Log::info('User authenticated', ['userId' => $user->id]);

            // Buscar el comentario/reseña
            $review = Review::findOrFail($reviewId);

            \Log::info('Review found', ['reviewId' => $reviewId, 'userId' => $review->user_id]);

            // Verificar que el usuario no sea el autor del comentario
            if ($user->id === $review->user_id) {
                \Log::warning('User tried to vote own review', ['userId' => $user->id, 'reviewId' => $reviewId]);
                return response()->json(['message' => 'No puedes votar tu propio comentario'], 403);
            }

            // Buscar voto existente
            $vote = ReviewVote::where('user_id', $user->id)
                ->where('review_id', $review->id)
                ->first();

            \Log::info('Checking existing vote', ['exists' => $vote ? true : false]);

            if ($vote) {
                // Si el voto es null, eliminar el voto anterior
                if ($validated['vote_type'] === null) {
                    $vote->delete();
                    \Log::info('Vote deleted', ['voteId' => $vote->id]);
                } else {
                    // De lo contrario, actualizar
                    $vote->update(['vote_type' => $validated['vote_type']]);
                    \Log::info('Vote updated', ['voteId' => $vote->id, 'voteType' => $validated['vote_type']]);
                }
            } else if ($validated['vote_type'] !== null) {
                // Crear nuevo voto solo si vote_type no es null
                $newVote = ReviewVote::create([
                    'user_id' => $user->id,
                    'review_id' => $review->id,
                    'vote_type' => $validated['vote_type']
                ]);
                \Log::info('Vote created', ['voteId' => $newVote->id, 'voteType' => $validated['vote_type']]);
            }

            // Obtener los conteos actualizados
            $helpfulCount = ReviewVote::where('review_id', $review->id)
                ->where('vote_type', 'helpful')
                ->count();

            $unhelpfulCount = ReviewVote::where('review_id', $review->id)
                ->where('vote_type', 'unhelpful')
                ->count();

            \Log::info('Vote counts', ['helpful' => $helpfulCount, 'unhelpful' => $unhelpfulCount]);

            return response()->json([
                'message' => 'Voto procesado correctamente',
                'helpful_votes_count' => $helpfulCount,
                'unhelpful_votes_count' => $unhelpfulCount,
                'success' => true
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Review not found', ['reviewId' => $reviewId]);
            return response()->json(['message' => 'Comentario no encontrado'], 404);
        } catch (\Exception $e) {
            \Log::error('Error processing vote', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Error procesando voto: ' . $e->getMessage()], 500);
        }
    }
}
