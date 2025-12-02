<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Place;

class PlacesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $places = [
            [
                'title' => 'Catedral de Caraparí',
                'slug' => 'catedral-carapari',
                'short_description' => 'La imponente catedral histórica en el corazón de Caraparí.',
                'description' => 'La catedral de Caraparí es una joya arquitectónica que representa siglos de historia y tradición. Su imponente estructura se alza majestuosa en el centro de la ciudad, siendo testigo silencioso del paso del tiempo y de las generaciones que han encontrado refugio espiritual en sus muros. Las torres gemelas que coronan su fachada principal son visibles desde varios puntos de la ciudad, convirtiéndola en un punto de referencia tanto físico como espiritual para los habitantes y visitantes.',
                'is_available' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Plaza Principal',
                'slug' => 'plaza-principal',
                'short_description' => 'Punto de encuentro con vida, ferias y actividades culturales.',
                'description' => 'La Plaza Principal de Caraparí es el corazón latiente de la ciudad, un espacio donde convergen la historia, la cultura y la vida social cotidiana. Rodeada de edificios coloniales y republicanos, esta plaza ha sido testigo de importantes eventos históricos y continúa siendo el escenario de celebraciones, ferias artesanales y actividades culturales. Los jardines cuidadosamente mantenidos y la fuente central crean un ambiente acogedor para lugareños y turistas.',
                'is_available' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Mercado Central',
                'slug' => 'mercado-central',
                'short_description' => 'Sabores locales y artesanías en un ambiente tradicional.',
                'description' => 'El Mercado Central es una explosión de colores, aromas y sabores que representa la esencia gastronómica y artesanal de Caraparí. En sus pasillos se pueden encontrar productos frescos de la región, desde frutas tropicales hasta especias locales, así como artesanías únicas elaboradas por artistas locales. Es el lugar perfecto para experimentar la cultura local de manera auténtica y llevarse un pedazo de Caraparí a casa.',
                'is_available' => true,
                'sort_order' => 3,
            ],
            [
                'title' => 'Plaza Moto Méndez',
                'slug' => 'plaza-moto-mendez',
                'short_description' => 'Espacio moderno ideal para eventos al aire libre.',
                'description' => 'La Plaza Moto Méndez representa la cara moderna de Caraparí, un espacio diseñado para albergar eventos culturales, conciertos y actividades comunitarias. Su diseño contemporáneo contrasta armoniosamente con la arquitectura tradicional de la ciudad, ofreciendo un ambiente versátil que se adapta tanto a celebraciones multitudinarias como a momentos de contemplación individual.',
                'is_available' => true,
                'sort_order' => 4,
            ],
            [
                'title' => 'Avenida Canal',
                'slug' => 'avenida-canal',
                'short_description' => 'Paseo arbolado y comercios locales con mucho encanto.',
                'description' => 'La Avenida Canal es una arteria vital de Caraparí que combina la funcionalidad urbana con el encanto paisajístico. Sus aceras amplias y arboledas proporcionan sombra natural para los paseantes, mientras que los comercios locales que flanquean la avenida ofrecen una variedad de productos y servicios. Es el lugar ideal para un paseo tranquilo, hacer compras o simplemente observar el ritmo de vida de la ciudad.',
                'is_available' => true,
                'sort_order' => 5,
            ],
            [
                'title' => 'Mirador Cerro Verde',
                'slug' => 'mirador-cerro-verde',
                'short_description' => 'Vista panorámica espectacular de toda la ciudad.',
                'description' => 'El Mirador Cerro Verde ofrece la vista más espectacular de Caraparí y sus alrededores. Desde esta elevación natural, los visitantes pueden apreciar la extensión completa de la ciudad, sus barrios, la disposición de sus calles principales y la belleza del paisaje circundante. Es especialmente popular durante el atardecer, cuando el cielo se tiñe de colores cálidos y la ciudad se prepara para la noche.',
                'is_available' => true,
                'sort_order' => 6,
            ],
        ];

        foreach ($places as $placeData) {
            Place::create($placeData);
        }
    }
}