<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $places = [
            [
                'title' => 'Plaza Principal de Carapari',
                'slug' => 'plaza-principal-carapari',
                'short_description' => 'El corazón de la ciudad donde se reúnen locales y turistas.',
                'description' => 'La Plaza Principal de Carapari es el centro neurálgico de la ciudad, rodeada de edificios coloniales y modernas construcciones. Es un lugar perfecto para relajarse y observar la vida cotidiana de los habitantes locales.',
                'is_available' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Mirador del Cerro',
                'slug' => 'mirador-del-cerro',
                'short_description' => 'Vista panorámica espectacular de toda la región.',
                'description' => 'Desde el Mirador del Cerro se puede apreciar una vista panorámica impresionante de Carapari y sus alrededores. Es especialmente hermoso durante el atardecer, cuando el cielo se tiñe de colores dorados y rojizos.',
                'is_available' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Iglesia Colonial San José',
                'slug' => 'iglesia-colonial-san-jose',
                'short_description' => 'Hermosa iglesia colonial con arquitectura tradicional.',
                'description' => 'La Iglesia Colonial San José es un ejemplo magnífico de la arquitectura colonial española en la región. Sus muros de adobe y su campanario son testigos de siglos de historia y tradición religiosa.',
                'is_available' => true,
                'sort_order' => 3,
            ],
            [
                'title' => 'Mercado Tradicional',
                'slug' => 'mercado-tradicional',
                'short_description' => 'Mercado local con productos típicos de la región.',
                'description' => 'El Mercado Tradicional de Carapari es el lugar perfecto para conocer los productos locales, desde frutas y verduras frescas hasta artesanías típicas de la región. Un lugar lleno de color, aromas y tradición.',
                'is_available' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($places as $placeData) {
            \App\Models\Place::create($placeData);
        }
    }
}
