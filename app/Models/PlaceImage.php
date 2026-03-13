<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlaceImage extends Model
{
    protected $fillable = [
        'place_id',
        'title',
        'image_path',
        'description',
        'type',
        'is_main',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_main' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the place that owns this image.
     */
    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    /**
     * Get all hotspots for this image.
     */
    public function hotspots(): HasMany
    {
        return $this->hasMany(PlaceImageHotspot::class);
    }

    /**
     * Get all outgoing routes from this image.
     */
    public function routes(): HasMany
    {
        return $this->hasMany(PlaceImageRoute::class, 'source_image_id');
    }

    /**
     * Get active images.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get main images.
     */
    public function scopeMain($query)
    {
        return $query->where('is_main', true);
    }

    /**
     * Get images ordered by sort order and then by creation date.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'asc');
    }
}
