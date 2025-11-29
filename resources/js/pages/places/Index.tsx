import React from 'react';
import { Head, Link } from '@inertiajs/react';

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
       main_image?: {
              id: number;
              image_path: string;
              title: string | null;
       } | null;
}

interface PlacesIndexProps {
       places: Place[];
}

export default function PlacesIndex({ places }: PlacesIndexProps) {
       const placeholderImage = "/images/placeholder-place.jpg";

       return (
              <div className="min-h-screen bg-gray-100">
                     <Head title="Lugares Turísticos - Carapari" />

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
                                   <div className="text-center mb-12">
                                          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                                                 Descubre Carapari
                                          </h1>
                                          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                                 Explora los lugares más hermosos y representativos de nuestra ciudad.
                                                 Cada lugar cuenta una historia única que te está esperando.
                                          </p>
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                          {places.map((place) => (
                                                 <PlaceCard key={place.id} place={place} placeholderImage={placeholderImage} />
                                          ))}
                                   </div>

                                   {places.length === 0 && (
                                          <div className="text-center py-12">
                                                 <div className="text-gray-400 text-6xl mb-4">🏝️</div>
                                                 <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                                        Próximamente...
                                                 </h3>
                                                 <p className="text-gray-600">
                                                        Estamos preparando los mejores lugares turísticos para ti.
                                                 </p>
                                          </div>
                                   )}
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

interface PlaceCardProps {
       place: Place;
       placeholderImage: string;
}

function PlaceCard({ place, placeholderImage }: PlaceCardProps) {
       const imageUrl = place.thumbnail
              ? `/storage/${place.thumbnail}`
              : place.main_image?.image_path
                     ? `/storage/${place.main_image.image_path}`
                     : placeholderImage;

       return (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                     <div className="relative h-64 overflow-hidden">
                            <img
                                   src={imageUrl}
                                   alt={place.title}
                                   className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                   onError={(e) => {
                                          (e.target as HTMLImageElement).src = placeholderImage;
                                   }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                     </div>

                     <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                   {place.title}
                            </h3>

                            <p className="text-gray-600 mb-4 line-clamp-3">
                                   {place.short_description}
                            </p>

                            <div className="flex items-center justify-between">
                                   <a
                                          href={`/places/${place.slug}`}
                                          className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                                   >
                                          Explorar
                                          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                   </a>

                                   {place.main_image && (
                                          <a
                                                 href={`/vr?image=${encodeURIComponent(`/storage/${place.main_image.image_path}`)}`}
                                                 className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                                                 title="Vista 360°"
                                          >
                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                 </svg>
                                          </a>
                                   )}
                            </div>
                     </div>
              </div>
       );
}