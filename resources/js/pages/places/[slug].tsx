import { Head, Link, router } from '@inertiajs/react';

const PLACE_LIST = [
    { title: 'Catedral', slug: 'catedral', img: '/images/panoramas/imagekkk.jpg', description: 'La imponente catedral histórica en el corazón de Caraparí.', rating: 4.8, reviews: 230 },
    { title: 'Plaza Principal', slug: 'plaza-principal', img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1800&q=80&auto=format&fit=crop', description: 'Punto de encuentro con vida, ferias y actividades culturales.', rating: 4.6, reviews: 142 },
    { title: 'Mercado Central', slug: 'mercado-central', img: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1800&q=80&auto=format&fit=crop', description: 'Sabores locales y artesanías en un ambiente tradicional.', rating: 4.4, reviews: 98 },
    { title: 'Plaza Moto Méndez', slug: 'plaza-moto-mendez', img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=1200&q=80&auto=format&fit=crop', description: 'Espacio moderno ideal para eventos al aire libre.', rating: 4.2, reviews: 64 },
    { title: 'Avenida Canal', slug: 'avenida-canal', img: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=1200&q=80&auto=format&fit=crop', description: 'Paseo arbolado y comercios locales con mucho encanto.', rating: 4.3, reviews: 77 },
    { title: 'Catedral (Antigua)', slug: 'catedral-antigua', img: 'https://images.unsplash.com/photo-1498550744923-4a5c0c7b8f3f?w=1200&q=80&auto=format&fit=crop', description: 'Otra vista histórica de la catedral y sus alrededores.', rating: 4.5, reviews: 55 },
];

export default function PlaceDetail({ slug }: { slug: string }) {
    const place = PLACE_LIST.find((p) => p.slug === slug);
    if (!place) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
                <Head title="Lugar no encontrado" />
                <h1 className="text-3xl font-bold mb-4">Lugar no encontrado</h1>
                <Link href="/" className="text-amber-400 underline">Volver al inicio</Link>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            <Head title={place.title + ' — Caraparí'} />
            <div className="mx-auto max-w-3xl px-4 py-12">
                <img src={place.img} alt={place.title} className="w-full h-64 object-cover rounded-lg mb-6" />
                <h1 className="text-4xl font-extrabold mb-2">{place.title}</h1>
                <div className="mb-4 text-neutral-400">{place.rating} ★ • {place.reviews} reseñas</div>
                <p className="mb-8 text-lg text-neutral-200">{place.description}</p>
                <div className="flex gap-4">
                    <Link href="/" className="rounded bg-amber-500 px-4 py-2 text-black font-semibold hover:bg-amber-400 transition">Volver al inicio</Link>
                    <button onClick={() => router.get('/vr', { image: place.img })} className="rounded bg-amber-500 px-4 py-2 text-black font-semibold hover:bg-amber-400 transition">Explorar</button>
                </div>
            </div>
        </div>
    );
}

// SSR/route param support for Inertia
PlaceDetail.layout = (page: any) => page;
PlaceDetail.getInitialProps = ({ params }: any) => ({ slug: params.slug });
