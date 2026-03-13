import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, Plus, X, File, CheckCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface FormErrors {
       name?: string;
       description?: string;
       model_file?: string;
       sort_order?: string;
}

export default function CreateAsset3d() {
       const { data, setData, reset } = useForm({
              name: '',
              description: '',
              model_file: null as File | null,
              is_active: true,
              sort_order: 0,
       });

       const [errorMessages, setErrorMessages] = useState<FormErrors>({});
       const [fileName, setFileName] = useState<string>('');
       const [isUploading, setIsUploading] = useState(false);
       const [uploadProgress, setUploadProgress] = useState(0);
       const [uploadSuccess, setUploadSuccess] = useState(false);

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();
              setErrorMessages({});

              const formData = new FormData();
              formData.append('name', data.name);
              formData.append('description', data.description);
              if (data.model_file) {
                     formData.append('model_file', data.model_file);
              }
              formData.append('is_active', String(data.is_active));
              formData.append('sort_order', String(data.sort_order));

              setIsUploading(true);
              setUploadProgress(0);
              setUploadSuccess(false);

              const xhr = new XMLHttpRequest();

              xhr.upload.addEventListener('progress', (event) => {
                     if (event.lengthComputable) {
                            setUploadProgress(Math.round((event.loaded / event.total) * 100));
                     }
              });

              xhr.addEventListener('load', () => {
                     if (xhr.status >= 200 && xhr.status < 300) {
                            setUploadProgress(100);
                            setUploadSuccess(true);
                            setTimeout(() => {
                                   window.location.href = '/admin/assets3d';
                            }, 1800);
                     } else if (xhr.status === 422) {
                            setIsUploading(false);
                            setUploadProgress(0);
                            try {
                                   const response = JSON.parse(xhr.responseText);
                                   const rawErrors = response.errors || {};
                                   const mapped: FormErrors = {};
                                   for (const key of Object.keys(rawErrors)) {
                                          mapped[key as keyof FormErrors] = Array.isArray(rawErrors[key])
                                                 ? rawErrors[key][0]
                                                 : rawErrors[key];
                                   }
                                   setErrorMessages(mapped);
                            } catch {
                                   setErrorMessages({ name: 'Error al validar el formulario.' });
                            }
                     } else {
                            setIsUploading(false);
                            setUploadProgress(0);
                            setErrorMessages({ name: `Error del servidor (${xhr.status}). Inténtalo de nuevo.` });
                     }
              });

              xhr.addEventListener('error', () => {
                     setIsUploading(false);
                     setUploadProgress(0);
                     setErrorMessages({ name: 'Error de conexión. Inténtalo de nuevo.' });
              });

              xhr.open('POST', '/admin/assets3d');
              const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
              xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);
              xhr.setRequestHeader('Accept', 'application/json');
              xhr.send(formData);
       };

       const handleReset = () => {
              reset();
              setErrorMessages({});
              setFileName('');
       };

       const clearError = (field: keyof FormErrors) => {
              setErrorMessages(prev => ({
                     ...prev,
                     [field]: undefined
              }));
       };

       const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                     if (!file.name.toLowerCase().endsWith('.glb')) {
                            setErrorMessages(prev => ({
                                   ...prev,
                                   model_file: 'El archivo debe ser de tipo .glb'
                            }));
                            setFileName('');
                            setData('model_file', null);
                     } else {
                            setData('model_file', file);
                            setFileName(file.name);
                            clearError('model_file');
                     }
              }
       };

       return (
              <AppLayout breadcrumbs={[
                     { title: 'Dashboard', href: '/dashboard' },
                     { title: 'Modelos 3D', href: '/admin/assets3d' },
                     { title: 'Crear Modelo', href: '/admin/assets3d/create' }
              ]}>
                     <Head title="Admin - Crear Modelo 3D" />

                     <div className="p-6">
                            {/* Header */}
                            <div className="mb-8">
                                   <div className="flex items-center gap-4 mb-4">
                                          <Link
                                                 href="/admin/assets3d"
                                                 className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                          >
                                                 <ArrowLeft className="h-5 w-5" />
                                                 Volver a Modelos 3D
                                          </Link>
                                   </div>

                                   <div className="flex items-center gap-3">
                                          <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                          <div>
                                                 <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                        Crear Nuevo Modelo 3D
                                                 </h1>
                                                 <p className="mt-1 text-gray-600 dark:text-gray-400">
                                                        Registra un nuevo modelo 3D (.glb) para usar en hotspots
                                                 </p>
                                          </div>
                                   </div>
                            </div>

                            {/* Form */}
                            <div className="max-w-2xl">
                                   <form onSubmit={handleSubmit} className="space-y-6">
                                          {/* Basic Information Card */}
                                          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                 <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                        <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        Información Básica
                                                 </h3>

                                                 <div className="space-y-4">
                                                        {/* Name */}
                                                        <div>
                                                               <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                      Nombre del Modelo *
                                                               </label>
                                                               <input
                                                                      type="text"
                                                                      id="name"
                                                                      value={data.name}
                                                                      onChange={(e) => {
                                                                             setData('name', e.target.value);
                                                                             clearError('name');
                                                                      }}
                                                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                      placeholder="Ej: Monumento Principal"
                                                                      disabled={isUploading}
                                                               />
                                                               {errorMessages.name && (
                                                                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessages.name}</p>
                                                               )}
                                                        </div>

                                                        {/* Description */}
                                                        <div>
                                                               <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                      Descripción (Opcional)
                                                               </label>
                                                               <textarea
                                                                      id="description"
                                                                      rows={3}
                                                                      value={data.description}
                                                                      onChange={(e) => {
                                                                             setData('description', e.target.value);
                                                                             clearError('description');
                                                                      }}
                                                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                                      placeholder="Describe brevemente qué es este modelo 3D..."
                                                                      disabled={isUploading}
                                                               />
                                                               {errorMessages.description && (
                                                                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessages.description}</p>
                                                               )}
                                                        </div>

                                                        {/* Model File Upload */}
                                                        <div>
                                                               <label htmlFor="model_file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                      Archivo del Modelo (.glb) *
                                                               </label>
                                                               <div className="relative">
                                                                      <input
                                                                             type="file"
                                                                             id="model_file"
                                                                             accept=".glb"
                                                                             onChange={handleFileChange}
                                                                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                             disabled={isUploading}
                                                                      />
                                                                      <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                                                             <File className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                                                             <div>
                                                                                    {fileName ? (
                                                                                           <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{fileName}</p>
                                                                                    ) : (
                                                                                           <p className="text-sm text-gray-500 dark:text-gray-400">Haz clic para seleccionar un archivo .glb</p>
                                                                                    )}
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                               <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                                      Selecciona un archivo .glb (máximo 256MB). El archivo se guardará automáticamente en el servidor.
                                                               </p>
                                                               {errorMessages.model_file && (
                                                                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessages.model_file}</p>
                                                               )}
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Settings Card */}
                                          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                 <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                                        Configuración
                                                 </h3>

                                                 <div className="space-y-4">
                                                        {/* Sort Order */}
                                                        <div>
                                                               <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                      Orden de Visualización
                                                               </label>
                                                               <input
                                                                      type="number"
                                                                      id="sort_order"
                                                                      value={data.sort_order}
                                                                      onChange={(e) => {
                                                                             setData('sort_order', parseInt(e.target.value) || 0);
                                                                             clearError('sort_order');
                                                                      }}
                                                                      min="0"
                                                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                      placeholder="0"
                                                                      disabled={isUploading}
                                                               />
                                                               <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                                      Números menores aparecen primero en la lista
                                                               </p>
                                                               {errorMessages.sort_order && (
                                                                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessages.sort_order}</p>
                                                               )}
                                                        </div>

                                                        {/* Is Active */}
                                                        <div className="flex items-start">
                                                               <div className="flex items-center h-5">
                                                                      <input
                                                                             id="is_active"
                                                                             type="checkbox"
                                                                             checked={data.is_active}
                                                                             onChange={(e) => setData('is_active', e.target.checked)}
                                                                             className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                                                                             disabled={isUploading}
                                                                      />
                                                               </div>
                                                               <div className="ml-3 text-sm">
                                                                      <label htmlFor="is_active" className="font-medium text-gray-700 dark:text-gray-300">
                                                                             Activar Modelo
                                                                      </label>
                                                                      <p className="text-gray-500 dark:text-gray-400">
                                                                             Los modelos activos pueden usarse en hotspots
                                                                      </p>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Action Buttons */}
                                          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                                                 <Link
                                                        href="/admin/assets3d"
                                                        className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                                 >
                                                        <ArrowLeft className="h-5 w-5" />
                                                        Cancelar
                                                 </Link>

                                                 <div className="flex gap-3">
                                                        <button
                                                               type="reset"
                                                               onClick={handleReset}
                                                               disabled={isUploading}
                                                               className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                               <X className="h-5 w-5" />
                                                               Limpiar
                                                        </button>

                                                        <button
                                                               type="submit"
                                                               disabled={isUploading || !data.model_file}
                                                               className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-blue-900/50"
                                                        >
                                                               {isUploading ? (
                                                                      <>
                                                                             <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                                             Guardando...
                                                                      </>
                                                               ) : (
                                                                      <>
                                                                             <Plus className="h-5 w-5" />
                                                                             Crear Modelo
                                                                      </>
                                                               )}
                                                        </button>
                                                 </div>
                                          </div>
                                   </form>
                            </div>

                            {/* Modal de progreso de carga */}
                            {isUploading && (
                                   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
                                                 {!uploadSuccess ? (
                                                        <div className="flex flex-col items-center text-center gap-5">
                                                               <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                                      <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                                                               </div>
                                                               <div>
                                                                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Subiendo modelo 3D...</h3>
                                                                      {fileName && (
                                                                             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">{fileName}</p>
                                                                      )}
                                                               </div>
                                                               <div className="w-full">
                                                                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                             <span>Progreso</span>
                                                                             <span className="font-medium">{uploadProgress}%</span>
                                                                      </div>
                                                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                                                             <div
                                                                                    className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                                                                                    style={{ width: `${uploadProgress}%` }}
                                                                             />
                                                                      </div>
                                                               </div>
                                                               <p className="text-xs text-gray-400 dark:text-gray-500">Por favor no cierres esta ventana...</p>
                                                        </div>
                                                 ) : (
                                                        <div className="flex flex-col items-center text-center gap-5">
                                                               <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                                               </div>
                                                               <div>
                                                                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">¡Modelo subido exitosamente!</h3>
                                                                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                             El modelo 3D se ha guardado correctamente.
                                                                      </p>
                                                               </div>
                                                               <div className="w-full">
                                                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                                                             <div className="bg-green-500 dark:bg-green-400 h-3 rounded-full w-full" />
                                                                      </div>
                                                               </div>
                                                               <p className="text-xs text-gray-400 dark:text-gray-500">Redirigiendo a la lista...</p>
                                                        </div>
                                                 )}
                                          </div>
                                   </div>
                            )}
                     </div>
              </AppLayout>
       );
}
