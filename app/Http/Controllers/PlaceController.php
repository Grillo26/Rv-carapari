<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlaceController extends Controller
{
    /**
     * Display a listing of available places.
     */
    public function index()
    {
        $places = Place::available()
            ->with(['mainImage'])
            ->ordered()
            ->get();

        return Inertia::render('Places/Index', [
            'places' => $places,
        ]);
    }

    /**
     * Display the specified place.
     */
    public function show($slug)
    {
        $place = Place::where('slug', $slug)
            ->available()
            ->with(['activeImages' => function ($query) {
                $query->ordered();
            }])
            ->firstOrFail();

        return Inertia::render('Places/Show', [
            'place' => $place,
        ]);
    }
}
