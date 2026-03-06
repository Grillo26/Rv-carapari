<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Asset3d;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Asset3dController extends Controller
{
    /**
     * Display a listing of all 3D assets.
     */
    public function index()
    {
        $assets = Asset3d::paginate(10);

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
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'model_file' => 'required|file|max:102400',
            'is_active' => 'nullable|in:0,1,true,false',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        // Validar extensión .glb manualmente
        if ($request->hasFile('model_file')) {
            $extension = strtolower($request->file('model_file')->getClientOriginalExtension());
            if ($extension !== 'glb') {
                return back()->withErrors(['model_file' => 'El archivo debe ser de tipo .glb'])->withInput();
            }
        }

        $validated = $request->only(['name', 'description', 'is_active', 'sort_order']);

        // Asignar valores por defecto
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['sort_order'] = $request->integer('sort_order', 0);

        // Handle file upload
        if ($request->hasFile('model_file')) {
            $filename = Str::random(40) . '.glb';
            $modelPath = $request->file('model_file')->storeAs('3d-models', $filename, 'public');
            $validated['model_path'] = $modelPath;
        }

        // Remove model_file from validated array as it's not a database field
        unset($validated['model_file']);

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
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'model_file' => 'nullable|file|max:102400',
            'is_active' => 'nullable|in:0,1,true,false',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        // Validar extensión .glb manualmente si se sube un archivo
        if ($request->hasFile('model_file')) {
            $extension = strtolower($request->file('model_file')->getClientOriginalExtension());
            if ($extension !== 'glb') {
                return back()->withErrors(['model_file' => 'El archivo debe ser de tipo .glb'])->withInput();
            }
        }

        $validated = $request->only(['name', 'description', 'is_active', 'sort_order']);
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['sort_order'] = $request->integer('sort_order', 0);

        // Handle file upload if a new file is provided
        if ($request->hasFile('model_file')) {
            // Delete old file if exists
            if ($asset3d->model_path && Storage::disk('public')->exists($asset3d->model_path)) {
                Storage::disk('public')->delete($asset3d->model_path);
            }

            $filename = Str::random(40) . '.glb';
            $modelPath = $request->file('model_file')->storeAs('3d-models', $filename, 'public');
            $validated['model_path'] = $modelPath;
        }

        // Remove model_file from validated array as it's not a database field
        unset($validated['model_file']);

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
        // Delete the file if it exists
        if ($asset3d->model_path && Storage::disk('public')->exists($asset3d->model_path)) {
            Storage::disk('public')->delete($asset3d->model_path);
        }

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
