<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Asset3d;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class Asset3dController extends Controller
{
    /**
     * Display a listing of all 3D assets.
     */
    public function index()
    {
        $assets = Asset3d::ordered()->paginate(15);

        return Inertia::render('Admin/Assets3d/Index', [
            'assets' => $assets,
        ]);
    }

    /**
     * Show the form for creating a new asset.
     */
    public function create()
    {
        return Inertia::render('Admin/Assets3d/Create');
    }

    /**
     * Store a newly created asset in storage.
     */
    public function store(Request $request)
    {
        // Validar datos
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'model_path' => 'required|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Asignar valores por defecto
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        // Crear el asset
        Asset3d::create($validated);

        return redirect()
            ->route('admin.assets3d.index')
            ->with('success', 'Asset 3D creado exitosamente');
    }

    /**
     * Show the form for editing the specified asset.
     */
    public function edit(Asset3d $asset3d)
    {
        return Inertia::render('Admin/Assets3d/Edit', [
            'asset' => $asset3d,
        ]);
    }

    /**
     * Update the specified asset in storage.
     */
    public function update(Request $request, Asset3d $asset3d)
    {
        // Validar datos
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'model_path' => 'required|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Actualizar el asset
        $asset3d->update($validated);

        return redirect()
            ->route('admin.assets3d.index')
            ->with('success', 'Asset 3D actualizado exitosamente');
    }

    /**
     * Remove the specified asset from storage.
     */
    public function destroy(Asset3d $asset3d)
    {
        $asset3d->delete();

        return redirect()
            ->route('admin.assets3d.index')
            ->with('success', 'Asset 3D eliminado exitosamente');
    }

    /**
     * Toggle active status of an asset.
     */
    public function toggleActive(Asset3d $asset3d)
    {
        $asset3d->update([
            'is_active' => !$asset3d->is_active
        ]);

        return redirect()
            ->route('admin.assets3d.index')
            ->with('success', 'Estado del asset actualizado');
    }
}
