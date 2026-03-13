import AppLayout from '@/layouts/app-layout';
import Sphere360Picker from '@/components/Sphere360Picker';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

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

interface Props {
       place: Place;
       placeImage: PlaceImage;
       assets3d: Asset3d[];
       availableImages: PlaceImage[];
}

type PointMode = 'hotspot' | 'route';

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
              href: '#',
       },
       {
              title: 'Puntos de Interés',
              href: `/admin/places/${placeId}/images/${imageId}/hotspots`,
       },
       {
              title: 'Nuevo Punto',
              href: `/admin/places/${placeId}/images/${imageId}/hotspots/create`,
       },
];

export default function HotspotCreate({ place, placeImage, assets3d, availableImages }: Props) {
       const [mode, setMode] = useState<PointMode>('hotspot');

       const breadcrumbs = createBreadcrumbs(
              place.id,
              placeImage.id,
              place.title,
              placeImage.title || `Imagen ${placeImage.id}`
       );

       // ── Formulario Hotspot ──
       const hotspotForm = useForm({
              asset_3d_id: '',
              pos_x: '',
              pos_y: '',
              pos_z: '',
              label: '',
              description: '',
              is_active: true,
              sort_order: 0,
       });

       // ── Formulario Ruta ──
       const routeForm = useForm({
              target_image_id: '',
              pos_x: '',
              pos_y: '',
              pos_z: '',
              label: '',
       });

       const handleHotspotSubmit = (e: FormEvent) => {
              e.preventDefault();
              hotspotForm.post(`/admin/places/${place.id}/images/${placeImage.id}/hotspots`);
       };

       const handleRouteSubmit = (e: FormEvent) => {
              e.preventDefault();
              routeForm.post(`/admin/places/${place.id}/images/${placeImage.id}/routes`);
       };

       const handleModeChange = (newMode: PointMode) => {
              setMode(newMode);
              hotspotForm.reset();
              routeForm.reset();
       };

       const selectedTargetImage = availableImages.find(
              (img) => String(img.id) === routeForm.data.target_image_id,
       );

       return (
              <AppLayout breadcrumbs={breadcrumbs}>
                     <Head title="Nuevo Punto" />
                     <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                            {/* Header */}
                            <div className="p-6 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                                   <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                          Crear Nuevo Punto
                                   </h1>
                                   <p className="text-gray-600 dark:text-gray-300">
                                          Imagen: <span className="font-semibold">{placeImage.title || `Imagen ${placeImage.id}`}</span>
                                   </p>
                            </div>

                            {/* ── Toggle Hotspot / Ruta ── */}
                            <div className="p-4 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                                   <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                                          Tipo de Punto
                                   </label>
                                   <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                                          <button
                                                 type="button"
                                                 onClick={() => handleModeChange('hotspot')}
                                                 className={`px-5 py-2.5 text-sm font-semibold transition-colors ${mode === 'hotspot'
                                                               ? 'bg-blue-600 text-white dark:bg-blue-700'
                                                               : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                                        }`}
                                          >
                                                 🧊 Hotspot (Modelo 3D)
                                          </button>
                                          <button
                                                 type="button"
                                                 onClick={() => handleModeChange('route')}
                                                 className={`px-5 py-2.5 text-sm font-semibold transition-colors border-l border-gray-300 dark:border-gray-600 ${mode === 'route'
                                                               ? 'bg-emerald-600 text-white dark:bg-emerald-700'
                                                               : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                                        }`}
                                          >
                                                 ➡️ Ruta (Flecha de navegación)
                                          </button>
                                   </div>
                                   <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                          {mode === 'hotspot'
                                                 ? 'Agrega un punto de interés con un modelo 3D que se mostrará al hacer clic.'
                                                 : 'Agrega una flecha de navegación que permitirá moverse a otra imagen 360°.'}
                                   </p>
                            </div>

                            {/* ════════════════════════════════════════════════════
                                FORMULARIO HOTSPOT
                               ════════════════════════════════════════════════════ */}
                            {mode === 'hotspot' && (
                                   <form onSubmit={handleHotspotSubmit} className="p-6 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                 {/* Modelo 3D */}
                                                 <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                               Modelo 3D *
                                                        </label>
                                                        <select
                                                               value={hotspotForm.data.asset_3d_id}
                                                               onChange={(e) => hotspotForm.setData('asset_3d_id', e.target.value)}
                                                               className={`w-full px-4 py-2 rounded-lg border ${hotspotForm.errors.asset_3d_id
                                                                      ? 'border-red-500 dark:border-red-500'
                                                                      : 'border-gray-300 dark:border-gray-600'
                                                                      } bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                                                        >
                                                               <option value="">Seleccionar modelo...</option>
                                                               {assets3d.map((asset) => (
                                                                      <option key={asset.id} value={asset.id}>
                                                                             {asset.name}
                                                                      </option>
                                                               ))}
                                                        </select>
                                                        {hotspotForm.errors.asset_3d_id && (
                                                               <p className="text-red-500 text-sm mt-1">{hotspotForm.errors.asset_3d_id}</p>
                                                        )}
                                                 </div>

                                                 {/* Etiqueta */}
                                                 <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                               Etiqueta
                                                        </label>
                                                        <input
                                                               type="text"
                                                               value={hotspotForm.data.label}
                                                               onChange={(e) => hotspotForm.setData('label', e.target.value)}
                                                               placeholder="Ej: Portal entrada"
                                                               className={`w-full px-4 py-2 rounded-lg border ${hotspotForm.errors.label
                                                                      ? 'border-red-500 dark:border-red-500'
                                                                      : 'border-gray-300 dark:border-gray-600'
                                                                      } bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                                                        />
                                                        {hotspotForm.errors.label && (
                                                               <p className="text-red-500 text-sm mt-1">{hotspotForm.errors.label}</p>
                                                        )}
                                                 </div>
                                          </div>

                                          {/* Selector Visual 360° */}
                                          <div className="mb-6">
                                                 <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Posición del Hotspot <span className="text-red-500">*</span>
                                                        <span className="ml-2 font-normal text-gray-500 dark:text-gray-400 text-xs">— Arrastra para girar, haz clic para fijar la posición</span>
                                                 </label>
                                                 <Sphere360Picker
                                                        imageUrl={`/storage/${placeImage.image_path}`}
                                                        onPick={(x, y, z) => {
                                                               hotspotForm.setData('pos_x', String(x));
                                                               hotspotForm.setData('pos_y', String(y));
                                                               hotspotForm.setData('pos_z', String(z));
                                                        }}
                                                 />
                                                 {(hotspotForm.errors.pos_x || hotspotForm.errors.pos_y || hotspotForm.errors.pos_z) && (
                                                        <p className="text-red-500 text-sm mt-2">Debes seleccionar una posición haciendo clic en la imagen 360°</p>
                                                 )}
                                          </div>

                                          {/* Coordenadas capturadas */}
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                 {(['pos_x', 'pos_y', 'pos_z'] as const).map((axis) => (
                                                        <div key={axis}>
                                                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                                                                      Posición {axis.slice(-1).toUpperCase()}
                                                               </label>
                                                               <input
                                                                      type="text"
                                                                      readOnly
                                                                      value={hotspotForm.data[axis] || '—'}
                                                                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 cursor-default select-none"
                                                               />
                                                        </div>
                                                 ))}
                                          </div>

                                          {/* Descripción */}
                                          <div className="mb-6">
                                                 <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Descripción
                                                 </label>
                                                 <textarea
                                                        value={hotspotForm.data.description}
                                                        onChange={(e) => hotspotForm.setData('description', e.target.value)}
                                                        placeholder="Descripción opcional del punto de interés"
                                                        rows={4}
                                                        className={`w-full px-4 py-2 rounded-lg border ${hotspotForm.errors.description
                                                               ? 'border-red-500 dark:border-red-500'
                                                               : 'border-gray-300 dark:border-gray-600'
                                                               } bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                                                 />
                                                 {hotspotForm.errors.description && (
                                                        <p className="text-red-500 text-sm mt-1">{hotspotForm.errors.description}</p>
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
                                                               value={hotspotForm.data.sort_order}
                                                               onChange={(e) => hotspotForm.setData('sort_order', parseInt(e.target.value) || 0)}
                                                               className={`w-full px-4 py-2 rounded-lg border ${hotspotForm.errors.sort_order
                                                                      ? 'border-red-500 dark:border-red-500'
                                                                      : 'border-gray-300 dark:border-gray-600'
                                                                      } bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                                                        />
                                                        {hotspotForm.errors.sort_order && (
                                                               <p className="text-red-500 text-sm mt-1">{hotspotForm.errors.sort_order}</p>
                                                        )}
                                                 </div>

                                                 <div className="flex items-end">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                               <input
                                                                      type="checkbox"
                                                                      checked={hotspotForm.data.is_active}
                                                                      onChange={(e) => hotspotForm.setData('is_active', e.target.checked)}
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
                                                        onClick={() => hotspotForm.reset()}
                                                        className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors font-medium"
                                                 >
                                                        Resetear
                                                 </button>
                                                 <button
                                                        type="submit"
                                                        disabled={hotspotForm.processing}
                                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                 >
                                                        {hotspotForm.processing ? 'Creando...' : 'Crear Hotspot'}
                                                 </button>
                                          </div>
                                   </form>
                            )}

                            {/* ════════════════════════════════════════════════════
                                FORMULARIO RUTA
                               ════════════════════════════════════════════════════ */}
                            {mode === 'route' && (
                                   <form onSubmit={handleRouteSubmit} className="p-6 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                 {/* Imagen destino */}
                                                 <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                               Imagen Destino *
                                                        </label>
                                                        {availableImages.length > 0 ? (
                                                               <select
                                                                      value={routeForm.data.target_image_id}
                                                                      onChange={(e) => routeForm.setData('target_image_id', e.target.value)}
                                                                      className={`w-full px-4 py-2 rounded-lg border ${routeForm.errors.target_image_id
                                                                             ? 'border-red-500 dark:border-red-500'
                                                                             : 'border-gray-300 dark:border-gray-600'
                                                                             } bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400`}
                                                               >
                                                                      <option value="">Seleccionar destino...</option>
                                                                      {availableImages.map((img) => (
                                                                             <option key={img.id} value={img.id}>
                                                                                    {img.title || `Imagen ${img.id}`}
                                                                             </option>
                                                                      ))}
                                                               </select>
                                                        ) : (
                                                               <p className="text-sm text-amber-600 dark:text-amber-400 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                                      No hay otras imágenes 360° disponibles para vincular.
                                                               </p>
                                                        )}
                                                        {routeForm.errors.target_image_id && (
                                                               <p className="text-red-500 text-sm mt-1">{routeForm.errors.target_image_id}</p>
                                                        )}
                                                 </div>

                                                 {/* Etiqueta */}
                                                 <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                               Etiqueta
                                                        </label>
                                                        <input
                                                               type="text"
                                                               value={routeForm.data.label}
                                                               onChange={(e) => routeForm.setData('label', e.target.value)}
                                                               placeholder="Ej: Ir a la sala principal"
                                                               className={`w-full px-4 py-2 rounded-lg border ${routeForm.errors.label
                                                                      ? 'border-red-500 dark:border-red-500'
                                                                      : 'border-gray-300 dark:border-gray-600'
                                                                      } bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400`}
                                                        />
                                                        {routeForm.errors.label && (
                                                               <p className="text-red-500 text-sm mt-1">{routeForm.errors.label}</p>
                                                        )}
                                                 </div>
                                          </div>

                                          {/* Preview miniatura imagen destino */}
                                          {selectedTargetImage && (
                                                 <div className="mb-6 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                                                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                                                               📍 Destino: {selectedTargetImage.title || `Imagen ${selectedTargetImage.id}`}
                                                        </p>
                                                        <img
                                                               src={`/storage/${selectedTargetImage.image_path}`}
                                                               alt={selectedTargetImage.title || 'Destino'}
                                                               className="w-full max-h-40 object-cover rounded-lg"
                                                        />
                                                 </div>
                                          )}

                                          {/* Selector Visual 360° — posición de la flecha en la imagen ACTUAL */}
                                          <div className="mb-6">
                                                 <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Posición de la Flecha <span className="text-red-500">*</span>
                                                        <span className="ml-2 font-normal text-gray-500 dark:text-gray-400 text-xs">— Haz clic en la imagen 360° para ubicar la flecha de navegación</span>
                                                 </label>
                                                 <Sphere360Picker
                                                        imageUrl={`/storage/${placeImage.image_path}`}
                                                        onPick={(x, y, z) => {
                                                               routeForm.setData('pos_x', String(x));
                                                               routeForm.setData('pos_y', String(y));
                                                               routeForm.setData('pos_z', String(z));
                                                        }}
                                                 />
                                                 {(routeForm.errors.pos_x || routeForm.errors.pos_y || routeForm.errors.pos_z) && (
                                                        <p className="text-red-500 text-sm mt-2">Debes seleccionar una posición haciendo clic en la imagen 360°</p>
                                                 )}
                                          </div>

                                          {/* Coordenadas capturadas */}
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                 {(['pos_x', 'pos_y', 'pos_z'] as const).map((axis) => (
                                                        <div key={axis}>
                                                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                                                                      Posición {axis.slice(-1).toUpperCase()}
                                                               </label>
                                                               <input
                                                                      type="text"
                                                                      readOnly
                                                                      value={routeForm.data[axis] || '—'}
                                                                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 cursor-default select-none"
                                                               />
                                                        </div>
                                                 ))}
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
                                                        onClick={() => routeForm.reset()}
                                                        className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors font-medium"
                                                 >
                                                        Resetear
                                                 </button>
                                                 <button
                                                        type="submit"
                                                        disabled={routeForm.processing || availableImages.length === 0}
                                                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                 >
                                                        {routeForm.processing ? 'Creando...' : 'Crear Ruta'}
                                                 </button>
                                          </div>
                                   </form>
                            )}

                            {/* Información de Ayuda */}
                            <div className={`p-6 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border ${mode === 'hotspot'
                                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900'
                                          : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900'
                                   }`}>
                                   {mode === 'hotspot' ? (
                                          <>
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
                                          </>
                                   ) : (
                                          <>
                                                 <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                                                        💡 Cómo crear una Ruta de Navegación
                                                 </h3>
                                                 <ul className="text-sm text-emerald-800 dark:text-emerald-200 space-y-1">
                                                        <li>1. Selecciona la <strong>imagen destino</strong> a la que el usuario navegará.</li>
                                                        <li>2. Haz clic en la imagen 360° para definir <strong>dónde aparecerá la flecha</strong>.</li>
                                                        <li>3. Opcionalmente agrega una <strong>etiqueta</strong> descriptiva (ej: "Ir al patio").</li>
                                                 </ul>
                                          </>
                                   )}
                            </div>
                     </div>
              </AppLayout>
       );
}
