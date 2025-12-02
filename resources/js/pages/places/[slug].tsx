import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { login, register } from '@/routes';
import { type SharedData } from '@/types';

interface PlaceImage {
    id: number;
    title: string | null;
    image_path: string;
    description: string | null;
    is_main: boolean;
    is_active: boolean;
    sort_order: number;
}

interface Place {
    id: number;
    title: string;
    slug: string;
    short_description: string;
    description: string;
    thumbnail: string | null;
    main_360_image: string | null;
    is_available: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    active_images: PlaceImage[];
}

interface PlaceShowProps extends SharedData {
    place: Place;
    canRegister?: boolean;
}

export default function PlaceShow({ place, canRegister = true }: PlaceShowProps) {
    const { auth } = usePage<SharedData>().props;
    const [menuOpen, setMenuOpen] = useState(false);

    const placeholderImage = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80&auto=format&fit=crop";

    const mainImage = place.thumbnail
        ? `/storage/${place.thumbnail}`
        : place.active_images.find(img => img.is_main)?.image_path
            ? `/storage/${place.active_images.find(img => img.is_main)?.image_path}`
            : placeholderImage;

    // Mock rating data (you can replace with real data later)
    const rating = place.rating || 4.6;
    const reviewsCount = place.reviews_count || Math.floor(Math.random() * 200) + 50;

    return (
        <div className="min-h-screen bg-neutral-900 text-white" style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto" }}>
            <Head title={`${place.title} - Caraparí Turismo`} />

            {/* Navigation */}
            <nav className="fixed left-0 right-0 top-0 z-40 bg-neutral-900/60 backdrop-blur-sm">
                <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-2xl font-extrabold tracking-tight hover:text-amber-400 transition-colors">CARAPARÍ</Link>
                        <div className="hidden items-center gap-3 text-sm text-neutral-300 ml-6 md:flex">
                            <a href="/#tours" className="hover:text-white">Tours</a>
                            <a href="/#vr-tours" className="hover:text-white">VR Tours</a>
                            <a href="/#places" className="hover:text-white">Lugares</a>
                            <a href="/#faq" className="hover:text-white">Preguntas</a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        {!auth.user ? (
                            <>
                                <Link href={login()} className="text-sm text-neutral-300 hover:text-white">Iniciar sesión</Link>
                                {canRegister && <Link href={register()} className="rounded-md bg-amber-500 px-3 py-1 text-sm font-medium text-black">Registro</Link>}
                            </>
                        ) : (
                            <div className="relative">
                                <button onClick={() => setMenuOpen((s) => !s)} className="flex items-center gap-2">
                                    <div className="h-8 w-8 overflow-hidden rounded-full bg-neutral-700">
                                        <img src={auth.user.avatar ? `/storage/${auth.user.avatar}` : '/images/default-avatar.png'} alt="avatar" className="h-full w-full object-cover" />
                                    </div>
                                    <div className="text-sm text-neutral-300 hidden md:block">{auth.user.name}</div>
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-2 w-40 rounded bg-neutral-800/90 p-2 shadow-lg">
                                        <Link href="/settings/profile" className="block px-2 py-1 text-sm text-neutral-200 hover:bg-neutral-700 rounded">Perfil</Link>
                                        <Link href="/dashboard" className="block px-2 py-1 text-sm text-neutral-200 hover:bg-neutral-700 rounded">Dashboard</Link>
                                        <Link method="post" href="/logout" as="button" className="mt-2 w-full rounded bg-red-600 px-3 py-1 text-sm font-medium text-white">Cerrar sesión</Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <div className="pt-20">
                {/* Hero Section */}
                <section className="relative">
                    <div className="mx-auto max-w-6xl px-6 py-12">
                        {/* Back Button */}
                        <div className="mb-8">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Volver al inicio
                            </Link>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                            {/* Left Content - Title and Info */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Main Title */}
                                <div>
                                    <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
                                        {place.title}
                                    </h1>

                                    {/* Rating and Reviews */}
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-amber-400' : 'text-neutral-600'}`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-xl font-semibold text-amber-400">{rating}</span>
                                        </div>
                                        <div className="text-neutral-300">
                                            <span className="text-lg">{reviewsCount} reseñas</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="prose prose-lg prose-invert max-w-none">
                                    <p className="text-neutral-300 text-lg leading-relaxed">
                                        {place.description}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                    <button
                                        onClick={() => {
                                            // Prioridad: main_360_image > imagen marcada como principal > primera imagen disponible
                                            const imagePath = place.main_360_image ||
                                                place.active_images.find(img => img.is_main)?.image_path ||
                                                place.active_images[0]?.image_path;

                                            if (imagePath) {
                                                router.get('/vr', { image: `/storage/${imagePath}` });
                                            } else {
                                                alert('No hay imágenes 360° disponibles para este lugar');
                                            }
                                        }}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Explorar
                                    </button>

                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 px-6 py-4 text-neutral-300 hover:text-white transition-colors"
                                    >
                                        Ver más lugares
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>

                            {/* Right Content - Main Image */}
                            <div className="lg:col-span-1">
                                <div className="relative group">
                                    <img
                                        src={mainImage}
                                        alt={place.title}
                                        className="w-full h-96 object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = placeholderImage;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Images Gallery */}
                {place.active_images.length > 0 && (
                    <section className="mx-auto max-w-6xl px-6 py-16">
                        <h2 className="text-3xl font-bold mb-8 text-center">Galería de Imágenes 360°</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {place.active_images.map((image, index) => (
                                <div
                                    key={image.id}
                                    className="relative group cursor-pointer"
                                    onClick={() => router.get('/vr', { image: `/storage/${image.image_path}` })}
                                >
                                    <div className="relative overflow-hidden rounded-xl bg-neutral-800">
                                        <img
                                            src={`/storage/${image.image_path}`}
                                            alt={image.title || `${place.title} - Imagen ${index + 1}`}
                                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = placeholderImage;
                                            }}
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 group-hover:opacity-80 transition-opacity duration-300"></div>

                                        {/* Play Icon */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-amber-500/90 text-black rounded-full p-3">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Main Badge */}
                                        {image.is_main && (
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-amber-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                                                    Principal
                                                </span>
                                            </div>
                                        )}

                                        {/* Title */}
                                        {image.title && (
                                            <div className="absolute bottom-3 left-3 right-3">
                                                <p className="bg-black/70 text-white text-sm px-3 py-1 rounded-lg truncate">
                                                    {image.title}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="mt-20 border-t border-neutral-800/60 bg-neutral-900/80">
                    <div className="mx-auto max-w-6xl px-6 py-10">
                        <div className="text-center">
                            <div className="text-xl font-bold mb-2">CARAPARÍ</div>
                            <div className="text-sm text-neutral-400">
                                © {new Date().getFullYear()} CARAPARÍ — Turismo. Todos los derechos reservados.
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
