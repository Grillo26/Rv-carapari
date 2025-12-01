<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\PlaceImage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PlaceImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Place $place)
    {
        $place->load(['images' => function ($query) {
            $query->ordered(); // Ordenar por sort_order
        }]);

        return Inertia::render('Admin/Places/Images/Index', [
            'place' => $place,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Place $place)
    {
        return Inertia::render('Admin/Places/Images/Create', [
            'place' => $place,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Place $place)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'required|image|max:10240',
            'is_main' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:1', // Mínimo 1 en lugar de 0
        ]);

        // Si no se especifica sort_order, usar el siguiente número disponible
        if (!isset($validated['sort_order'])) {
            $maxOrder = PlaceImage::where('place_id', $place->id)->max('sort_order') ?? 0;
            $validated['sort_order'] = $maxOrder + 1;
        }

        // If this is set as main, remove main flag from other images
        if ($validated['is_main'] ?? false) {
            PlaceImage::where('place_id', $place->id)
                ->where('is_main', true)
                ->update(['is_main' => false]);
        }

        // Handle image upload
        $imagePath = $request->file('image')->store('places/360/' . $place->slug, 'public');

        $place->images()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'image_path' => $imagePath,
            'is_main' => $validated['is_main'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'],
        ]);

        return redirect()->route('admin.places.images.index', $place)
            ->with('success', 'Imagen 360° agregada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Place $place, PlaceImage $image)
    {
        return Inertia::render('Admin/Places/Images/Show', [
            'place' => $place,
            'image' => $image,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Place $place, PlaceImage $image)
    {
        // Ensure the image belongs to the place
        if ($image->place_id !== $place->id) {
            abort(404, 'La imagen no pertenece a este lugar.');
        }

        return Inertia::render('Admin/Places/Images/Edit', [
            'place' => $place,
            'placeImage' => $image,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Place $place, PlaceImage $image)
    {
        // Ensure the image belongs to the place
        if ($image->place_id !== $place->id) {
            abort(404, 'La imagen no pertenece a este lugar.');
        }
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:10240',
            'is_main' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:1', // Mínimo 1 en lugar de 0
        ]);

        // If this is set as main, remove main flag from other images
        if (($validated['is_main'] ?? false) && !$image->is_main) {
            PlaceImage::where('place_id', $place->id)
                ->where('id', '!=', $image->id)
                ->where('is_main', true)
                ->update(['is_main' => false]);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($image->image_path);
            $validated['image_path'] = $request->file('image')->store('places/360/' . $place->slug, 'public');
        }

        $image->update($validated);

        return redirect()->route('admin.places.images.index', $place)
            ->with('success', 'Imagen 360° actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Place $place, PlaceImage $image)
    {
        // Ensure the image belongs to the place
        if ($image->place_id !== $place->id) {
            abort(404, 'La imagen no pertenece a este lugar.');
        }

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return redirect()->route('admin.places.images.index', $place)
            ->with('success', 'Imagen 360° eliminada exitosamente.');
    }

    /**
     * Toggle the active status of an image.
     */
    public function toggleActive(Place $place, PlaceImage $image)
    {
        // Ensure the image belongs to the place
        if ($image->place_id !== $place->id) {
            abort(404, 'La imagen no pertenece a este lugar.');
        }

        $image->update(['is_active' => !$image->is_active]);

        return redirect()->back()
            ->with('success', 'Estado de la imagen actualizado.');
    }

    /**
     * Set an image as main.
     */
    public function setAsMain(Place $place, PlaceImage $image)
    {
        // Ensure the image belongs to the place
        if ($image->place_id !== $place->id) {
            abort(404, 'La imagen no pertenece a este lugar.');
        }

        // Remove main flag from other images
        PlaceImage::where('place_id', $place->id)
            ->where('id', '!=', $image->id)
            ->where('is_main', true)
            ->update(['is_main' => false]);

        // Set this image as main
        $image->update(['is_main' => true]);

        return redirect()->back()
            ->with('success', 'Imagen principal actualizada.');
    }
}
