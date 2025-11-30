import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Upload, Image as ImageIcon, Eye, Star, Camera } from 'lucide-react';
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
       const [formData, setFormData] = useState({
              title: '',
              description: '',
              sort_order: 1,
              // is_main: false, // Comentado para uso futuro
              is_active: true
       });

       const [imageFile, setImageFile] = useState<File | null>(null);
       const [imagePreview, setImagePreview] = useState<string | null>(null);
       const [isSubmitting, setIsSubmitting] = useState(false);
       const [errors, setErrors] = useState<FormErrors>({});

       const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              const { name, value, type } = e.target;

              if (type === 'checkbox') {
                     const checked = (e.target as HTMLInputElement).checked;
                     setFormData(prev => ({
                            ...prev,
                            [name]: checked
                     }));
              } else {
                     setFormData(prev => ({
                            ...prev,
                            [name]: value
                     }));
              }

              // Clear error for this field
              if (errors[name as keyof FormErrors]) {
                     setErrors(prev => ({
                            ...prev,
                            [name]: undefined
                     }));
              }
       };

       const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                     setImageFile(file);

                     // Create preview
                     const reader = new FileReader();
                     reader.onload = (e) => {
                            setImagePreview(e.target?.result as string);
                     };
                     reader.readAsDataURL(file);

                     // Clear error
                     if (errors.image) {
                            setErrors(prev => ({ ...prev, image: undefined }));
                     }
              }
       };

       const clearImage = () => {
              setImageFile(null);
              setImagePreview(null);
              const fileInput = document.getElementById('image') as HTMLInputElement;
              if (fileInput) {
                     fileInput.value = '';
              }
       };

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();

              if (isSubmitting) return;

              const submitFormData = new FormData();
              submitFormData.append('title', formData.title);
              submitFormData.append('description', formData.description);
              submitFormData.append('sort_order', formData.sort_order.toString());
              // submitFormData.append('is_main', formData.is_main ? '1' : '0'); // Comentado para uso futuro
              submitFormData.append('is_active', formData.is_active ? '1' : '0');

              if (imageFile) {
                     submitFormData.append('image', imageFile);
              }

              setIsSubmitting(true);
              setErrors({});

              router.post(`/admin/places/${place.id}/images`, submitFormData, {
                     forceFormData: true,
                     preserveScroll: true,
                     onSuccess: () => {
                            // Success is handled by redirect
                     },
                     onError: (errors) => {
                            setErrors(errors as FormErrors);
                            setIsSubmitting(false);
                     },
                     onFinish: () => {
                            setIsSubmitting(false);
                     }
              });
       };

       return (
              <AppLayout breadcrumbs={[
                     { title: 'Dashboard', href: '/dashboard' },
                     { title: 'Lugares Turísticos', href: '/admin/places' },
                     { title: place.title, href: `/admin/places/${place.id}` },
                     { title: 'Imágenes 360°', href: `/admin/places/${place.id}/images` },
                     { title: 'Crear Imagen', href: `/admin/places/${place.id}/images/create` }
              ]}>
                     <Head title={`Admin - Agregar Imagen 360° a ${place.title}`} />

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
                                                        Agregar Imagen 360°
                                                 </h1>
                                                 <p className="mt-1 text-gray-600 dark:text-gray-400">
                                                        Lugar: <span className="font-medium text-gray-900 dark:text-gray-100">{place.title}</span>
                                                 </p>
                                          </div>
                                   </div>
                            </div>

                            {/* Form */}
                            <div className="max-w-4xl">
                                   <form onSubmit={handleSubmit} className="space-y-8">
                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                 {/* Left Column - Form Fields */}
                                                 <div className="space-y-6">
                                                        {/* Basic Information Card */}
                                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                                      <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                                      Información Básica
                                                               </h3>

                                                               <div className="space-y-4">
                                                                      {/* Title */}
                                                                      <div>
                                                                             <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                    Título de la Imagen
                                                                             </label>
                                                                             <input
                                                                                    type="text"
                                                                                    id="title"
                                                                                    name="title"
                                                                                    value={formData.title}
                                                                                    onChange={handleInputChange}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                                                    placeholder="Ej: Vista principal del mirador"
                                                                             />
                                                                             {errors.title && (
                                                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                                                                             )}
                                                                      </div>

                                                                      {/* Description */}
                                                                      <div>
                                                                             <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                    Descripción
                                                                             </label>
                                                                             <textarea
                                                                                    id="description"
                                                                                    name="description"
                                                                                    rows={4}
                                                                                    value={formData.description}
                                                                                    onChange={handleInputChange}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                                                    placeholder="Describe lo que se puede ver en esta imagen 360°..."
                                                                             />
                                                                             {errors.description && (
                                                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                                                             )}
                                                                      </div>

                                                                      {/* Sort Order */}
                                                                      <div>
                                                                             <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                    Orden de Visualización
                                                                             </label>
                                                                             <input
                                                                                    type="number"
                                                                                    id="sort_order"
                                                                                    name="sort_order"
                                                                                    min="1"
                                                                                    value={formData.sort_order}
                                                                                    onChange={handleInputChange}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                                             />
                                                                             {errors.sort_order && (
                                                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sort_order}</p>
                                                                             )}
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        {/* Settings Card */}
                                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                                      <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                                                      Configuración
                                                               </h3>

                                                               <div className="space-y-4">
                                                                      {/* Funcionalidad de imagen principal comentada para uso futuro */}
                                                                      {/* 
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="is_main"
                                                    name="is_main"
                                                    type="checkbox"
                                                    checked={formData.is_main}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="is_main" className="font-medium text-gray-700 dark:text-gray-300">
                                                    Imagen Principal
                                                </label>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Esta será la imagen 360° que se mostrará por defecto
                                                </p>
                                            </div>
                                        </div>
                                        */}

                                                                      {/* Is Active */}
                                                                      <div className="flex items-start">
                                                                             <div className="flex items-center h-5">
                                                                                    <input
                                                                                           id="is_active"
                                                                                           name="is_active"
                                                                                           type="checkbox"
                                                                                           checked={formData.is_active}
                                                                                           onChange={handleInputChange}
                                                                                           className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                                                                                    />
                                                                             </div>
                                                                             <div className="ml-3 text-sm">
                                                                                    <label htmlFor="is_active" className="font-medium text-gray-700 dark:text-gray-300">
                                                                                           Imagen Activa
                                                                                    </label>
                                                                                    <p className="text-gray-500 dark:text-gray-400">
                                                                                           Solo las imágenes activas se mostrarán públicamente
                                                                                    </p>
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 </div>

                                                 {/* Right Column - Image Upload */}
                                                 <div>
                                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                                      <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                                      Imagen 360° *
                                                               </h3>

                                                               {!imagePreview ? (
                                                                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                                                                             <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">🌐</div>
                                                                             <div className="space-y-2">
                                                                                    <label htmlFor="image" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors">
                                                                                           <Upload className="h-4 w-4" />
                                                                                           Seleccionar Imagen 360°
                                                                                    </label>
                                                                                    <input
                                                                                           id="image"
                                                                                           name="image"
                                                                                           type="file"
                                                                                           accept="image/*"
                                                                                           onChange={handleFileChange}
                                                                                           className="hidden"
                                                                                    />
                                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                                           Formatos permitidos: JPG, PNG, WEBP
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                                           Máximo: 10MB | Resolución recomendada: 4096x2048px
                                                                                    </p>
                                                                             </div>
                                                                      </div>
                                                               ) : (
                                                                      <div className="space-y-4">
                                                                             <div className="relative">
                                                                                    <img
                                                                                           src={imagePreview}
                                                                                           alt="Vista previa"
                                                                                           className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                                                    />
                                                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                                                           <button
                                                                                                  type="button"
                                                                                                  onClick={() => setImagePreview(imagePreview)}
                                                                                                  className="p-2 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                                                                                  title="Ver imagen completa"
                                                                                           >
                                                                                                  <Eye className="h-4 w-4" />
                                                                                           </button>
                                                                                           <button
                                                                                                  type="button"
                                                                                                  onClick={clearImage}
                                                                                                  className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-500 transition-colors"
                                                                                                  title="Eliminar imagen"
                                                                                           >
                                                                                                  <ArrowLeft className="h-4 w-4" />
                                                                                           </button>
                                                                                    </div>
                                                                             </div>

                                                                             <div className="text-center">
                                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                           {imageFile?.name} ({((imageFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                                                                                    </p>
                                                                                    <label htmlFor="image" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm cursor-pointer mt-2">
                                                                                           <Upload className="h-4 w-4" />
                                                                                           Cambiar imagen
                                                                                    </label>
                                                                                    <input
                                                                                           id="image"
                                                                                           name="image"
                                                                                           type="file"
                                                                                           accept="image/*"
                                                                                           onChange={handleFileChange}
                                                                                           className="hidden"
                                                                                    />
                                                                             </div>
                                                                      </div>
                                                               )}

                                                               {errors.image && (
                                                                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.image}</p>
                                                               )}
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Action Buttons */}
                                          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                                                 <Link
                                                        href={`/admin/places/${place.id}/images`}
                                                        className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                                 >
                                                        <ArrowLeft className="h-5 w-5" />
                                                        Cancelar
                                                 </Link>

                                                 <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-gray-900/50"
                                                 >
                                                        {isSubmitting ? (
                                                               <>
                                                                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                                      Guardando...
                                                               </>
                                                        ) : (
                                                               <>
                                                                      <Upload className="h-5 w-5" />
                                                                      Guardar Imagen 360°
                                                               </>
                                                        )}
                                                 </button>
                                          </div>
                                   </form>
                            </div>
                     </div>
              </AppLayout>
       );
}