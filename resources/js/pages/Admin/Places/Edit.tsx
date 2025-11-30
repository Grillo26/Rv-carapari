import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Camera } from 'lucide-react';
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
}

interface Errors {
       title?: string[];
       slug?: string[];
       short_description?: string[];
       description?: string[];
       thumbnail?: string[];
       main_360_image?: string[];
       sort_order?: string[];
}

interface PlacesEditProps {
       place: Place;
}

export default function PlacesEdit({ place }: PlacesEditProps) {
       const [formData, setFormData] = useState({
              title: place.title,
              slug: place.slug,
              short_description: place.short_description,
              description: place.description,
              is_available: place.is_available,
              sort_order: place.sort_order,
       });

       const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
       const [main360ImageFile, setMain360ImageFile] = useState<File | null>(null);
       const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
       const [main360Preview, setMain360Preview] = useState<string>('');
       const [errors, setErrors] = useState<Errors>({});
       const [processing, setProcessing] = useState(false);

       useEffect(() => {
              // Cargar imágenes existentes como preview
              if (place.thumbnail) {
                     setThumbnailPreview(`/storage/${place.thumbnail}`);
              }
              if (place.main_360_image) {
                     setMain360Preview(`/storage/${place.main_360_image}`);
              }
       }, [place]);

       const generateSlug = (title: string) => {
              return title
                     .toLowerCase()
                     .normalize('NFD')
                     .replace(/[\u0300-\u036f]/g, '') // Remover acentos
                     .replace(/[^\w\s-]/g, '')
                     .replace(/\s+/g, '-')
                     .replace(/-+/g, '-')
                     .replace(/^-+|-+$/g, '') // Remover guiones al inicio y final
                     .trim();
       };

       const handleTitleChange = (value: string) => {
              setFormData({
                     ...formData,
                     title: value,
                     slug: formData.slug === place.slug ? generateSlug(value) : formData.slug,
              });
       };

       const handleFileChange = (file: File | null, type: 'thumbnail' | 'main360') => {
              if (file) {
                     // Validaciones del archivo
                     const maxSize = type === 'thumbnail' ? 2 * 1024 * 1024 : 10 * 1024 * 1024; // 2MB o 10MB
                     const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

                     if (!validTypes.includes(file.type)) {
                            const newErrors = { ...errors };
                            const errorField = type === 'thumbnail' ? 'thumbnail' : 'main_360_image';
                            newErrors[errorField] = ['Solo se permiten archivos JPG, PNG'];
                            setErrors(newErrors);
                            return;
                     }

                     if (file.size > maxSize) {
                            const newErrors = { ...errors };
                            const errorField = type === 'thumbnail' ? 'thumbnail' : 'main_360_image';
                            const sizeMB = type === 'thumbnail' ? '2MB' : '10MB';
                            newErrors[errorField] = [`El archivo debe ser menor a ${sizeMB}`];
                            setErrors(newErrors);
                            return;
                     }

                     // Limpiar errores previos
                     const newErrors = { ...errors };
                     const errorField = type === 'thumbnail' ? 'thumbnail' : 'main_360_image';
                     delete newErrors[errorField];
                     setErrors(newErrors);

                     const reader = new FileReader();
                     reader.onload = (e) => {
                            if (type === 'thumbnail') {
                                   setThumbnailFile(file);
                                   setThumbnailPreview(e.target?.result as string);
                            } else {
                                   setMain360ImageFile(file);
                                   setMain360Preview(e.target?.result as string);
                            }
                     };
                     reader.readAsDataURL(file);
              } else {
                     if (type === 'thumbnail') {
                            setThumbnailFile(null);
                            setThumbnailPreview(place.thumbnail ? `/storage/${place.thumbnail}` : '');
                     } else {
                            setMain360ImageFile(null);
                            setMain360Preview(place.main_360_image ? `/storage/${place.main_360_image}` : '');
                     }
              }
       };

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();
              setProcessing(true);
              setErrors({});

              // Validaciones básicas del frontend
              const newErrors: Errors = {};

              if (!formData.title.trim()) {
                     newErrors.title = ['El título es requerido'];
              }
              if (!formData.short_description.trim()) {
                     newErrors.short_description = ['La descripción breve es requerida'];
              }
              if (!formData.description.trim()) {
                     newErrors.description = ['La descripción completa es requerida'];
              }

              if (Object.keys(newErrors).length > 0) {
                     setErrors(newErrors);
                     setProcessing(false);
                     return;
              }

              const submitData = new FormData();

              // Agregar todos los campos del formulario
              submitData.append('title', formData.title);
              submitData.append('short_description', formData.short_description);
              submitData.append('description', formData.description);
              submitData.append('is_available', formData.is_available ? '1' : '0');
              submitData.append('sort_order', formData.sort_order.toString());

              // Solo agregar slug si no está vacío
              if (formData.slug && formData.slug.trim()) {
                     submitData.append('slug', formData.slug);
              }

              // Solo agregar archivos si se seleccionaron nuevos
              if (thumbnailFile) {
                     submitData.append('thumbnail', thumbnailFile);
              }
              if (main360ImageFile) {
                     submitData.append('main_360_image', main360ImageFile);
              }

              // Agregar método PUT para Laravel
              submitData.append('_method', 'PUT');

              router.post(`/admin/places/${place.id}`, submitData, {
                     onSuccess: (response) => {
                            console.log('Lugar actualizado exitosamente:', response);
                     },
                     onError: (errors) => {
                            console.log('Errores del servidor:', errors);
                            setErrors(errors as Errors);
                            setProcessing(false);
                     },
                     onFinish: () => {
                            setProcessing(false);
                     },
                     forceFormData: true,
              });
       };

       return (
              <AppLayout breadcrumbs={[
                     { title: 'Dashboard', href: '/dashboard' },
                     { title: 'Lugares Turísticos', href: '/admin/places' },
                     { title: 'Editar Lugar', href: `/admin/places/${place.id}/edit` }
              ]}>
                     <Head title={`Admin - Editar ${place.title}`} />

                     <div className="p-6">
                            <div className="mb-6">
                                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                 Editar Lugar Turístico: {place.title}
                                          </h1>
                                          <Link
                                                 href={`/admin/places/${place.id}/images`}
                                                 className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-gray-900/50"
                                          >
                                                 <Camera className="h-5 w-5" />
                                                 Gestionar Imágenes 360°
                                          </Link>
                                   </div>
                            </div>

                            <div className="py-0">
                                   <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                                          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                                 <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                                        {/* Información Básica */}
                                                        <div className="space-y-4">
                                                               <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Información Básica</h3>

                                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                      <div>
                                                                             <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    Título *
                                                                             </label>
                                                                             <input
                                                                                    type="text"
                                                                                    id="title"
                                                                                    value={formData.title}
                                                                                    onChange={(e) => handleTitleChange(e.target.value)}
                                                                                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${errors.title ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                                                                           }`}
                                                                                    placeholder="Nombre del lugar turístico"
                                                                             />
                                                                             {errors.title && (
                                                                                    <p className="mt-1 text-sm text-red-600">{errors.title[0]}</p>
                                                                             )}
                                                                      </div>

                                                                      <div>
                                                                             <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    Slug (URL)
                                                                             </label>
                                                                             <input
                                                                                    type="text"
                                                                                    id="slug"
                                                                                    value={formData.slug}
                                                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                                                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${errors.slug ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                                                                           }`}
                                                                                    placeholder="url-amigable"
                                                                             />
                                                                             {errors.slug && (
                                                                                    <p className="mt-1 text-sm text-red-600">{errors.slug[0]}</p>
                                                                             )}
                                                                      </div>
                                                               </div>

                                                               <div>
                                                                      <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                             Descripción Breve *
                                                                      </label>
                                                                      <textarea
                                                                             id="short_description"
                                                                             rows={3}
                                                                             value={formData.short_description}
                                                                             onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                                                             className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${errors.short_description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                                                                    }`}
                                                                             placeholder="Descripción corta para mostrar en las cards"
                                                                             maxLength={500}
                                                                      />
                                                                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{formData.short_description.length}/500 caracteres</p>
                                                                      {errors.short_description && (
                                                                             <p className="mt-1 text-sm text-red-600">{errors.short_description[0]}</p>
                                                                      )}
                                                               </div>

                                                               <div>
                                                                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                             Descripción Completa *
                                                                      </label>
                                                                      <textarea
                                                                             id="description"
                                                                             rows={6}
                                                                             value={formData.description}
                                                                             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                                             className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${errors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                                                                    }`}
                                                                             placeholder="Descripción detallada del lugar turístico"
                                                                      />
                                                                      {errors.description && (
                                                                             <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
                                                                      )}
                                                               </div>
                                                        </div>

                                                        {/* Imágenes */}
                                                        <div className="space-y-4">
                                                               <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Imágenes</h3>

                                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                      {/* Miniatura */}
                                                                      <div>
                                                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                    Miniatura (para cards)
                                                                             </label>
                                                                             <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                                                                    {thumbnailPreview ? (
                                                                                           <div className="space-y-2">
                                                                                                  <img
                                                                                                         src={thumbnailPreview}
                                                                                                         alt="Preview"
                                                                                                         className="w-full h-48 object-cover rounded"
                                                                                                  />
                                                                                                  <button
                                                                                                         type="button"
                                                                                                         onClick={() => handleFileChange(null, 'thumbnail')}
                                                                                                         className="text-red-600 hover:text-red-700 text-sm"
                                                                                                  >
                                                                                                         {thumbnailFile ? 'Eliminar nueva imagen' : 'Eliminar imagen actual'}
                                                                                                  </button>
                                                                                           </div>
                                                                                    ) : (
                                                                                           <div className="text-center">
                                                                                                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                                                         <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                                                  </svg>
                                                                                                  <div className="mt-2">
                                                                                                         <input
                                                                                                                type="file"
                                                                                                                accept="image/*"
                                                                                                                onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'thumbnail')}
                                                                                                                className="hidden"
                                                                                                                id="thumbnail-upload"
                                                                                                         />
                                                                                                         <label
                                                                                                                htmlFor="thumbnail-upload"
                                                                                                                className="cursor-pointer bg-white dark:bg-gray-600 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                                                                                                         >
                                                                                                                Seleccionar imagen
                                                                                                         </label>
                                                                                                  </div>
                                                                                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG hasta 2MB</p>
                                                                                           </div>
                                                                                    )}
                                                                             </div>
                                                                             {errors.thumbnail && (
                                                                                    <p className="mt-1 text-sm text-red-600">{errors.thumbnail[0]}</p>
                                                                             )}
                                                                      </div>

                                                                      {/* Imagen 360 Principal */}
                                                                      <div>
                                                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                    Imagen 360° Principal
                                                                             </label>
                                                                             <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                                                                    {main360Preview ? (
                                                                                           <div className="space-y-2">
                                                                                                  <img
                                                                                                         src={main360Preview}
                                                                                                         alt="Preview"
                                                                                                         className="w-full h-48 object-cover rounded"
                                                                                                  />
                                                                                                  <button
                                                                                                         type="button"
                                                                                                         onClick={() => handleFileChange(null, 'main360')}
                                                                                                         className="text-red-600 hover:text-red-700 text-sm"
                                                                                                  >
                                                                                                         {main360ImageFile ? 'Eliminar nueva imagen' : 'Eliminar imagen actual'}
                                                                                                  </button>
                                                                                           </div>
                                                                                    ) : (
                                                                                           <div className="text-center">
                                                                                                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                                                         <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                                         <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                                                  </svg>
                                                                                                  <div className="mt-2">
                                                                                                         <input
                                                                                                                type="file"
                                                                                                                accept="image/*"
                                                                                                                onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'main360')}
                                                                                                                className="hidden"
                                                                                                                id="main360-upload"
                                                                                                         />
                                                                                                         <label
                                                                                                                htmlFor="main360-upload"
                                                                                                                className="cursor-pointer bg-white dark:bg-gray-600 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                                                                                                         >
                                                                                                                Seleccionar imagen 360°
                                                                                                         </label>
                                                                                                  </div>
                                                                                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG hasta 10MB</p>
                                                                                           </div>
                                                                                    )}
                                                                             </div>
                                                                             {errors.main_360_image && (
                                                                                    <p className="mt-1 text-sm text-red-600">{errors.main_360_image[0]}</p>
                                                                             )}
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        {/* Configuración */}
                                                        <div className="space-y-4">
                                                               <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Configuración</h3>

                                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                      <div>
                                                                             <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    Orden de visualización
                                                                             </label>
                                                                             <input
                                                                                    type="number"
                                                                                    id="sort_order"
                                                                                    min="0"
                                                                                    value={formData.sort_order}
                                                                                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                                                                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${errors.sort_order ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                                                                           }`}
                                                                             />
                                                                             {errors.sort_order && (
                                                                                    <p className="mt-1 text-sm text-red-600">{errors.sort_order[0]}</p>
                                                                             )}
                                                                      </div>

                                                                      <div className="flex items-center space-x-2 pt-6">
                                                                             <input
                                                                                    type="checkbox"
                                                                                    id="is_available"
                                                                                    checked={formData.is_available}
                                                                                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                                                                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                                                                             />
                                                                             <label htmlFor="is_available" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                    Disponible para mostrar al público
                                                                             </label>
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        {/* Botones */}
                                                        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                                               <Link
                                                                      href="/admin/places"
                                                                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                                                               >
                                                                      Cancelar
                                                               </Link>
                                                               <button
                                                                      type="submit"
                                                                      disabled={processing}
                                                                      className={`px-6 py-2 rounded-lg text-white font-medium ${processing
                                                                             ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                                                             : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                                                             }`}
                                                               >
                                                                      {processing ? 'Actualizando...' : 'Actualizar Lugar'}
                                                               </button>
                                                        </div>
                                                 </form>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </AppLayout>
       );
}