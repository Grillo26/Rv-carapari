import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Users, UserPlus, Search, Filter, Eye, Edit2, Trash2, Shield, User as UserIcon, Mail, Calendar, MoreVertical, Crown, UserCheck } from 'lucide-react';
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

interface UserIndexProps {
       users: {
              data: User[];
              current_page: number;
              last_page: number;
              per_page: number;
              total: number;
              from: number;
              to: number;
       };
       filters: {
              search: string;
              role: string;
              sort: string;
              direction: string;
       };
       stats: {
              total: number;
              admins: number;
              users: number;
              verified: number;
       };
}

export default function UsersIndex({ users, filters, stats }: UserIndexProps) {
       const [searchTerm, setSearchTerm] = useState(filters.search || '');
       const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
       const [deleteModal, setDeleteModal] = useState<{
              isOpen: boolean;
              user: User | null;
              isDeleting: boolean;
       }>({
              isOpen: false,
              user: null,
              isDeleting: false
       });

       const handleSearch = () => {
              router.get('/admin/users', {
                     search: searchTerm,
                     role: roleFilter,
                     sort: filters.sort,
                     direction: filters.direction
              }, {
                     preserveState: true,
              });
       };

       const handleSort = (field: string) => {
              const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
              router.get('/admin/users', {
                     search: searchTerm,
                     role: roleFilter,
                     sort: field,
                     direction: direction
              }, {
                     preserveState: true,
              });
       };

       const handleToggleRole = (user: User) => {
              router.patch(`/admin/users/${user.id}/toggle-role`, {}, {
                     preserveState: true,
              });
       };

       const handleDeleteClick = (user: User) => {
              setDeleteModal({
                     isOpen: true,
                     user,
                     isDeleting: false
              });
       };

       const handleDeleteConfirm = () => {
              if (!deleteModal.user) return;

              setDeleteModal(prev => ({ ...prev, isDeleting: true }));

              router.delete(`/admin/users/${deleteModal.user.id}`, {
                     onSuccess: () => {
                            setDeleteModal({ isOpen: false, user: null, isDeleting: false });
                     },
                     onError: () => {
                            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
                     }
              });
       };

       const handleDeleteCancel = () => {
              setDeleteModal({ isOpen: false, user: null, isDeleting: false });
       };

       const formatDate = (dateString: string) => {
              return new Date(dateString).toLocaleDateString('es-ES', {
                     year: 'numeric',
                     month: 'short',
                     day: 'numeric'
              });
       };

       return (
              <AppLayout>
                     <Head title="Admin - Gestión de Usuarios" />

                     <div className="p-6">
                            {/* Header */}
                            <div className="mb-8">
                                   <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                                 <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                                 <div>
                                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                               Gestión de Usuarios
                                                        </h1>
                                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                                               Administra todos los usuarios del sistema
                                                        </p>
                                                 </div>
                                          </div>

                                          <Link
                                                 href="/admin/users/create"
                                                 className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                                          >
                                                 <UserPlus className="h-5 w-5" />
                                                 Nuevo Usuario
                                          </Link>
                                   </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                   <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                                          <div className="flex items-center justify-between">
                                                 <div>
                                                        <p className="text-sm font-medium text-blue-100">Total Usuarios</p>
                                                        <p className="text-2xl font-bold">{stats.total}</p>
                                                 </div>
                                                 <Users className="h-8 w-8 text-blue-200" />
                                          </div>
                                   </div>

                                   <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                                          <div className="flex items-center justify-between">
                                                 <div>
                                                        <p className="text-sm font-medium text-purple-100">Administradores</p>
                                                        <p className="text-2xl font-bold">{stats.admins}</p>
                                                 </div>
                                                 <Crown className="h-8 w-8 text-purple-200" />
                                          </div>
                                   </div>

                                   <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                                          <div className="flex items-center justify-between">
                                                 <div>
                                                        <p className="text-sm font-medium text-green-100">Usuarios</p>
                                                        <p className="text-2xl font-bold">{stats.users}</p>
                                                 </div>
                                                 <UserIcon className="h-8 w-8 text-green-200" />
                                          </div>
                                   </div>

                                   <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
                                          <div className="flex items-center justify-between">
                                                 <div>
                                                        <p className="text-sm font-medium text-emerald-100">Verificados</p>
                                                        <p className="text-2xl font-bold">{stats.verified}</p>
                                                 </div>
                                                 <UserCheck className="h-8 w-8 text-emerald-200" />
                                          </div>
                                   </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 mb-6">
                                   <div className="flex flex-col md:flex-row gap-4">
                                          <div className="flex-1">
                                                 <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                        <input
                                                               type="text"
                                                               placeholder="Buscar por nombre o email..."
                                                               value={searchTerm}
                                                               onChange={(e) => setSearchTerm(e.target.value)}
                                                               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                               className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                 </div>
                                          </div>

                                          <div className="flex gap-3">
                                                 <select
                                                        value={roleFilter}
                                                        onChange={(e) => setRoleFilter(e.target.value)}
                                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                 >
                                                        <option value="all">Todos los roles</option>
                                                        <option value="admin">Administradores</option>
                                                        <option value="user">Usuarios</option>
                                                 </select>

                                                 <button
                                                        onClick={handleSearch}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                 >
                                                        <Filter className="h-4 w-4" />
                                                        Filtrar
                                                 </button>
                                          </div>
                                   </div>
                            </div>

                            {/* Users Table */}
                            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm dark:shadow-gray-900/50 overflow-hidden">
                                   <div className="overflow-x-auto">
                                          <table className="w-full">
                                                 <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-gray-600">
                                                        <tr>
                                                               <th className="px-6 py-3 text-left">
                                                                      <button
                                                                             onClick={() => handleSort('name')}
                                                                             className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-100"
                                                                      >
                                                                             Usuario
                                                                      </button>
                                                               </th>
                                                               <th className="px-6 py-3 text-left">
                                                                      <button
                                                                             onClick={() => handleSort('role')}
                                                                             className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-100"
                                                                      >
                                                                             Rol
                                                                      </button>
                                                               </th>
                                                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                      Estado
                                                               </th>
                                                               <th className="px-6 py-3 text-left">
                                                                      <button
                                                                             onClick={() => handleSort('created_at')}
                                                                             className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-100"
                                                                      >
                                                                             Registro
                                                                      </button>
                                                               </th>
                                                               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                      Acciones
                                                               </th>
                                                        </tr>
                                                 </thead>
                                                 <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-gray-700">
                                                        {users.data.map((user) => (
                                                               <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                      <td className="px-6 py-4">
                                                                             <div className="flex items-center gap-3">
                                                                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                                                                           {user.avatar ? (
                                                                                                  <img
                                                                                                         src={`/storage/${user.avatar}`}
                                                                                                         alt={user.name}
                                                                                                         className="h-full w-full object-cover"
                                                                                                  />
                                                                                           ) : (
                                                                                                  <UserIcon className="h-5 w-5 text-gray-400" />
                                                                                           )}
                                                                                    </div>
                                                                                    <div>
                                                                                           <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                                                  {user.name}
                                                                                           </p>
                                                                                           <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                                                  <Mail className="h-3 w-3" />
                                                                                                  {user.email}
                                                                                           </p>
                                                                                    </div>
                                                                             </div>
                                                                      </td>
                                                                      <td className="px-6 py-4">
                                                                             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                                                    }`}>
                                                                                    {user.role === 'admin' ? <Crown className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                                                                                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                                                                             </span>
                                                                      </td>
                                                                      <td className="px-6 py-4">
                                                                             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.email_verified_at
                                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                                    }`}>
                                                                                    {user.email_verified_at ? 'Verificado' : 'Pendiente'}
                                                                             </span>
                                                                      </td>
                                                                      <td className="px-6 py-4">
                                                                             <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                                                    <Calendar className="h-3 w-3" />
                                                                                    {formatDate(user.created_at)}
                                                                             </div>
                                                                      </td>
                                                                      <td className="px-6 py-4 text-right">
                                                                             <div className="flex items-center justify-end gap-2">
                                                                                    <Link
                                                                                           href={`/admin/users/${user.id}`}
                                                                                           className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                                                           title="Ver usuario"
                                                                                    >
                                                                                           <Eye className="h-4 w-4" />
                                                                                    </Link>
                                                                                    <Link
                                                                                           href={`/admin/users/${user.id}/edit`}
                                                                                           className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                                                           title="Editar usuario"
                                                                                    >
                                                                                           <Edit2 className="h-4 w-4" />
                                                                                    </Link>
                                                                                    <button
                                                                                           onClick={() => handleToggleRole(user)}
                                                                                           className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                                                                           title="Cambiar rol"
                                                                                    >
                                                                                           <Shield className="h-4 w-4" />
                                                                                    </button>
                                                                                    <button
                                                                                           onClick={() => handleDeleteClick(user)}
                                                                                           className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                                                           title="Eliminar usuario"
                                                                                    >
                                                                                           <Trash2 className="h-4 w-4" />
                                                                                    </button>
                                                                             </div>
                                                                      </td>
                                                               </tr>
                                                        ))}
                                                 </tbody>
                                          </table>
                                   </div>

                                   {/* Pagination */}
                                   {users.last_page > 1 && (
                                          <div className="bg-white dark:bg-neutral-900 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                                                 <div className="flex items-center justify-between">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                               Mostrando {users.from} a {users.to} de {users.total} resultados
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                               {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                                                                      <Link
                                                                             key={page}
                                                                             href={`/admin/users?page=${page}&search=${filters.search}&role=${filters.role}&sort=${filters.sort}&direction=${filters.direction}`}
                                                                             className={`px-3 py-2 rounded-lg text-sm transition-colors ${page === users.current_page
                                                                                    ? 'bg-blue-600 text-white'
                                                                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                                    }`}
                                                                      >
                                                                             {page}
                                                                      </Link>
                                                               ))}
                                                        </div>
                                                 </div>
                                          </div>
                                   )}
                            </div>
                     </div>

                     {/* Delete Modal */}
                     {deleteModal.isOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                   <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-md">
                                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                 Eliminar Usuario
                                          </h3>
                                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                 ¿Estás seguro de que deseas eliminar a <strong>{deleteModal.user?.name}</strong>?
                                                 Esta acción no se puede deshacer.
                                          </p>
                                          <div className="flex justify-end gap-3">
                                                 <button
                                                        onClick={handleDeleteCancel}
                                                        disabled={deleteModal.isDeleting}
                                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                                 >
                                                        Cancelar
                                                 </button>
                                                 <button
                                                        onClick={handleDeleteConfirm}
                                                        disabled={deleteModal.isDeleting}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                                                 >
                                                        {deleteModal.isDeleting ? 'Eliminando...' : 'Eliminar'}
                                                 </button>
                                          </div>
                                   </div>
                            </div>
                     )}
              </AppLayout>
       );
}