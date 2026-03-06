<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset3d extends Model
{
    protected $table = 'assets_3d';

    protected $fillable = [
        'name',
        'description',
        'model_path',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get all hotspots for this 3D asset.
     */
    public function hotspots(): HasMany
    {
        return $this->hasMany(PlaceImageHotspot::class);
    }

    /**
     * Scope: Get only active assets.
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
