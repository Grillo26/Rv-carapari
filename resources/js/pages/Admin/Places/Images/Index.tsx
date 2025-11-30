import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, Edit, Trash2, Star, StarOff, ToggleLeft, ToggleRight, ArrowLeft, Upload, Camera } from 'lucide-react';
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
       images: PlaceImage[];
}

interface PlaceImage {
       id: number;
       place_id: number;
       title: string | null;
       image_path: string;
       description: string | null;
       is_main: boolean;
       is_active: boolean;
       sort_order: number;
       created_at: string;
       updated_at: string;
}

interface PlaceImagesIndexProps {
       place: Place;
}

export default function PlaceImagesIndex({ place }: PlaceImagesIndexProps) {
       const [deleteModal, setDeleteModal] = useState<{
              isOpen: boolean;
              image: PlaceImage | null;
              isDeleting: boolean;
       }>({
              isOpen: false,
              image: null,
              isDeleting: false
       });

       const handleToggleActive = (image: PlaceImage) => {
              router.patch(`/admin/places/${place.id}/images/${image.id}/toggle-active`, {}, {
                     preserveState: true,
                     preserveScroll: true,
              });
       };

       // Funcionalidad de imagen principal comentada para uso futuro
       // const handleSetAsMain = (image: PlaceImage) => {
       //     router.patch(`/admin/places/${place.id}/images/${image.id}/set-main`, {}, {
       //         preserveState: true,
       //         preserveScroll: true,
       //     });
       // };

       const handleDeleteClick = (image: PlaceImage) => {
              setDeleteModal({
                     isOpen: true,
                     image,
                     isDeleting: false
              });
       };

       const handleDeleteConfirm = () => {
              if (!deleteModal.image) return;

              setDeleteModal(prev => ({ ...prev, isDeleting: true }));

              router.delete(`/admin/places/${place.id}/images/${deleteModal.image.id}`, {
                     onSuccess: () => {
                            setDeleteModal({ isOpen: false, image: null, isDeleting: false });
                     },
                     onError: () => {
                            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
                     }
              });
       };

       const handleDeleteCancel = () => {
              setDeleteModal({ isOpen: false, image: null, isDeleting: false });
       };

       return (
              <AppLayout breadcrumbs={[
                     { title: 'Dashboard', href: '/dashboard' },
                     { title: 'Lugares Turísticos', href: '/admin/places' },
                     { title: place.title, href: `/admin/places/${place.id}` },
                     { title: 'Imágenes 360°', href: `/admin/places/${place.id}/images` }
              ]}>
                     <Head title={`Admin - Imágenes 360° de ${place.title}`} />

                     <div className="p-6">
                            {/* Header */}
                            <div className="mb-8">
                                   <div className="flex items-center gap-4 mb-4">
                                          <Link
                                                 href="/admin/places"
                                                 className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                          >
                                                 <ArrowLeft className="h-5 w-5" />
                                                 Volver a lugares
                                          </Link>
                                   </div>

                                   <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                          <div>
                                                 <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                        <Camera className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                                        Imágenes 360° - {place.title}
                                                 </h1>
                                                 <p className="mt-2 text-gray-600 dark:text-gray-400">
                                                        Gestiona las experiencias inmersivas de este lugar turístico
                                                 </p>
                                          </div>
                                          <Link
                                                 href={`/admin/places/${place.id}/images/create`}
                                                 className="mt-4 lg:mt-0 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-gray-900/50"
                                          >
                                                 <Plus className="h-5 w-5" />
                                                 Agregar Imagen 360°
                                          </Link>
                                   </div>

                                   {/* Stats Cards */}
                                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                                                 <div className="flex items-center justify-between">
                                                        <div>
                                                               <p className="text-sm font-medium text-purple-100">Total Imágenes</p>
                                                               <p className="text-2xl font-bold">{place.images.length}</p>
                                                        </div>
                                                        <Camera className="h-8 w-8 text-purple-200" />
                                                 </div>
                                          </div>

                                          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                                                 <div className="flex items-center justify-between">
                                                        <div>
                                                               <p className="text-sm font-medium text-green-100">Activas</p>
                                                               <p className="text-2xl font-bold">
                                                                      {place.images.filter(img => img.is_active).length}
                                                               </p>
                                                        </div>
                                                        <Eye className="h-8 w-8 text-green-200" />
                                                 </div>
                                          </div>

                                          {/* Estadísticas de imagen principal comentadas para uso futuro */}
                                          {/* <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-100">Principal</p>
                                    <p className="text-2xl font-bold">
                                        {place.images.filter(img => img.is_main).length}
                                    </p>
                                </div>
                                <Star className="h-8 w-8 text-yellow-200" />
                            </div>
                        </div> 

                                                 <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                                                        <div className="flex items-center justify-between">
                                                               <div>
                                                                      <p className="text-sm font-medium text-red-100">Inactivas</p>
                                                                      <p className="text-2xl font-bold">
                                                                             {place.images.filter(img => !img.is_active).length}
                                                                      </p>
                                                               </div>
                                                               <ToggleLeft className="h-8 w-8 text-red-200" />
                                                        </div>
                                                 </div>
                                   </div>*/}
                                   </div>

                                   {/* Content */}
                                   <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50">
                                          {place.images.length === 0 ? (
                                                 <EmptyState placeId={place.id} />
                                          ) : (
                                                 <div className="p-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                               {place.images.map((image) => (
                                                                      <ImageCard
                                                                             key={image.id}
                                                                             image={image}
                                                                             place={place}
                                                                             onToggleActive={() => handleToggleActive(image)}
                                                                             // onSetAsMain={() => handleSetAsMain(image)} // Comentado para uso futuro
                                                                             onDelete={() => handleDeleteClick(image)}
                                                                      />
                                                               ))}
                                                        </div>
                                                 </div>
                                          )}
                                   </div>
                            </div>

                            {/* Delete Modal */}
                            <ConfirmDeleteModal
                                   isOpen={deleteModal.isOpen}
                                   onClose={handleDeleteCancel}
                                   onConfirm={handleDeleteConfirm}
                                   title="Eliminar Imagen 360°"
                                   message="¿Estás seguro de que deseas eliminar esta imagen 360°? Esta acción no se puede deshacer."
                                   itemName={deleteModal.image?.title || 'Imagen sin título'}
                                   isDeleting={deleteModal.isDeleting}
                            />
                     </div>
              </AppLayout>
       );
}

interface EmptyStateProps {
       placeId: number;
}

function EmptyState({ placeId }: EmptyStateProps) {
       return (
              <div className="text-center py-16">
                     <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📷</div>
                     <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No hay imágenes 360° registradas
                     </h3>
                     <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                            Comienza agregando la primera imagen 360° para crear experiencias inmersivas
                     </p>
                     <Link
                            href={`/admin/places/${placeId}/images/create`}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-medium px-6 py-3 rounded-lg transition-all"
                     >
                            <Upload className="h-5 w-5" />
                            Agregar Primera Imagen 360°
                     </Link>
              </div>
       );
}

interface ImageCardProps {
       image: PlaceImage;
       place: Place;
       onToggleActive: () => void;
       // onSetAsMain: () => void; // Comentado para uso futuro
       onDelete: () => void;
}

function ImageCard({ image, place, onToggleActive, /* onSetAsMain, */ onDelete }: ImageCardProps) { // onSetAsMain comentado para uso futuro
       const placeholderImage = "/images/placeholder-360.jpg";
       const imageUrl = `/storage/${image.image_path}`;

       return (
              <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 transition-all duration-300 overflow-hidden">
                     {/* Image */}
                     <div className="relative h-48">
                            <img
                                   src={imageUrl}
                                   alt={image.title || 'Imagen 360°'}
                                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                   onError={(e) => {
                                          (e.target as HTMLImageElement).src = placeholderImage;
                                   }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                   {/* Badge de imagen principal comentado para uso futuro */}
                                   {/* {image.is_main && (
                                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100/90 dark:bg-yellow-900/90 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700 backdrop-blur-sm">
                                                 <Star className="h-3 w-3" />
                                                 Principal
                                          </span>
                                   )} */}
                                   <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${image.is_active
                                          ? 'bg-green-100/90 dark:bg-green-900/90 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
                                          : 'bg-red-100/90 dark:bg-red-900/90 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
                                          }`}>
                                          {image.is_active ? '✓ Activa' : '✕ Inactiva'}
                                   </span>
                            </div>

                            {/* View 360 Button */}
                            <div className="absolute bottom-3 right-3">
                                   <Link
                                          href={`/vr?image=${encodeURIComponent(imageUrl)}`}
                                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                   >
                                          <Eye className="h-3 w-3" />
                                          Ver 360°
                                   </Link>
                            </div>
                     </div>

                     {/* Content */}
                     <div className="p-4">
                            <div className="mb-3">
                                   <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                          {image.title || 'Sin título'}
                                   </h3>
                                   {image.description && (
                                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                 {image.description}
                                          </p>
                                   )}
                            </div>

                            {/* Meta */}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                                   <span>Orden: {image.sort_order}</span>
                                   <span>{new Date(image.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2">
                                   <Link
                                          href={`/admin/places/${place.id}/images/${image.id}/edit`}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-xs font-medium transition-colors"
                                   >
                                          <Edit className="h-3 w-3" />
                                          Editar
                                   </Link>

                                   {/* Funcionalidad de imagen principal comentada para uso futuro */}
                                   {/* {!image.is_main && (
                                          <button
                                                 onClick={onSetAsMain}
                                                 className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 rounded-md text-xs font-medium transition-colors"
                                          >
                                                 <Star className="h-3 w-3" />
                                                 Principal
                                          </button>
                                   )} */}

                                   <button
                                          onClick={onToggleActive}
                                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${image.is_active
                                                 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                                                 : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                 }`}
                                   >
                                          {image.is_active ? (
                                                 <>
                                                        <ToggleLeft className="h-3 w-3" />
                                                        Ocultar
                                                 </>
                                          ) : (
                                                 <>
                                                        <ToggleRight className="h-3 w-3" />
                                                        Mostrar
                                                 </>
                                          )}
                                   </button>

                                   <button
                                          onClick={onDelete}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-md text-xs font-medium transition-colors"
                                   >
                                          <Trash2 className="h-3 w-3" />
                                          Eliminar
                                   </button>
                            </div>
                     </div>
              </div>
       );
}