<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Place extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'short_description',
        'description',
        'thumbnail',
        'main_360_image',
        'is_available',
        'sort_order',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($place) {
            if (empty($place->slug)) {
                $place->slug = Str::slug($place->title);
            }
        });

        static::updating(function ($place) {
            if ($place->isDirty('title') && empty($place->slug)) {
                $place->slug = Str::slug($place->title);
            }
        });
    }

    /**
     * Get all images for this place.
     */
    public function images(): HasMany
    {
        return $this->hasMany(PlaceImage::class)->orderBy('sort_order');
    }

    /**
     * Get active images for this place.
     */
    public function activeImages(): HasMany
    {
        return $this->hasMany(PlaceImage::class)
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    /**
     * Get the main image for this place.
     */
    public function mainImage()
    {
        return $this->hasOne(PlaceImage::class)
            ->where('is_main', true)
            ->where('is_active', true);
    }

    /**
     * Get available places.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Get places ordered by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('title');
    }

    // Relationships for reviews system
    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('is_approved', true);
    }

    // Rating statistics
    public function getAverageRatingAttribute()
    {
        return $this->ratings()->avg('rating') ?: 0;
    }

    public function getTotalRatingsAttribute()
    {
        return $this->ratings()->count();
    }

    public function getTotalReviewsAttribute()
    {
        return $this->approvedReviews()->count();
    }

    public function getRatingDistributionAttribute()
    {
        $distribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $distribution[$i] = $this->ratings()->where('rating', $i)->count();
        }
        return $distribution;
    }

    // Check if user has rated this place
    public function hasUserRated($userId): bool
    {
        return $this->ratings()->where('user_id', $userId)->exists();
    }

    // Get user's rating for this place
    public function getUserRating($userId)
    {
        return $this->ratings()->where('user_id', $userId)->first()?->rating;
    }
}
