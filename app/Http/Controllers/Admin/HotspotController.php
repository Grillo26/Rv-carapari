<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\PlaceImage;
use App\Models\PlaceImageHotspot;
use App\Models\Asset3d;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HotspotController extends Controller
{
    /**
     * Display a listing of hotspots for a place image.
     */
    public function index(Place $place, PlaceImage $image)
    {
        // Cargar hotspots con relaciones
        $hotspots = $image->hotspots()->with('asset3d')->ordered()->get();

        return Inertia::render('Admin/Hotspots/Index', [
            'place' => $place,
            'image' => $image,
            'hotspots' => $hotspots,
        ]);
    }

    /**
     * Show the form for creating a new hotspot.
     */
    public function create(Place $place, PlaceImage $image)
    {
        // Obtener todos los assets 3D disponibles
        $assets3d = Asset3d::active()->ordered()->get();

        return Inertia::render('Admin/Hotspots/Create', [
            'place' => $place,
            'image' => $image,
            'assets3d' => $assets3d,
        ]);
    }

    /**
     * Store a newly created hotspot in storage.
     */
    public function store(Request $request, Place $place, PlaceImage $image)
    {
        // Validar datos
        $validated = $request->validate([
            'asset_3d_id' => 'required|exists:assets_3d,id',
            'pos_x' => 'required|numeric',
            'pos_y' => 'required|numeric',
            'pos_z' => 'required|numeric',
            'label' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Asignar valores por defecto si no están presentes
        $validated['place_image_id'] = $image->id;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        // Crear el hotspot
        $hotspot = PlaceImageHotspot::create($validated);

        return redirect()
            ->route('admin.hotspots.index', [$place, $image])
            ->with('success', 'Hotspot creado exitosamente');
    }

    /**
     * Show the form for editing the specified hotspot.
     */
    public function edit(Place $place, PlaceImage $image, PlaceImageHotspot $hotspot)
    {
        // Verificar que el hotspot pertenece a la imagen
        if ($hotspot->place_image_id !== $image->id) {
            abort(404);
        }

        // Obtener todos los assets 3D disponibles
        $assets3d = Asset3d::active()->ordered()->get();

        return Inertia::render('Admin/Hotspots/Edit', [
            'place' => $place,
            'image' => $image,
            'hotspot' => $hotspot->load('asset3d'),
            'assets3d' => $assets3d,
        ]);
    }

    /**
     * Update the specified hotspot in storage.
     */
    public function update(Request $request, Place $place, PlaceImage $image, PlaceImageHotspot $hotspot)
    {
        // Verificar que el hotspot pertenece a la imagen
        if ($hotspot->place_image_id !== $image->id) {
            abort(404);
        }

        // Validar datos
        $validated = $request->validate([
            'asset_3d_id' => 'required|exists:assets_3d,id',
            'pos_x' => 'required|numeric',
            'pos_y' => 'required|numeric',
            'pos_z' => 'required|numeric',
            'label' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Actualizar el hotspot
        $hotspot->update($validated);

        return redirect()
            ->route('admin.hotspots.index', [$place, $image])
            ->with('success', 'Hotspot actualizado exitosamente');
    }

    /**
     * Remove the specified hotspot from storage.
     */
    public function destroy(Place $place, PlaceImage $image, PlaceImageHotspot $hotspot)
    {
        // Verificar que el hotspot pertenece a la imagen
        if ($hotspot->place_image_id !== $image->id) {
            abort(404);
        }

        $hotspot->delete();

        return redirect()
            ->route('admin.hotspots.index', [$place, $image])
            ->with('success', 'Hotspot eliminado exitosamente');
    }

    /**
     * Toggle active status of a hotspot.
     */
    public function toggleActive(Place $place, PlaceImage $image, PlaceImageHotspot $hotspot)
    {
        // Verificar que el hotspot pertenece a la imagen
        if ($hotspot->place_image_id !== $image->id) {
            abort(404);
        }

        $hotspot->update([
            'is_active' => !$hotspot->is_active
        ]);

        return redirect()
            ->route('admin.hotspots.index', [$place, $image])
            ->with('success', 'Estado del hotspot actualizado');
    }
}
