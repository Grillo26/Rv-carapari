import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Asset3d {
       id: number;
       name: string;
       model_path: string;
}

interface Hotspot {
       id: number;
       place_image_id: number;
       asset_3d_id: number;
       pos_x: number;
       pos_y: number;
       pos_z: number;
       label: string | null;
       description: string | null;
       is_active: boolean;
       sort_order: number;
       created_at: string;
       asset_3d: Asset3d;
}

interface PlaceImage {
       id: number;
       title: string | null;
       image_path: string;
       type: string;
}

interface Place {
       id: number;
       title: string;
}

interface PaginationMeta {
       current_page: number;
       last_page: number;
       per_page: number;
       total: number;
       from: number;
       to: number;
}

interface PaginationLink {
       url: string | null;
       label: string;
       active: boolean;
}

interface Props {
       place: Place;
       placeImage: PlaceImage;
       hotspots: {
              data: Hotspot[];
              pagination: {
                     current_page: number;
                     last_page: number;
                     per_page: number;
                     total: number;
                     from: number;
                     to: number;
              };
              links: PaginationLink[];
       };
}

const createBreadcrumbs = (placeId: number, imageId: number, placeName: string, imageName: string): BreadcrumbItem[] => [
       {
              title: 'Admin',
              href: '#',
       },
       {
              title: 'Lugares',
              href: `/admin/places`,
       },
       {
              title: placeName,
              href: `/admin/places/${placeId}`,
       },
       {
              title: 'Imágenes',
              href: `/admin/places/${placeId}/images`,
       },
       {
              title: imageName,
              href: `/admin/places/${placeId}/images/${imageId}`,
       },
       {
              title: 'Puntos de Interés',
              href: `/admin/places/${placeId}/images/${imageId}/hotspots`,
       },
];

export default function HotspotIndex({ place, placeImage, hotspots }: Props) {
       const [deleteId, setDeleteId] = useState<number | null>(null);
       const [showDeleteModal, setShowDeleteModal] = useState(false);
       const [deletingHotspotLabel, setDeletingHotspotLabel] = useState<string>('');

       const breadcrumbs = createBreadcrumbs(
              place.id,
              placeImage.id,
              place.title,
              placeImage.title || `Imagen ${placeImage.id}`
       );

       const handleToggleActive = (hotspotId: number) => {
              router.patch(
                     `/admin/places/${place.id}/images/${placeImage.id}/hotspots/${hotspotId}/toggle-active`,
                     {}
              );
       };

       const handleEdit = (hotspotId: number) => {
              router.visit(
                     `/admin/places/${place.id}/images/${placeImage.id}/hotspots/${hotspotId}/edit`
              );
       };

       const handleDeleteClick = (hotspotId: number, label: string | null) => {
              setDeleteId(hotspotId);
              setDeletingHotspotLabel(label || `Punto #${hotspotId}`);
              setShowDeleteModal(true);
       };

       const handleConfirmDelete = () => {
              if (deleteId) {
                     router.delete(
                            `/admin/places/${place.id}/images/${placeImage.id}/hotspots/${deleteId}`
                     );
                     setShowDeleteModal(false);
                     setDeleteId(null);
              }
       };

       const handlePaginationLink = (url: string | null) => {
              if (url) {
                     router.visit(url);
              }
       };

       return (
              <AppLayout breadcrumbs={breadcrumbs}>
                     <Head title="Puntos de Interés" />
                     <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                            {/* Header with Title and Create Button */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                                   <div>
                                          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                                 Puntos de Interés (Hotspots)
                                          </h1>
                                          <p className="text-gray-600 dark:text-gray-300">
                                                 Imagen: <span className="font-semibold">{placeImage.title || `Imagen ${placeImage.id}`}</span>
                                          </p>
                                   </div>
                                   <Link
                                          href={`/admin/places/${place.id}/images/${placeImage.id}/hotspots/create`}
                                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                                   >
                                          + Nuevo Punto
                                   </Link>
                            </div>

                            {/* Statistics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                   <div className="p-4 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                 {hotspots.pagination.total}
                                          </div>
                                          <div className="text-sm text-gray-600 dark:text-gray-300">Puntos Totales</div>
                                   </div>
                                   <div className="p-4 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                 {hotspots.data.filter(h => h.is_active).length}
                                          </div>
                                          <div className="text-sm text-gray-600 dark:text-gray-300">Activos</div>
                                   </div>
                                   <div className="p-4 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                 {hotspots.data.filter(h => !h.is_active).length}
                                          </div>
                                          <div className="text-sm text-gray-600 dark:text-gray-300">Inactivos</div>
                                   </div>
                            </div>

                            {/* Table */}
                            <div className="p-6 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 overflow-x-auto">
                                   {hotspots.data.length > 0 ? (
                                          <>
                                                 <table className="w-full">
                                                        <thead>
                                                               <tr className="border-b border-gray-200 dark:border-gray-700">
                                                                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                                             Modelo 3D
                                                                      </th>
                                                                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                                             Etiqueta
                                                                      </th>
                                                                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                                             Coordenadas
                                                                      </th>
                                                                      <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                                             Orden
                                                                      </th>
                                                                      <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                                             Estado
                                                                      </th>
                                                                      <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                                             Fecha
                                                                      </th>
                                                                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                                             Acciones
                                                                      </th>
                                                               </tr>
                                                        </thead>
                                                        <tbody>
                                                               {hotspots.data.map((hotspot, index) => (
                                                                      <tr
                                                                             key={hotspot.id}
                                                                             className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                                                                      >
                                                                             <td className="py-3 px-4">
                                                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                                                           {hotspot.asset_3d?.name || 'Modelo no disponible'}
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                           {hotspot.asset_3d?.model_path || '—'}
                                                                                    </div>
                                                                             </td>
                                                                             <td className="py-3 px-4">
                                                                                    <span className="text-gray-700 dark:text-gray-300">
                                                                                           {hotspot.label || '—'}
                                                                                    </span>
                                                                             </td>
                                                                             <td className="py-3 px-4">
                                                                                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                                                                                           ({hotspot.pos_x.toFixed(2)}, {hotspot.pos_y.toFixed(2)}, {hotspot.pos_z.toFixed(2)})
                                                                                    </code>
                                                                             </td>
                                                                             <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                                                                                    {hotspot.sort_order}
                                                                             </td>
                                                                             <td className="py-3 px-4 text-center">
                                                                                    <button
                                                                                           onClick={() => handleToggleActive(hotspot.id)}
                                                                                           className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${hotspot.is_active
                                                                                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                                                                  }`}
                                                                                    >
                                                                                           {hotspot.is_active ? 'Activo' : 'Inactivo'}
                                                                                    </button>
                                                                             </td>
                                                                             <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                                                                                    {new Date(hotspot.created_at).toLocaleDateString('es-ES')}
                                                                             </td>
                                                                             <td className="py-3 px-4 text-right">
                                                                                    <div className="flex justify-end gap-2">
                                                                                           <button
                                                                                                  onClick={() => handleEdit(hotspot.id)}
                                                                                                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 rounded text-sm font-medium transition-colors"
                                                                                           >
                                                                                                  Editar
                                                                                           </button>
                                                                                           <button
                                                                                                  onClick={() => handleDeleteClick(hotspot.id, hotspot.label)}
                                                                                                  className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-200 rounded text-sm font-medium transition-colors"
                                                                                           >
                                                                                                  Eliminar
                                                                                           </button>
                                                                                    </div>
                                                                             </td>
                                                                      </tr>
                                                               ))}
                                                        </tbody>
                                                 </table>

                                                 {/* Pagination */}
                                                 {hotspots.pagination.last_page > 1 && (
                                                        <div className="flex justify-center items-center gap-2 mt-6">
                                                               {hotspots.links.map((link, index) => (
                                                                      <button
                                                                             key={index}
                                                                             onClick={() => handlePaginationLink(link.url)}
                                                                             disabled={!link.url}
                                                                             className={`px-3 py-1 rounded text-sm font-medium transition-colors ${link.active
                                                                                    ? 'bg-blue-600 text-white dark:bg-blue-700'
                                                                                    : link.url
                                                                                           ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                                                           : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                                                                                    }`}
                                                                             dangerouslySetInnerHTML={{ __html: link.label }}
                                                                      />
                                                               ))}
                                                        </div>
                                                 )}
                                          </>
                                   ) : (
                                          <div className="text-center py-12">
                                                 <div className="text-gray-400 dark:text-gray-600 mb-4 text-4xl">📍</div>
                                                 <p className="text-gray-600 dark:text-gray-300 mb-4">
                                                        No hay puntos de interés aún en esta imagen.
                                                 </p>
                                                 <Link
                                                        href={`/admin/places/${place.id}/images/${placeImage.id}/hotspots/create`}
                                                        className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                                                 >
                                                        + Crear Primer Punto
                                                 </Link>
                                          </div>
                                   )}
                            </div>
                     </div>

                     {/* Delete Modal */}
                     <ConfirmDeleteModal
                            isOpen={showDeleteModal}
                            title="Eliminar Punto de Interés"
                            message="¿Estás seguro de que deseas eliminar este punto de interés? Esta acción no se puede deshacer."
                            itemName={deletingHotspotLabel}
                            onConfirm={handleConfirmDelete}
                            onClose={() => {
                                   setShowDeleteModal(false);
                                   setDeleteId(null);
                            }}
                     />
              </AppLayout>
       );
}
