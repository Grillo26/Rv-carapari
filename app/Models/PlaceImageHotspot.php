<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlaceImageHotspot extends Model
{
    protected $table = 'place_image_hotspots';

    protected $fillable = [
        'place_image_id',
        'asset_3d_id',
        'pos_x',
        'pos_y',
        'pos_z',
        'label',
        'description',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'pos_x' => 'float',
        'pos_y' => 'float',
        'pos_z' => 'float',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the place image that owns this hotspot.
     */
    public function placeImage(): BelongsTo
    {
        return $this->belongsTo(PlaceImage::class);
    }

    /**
     * Get the 3D asset associated with this hotspot.
     */
    public function asset3d(): BelongsTo
    {
        return $this->belongsTo(Asset3d::class, 'asset_3d_id');
    }

    /**
     * Scope: Get only active hotspots.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Order by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
