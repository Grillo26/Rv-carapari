import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

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
       images_count?: number;
       main_image?: {
              id: number;
              image_path: string;
              title: string | null;
       } | null;
}

interface PlacesIndexProps {
       places: {
              data: Place[];
              links: any;
              meta: any;
       };
}

export default function PlacesIndex({ places }: PlacesIndexProps) {
       const handleToggleAvailability = (place: Place) => {
              router.patch(`/admin/places/${place.id}/toggle-availability`, {}, {
                     preserveState: true,
                     preserveScroll: true,
              });
       };

       const handleDelete = (place: Place) => {
              if (confirm(`¿Estás seguro de eliminar el lugar "${place.title}"? Esta acción no se puede deshacer.`)) {
                     router.delete(`/admin/places/${place.id}`, {
                            preserveState: true,
                     });
              }
       };

       return (
              <AppLayout breadcrumbs={[
                     { title: 'Dashboard', href: '/dashboard' },
                     { title: 'Lugares Turísticos', href: '/admin/places' }
              ]}>
                     <Head title="Admin - Lugares Turísticos" />

                     <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                   <h1 className="text-2xl font-bold text-gray-900">
                                          Gestión de Lugares Turísticos
                                   </h1>
                                   <Link
                                          href="/admin/places/create"
                                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                   >
                                          Agregar Lugar
                                   </Link>
                            </div>

                            <div className="py-0">
                                   <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                                          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                                 <div className="p-6">
                                                        {places.data.length === 0 ? (
                                                               <div className="text-center py-12">
                                                                      <div className="text-gray-400 text-6xl mb-4">🏝️</div>
                                                                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                                             No hay lugares registrados
                                                                      </h3>
                                                                      <p className="text-gray-500 mb-6">
                                                                             Comienza agregando el primer lugar turístico
                                                                      </p>
                                                                      <Link
                                                                             href="/admin/places/create"
                                                                             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                                                      >
                                                                             Agregar Lugar
                                                                      </Link>
                                                               </div>
                                                        ) : (
                                                               <div className="grid gap-6">
                                                                      {places.data.map((place) => (
                                                                             <PlaceCard
                                                                                    key={place.id}
                                                                                    place={place}
                                                                                    onToggleAvailability={() => handleToggleAvailability(place)}
                                                                                    onDelete={() => handleDelete(place)}
                                                                             />
                                                                      ))}
                                                               </div>
                                                        )}

                                                        {/* Pagination */}
                                                        {places.meta && places.meta.total > places.meta.per_page && (
                                                               <div className="mt-6 flex justify-center">
                                                                      <div className="flex space-x-1">
                                                                             {places.links.map((link: any, index: number) => (
                                                                                    <button
                                                                                           key={index}
                                                                                           onClick={() => link.url && router.get(link.url)}
                                                                                           disabled={!link.url}
                                                                                           className={`px-3 py-2 text-sm rounded-md ${link.active
                                                                                                  ? 'bg-blue-600 text-white'
                                                                                                  : link.url
                                                                                                         ? 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                                                                                                         : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                                                                  }`}
                                                                                           dangerouslySetInnerHTML={{ __html: link.label }}
                                                                                    />
                                                                             ))}
                                                                      </div>
                                                               </div>
                                                        )}
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </AppLayout>
       );
}

interface PlaceCardProps {
       place: Place;
       onToggleAvailability: () => void;
       onDelete: () => void;
}

function PlaceCard({ place, onToggleAvailability, onDelete }: PlaceCardProps) {
       const placeholderImage = "/images/placeholder-place.jpg";
       const imageUrl = place.thumbnail
              ? `/storage/${place.thumbnail}`
              : place.main_image?.image_path
                     ? `/storage/${place.main_image.image_path}`
                     : placeholderImage;

       return (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                     <div className="flex items-start space-x-6">
                            {/* Image */}
                            <div className="flex-shrink-0">
                                   <img
                                          src={imageUrl}
                                          alt={place.title}
                                          className="w-24 h-24 object-cover rounded-lg"
                                          onError={(e) => {
                                                 (e.target as HTMLImageElement).src = placeholderImage;
                                          }}
                                   />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                   <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                                 <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                        {place.title}
                                                 </h3>
                                                 <p className="text-sm text-gray-500 mb-2">/{place.slug}</p>
                                                 <p className="text-sm text-gray-700 line-clamp-2">
                                                        {place.short_description}
                                                 </p>
                                          </div>

                                          {/* Status Badge */}
                                          <div className="ml-4">
                                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${place.is_available
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {place.is_available ? 'Disponible' : 'No disponible'}
                                                 </span>
                                          </div>
                                   </div>

                                   {/* Stats */}
                                   <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                          <span>Orden: {place.sort_order}</span>
                                          <span>•</span>
                                          <span>Imágenes: {place.images_count || 0}</span>
                                          <span>•</span>
                                          <span>Creado: {new Date(place.created_at).toLocaleDateString()}</span>
                                   </div>

                                   {/* Actions */}
                                   <div className="flex items-center space-x-2 mt-4">
                                          <Link
                                                 href={`/admin/places/${place.id}`}
                                                 className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                          >
                                                 Ver
                                          </Link>
                                          <span className="text-gray-300">|</span>
                                          <Link
                                                 href={`/admin/places/${place.id}/edit`}
                                                 className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                          >
                                                 Editar
                                          </Link>
                                          <span className="text-gray-300">|</span>
                                          <Link
                                                 href={`/admin/places/${place.id}/images`}
                                                 className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                          >
                                                 Imágenes 360°
                                          </Link>
                                          <span className="text-gray-300">|</span>
                                          <button
                                                 onClick={onToggleAvailability}
                                                 className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                                          >
                                                 {place.is_available ? 'Ocultar' : 'Mostrar'}
                                          </button>
                                          <span className="text-gray-300">|</span>
                                          <button
                                                 onClick={onDelete}
                                                 className="text-red-600 hover:text-red-700 text-sm font-medium"
                                          >
                                                 Eliminar
                                          </button>
                                   </div>
                            </div>
                     </div>
              </div>
       );
}