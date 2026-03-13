<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\PlaceImage;
use App\Models\PlaceImageHotspot;
use App\Models\PlaceImageRoute;
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
        // Cargar hotspots con relaciones y paginación
        $hotspots = $image->hotspots()
            ->with('asset3d')
            ->ordered()
            ->paginate(15);

        // Mapear al formato que espera el frontend (asset3d → asset_3d)
        $hotspotsData = collect($hotspots->items())->map(function ($hotspot) {
            $arr = $hotspot->toArray();
            $arr['asset_3d'] = $hotspot->asset3d ? $hotspot->asset3d->toArray() : null;
            return $arr;
        })->values()->all();

        return Inertia::render('Admin/Hotspots/Index', [
            'place' => $place,
            'placeImage' => $image,
            'hotspots' => [
                'data' => $hotspotsData,
                'pagination' => [
                    'current_page' => $hotspots->currentPage(),
                    'last_page' => $hotspots->lastPage(),
                    'per_page' => $hotspots->perPage(),
                    'total' => $hotspots->total(),
                    'from' => $hotspots->firstItem(),
                    'to' => $hotspots->lastItem(),
                ],
                'links' => $this->generatePaginationLinks($hotspots),
            ],
            'routes' => $image->routes()->with('targetImage')->get(),
        ]);
    }

    /**
     * Generate pagination links manually
     */
    private function generatePaginationLinks($paginator)
    {
        $links = [];
        
        // Previous link
        if ($paginator->onFirstPage()) {
            $links[] = [
                'url' => null,
                'label' => '&laquo; Anterior',
                'active' => false,
            ];
        } else {
            $links[] = [
                'url' => $paginator->previousPageUrl(),
                'label' => '&laquo; Anterior',
                'active' => false,
            ];
        }

        // Page number links
        foreach ($paginator->getUrlRange(1, $paginator->lastPage()) as $page => $url) {
            $links[] = [
                'url' => $url,
                'label' => (string)$page,
                'active' => $page === $paginator->currentPage(),
            ];
        }

        // Next link
        if ($paginator->hasMorePages()) {
            $links[] = [
                'url' => $paginator->nextPageUrl(),
                'label' => 'Siguiente &raquo;',
                'active' => false,
            ];
        } else {
            $links[] = [
                'url' => null,
                'label' => 'Siguiente &raquo;',
                'active' => false,
            ];
        }

        return $links;
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
            'placeImage' => $image,
            'assets3d' => $assets3d,
            'availableImages' => PlaceImage::where('place_id', $place->id)
                ->where('id', '!=', $image->id)
                ->where('type', 'main_360')
                ->active()
                ->ordered()
                ->get(),
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
            ->route('admin.places.images.hotspots.index', [$place, $image])
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
            'placeImage' => $image,
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
            ->route('admin.places.images.hotspots.index', [$place, $image])
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
            ->route('admin.places.images.hotspots.index', [$place, $image])
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
            ->route('admin.places.images.hotspots.index', [$place, $image])
            ->with('success', 'Estado del hotspot actualizado');
    }
}
