import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Upload, Image as ImageIcon, Eye, Star, Camera, Plus, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Place {
       id: number;
       title: string;
       slug: string;
}

interface CreatePlaceImageProps {
       place: Place;
}

interface FormErrors {
       title?: string;
       image?: string;
       description?: string;
       sort_order?: string;
}

export default function CreatePlaceImage({ place }: CreatePlaceImageProps) {
       const { url } = usePage();
       const searchParams = new URLSearchParams(url.split('?')[1]);
       const imageType = (searchParams.get('type') as 'main_360' | 'gallery') || 'main_360';

       // Para 360°: Un solo formulario
       if (imageType === 'main_360') {
              return <Create360Form place={place} />;
       }

       // Para Álbum: Múltiples imágenes
       return <CreateGalleryForm place={place} />;
}

// ==================== COMPONENTE PARA IMÁGENES 360° ====================
interface Image360 {
       id: string;
       file: File;
       preview: string;
       title: string;
       description: string;
}

function Create360Form({ place }: { place: Place }) {
       const [images360, setImages360] = useState<Image360[]>([]);
       const [isSubmitting, setIsSubmitting] = useState(false);

       const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
              const files = e.target.files;
              if (files) {
                     Array.from(files).forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                   setImages360(prev => [...prev, {
                                          id: Date.now().toString() + Math.random(),
                                          file,
                                          preview: event.target?.result as string,
                                          title: file.name.replace(/\.[^/.]+$/, ''),
                                          description: ''
                                   }]);
                            };
                            reader.readAsDataURL(file);
                     });
              }
       };

       const handleUpdateField = (id: string, field: 'title' | 'description', value: string) => {
              setImages360(prev => prev.map(img =>
                     img.id === id ? { ...img, [field]: value } : img
              ));
       };

       const handleRemoveImage = (id: string) => {
              setImages360(prev => prev.filter(img => img.id !== id));
       };

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();

              if (images360.length === 0) return;

              setIsSubmitting(true);

              images360.forEach((img, index) => {
                     const submitFormData = new FormData();
                     submitFormData.append('title', img.title);
                     submitFormData.append('description', img.description);
                     submitFormData.append('type', 'main_360');
                     submitFormData.append('is_active', '1');
                     submitFormData.append('sort_order', (index + 1).toString());
                     submitFormData.append('image', img.file);

                     router.post(`/admin/places/${place.id}/images`, submitFormData, {
                            forceFormData: true,
                            preserveScroll: index === images360.length - 1,
                            onFinish: () => {
                                   if (index === images360.length - 1) {
                                          setIsSubmitting(false);
                                   }
                            }
                     });
              });
       };

       return (
              <AppLayout breadcrumbs={[
                     { title: 'Dashboard', href: '/dashboard' },
                     { title: 'Lugares Turísticos', href: '/admin/places' },
                     { title: place.title, href: `/admin/places/${place.id}` },
                     { title: 'Imágenes', href: `/admin/places/${place.id}/images` },
                     { title: 'Agregar Imágenes 360°', href: `/admin/places/${place.id}/images/create` }
              ]}>
                     <Head title={`Admin - Agregar Imágenes 360° a ${place.title}`} />

                     <div className="p-6">
                            {/* Header */}
                            <div className="mb-8">
                                   <div className="flex items-center gap-4 mb-4">
                                          <Link
                                                 href={`/admin/places/${place.id}/images`}
                                                 className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                          >
                                                 <ArrowLeft className="h-5 w-5" />
                                                 Volver a imágenes
                                          </Link>
                                   </div>

                                   <div className="flex items-center gap-3">
                                          <Camera className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                          <div>
                                                 <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                        Agregar Imágenes 360°
                                                 </h1>
                                                 <p className="mt-1 text-gray-600 dark:text-gray-400">
                                                        Lugar: <span className="font-medium text-gray-900 dark:text-gray-100">{place.title}</span>
                                                 </p>
                                          </div>
                                   </div>
                            </div>

                            {/* Form */}
                            <div className="max-w-6xl">
                                   <form onSubmit={handleSubmit} className="space-y-8">
                                          {/* Upload Area */}
                                          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border-2 border-dashed border-purple-300 dark:border-purple-600">
                                                 <div className="text-center">
                                                        <div className="text-purple-400 text-6xl mb-4">🌐</div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                               Selecciona una o varias imágenes 360°
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                               Haz clic o arrastra archivos aquí
                                                        </p>
                                                        <label className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg cursor-pointer transition-colors">
                                                               <Upload className="h-5 w-5" />
                                                               Seleccionar Imágenes 360°
                                                               <input
                                                                      type="file"
                                                                      accept="image/*"
                                                                      multiple
                                                                      onChange={handleAddImage}
                                                                      className="hidden"
                                                               />
                                                        </label>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                                                               Formatos: JPG, PNG, WEBP | Máximo: 10MB por imagen | Resolución recomendada: 4096x2048px
                                                        </p>
                                                 </div>
                                          </div>

                                          {/* Images Grid */}
                                          {images360.length > 0 && (
                                                 <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                                               Imágenes 360° Seleccionadas ({images360.length})
                                                        </h3>
                                                        <div className="grid grid-cols-1 gap-6">
                                                               {images360.map((img, index) => (
                                                                      <div key={img.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                                                                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                                                    {/* Image Preview */}
                                                                                    <div className="relative h-48 lg:h-auto">
                                                                                           <img
                                                                                                  src={img.preview}
                                                                                                  alt={img.title || 'Imagen 360°'}
                                                                                                  className="w-full h-full object-cover rounded-lg"
                                                                                           />
                                                                                           <button
                                                                                                  type="button"
                                                                                                  onClick={() => handleRemoveImage(img.id)}
                                                                                                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                                                           >
                                                                                                  <X className="h-4 w-4" />
                                                                                           </button>
                                                                                           <span className="absolute top-2 left-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                                                                                                  #{index + 1}
                                                                                           </span>
                                                                                    </div>

                                                                                    {/* Form Fields */}
                                                                                    <div className="lg:col-span-2 space-y-4">
                                                                                           {/* Title Field */}
                                                                                           <div>
                                                                                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                                         Título de la Imagen 360°
                                                                                                  </label>
                                                                                                  <input
                                                                                                         type="text"
                                                                                                         value={img.title}
                                                                                                         onChange={(e) => handleUpdateField(img.id, 'title', e.target.value)}
                                                                                                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                                                         placeholder="Ej: Vista principal del mirador"
                                                                                                  />
                                                                                           </div>

                                                                                           {/* Description Field */}
                                                                                           <div>
                                                                                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                                         Descripción
                                                                                                  </label>
                                                                                                  <textarea
                                                                                                         value={img.description}
                                                                                                         onChange={(e) => handleUpdateField(img.id, 'description', e.target.value)}
                                                                                                         rows={3}
                                                                                                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                                                         placeholder="Describe lo que se puede ver en esta imagen 360°..."
                                                                                                  />
                                                                                           </div>
                                                                                    </div>
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 </div>
                                          )}

                                          {/* Action Buttons */}
                                          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                                                 <Link
                                                        href={`/admin/places/${place.id}/images`}
                                                        className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 rounded-lg font-medium"
                                                 >
                                                        <ArrowLeft className="h-5 w-5" />
                                                        Cancelar
                                                 </Link>

                                                 <button
                                                        type="submit"
                                                        disabled={isSubmitting || images360.length === 0}
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg"
                                                 >
                                                        <Upload className="h-5 w-5" />
                                                        {isSubmitting ? 'Guardando...' : `Guardar ${images360.length} Imagen${images360.length !== 1 ? 'es' : ''} 360°`}
                                                 </button>
                                          </div>
                                   </form>
                            </div>
                     </div>
              </AppLayout>
       );
}

// ==================== COMPONENTE PARA MÚLTIPLES FOTOS DEL ÁLBUM ====================
interface GalleryImage {
       id: string;
       file: File;
       preview: string;
       title: string;
}

function CreateGalleryForm({ place }: { place: Place }) {
       const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
       const [isSubmitting, setIsSubmitting] = useState(false);

       const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
              const files = e.target.files;
              if (files) {
                     Array.from(files).forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                   setGalleryImages(prev => [...prev, {
                                          id: Date.now().toString() + Math.random(),
                                          file,
                                          preview: event.target?.result as string,
                                          title: file.name.replace(/\.[^/.]+$/, '')
                                   }]);
                            };
                            reader.readAsDataURL(file);
                     });
              }
       };

       const handleUpdateTitle = (id: string, newTitle: string) => {
              setGalleryImages(prev => prev.map(img =>
                     img.id === id ? { ...img, title: newTitle } : img
              ));
       };

       const handleRemoveImage = (id: string) => {
              setGalleryImages(prev => prev.filter(img => img.id !== id));
       };

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();

              if (galleryImages.length === 0) return;

              setIsSubmitting(true);

              galleryImages.forEach((img, index) => {
                     const submitFormData = new FormData();
                     submitFormData.append('title', img.title);
                     submitFormData.append('type', 'gallery');
                     submitFormData.append('is_active', '1');
                     submitFormData.append('sort_order', (index + 1).toString());
                     submitFormData.append('image', img.file);

                     router.post(`/admin/places/${place.id}/images`, submitFormData, {
                            forceFormData: true,
                            preserveScroll: index === galleryImages.length - 1,
                            onFinish: () => {
                                   if (index === galleryImages.length - 1) {
                                          setIsSubmitting(false);
                                   }
                            }
                     });
              });
       };

       return (
              <AppLayout breadcrumbs={[
                     { title: 'Dashboard', href: '/dashboard' },
                     { title: 'Lugares Turísticos', href: '/admin/places' },
                     { title: place.title, href: `/admin/places/${place.id}` },
                     { title: 'Imágenes', href: `/admin/places/${place.id}/images` },
                     { title: 'Agregar Fotos al Álbum', href: `/admin/places/${place.id}/images/create` }
              ]}>
                     <Head title={`Admin - Agregar Fotos al Álbum de ${place.title}`} />

                     <div className="p-6">
                            {/* Header */}
                            <div className="mb-8">
                                   <div className="flex items-center gap-4 mb-4">
                                          <Link
                                                 href={`/admin/places/${place.id}/images`}
                                                 className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900"
                                          >
                                                 <ArrowLeft className="h-5 w-5" />
                                                 Volver a Galería
                                          </Link>
                                   </div>

                                   <div className="flex items-center gap-3">
                                          <Camera className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                          <div>
                                                 <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                        Agregar Fotos al Álbum
                                                 </h1>
                                                 <p className="mt-1 text-gray-600 dark:text-gray-400">
                                                        Lugar: <span className="font-medium">{place.title}</span>
                                                 </p>
                                          </div>
                                   </div>
                            </div>

                            {/* Form */}
                            <div className="max-w-6xl">
                                   <form onSubmit={handleSubmit} className="space-y-8">
                                          {/* Upload Area */}
                                          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border-2 border-dashed border-blue-300 dark:border-blue-600">
                                                 <div className="text-center">
                                                        <div className="text-blue-400 text-6xl mb-4">📸</div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                               Selecciona una o varias fotos
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                               Haz clic o arrastra archivos aquí
                                                        </p>
                                                        <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg cursor-pointer transition-colors">
                                                               <Upload className="h-5 w-5" />
                                                               Seleccionar Fotos
                                                               <input
                                                                      type="file"
                                                                      accept="image/*"
                                                                      multiple
                                                                      onChange={handleAddImage}
                                                                      className="hidden"
                                                               />
                                                        </label>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                                                               Formatos: JPG, PNG, WEBP | Máximo: 5MB por imagen
                                                        </p>
                                                 </div>
                                          </div>

                                          {/* Images Grid */}
                                          {galleryImages.length > 0 && (
                                                 <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                                               Fotos Seleccionadas ({galleryImages.length})
                                                        </h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                               {galleryImages.map((img) => (
                                                                      <div key={img.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                                             {/* Image Preview */}
                                                                             <div className="relative h-48 overflow-hidden">
                                                                                    <img
                                                                                           src={img.preview}
                                                                                           alt={img.title}
                                                                                           className="w-full h-full object-cover"
                                                                                    />
                                                                                    <button
                                                                                           type="button"
                                                                                           onClick={() => handleRemoveImage(img.id)}
                                                                                           className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                                                    >
                                                                                           <X className="h-4 w-4" />
                                                                                    </button>
                                                                             </div>

                                                                             {/* Title Input */}
                                                                             <div className="p-4">
                                                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                           Título de la Foto
                                                                                    </label>
                                                                                    <input
                                                                                           type="text"
                                                                                           value={img.title}
                                                                                           onChange={(e) => handleUpdateTitle(img.id, e.target.value)}
                                                                                           className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                           placeholder="Título de la foto"
                                                                                    />
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 </div>
                                          )}

                                          {/* Action Buttons */}
                                          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                                                 <Link
                                                        href={`/admin/places/${place.id}/images`}
                                                        className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 rounded-lg font-medium"
                                                 >
                                                        <ArrowLeft className="h-5 w-5" />
                                                        Cancelar
                                                 </Link>

                                                 <button
                                                        type="submit"
                                                        disabled={isSubmitting || galleryImages.length === 0}
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg"
                                                 >
                                                        <Upload className="h-5 w-5" />
                                                        {isSubmitting ? 'Guardando...' : `Guardar ${galleryImages.length} Foto${galleryImages.length !== 1 ? 's' : ''}`}
                                                 </button>
                                          </div>
                                   </form>
                            </div>
                     </div>
              </AppLayout>
       );
}