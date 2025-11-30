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
        // Log para debug
        \Log::info('Place creation request received', [
            'data' => $request->except(['thumbnail', 'main_360_image']),
            'files' => [
                'thumbnail' => $request->hasFile('thumbnail'),
                'main_360_image' => $request->hasFile('main_360_image')
            ]
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:places',
            'short_description' => 'required|string|max:500',
            'description' => 'required|string',
            'thumbnail' => 'nullable|image|max:2048', // 2MB max
            'main_360_image' => 'nullable|image|max:10240', // 10MB max
            'is_available' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        try {
            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                $thumbnailFile = $request->file('thumbnail');
                \Log::info('Thumbnail upload', [
                    'original_name' => $thumbnailFile->getClientOriginalName(),
                    'size' => $thumbnailFile->getSize(),
                    'mime' => $thumbnailFile->getMimeType()
                ]);
                $validated['thumbnail'] = $thumbnailFile->store('places/thumbnails', 'public');
            }

            // Handle main 360 image upload
            if ($request->hasFile('main_360_image')) {
                $main360File = $request->file('main_360_image');
                \Log::info('Main 360 image upload', [
                    'original_name' => $main360File->getClientOriginalName(),
                    'size' => $main360File->getSize(),
                    'mime' => $main360File->getMimeType()
                ]);
                $validated['main_360_image'] = $main360File->store('places/360', 'public');
            }

            // Asegurar que is_available tenga un valor por defecto
            if (!isset($validated['is_available'])) {
                $validated['is_available'] = true;
            }

            // Asegurar que sort_order tenga un valor por defecto
            if (!isset($validated['sort_order'])) {
                $validated['sort_order'] = 0;
            }

            $place = Place::create($validated);

            \Log::info('Place created successfully', ['place_id' => $place->id]);

            return redirect()->route('admin.places.index')
                ->with('success', 'Lugar turístico creado exitosamente.');

        } catch (\Exception $e) {
            \Log::error('Error creating place', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Error al crear el lugar turístico: ' . $e->getMessage());
        }
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
