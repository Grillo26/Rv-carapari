<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Review extends Model
{
    protected $fillable = [
        'place_id',
        'user_id',
        'title',
        'content',
        'is_approved',
        'approved_at',
        'approved_by',
    ];

    protected $appends = [
        'helpful_votes_count',
        'unhelpful_votes_count'
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'approved_at' => 'datetime',
    ];

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function userReviews(): HasMany
    {
        return $this->hasMany(UserReview::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ReviewVote::class, 'review_id');
    }

    public function helpfulVotes(): HasMany
    {
        return $this->hasMany(UserReview::class)->where('is_helpful', true);
    }

    public function unhelpfulVotes(): HasMany
    {
        return $this->hasMany(UserReview::class)->where('is_helpful', false);
    }

    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopePending($query)
    {
        return $query->where('is_approved', false);
    }

    public function scopeForPlace($query, $placeId)
    {
        return $query->where('place_id', $placeId);
    }

    public function getHelpfulVotesCountAttribute()
    {
        // Usar ReviewVote en lugar de UserReview
        return ReviewVote::where('review_id', $this->id)
            ->where('vote_type', 'helpful')
            ->count();
    }

    public function getUnhelpfulVotesCountAttribute()
    {
        // Usar ReviewVote en lugar de UserReview
        return ReviewVote::where('review_id', $this->id)
            ->where('vote_type', 'unhelpful')
            ->count();
    }
}
