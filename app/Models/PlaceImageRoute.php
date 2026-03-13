<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlaceImageRoute extends Model
{
    protected $fillable = [
        'source_image_id',
        'target_image_id',
        'pos_x',
        'pos_y',
        'pos_z',
        'label',
    ];

    protected $casts = [
        'pos_x' => 'float',
        'pos_y' => 'float',
        'pos_z' => 'float',
    ];

    /**
     * Get the source image (origin of the route).
     */
    public function sourceImage(): BelongsTo
    {
        return $this->belongsTo(PlaceImage::class, 'source_image_id');
    }

    /**
     * Get the target image (destination of the route).
     */
    public function targetImage(): BelongsTo
    {
        return $this->belongsTo(PlaceImage::class, 'target_image_id');
    }
}
