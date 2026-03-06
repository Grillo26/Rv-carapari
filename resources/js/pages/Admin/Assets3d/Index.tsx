import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Upload } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

interface Asset3d {
       id: number;
       name: string;
       description: string | null;
       model_path: string;
       is_active: boolean;
       sort_order: number;
       created_at: string;
       updated_at: string;
}

interface PaginationMeta {
       current_page: number;
       from: number | null;
       last_page: number;
       per_page: number;
       to: number | null;
       total: number;
       path: string;
}

interface PaginationLink {
       url: string | null;
       label: string;
       active: boolean;
}

interface Asset3dIndexProps {
       assets?: {
              data: Asset3d[];
              links: PaginationLink[];
              meta: PaginationMeta;
       };
}

export default function Asset3dIndex({ assets = { data: [], links: [], meta: { current_page: 1, from: null, last_page: 1, per_page: 15, to: null, total: 0, path: '' } } }: Asset3dIndexProps) {
       const assetsData = assets?.data ?? [];
       const pagination = assets?.meta;

       const [deleteModal, setDeleteModal] = useState<{
              isOpen: boolean;
              asset: Asset3d | null;
              isDeleting: boolean;
       }>({
              isOpen: false,
              asset: null,
              isDeleting: false
       });

       const handleToggleActive = (asset: Asset3d) => {
              router.patch(`/admin/assets3d/${asset.id}/toggle-active`, {}, {
                     preserveState: true,
                     preserveScroll: true,
              });
       };

       const handleDeleteClick = (asset: Asset3d) => {
              setDeleteModal({
                     isOpen: true,
                     asset,
                     isDeleting: false
              });
       };

       const handleDeleteConfirm = () => {
              if (!deleteModal.asset) return;

              setDeleteModal(prev => ({ ...prev, isDeleting: true }));

              router.delete(`/admin/assets3d/${deleteModal.asset.id}`, {
                     preserveState: true,
                     preserveScroll: true,
                     onSuccess: () => {
                            setDeleteModal({ isOpen: false, asset: null, isDeleting: false });
                     },
                     onError: () => {
                            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
                     }
              });
       };

       const handleDeleteCancel = () => {
              setDeleteModal({ isOpen: false, asset: null, isDeleting: false });
       };

       return (
              <AppLayout breadcrumbs={[
                     { title: 'Dashboard', href: '/dashboard' },
                     { title: 'Modelos 3D', href: '/admin/assets3d' }
              ]}>
                     <Head title="Admin - Modelos 3D" />

                     <div className="p-6">
                            {/* Header */}
                            <div className="mb-8">
                                   <div className="flex items-center justify-between mb-4">
                                          <Link
                                                 href="/dashboard"
                                                 className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                          >
                                                 <ArrowLeft className="h-5 w-5" />
                                                 Volver a dashboard
                                          </Link>
                                   </div>

                                   <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                          <div>
                                                 <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                        <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                                        Modelos 3D
                                                 </h1>
                                                 <p className="mt-2 text-gray-600 dark:text-gray-400">
                                                        Gestiona los modelos 3D (.glb) disponibles para los hotspots
                                                 </p>
                                          </div>
                                          <Link
                                                 href="/admin/assets3d/create"
                                                 className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-blue-900/50"
                                          >
                                                 <Plus className="h-5 w-5" />
                                                 Crear Modelo 3D
                                          </Link>
                                   </div>

                                   {/* Stats Card */}
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                                                 <div className="flex items-center justify-between">
                                                        <div>
                                                               <p className="text-sm font-medium text-blue-100">Total de Modelos</p>
                                                               <p className="text-2xl font-bold">{assets?.meta?.total ?? 0}</p>
                                                        </div>
                                                        <Upload className="h-8 w-8 text-blue-200" />
                                                 </div>
                                          </div>

                                          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                                                 <div className="flex items-center justify-between">
                                                        <div>
                                                               <p className="text-sm font-medium text-green-100">Activos</p>
                                                               <p className="text-2xl font-bold">
                                                                      {assets.data.filter(a => a.is_active).length}
                                                               </p>
                                                        </div>
                                                        <Eye className="h-8 w-8 text-green-200" />
                                                 </div>
                                          </div>

                                          <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg p-4 text-white">
                                                 <div className="flex items-center justify-between">
                                                        <div>
                                                               <p className="text-sm font-medium text-gray-100">Inactivos</p>
                                                               <p className="text-2xl font-bold">
                                                                      {assets.data.filter(a => !a.is_active).length}
                                                               </p>
                                                        </div>
                                                        <EyeOff className="h-8 w-8 text-gray-200" />
                                                 </div>
                                          </div>
                                   </div>
                            </div>

                            {/* Table */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50">
                                   {assets.data.length === 0 ? (
                                          <div className="text-center py-16">
                                                 <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📦</div>
                                                 <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                        No hay modelos 3D
                                                 </h3>
                                                 <p className="text-gray-500 dark:text-gray-400 mb-6">
                                                        Comienza creando tu primer modelo 3D para usar en hotspots
                                                 </p>
                                                 <Link
                                                        href="/admin/assets3d/create"
                                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-all"
                                                 >
                                                        <Plus className="h-5 w-5" />
                                                        Crear Modelo 3D
                                                 </Link>
                                          </div>
                                   ) : (
                                          <div className="overflow-x-auto">
                                                 <table className="w-full">
                                                        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                                               <tr>
                                                                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                                                             Nombre
                                                                      </th>
                                                                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                                                             Ruta del Modelo
                                                                      </th>
                                                                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                                                             Orden
                                                                      </th>
                                                                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                                                             Estado
                                                                      </th>
                                                                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                                                             Fecha Creación
                                                                      </th>
                                                                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                                                             Acciones
                                                                      </th>
                                                               </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                               {assets.data.map((asset) => (
                                                                      <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                                             <td className="px-6 py-4">
                                                                                    <div>
                                                                                           <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                                                                  {asset.name}
                                                                                           </p>
                                                                                           {asset.description && (
                                                                                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                                                                         {asset.description}
                                                                                                  </p>
                                                                                           )}
                                                                                    </div>
                                                                             </td>
                                                                             <td className="px-6 py-4">
                                                                                    <code className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded font-mono">
                                                                                           {asset.model_path}
                                                                                    </code>
                                                                             </td>
                                                                             <td className="px-6 py-4">
                                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                                                           {asset.sort_order}
                                                                                    </span>
                                                                             </td>
                                                                             <td className="px-6 py-4">
                                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${asset.is_active
                                                                                           ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                                                           : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                                                                           }`}>
                                                                                           {asset.is_active ? '✓ Activo' : '✕ Inactivo'}
                                                                                    </span>
                                                                             </td>
                                                                             <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
                                                                                    {new Date(asset.created_at).toLocaleDateString()}
                                                                             </td>
                                                                             <td className="px-6 py-4">
                                                                                    <div className="flex items-center justify-center gap-2">
                                                                                           <button
                                                                                                  onClick={() => handleToggleActive(asset)}
                                                                                                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${asset.is_active
                                                                                                         ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                                                                                                         : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                                                                         }`}
                                                                                                  title={asset.is_active ? 'Desactivar' : 'Activar'}
                                                                                           >
                                                                                                  {asset.is_active ? (
                                                                                                         <>
                                                                                                                <EyeOff className="h-3 w-3" />
                                                                                                                Desactivar
                                                                                                         </>
                                                                                                  ) : (
                                                                                                         <>
                                                                                                                <Eye className="h-3 w-3" />
                                                                                                                Activar
                                                                                                         </>
                                                                                                  )}
                                                                                           </button>

                                                                                           <Link
                                                                                                  href={`/admin/assets3d/${asset.id}/edit`}
                                                                                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-xs font-medium transition-colors"
                                                                                           >
                                                                                                  <Edit className="h-3 w-3" />
                                                                                                  Editar
                                                                                           </Link>

                                                                                           <button
                                                                                                  onClick={() => handleDeleteClick(asset)}
                                                                                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-md text-xs font-medium transition-colors"
                                                                                           >
                                                                                                  <Trash2 className="h-3 w-3" />
                                                                                                  Eliminar
                                                                                           </button>
                                                                                    </div>
                                                                             </td>
                                                                      </tr>
                                                               ))}
                                                        </tbody>
                                                 </table>
                                          </div>
                                   )}
                            </div>

                            {/* Pagination */}
                            {assets?.meta && assets.meta.last_page > 1 && (
                                   <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                          <div className="text-sm text-gray-600 dark:text-gray-400">
                                                 Mostrando {assets.meta.from ?? 0} a {assets.meta.to ?? 0} de {assets.meta.total ?? 0} resultados
                                          </div>
                                          <div className="flex gap-2">
                                                 {assets.links?.map((link, index) => (
                                                        <button
                                                               key={index}
                                                               onClick={() => {
                                                                      if (link.url) router.visit(link.url);
                                                               }}
                                                               disabled={!link.url}
                                                               className={`px-3 py-2 rounded text-sm font-medium transition-colors ${link.active
                                                                      ? 'bg-blue-600 text-white dark:bg-blue-700'
                                                                      : link.url
                                                                             ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                                             : 'border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                                                                      }`}
                                                               dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                 ))}
                                          </div>
                                   </div>
                            )}
                     </div>

                     <ConfirmDeleteModal
                            isOpen={deleteModal.isOpen}
                            onClose={handleDeleteCancel}
                            onConfirm={handleDeleteConfirm}
                            title="Eliminar Modelo 3D"
                            message="¿Estás seguro de que deseas eliminar este modelo 3D? Esta acción no se puede deshacer."
                            itemName={deleteModal.asset?.name || 'Modelo 3D'}
                            isDeleting={deleteModal.isDeleting}
                     />
              </AppLayout>
       );
}
