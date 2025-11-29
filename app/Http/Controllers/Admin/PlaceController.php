<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\PlaceImage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PlaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $places = Place::with(['images', 'mainImage'])
            ->ordered()
            ->paginate(10);

        return Inertia::render('Admin/Places/Index', [
            'places' => $places,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Places/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:places',
            'short_description' => 'required|string|max:500',
            'description' => 'required|string',
            'thumbnail' => 'nullable|image|max:2048',
            'main_360_image' => 'nullable|image|max:10240',
            'is_available' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('places/thumbnails', 'public');
        }

        // Handle main 360 image upload
        if ($request->hasFile('main_360_image')) {
            $validated['main_360_image'] = $request->file('main_360_image')->store('places/360', 'public');
        }

        $place = Place::create($validated);

        return redirect()->route('admin.places.index')
            ->with('success', 'Lugar turístico creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Place $place)
    {
        $place->load(['images' => function ($query) {
            $query->ordered();
        }]);

        return Inertia::render('Admin/Places/Show', [
            'place' => $place,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Place $place)
    {
        $place->load(['images' => function ($query) {
            $query->ordered();
        }]);

        return Inertia::render('Admin/Places/Edit', [
            'place' => $place,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Place $place)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('places')->ignore($place->id)
            ],
            'short_description' => 'required|string|max:500',
            'description' => 'required|string',
            'thumbnail' => 'nullable|image|max:2048',
            'main_360_image' => 'nullable|image|max:10240',
            'is_available' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            if ($place->thumbnail) {
                Storage::disk('public')->delete($place->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('places/thumbnails', 'public');
        }

        // Handle main 360 image upload
        if ($request->hasFile('main_360_image')) {
            if ($place->main_360_image) {
                Storage::disk('public')->delete($place->main_360_image);
            }
            $validated['main_360_image'] = $request->file('main_360_image')->store('places/360', 'public');
        }

        $place->update($validated);

        return redirect()->route('admin.places.index')
            ->with('success', 'Lugar turístico actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Place $place)
    {
        // Delete associated files
        if ($place->thumbnail) {
            Storage::disk('public')->delete($place->thumbnail);
        }
        if ($place->main_360_image) {
            Storage::disk('public')->delete($place->main_360_image);
        }

        // Delete associated images
        foreach ($place->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $place->delete();

        return redirect()->route('admin.places.index')
            ->with('success', 'Lugar turístico eliminado exitosamente.');
    }

    /**
     * Toggle the availability of a place.
     */
    public function toggleAvailability(Place $place)
    {
        $place->update(['is_available' => !$place->is_available]);

        return redirect()->back()
            ->with('success', 'Disponibilidad del lugar actualizada.');
    }
}
