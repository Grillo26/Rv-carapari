<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReviewVote;
use App\Models\UserReview;
use Illuminate\Http\Request;

class ReviewVoteController extends Controller
{
    public function store(Request $request, UserReview $review)
    {
        $validated = $request->validate([
            'vote_type' => 'nullable|in:helpful,unhelpful'
        ]);

        $user = $request->user();

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
                return response()->json(['message' => 'Voto eliminado'], 200);
            }
            // De lo contrario, actualizar
            $vote->update(['vote_type' => $validated['vote_type']]);
            return response()->json(['message' => 'Voto actualizado'], 200);
        }

        // Si no hay voto anterior y vote_type es null, no hacer nada
        if ($validated['vote_type'] === null) {
            return response()->json(['message' => 'No hay voto para eliminar'], 200);
        }

        // Crear nuevo voto
        ReviewVote::create([
            'user_id' => $user->id,
            'review_id' => $review->id,
            'vote_type' => $validated['vote_type']
        ]);

        return response()->json(['message' => 'Voto registrado'], 201);
    }
}
