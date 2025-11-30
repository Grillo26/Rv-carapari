import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit, Trash2, Plus, MapPin, Calendar, Images, ToggleLeft, ToggleRight, Search, Filter } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

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
       const [searchTerm, setSearchTerm] = useState('');
       const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'hidden'>('all');
       const [deleteModal, setDeleteModal] = useState<{
              isOpen: boolean;
              place: Place | null;
              isDeleting: boolean;
       }>({
              isOpen: false,
              place: null,
              isDeleting: false
       });

       // Filtrar lugares según búsqueda y estado
       const filteredPlaces = places.data.filter(place => {
              const matchesSearch = place.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     place.short_description.toLowerCase().includes(searchTerm.toLowerCase());

              const matchesFilter = filterStatus === 'all' ||
                     (filterStatus === 'available' && place.is_available) ||
                     (filterStatus === 'hidden' && !place.is_available);

              return matchesSearch && matchesFilter;
       });

       const handleToggleAvailability = (place: Place) => {
              router.patch(`/admin/places/${place.id}/toggle-availability`, {}, {
                     preserveState: true,
                     preserveScroll: true,
              });
       };

       const handleDeleteClick = (place: Place) => {
              setDeleteModal({
                     isOpen: true,
                     place,
                     isDeleting: false
              });
       };

       const handleDeleteConfirm = () => {
              if (!deleteModal.place) return;

              setDeleteModal(prev => ({ ...prev, isDeleting: true }));

              router.delete(`/admin/places/${deleteModal.place.id}`, {
                     onSuccess: () => {
                            setDeleteModal({ isOpen: false, place: null, isDeleting: false });
                     },
                     onError: () => {
                            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
                     }
              });
       };

       const handleDeleteCancel = () => {
              setDeleteModal({ isOpen: false, place: null, isDeleting: false });
       };

       return (
              <AppLayout breadcrumbs={[
                     { title: 'Dashboard', href: '/dashboard' },
                     { title: 'Lugares Turísticos', href: '/admin/places' }
              ]}>
                     <Head title="Admin - Lugares Turísticos" />

                     <div className="p-6">
                            {/* Header */}
                            <div className="mb-8">
                                   <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                          <div>
                                                 <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                        <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                                        Gestión de Lugares Turísticos
                                                 </h1>
                                                 <p className="mt-2 text-gray-600 dark:text-gray-400">
                                                        Administra los destinos turísticos con experiencias 360°
                                                 </p>
                                          </div>
                                          <Link
                                                 href="/admin/places/create"
                                                 className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-gray-900/50"
                                          >
                                                 <Plus className="h-5 w-5" />
                                                 Agregar Lugar
                                          </Link>
                                   </div>

                                   {/* Stats Cards */}
                                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                                                 <div className="flex items-center justify-between">
                                                        <div>
                                                               <p className="text-sm font-medium text-blue-100">Total Lugares</p>
                                                               <p className="text-2xl font-bold">{places.meta?.total || 0}</p>
                                                        </div>
                                                        <MapPin className="h-8 w-8 text-blue-200" />
                                                 </div>
                                          </div>

                                          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                                                 <div className="flex items-center justify-between">
                                                        <div>
                                                               <p className="text-sm font-medium text-green-100">Disponibles</p>
                                                               <p className="text-2xl font-bold">
                                                                      {places.data.filter(p => p.is_available).length}
                                                               </p>
                                                        </div>
                                                        <Eye className="h-8 w-8 text-green-200" />
                                                 </div>
                                          </div>

                                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                                                 <div className="flex items-center justify-between">
                                                        <div>
                                                               <p className="text-sm font-medium text-orange-100">Ocultos</p>
                                                               <p className="text-2xl font-bold">
                                                                      {places.data.filter(p => !p.is_available).length}
                                                               </p>
                                                        </div>
                                                        <ToggleLeft className="h-8 w-8 text-orange-200" />
                                                 </div>
                                          </div>

                                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                                                 <div className="flex items-center justify-between">
                                                        <div>
                                                               <p className="text-sm font-medium text-purple-100">Total Imágenes</p>
                                                               <p className="text-2xl font-bold">
                                                                      {places.data.reduce((sum, p) => sum + (p.images_count || 0), 0)}
                                                               </p>
                                                        </div>
                                                        <Images className="h-8 w-8 text-purple-200" />
                                                 </div>
                                          </div>
                                   </div>
                            </div>

                            {/* Filters and Search */}
                            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4">
                                   <div className="flex flex-col md:flex-row md:items-center gap-4">
                                          {/* Search */}
                                          <div className="flex-1 relative">
                                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                                 </div>
                                                 <input
                                                        type="text"
                                                        placeholder="Buscar lugares..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                                 />
                                          </div>

                                          {/* Filter */}
                                          <div className="flex items-center gap-2">
                                                 <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                 <select
                                                        value={filterStatus}
                                                        onChange={(e) => setFilterStatus(e.target.value as 'all' | 'available' | 'hidden')}
                                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                                 >
                                                        <option value="all">Todos los estados</option>
                                                        <option value="available">Disponibles</option>
                                                        <option value="hidden">Ocultos</option>
                                                 </select>
                                          </div>
                                   </div>
                            </div>

                            {/* Content */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50">
                                   {filteredPlaces.length === 0 ? (
                                          <EmptyState
                                                 searchTerm={searchTerm}
                                                 filterStatus={filterStatus}
                                                 totalPlaces={places.data.length}
                                          />
                                   ) : (
                                          <div className="p-6">
                                                 <div className="grid gap-6">
                                                        {filteredPlaces.map((place) => (
                                                               <PlaceCard
                                                                      key={place.id}
                                                                      place={place}
                                                                      onToggleAvailability={() => handleToggleAvailability(place)}
                                                                      onDelete={() => handleDeleteClick(place)}
                                                               />
                                                        ))}
                                                 </div>

                                                 {/* Pagination */}
                                                 {places.meta && places.meta.total > places.meta.per_page && (
                                                        <div className="mt-8 flex justify-center">
                                                               <div className="flex space-x-1">
                                                                      {places.links.map((link: any, index: number) => (
                                                                             <button
                                                                                    key={index}
                                                                                    onClick={() => link.url && router.get(link.url)}
                                                                                    disabled={!link.url}
                                                                                    className={`px-4 py-2 text-sm rounded-md transition-all ${link.active
                                                                                           ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                                                                                           : link.url
                                                                                                  ? 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
                                                                                                  : 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                                                                                           }`}
                                                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                                             />
                                                                      ))}
                                                               </div>
                                                        </div>
                                                 )}
                                          </div>
                                   )}
                            </div>
                     </div>

                     {/* Delete Modal */}
                     <ConfirmDeleteModal
                            isOpen={deleteModal.isOpen}
                            onClose={handleDeleteCancel}
                            onConfirm={handleDeleteConfirm}
                            title="Eliminar Lugar Turístico"
                            message="¿Estás seguro de que deseas eliminar este lugar turístico? Se eliminarán también todas las imágenes 360° asociadas."
                            itemName={deleteModal.place?.title || ''}
                            isDeleting={deleteModal.isDeleting}
                     />
              </AppLayout>
       );
}

interface EmptyStateProps {
       searchTerm: string;
       filterStatus: string;
       totalPlaces: number;
}

function EmptyState({ searchTerm, filterStatus, totalPlaces }: EmptyStateProps) {
       if (totalPlaces === 0) {
              return (
                     <div className="text-center py-16">
                            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🏝️</div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                   No hay lugares registrados
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                                   Comienza agregando el primer lugar turístico para mostrar experiencias 360°
                            </p>
                            <Link
                                   href="/admin/places/create"
                                   className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-all"
                            >
                                   <Plus className="h-5 w-5" />
                                   Agregar Primer Lugar
                            </Link>
                     </div>
              );
       }

       return (
              <div className="text-center py-16">
                     <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔍</div>
                     <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No se encontraron lugares
                     </h3>
                     <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {searchTerm ? `No hay lugares que coincidan con "${searchTerm}"` :
                                   `No hay lugares ${filterStatus === 'available' ? 'disponibles' : 'ocultos'}`}
                     </p>
                     <button
                            onClick={() => {
                                   // Reset filters logic could go here
                                   window.location.reload();
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                     >
                            Limpiar filtros
                     </button>
              </div>
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
              <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 transition-all duration-300 overflow-hidden">
                     <div className="flex flex-col lg:flex-row">
                            {/* Image Section */}
                            <div className="lg:w-80 flex-shrink-0">
                                   <div className="relative h-48 lg:h-full">
                                          <img
                                                 src={imageUrl}
                                                 alt={place.title}
                                                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                 onError={(e) => {
                                                        (e.target as HTMLImageElement).src = placeholderImage;
                                                 }}
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                                          {/* Status Badge */}
                                          <div className="absolute top-4 left-4">
                                                 <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${place.is_available
                                                        ? 'bg-green-100/90 dark:bg-green-900/90 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
                                                        : 'bg-red-100/90 dark:bg-red-900/90 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
                                                        }`}>
                                                        {place.is_available ? '✓ Disponible' : '✕ Oculto'}
                                                 </span>
                                          </div>

                                          {/* Image Count Badge */}
                                          {(place.images_count || 0) > 0 && (
                                                 <div className="absolute bottom-4 right-4">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 backdrop-blur-sm border border-white/20 dark:border-gray-600/20">
                                                               <Images className="h-3 w-3" />
                                                               {place.images_count}
                                                        </span>
                                                 </div>
                                          )}
                                   </div>
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 p-6">
                                   <div className="flex flex-col h-full">
                                          <div className="flex-1">
                                                 {/* Title and URL */}
                                                 <div className="mb-3">
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                               {place.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded mt-1 inline-block">
                                                               /{place.slug}
                                                        </p>
                                                 </div>

                                                 {/* Description */}
                                                 <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                                                        {place.short_description}
                                                 </p>

                                                 {/* Meta Information */}
                                                 <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-6">
                                                        <div className="flex items-center gap-1">
                                                               <Calendar className="h-3 w-3" />
                                                               <span>Orden: {place.sort_order}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                               <Images className="h-3 w-3" />
                                                               <span>Imágenes 360°: {place.images_count || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                               <Calendar className="h-3 w-3" />
                                                               <span>Creado: {new Date(place.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Action Buttons */}
                                          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                 <Link
                                                        href={`/places/${place.slug}`}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg font-medium text-sm transition-colors"
                                                 >
                                                        <Eye className="h-4 w-4" />
                                                        Ver Público
                                                 </Link>

                                                 <Link
                                                        href={`/admin/places/${place.id}/edit`}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg font-medium text-sm transition-colors"
                                                 >
                                                        <Edit className="h-4 w-4" />
                                                        Editar
                                                 </Link>

                                                 <Link
                                                        href={`/admin/places/${place.id}/images`}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg font-medium text-sm transition-colors"
                                                 >
                                                        <Images className="h-4 w-4" />
                                                        Imágenes 360°
                                                 </Link>

                                                 <button
                                                        onClick={onToggleAvailability}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-lg font-medium text-sm transition-colors"
                                                 >
                                                        {place.is_available ? (
                                                               <>
                                                                      <ToggleLeft className="h-4 w-4" />
                                                                      Ocultar
                                                               </>
                                                        ) : (
                                                               <>
                                                                      <ToggleRight className="h-4 w-4" />
                                                                      Mostrar
                                                               </>
                                                        )}
                                                 </button>

                                                 <button
                                                        onClick={onDelete}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg font-medium text-sm transition-colors"
                                                 >
                                                        <Trash2 className="h-4 w-4" />
                                                        Eliminar
                                                 </button>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </div>
       );
}