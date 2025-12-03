<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserReview extends Model
{
    protected $fillable = [
        'user_id',
        'review_id',
        'is_helpful',
    ];

    protected $casts = [
        'is_helpful' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }

    public function scopeHelpful($query)
    {
        return $query->where('is_helpful', true);
    }

    public function scopeUnhelpful($query)
    {
        return $query->where('is_helpful', false);
    }
}
