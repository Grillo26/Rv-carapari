import { Head, Link, router } from '@inertiajs/react';

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

interface PlaceShowProps {
    place: Place;
}

export default function PlaceShow({ place }: PlaceShowProps) {
    const placeholderImage = "/images/placeholder-place.jpg";

    const mainImage = place.thumbnail
        ? `/storage/${place.thumbnail}`
        : place.active_images.find(img => img.is_main)?.image_path
            ? `/storage/${place.active_images.find(img => img.is_main)?.image_path}`
            : placeholderImage;

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title={`${place.title} - Lugares Turísticos`} />

            {/* Navigation */}
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link
                                href="/"
                                className="text-xl font-bold text-gray-900 hover:text-blue-600"
                            >
                                Carapari Turismo
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Inicio
                            </Link>
                            <Link
                                href="/places"
                                className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Lugares
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/places"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Volver a lugares
                        </Link>

                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            {place.title}
                        </h1>

                        <p className="text-xl text-gray-600 max-w-3xl">
                            {place.short_description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Main Image */}
                        <div className="relative">
                            <img
                                src={mainImage}
                                alt={place.title}
                                className="w-full h-96 object-cover rounded-2xl shadow-lg"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = placeholderImage;
                                }}
                            />

                            {/* VR Button Overlay */}
                            {place.active_images.length > 0 && (
                                <div className="absolute bottom-4 right-4">
                                    <button
                                        onClick={() => {
                                            const mainImagePath = place.active_images.find(img => img.is_main)?.image_path ||
                                                place.active_images[0]?.image_path;
                                            if (mainImagePath) {
                                                router.get('/vr', { image: `/storage/${mainImagePath}` });
                                            }
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Vista 360°
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
                            <div className="prose prose-lg text-gray-700">
                                {place.description.split('\n').map((paragraph, index) => (
                                    <p key={index} className="mb-4">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 360° Images Gallery */}
                    {place.active_images.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Galería 360°</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {place.active_images.map((image) => (
                                    <div
                                        key={image.id}
                                        className="relative group cursor-pointer"
                                        onClick={() => router.get('/vr', { image: `/storage/${image.image_path}` })}
                                    >
                                        <img
                                            src={`/storage/${image.image_path}`}
                                            alt={image.title || place.title}
                                            className="w-full h-48 object-cover rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                                        />

                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                                            <div className="text-white text-center">
                                                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <p className="font-medium">Ver en 360°</p>
                                            </div>
                                        </div>

                                        {image.is_main && (
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                    Principal
                                                </span>
                                            </div>
                                        )}

                                        {image.title && (
                                            <div className="absolute bottom-3 left-3 right-3">
                                                <p className="bg-black/70 text-white text-sm px-3 py-1 rounded-lg truncate">
                                                    {image.title}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="text-center">
                        <Link
                            href="/places"
                            className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 mr-4"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Ver más lugares
                        </Link>

                        <Link
                            href="/"
                            className="inline-flex items-center px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Inicio
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-sm">
                            © 2025 Carapari Turismo. Descubre la belleza de nuestra ciudad.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
