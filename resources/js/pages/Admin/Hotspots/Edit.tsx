import AppLayout from '@/layouts/app-layout';
import Sphere360Picker from '@/components/Sphere360Picker';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface Asset3d {
       id: number;
       name: string;
       model_path: string;
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

interface Props {
       place: Place;
       placeImage: PlaceImage;
       hotspot: Hotspot;
       assets3d: Asset3d[];
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
              href: `/admin/places/${placeId}/images`,
       },
       {
              title: 'Puntos de Interés',
              href: `/admin/places/${placeId}/images/${imageId}/hotspots`,
       },
       {
              title: 'Editar Punto',
              href: `/admin/places/${placeId}/images/${imageId}/hotspots/${imageId}/edit`,
       },
];

export default function HotspotEdit({ place, placeImage, hotspot, assets3d }: Props) {
       const breadcrumbs = createBreadcrumbs(
              place.id,
              placeImage.id,
              place.title,
              placeImage.title || `Imagen ${placeImage.id}`
       );

       const { data, setData, put, processing, errors, reset } = useForm({
              asset_3d_id: hotspot.asset_3d_id.toString(),
              pos_x: hotspot.pos_x.toString(),
              pos_y: hotspot.pos_y.toString(),
              pos_z: hotspot.pos_z.toString(),
              label: hotspot.label || '',
              description: hotspot.description || '',
              is_active: hotspot.is_active,
              sort_order: hotspot.sort_order,
       });

       const handleSubmit = (e: FormEvent) => {
              e.preventDefault();
              put(`/admin/places/${place.id}/images/${placeImage.id}/hotspots/${hotspot.id}`);
       };

       const handleReset = () => {
              reset();
       };

       const clearError = (field: string) => {
              if (errors[field as keyof typeof errors]) {
                     setData(field as any, data[field as keyof typeof data]);
              }
       };

       return (
              <AppLayout breadcrumbs={breadcrumbs}>
                     <Head title="Editar Punto de Interés" />
                     <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                            {/* Header */}
                            <div className="p-6 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                                   <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                          Editar Punto de Interés
                                   </h1>
                                   <p className="text-gray-600 dark:text-gray-300">
                                          Imagen: <span className="font-semibold">{placeImage.title || `Imagen ${placeImage.id}`}</span>
                                   </p>
                                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                          Creado: {new Date(hotspot.created_at).toLocaleDateString('es-ES')} |
                                          Estado: <span className={hotspot.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                                 {hotspot.is_active ? 'Activo' : 'Inactivo'}
                                          </span>
                                   </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                          {/* Modelo 3D */}
                                          <div>
                                                 <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Modelo 3D *
                                                 </label>
                                                 <select
                                                        value={data.asset_3d_id}
                                                        onChange={(e) => {
                                                               setData('asset_3d_id', e.target.value);
                                                               clearError('asset_3d_id');
                                                        }}
                                                        className={`w-full px-4 py-2 rounded-lg border ${errors.asset_3d_id
                                                               ? 'border-red-500 dark:border-red-500'
                                                               : 'border-gray-300 dark:border-gray-600'
                                                               } bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                                                 >
                                                        <option value="">Seleccionar modelo...</option>
                                                        {assets3d.map((asset) => (
                                                               <option key={asset.id} value={asset.id}>
                                                                      {asset.name} ({asset.model_path})
                                                               </option>
                                                        ))}
                                                 </select>
                                                 {errors.asset_3d_id && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.asset_3d_id}</p>
                                                 )}
                                          </div>

                                          {/* Etiqueta */}
                                          <div>
                                                 <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Etiqueta
                                                 </label>
                                                 <input
                                                        type="text"
                                                        value={data.label}
                                                        onChange={(e) => {
                                                               setData('label', e.target.value);
                                                               clearError('label');
                                                        }}
                                                        placeholder="Ej: Portal entrada"
                                                        className={`w-full px-4 py-2 rounded-lg border ${errors.label
                                                               ? 'border-red-500 dark:border-red-500'
                                                               : 'border-gray-300 dark:border-gray-600'
                                                               } bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                                                 />
                                                 {errors.label && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.label}</p>
                                                 )}
                                          </div>
                                   </div>

                                   {/* Selector Visual 360° */}
                                   <div className="mb-6">
                                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                 Posición del Hotspot <span className="text-red-500">*</span>
                                                 <span className="ml-2 font-normal text-gray-500 dark:text-gray-400 text-xs">— Arrastra para girar, haz clic para cambiar la posición</span>
                                          </label>
                                          <Sphere360Picker
                                                 imageUrl={`/storage/${placeImage.image_path}`}
                                                 initialPosition={{
                                                        x: parseFloat(data.pos_x) || 0,
                                                        y: parseFloat(data.pos_y) || 0,
                                                        z: parseFloat(data.pos_z) || 0,
                                                 }}
                                                 onPick={(x, y, z) => {
                                                        setData('pos_x', String(x));
                                                        setData('pos_y', String(y));
                                                        setData('pos_z', String(z));
                                                 }}
                                          />
                                          {(errors.pos_x || errors.pos_y || errors.pos_z) && (
                                                 <p className="text-red-500 text-sm mt-2">Debes seleccionar una posición haciendo clic en la imagen 360°</p>
                                          )}
                                   </div>

                                   {/* Coordenadas capturadas (solo lectura) */}
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                          <div>
                                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                                                        Posición X
                                                 </label>
                                                 <input
                                                        type="text"
                                                        readOnly
                                                        value={data.pos_x || '—'}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 cursor-default select-none"
                                                 />
                                          </div>
                                          <div>
                                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                                                        Posición Y
                                                 </label>
                                                 <input
                                                        type="text"
                                                        readOnly
                                                        value={data.pos_y || '—'}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 cursor-default select-none"
                                                 />
                                          </div>
                                          <div>
                                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                                                        Posición Z
                                                 </label>
                                                 <input
                                                        type="text"
                                                        readOnly
                                                        value={data.pos_z || '—'}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 cursor-default select-none"
                                                 />
                                          </div>
                                   </div>

                                   {/* Descripción */}
                                   <div className="mb-6">
                                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                 Descripción
                                          </label>
                                          <textarea
                                                 value={data.description}
                                                 onChange={(e) => {
                                                        setData('description', e.target.value);
                                                        clearError('description');
                                                 }}
                                                 placeholder="Descripción opcional del punto de interés"
                                                 rows={4}
                                                 className={`w-full px-4 py-2 rounded-lg border ${errors.description
                                                        ? 'border-red-500 dark:border-red-500'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                        } bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                                          />
                                          {errors.description && (
                                                 <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                          )}
                                   </div>

                                   {/* Orden y Estado */}
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                          <div>
                                                 <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Orden
                                                 </label>
                                                 <input
                                                        type="number"
                                                        min="0"
                                                        value={data.sort_order}
                                                        onChange={(e) => {
                                                               setData('sort_order', parseInt(e.target.value) || 0);
                                                               clearError('sort_order');
                                                        }}
                                                        className={`w-full px-4 py-2 rounded-lg border ${errors.sort_order
                                                               ? 'border-red-500 dark:border-red-500'
                                                               : 'border-gray-300 dark:border-gray-600'
                                                               } bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                                                 />
                                                 {errors.sort_order && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.sort_order}</p>
                                                 )}
                                          </div>

                                          <div className="flex items-end">
                                                 <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                               type="checkbox"
                                                               checked={data.is_active}
                                                               onChange={(e) => {
                                                                      setData('is_active', e.target.checked);
                                                                      clearError('is_active');
                                                               }}
                                                               className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                               Activo
                                                        </span>
                                                 </label>
                                          </div>
                                   </div>

                                   {/* Buttons */}
                                   <div className="flex gap-3 justify-end">
                                          <Link
                                                 href={`/admin/places/${place.id}/images/${placeImage.id}/hotspots`}
                                                 className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors font-medium"
                                          >
                                                 Cancelar
                                          </Link>
                                          <button
                                                 type="button"
                                                 onClick={handleReset}
                                                 className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors font-medium"
                                          >
                                                 Resetear
                                          </button>
                                          <button
                                                 type="submit"
                                                 disabled={processing}
                                                 className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                                 {processing ? 'Actualizando...' : 'Actualizar Punto'}
                                          </button>
                                   </div>
                            </form>

                            {/* Información de Ayuda */}
                            <div className="p-6 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900">
                                   <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                          💡 Guía de Coordenadas
                                   </h3>
                                   <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                                          Las coordenadas (X, Y, Z) definen la posición del punto de interés en el espacio 3D:
                                   </p>
                                   <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                          <li>• <strong>X</strong>: Posición horizontal (izquierda - derecha)</li>
                                          <li>• <strong>Y</strong>: Posición vertical (arriba - abajo)</li>
                                          <li>• <strong>Z</strong>: Profundidad (cerca - lejos)</li>
                                   </ul>
                            </div>
                     </div>
              </AppLayout>
       );
}
