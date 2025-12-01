import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, User, Mail, Lock, Shield, Upload, Eye, EyeOff } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface FormErrors {
       name?: string;
       email?: string;
       password?: string;
       password_confirmation?: string;
       role?: string;
       avatar?: string;
}

export default function CreateUser() {
       const [formData, setFormData] = useState({
              name: '',
              email: '',
              password: '',
              password_confirmation: '',
              role: 'user'
       });

       const [avatarFile, setAvatarFile] = useState<File | null>(null);
       const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
       const [showPassword, setShowPassword] = useState(false);
       const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
       const [isSubmitting, setIsSubmitting] = useState(false);
       const [errors, setErrors] = useState<FormErrors>({});

       const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
              const { name, value } = e.target;
              setFormData(prev => ({
                     ...prev,
                     [name]: value
              }));

              // Clear error for this field
              if (errors[name as keyof FormErrors]) {
                     setErrors(prev => ({
                            ...prev,
                            [name]: undefined
                     }));
              }
       };

       const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                     setAvatarFile(file);

                     // Create preview
                     const reader = new FileReader();
                     reader.onload = (e) => {
                            setAvatarPreview(e.target?.result as string);
                     };
                     reader.readAsDataURL(file);

                     // Clear error
                     if (errors.avatar) {
                            setErrors(prev => ({ ...prev, avatar: undefined }));
                     }
              }
       };

       const clearAvatar = () => {
              setAvatarFile(null);
              setAvatarPreview(null);
              const fileInput = document.getElementById('avatar') as HTMLInputElement;
              if (fileInput) {
                     fileInput.value = '';
              }
       };

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();

              if (isSubmitting) return;

              const submitFormData = new FormData();
              submitFormData.append('name', formData.name);
              submitFormData.append('email', formData.email);
              submitFormData.append('password', formData.password);
              submitFormData.append('password_confirmation', formData.password_confirmation);
              submitFormData.append('role', formData.role);

              if (avatarFile) {
                     submitFormData.append('avatar', avatarFile);
              }

              setIsSubmitting(true);
              setErrors({});

              router.post('/admin/users', submitFormData, {
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
                     { title: 'Usuarios', href: '/admin/users' },
                     { title: 'Crear Usuario', href: '/admin/users/create' }
              ]}>
                     <Head title="Admin - Crear Usuario" />

                     <div className="p-6">
                            {/* Header */}
                            <div className="mb-8">
                                   <div className="flex items-center gap-4 mb-4">
                                          <Link
                                                 href="/admin/users"
                                                 className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                          >
                                                 <ArrowLeft className="h-5 w-5" />
                                                 Volver a usuarios
                                          </Link>
                                   </div>

                                   <div className="flex items-center gap-3">
                                          <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                          <div>
                                                 <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                        Crear Nuevo Usuario
                                                 </h1>
                                                 <p className="mt-1 text-gray-600 dark:text-gray-400">
                                                        Agrega un nuevo usuario al sistema
                                                 </p>
                                          </div>
                                   </div>
                            </div>

                            {/* Form */}
                            <div className="max-w-2xl">
                                   <form onSubmit={handleSubmit} className="space-y-8">
                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                 {/* Left Column - Form Fields */}
                                                 <div className="space-y-6">
                                                        {/* Basic Information */}
                                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                                      Información Personal
                                                               </h3>

                                                               <div className="space-y-4">
                                                                      {/* Name */}
                                                                      <div>
                                                                             <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                    Nombre Completo *
                                                                             </label>
                                                                             <input
                                                                                    type="text"
                                                                                    id="name"
                                                                                    name="name"
                                                                                    value={formData.name}
                                                                                    onChange={handleInputChange}
                                                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                    placeholder="Ej: Juan Pérez González"
                                                                             />
                                                                             {errors.name && (
                                                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                                                             )}
                                                                      </div>

                                                                      {/* Email */}
                                                                      <div>
                                                                             <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                    Correo Electrónico *
                                                                             </label>
                                                                             <div className="relative">
                                                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                                    <input
                                                                                           type="email"
                                                                                           id="email"
                                                                                           name="email"
                                                                                           value={formData.email}
                                                                                           onChange={handleInputChange}
                                                                                           className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                           placeholder="usuario@email.com"
                                                                                    />
                                                                             </div>
                                                                             {errors.email && (
                                                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                                                             )}
                                                                      </div>

                                                                      {/* Password */}
                                                                      <div>
                                                                             <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                    Contraseña *
                                                                             </label>
                                                                             <div className="relative">
                                                                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                                    <input
                                                                                           type={showPassword ? 'text' : 'password'}
                                                                                           id="password"
                                                                                           name="password"
                                                                                           value={formData.password}
                                                                                           onChange={handleInputChange}
                                                                                           className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                           placeholder="Mínimo 8 caracteres"
                                                                                    />
                                                                                    <button
                                                                                           type="button"
                                                                                           onClick={() => setShowPassword(!showPassword)}
                                                                                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                                                    >
                                                                                           {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                                    </button>
                                                                             </div>
                                                                             {errors.password && (
                                                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                                                             )}
                                                                      </div>

                                                                      {/* Password Confirmation */}
                                                                      <div>
                                                                             <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                    Confirmar Contraseña *
                                                                             </label>
                                                                             <div className="relative">
                                                                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                                    <input
                                                                                           type={showPasswordConfirmation ? 'text' : 'password'}
                                                                                           id="password_confirmation"
                                                                                           name="password_confirmation"
                                                                                           value={formData.password_confirmation}
                                                                                           onChange={handleInputChange}
                                                                                           className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                           placeholder="Repite la contraseña"
                                                                                    />
                                                                                    <button
                                                                                           type="button"
                                                                                           onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                                                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                                                    >
                                                                                           {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                                    </button>
                                                                             </div>
                                                                             {errors.password_confirmation && (
                                                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                                                                             )}
                                                                      </div>

                                                                      {/* Role */}
                                                                      <div>
                                                                             <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                    Rol del Usuario *
                                                                             </label>
                                                                             <div className="relative">
                                                                                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                                    <select
                                                                                           id="role"
                                                                                           name="role"
                                                                                           value={formData.role}
                                                                                           onChange={handleInputChange}
                                                                                           className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                    >
                                                                                           <option value="user">Usuario</option>
                                                                                           <option value="admin">Administrador</option>
                                                                                    </select>
                                                                             </div>
                                                                             {errors.role && (
                                                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
                                                                             )}
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 </div>

                                                 {/* Right Column - Avatar Upload */}
                                                 <div>
                                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                                      <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                                      Foto de Perfil
                                                               </h3>

                                                               {!avatarPreview ? (
                                                                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                                                                             <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">👤</div>
                                                                             <div className="space-y-2">
                                                                                    <label htmlFor="avatar" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors">
                                                                                           <Upload className="h-4 w-4" />
                                                                                           Seleccionar Imagen
                                                                                    </label>
                                                                                    <input
                                                                                           id="avatar"
                                                                                           name="avatar"
                                                                                           type="file"
                                                                                           accept="image/*"
                                                                                           onChange={handleAvatarChange}
                                                                                           className="hidden"
                                                                                    />
                                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                                           JPG, PNG, WEBP hasta 2MB
                                                                                    </p>
                                                                             </div>
                                                                      </div>
                                                               ) : (
                                                                      <div className="space-y-4">
                                                                             <div className="relative">
                                                                                    <img
                                                                                           src={avatarPreview}
                                                                                           alt="Vista previa"
                                                                                           className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                                                    />
                                                                                    <button
                                                                                           type="button"
                                                                                           onClick={clearAvatar}
                                                                                           className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-500 transition-colors"
                                                                                           title="Eliminar imagen"
                                                                                    >
                                                                                           <ArrowLeft className="h-4 w-4" />
                                                                                    </button>
                                                                             </div>

                                                                             <div className="text-center">
                                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                           {avatarFile?.name} ({((avatarFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                                                                                    </p>
                                                                                    <label htmlFor="avatar" className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm cursor-pointer mt-2">
                                                                                           <Upload className="h-4 w-4" />
                                                                                           Cambiar imagen
                                                                                    </label>
                                                                                    <input
                                                                                           id="avatar"
                                                                                           name="avatar"
                                                                                           type="file"
                                                                                           accept="image/*"
                                                                                           onChange={handleAvatarChange}
                                                                                           className="hidden"
                                                                                    />
                                                                             </div>
                                                                      </div>
                                                               )}

                                                               {errors.avatar && (
                                                                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.avatar}</p>
                                                               )}
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Action Buttons */}
                                          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                                                 <Link
                                                        href="/admin/users"
                                                        className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                                 >
                                                        <ArrowLeft className="h-5 w-5" />
                                                        Cancelar
                                                 </Link>

                                                 <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-gray-900/50"
                                                 >
                                                        {isSubmitting ? (
                                                               <>
                                                                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                                      Creando...
                                                               </>
                                                        ) : (
                                                               <>
                                                                      <User className="h-5 w-5" />
                                                                      Crear Usuario
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