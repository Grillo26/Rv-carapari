<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\PlaceImage;
use App\Models\PlaceImageRoute;
use Illuminate\Http\Request;

class PlaceImageRouteController extends Controller
{
    /**
     * Store a newly created route in storage.
     */
    public function store(Request $request, Place $place, PlaceImage $image)
    {
        $validated = $request->validate([
            'target_image_id' => 'required|exists:place_images,id|different:source_image_id',
            'pos_x' => 'required|numeric',
            'pos_y' => 'required|numeric',
            'pos_z' => 'required|numeric',
            'label' => 'nullable|string|max:255',
        ]);

        // Verificar que la imagen destino no sea la misma
        if ((int) $validated['target_image_id'] === $image->id) {
            return back()->withErrors(['target_image_id' => 'La imagen destino no puede ser la misma que la imagen actual.']);
        }

        $validated['source_image_id'] = $image->id;

        PlaceImageRoute::create($validated);

        return redirect()
            ->route('admin.places.images.hotspots.index', [$place, $image])
            ->with('success', 'Ruta de navegación creada exitosamente');
    }

    /**
     * Remove the specified route from storage.
     */
    public function destroy(Place $place, PlaceImage $image, PlaceImageRoute $route)
    {
        if ($route->source_image_id !== $image->id) {
            abort(404);
        }

        $route->delete();

        return redirect()
            ->route('admin.places.images.hotspots.index', [$place, $image])
            ->with('success', 'Ruta eliminada exitosamente');
    }
}
