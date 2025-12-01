import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, User as UserIcon, Mail, Calendar, Shield, Edit2, Crown, CheckCircle, XCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface User {
       id: number;
       name: string;
       email: string;
       role: 'admin' | 'user';
       avatar: string | null;
       email_verified_at: string | null;
       created_at: string;
       updated_at: string;
}

interface UserShowProps {
       user: User;
}

export default function ShowUser({ user }: UserShowProps) {
       const formatDate = (dateString: string) => {
              return new Date(dateString).toLocaleDateString('es-ES', {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric',
                     hour: '2-digit',
                     minute: '2-digit'
              });
       };

       return (
              <AppLayout breadcrumbs={[
                     { title: 'Dashboard', href: '/dashboard' },
                     { title: 'Usuarios', href: '/admin/users' },
                     { title: user.name, href: `/admin/users/${user.id}` }
              ]}>
                     <Head title={`Admin - ${user.name}`} />

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

                                   <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-4">
                                                 <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                                        {user.avatar ? (
                                                               <img
                                                                      src={`/storage/${user.avatar}`}
                                                                      alt={user.name}
                                                                      className="h-full w-full object-cover"
                                                               />
                                                        ) : (
                                                               <UserIcon className="h-8 w-8 text-gray-400" />
                                                        )}
                                                 </div>
                                                 <div>
                                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                               {user.name}
                                                        </h1>
                                                        <div className="flex items-center gap-2 mt-1">
                                                               <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                               <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                                                        </div>
                                                 </div>
                                          </div>

                                          <Link
                                                 href={`/admin/users/${user.id}/edit`}
                                                 className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                                          >
                                                 <Edit2 className="h-5 w-5" />
                                                 Editar Usuario
                                          </Link>
                                   </div>
                            </div>

                            {/* User Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                   {/* Main Information */}
                                   <div className="lg:col-span-2 space-y-6">
                                          {/* Basic Info Card */}
                                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                 <div className="p-6">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                               <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                               Información Personal
                                                        </h3>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                               <div>
                                                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                             Nombre Completo
                                                                      </label>
                                                                      <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                                             {user.name}
                                                                      </p>
                                                               </div>

                                                               <div>
                                                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                             Correo Electrónico
                                                                      </label>
                                                                      <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                                             {user.email}
                                                                      </p>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Account Activity */}
                                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                 <div className="p-6">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                               <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                               Actividad de la Cuenta
                                                        </h3>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                               <div>
                                                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                             Fecha de Registro
                                                                      </label>
                                                                      <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                                             {formatDate(user.created_at)}
                                                                      </p>
                                                               </div>

                                                               <div>
                                                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                             Última Actualización
                                                                      </label>
                                                                      <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                                             {formatDate(user.updated_at)}
                                                                      </p>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Sidebar */}
                                   <div className="space-y-6">
                                          {/* Status Card */}
                                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                 <div className="p-6">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                                               Estado de la Cuenta
                                                        </h3>

                                                        <div className="space-y-4">
                                                               {/* Role */}
                                                               <div className="flex items-center justify-between">
                                                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rol</span>
                                                                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${user.role === 'admin'
                                                                             ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                                                             : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                                             }`}>
                                                                             {user.role === 'admin' ? (
                                                                                    <>
                                                                                           <Crown className="h-3 w-3" />
                                                                                           Administrador
                                                                                    </>
                                                                             ) : (
                                                                                    <>
                                                                                           <UserIcon className="h-3 w-3" />
                                                                                           Usuario
                                                                                    </>
                                                                             )}
                                                                      </span>
                                                               </div>

                                                               {/* Email Verification */}
                                                               <div className="flex items-center justify-between">
                                                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                                                                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${user.email_verified_at
                                                                             ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                             : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                             }`}>
                                                                             {user.email_verified_at ? (
                                                                                    <>
                                                                                           <CheckCircle className="h-3 w-3" />
                                                                                           Verificado
                                                                                    </>
                                                                             ) : (
                                                                                    <>
                                                                                           <XCircle className="h-3 w-3" />
                                                                                           No Verificado
                                                                                    </>
                                                                             )}
                                                                      </span>
                                                               </div>

                                                               {user.email_verified_at && (
                                                                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                                             Verificado el {formatDate(user.email_verified_at)}
                                                                      </div>
                                                               )}
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Profile Image */}
                                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                 <div className="p-6">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                                               Imagen de Perfil
                                                        </h3>

                                                        <div className="text-center">
                                                               <div className="h-32 w-32 mx-auto rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                                                      {user.avatar ? (
                                                                             <img
                                                                                    src={`/storage/${user.avatar}`}
                                                                                    alt={user.name}
                                                                                    className="h-full w-full object-cover"
                                                                             />
                                                                      ) : (
                                                                             <UserIcon className="h-16 w-16 text-gray-400" />
                                                                      )}
                                                               </div>

                                                               {!user.avatar && (
                                                                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                                             Sin imagen de perfil
                                                                      </p>
                                                               )}
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Permissions */}
                                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                 <div className="p-6">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                               <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                                               Permisos
                                                        </h3>

                                                        <div className="space-y-3">
                                                               <div className="flex items-center justify-between text-sm">
                                                                      <span className="text-gray-700 dark:text-gray-300">Acceso al Dashboard</span>
                                                                      <span className="text-green-600 dark:text-green-400">✓</span>
                                                               </div>

                                                               <div className="flex items-center justify-between text-sm">
                                                                      <span className="text-gray-700 dark:text-gray-300">Ver Lugares</span>
                                                                      <span className="text-green-600 dark:text-green-400">✓</span>
                                                               </div>

                                                               {user.role === 'admin' && (
                                                                      <>
                                                                             <div className="flex items-center justify-between text-sm">
                                                                                    <span className="text-gray-700 dark:text-gray-300">Gestionar Lugares</span>
                                                                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                                                             </div>

                                                                             <div className="flex items-center justify-between text-sm">
                                                                                    <span className="text-gray-700 dark:text-gray-300">Gestionar Usuarios</span>
                                                                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                                                             </div>

                                                                             <div className="flex items-center justify-between text-sm">
                                                                                    <span className="text-gray-700 dark:text-gray-300">Panel de Administración</span>
                                                                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                                                             </div>
                                                                      </>
                                                               )}
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </AppLayout>
       );
}