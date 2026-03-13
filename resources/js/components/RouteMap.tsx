import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RouteMapProps {
       destLat: number;
       destLon: number;
       placeName: string;
       onClose: () => void;
}

interface RouteInfo {
       distance: string;
       duration: string;
       steps: string[];
}

type RouteMapView = 'satellite' | 'map' | 'hybrid';

type PermissionState = 'idle' | 'requesting' | 'denied' | 'loading' | 'ready' | 'error';

export default function RouteMap({ destLat, destLon, placeName, onClose }: RouteMapProps) {
       const mapRef = useRef<HTMLDivElement>(null);
       const mapInstance = useRef<L.Map | null>(null);
       const tileLayerRef = useRef<L.TileLayer | null>(null);
       const [mapView, setMapView] = useState<RouteMapView>('map');
       const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
       const [permState, setPermState] = useState<PermissionState>('idle');
       const [errorMsg, setErrorMsg] = useState('');
       const [isDrawing, setIsDrawing] = useState(false);
       const pendingCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

       const makeTile = (view: RouteMapView) => {
              if (view === 'satellite') {
                     return L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { attribution: '© Google', maxZoom: 20 });
              }
              if (view === 'hybrid') {
                     return L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { attribution: '© Google', maxZoom: 20 });
              }
              return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 });
       };

       const changeView = (v: RouteMapView) => {
              if (!mapInstance.current) return;
              if (tileLayerRef.current) mapInstance.current.removeLayer(tileLayerRef.current);
              tileLayerRef.current = makeTile(v);
              tileLayerRef.current.addTo(mapInstance.current);
              setMapView(v);
       };

       // Inicializar mapa cuando permState === 'ready'
       useEffect(() => {
              if (permState !== 'ready') return;
              if (!mapRef.current || mapInstance.current) return;

              mapInstance.current = L.map(mapRef.current).setView([destLat, destLon], 13);
              tileLayerRef.current = makeTile('map');
              tileLayerRef.current.addTo(mapInstance.current);

              // Dibujar ruta si ya hay coordenadas pendientes del usuario
              if (pendingCoordsRef.current) {
                     const { lat, lon } = pendingCoordsRef.current;
                     pendingCoordsRef.current = null;
                     drawRoute(lat, lon);
              }
       }, [permState]);

       // Destruir el mapa solo al desmontar el componente
       useEffect(() => {
              return () => {
                     if (mapInstance.current) {
                            mapInstance.current.remove();
                            mapInstance.current = null;
                     }
              };
       }, []);

       // Dibujar ruta cuando el mapa está listo y tenemos coordenadas
       const drawRoute = (userLat: number, userLon: number) => {
              if (!mapInstance.current) return;

              setIsDrawing(true);

              // Marcador destino (verde)
              const destIcon = L.divIcon({
                     className: '',
                     html: `<div style="background:#22c55e;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.5)"></div>`,
                     iconSize: [18, 18],
                     iconAnchor: [9, 9],
              });

              // Marcador usuario (azul)
              const userIcon = L.divIcon({
                     className: '',
                     html: `<div style="background:#3b82f6;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.5)"></div>`,
                     iconSize: [18, 18],
                     iconAnchor: [9, 9],
              });

              L.marker([destLat, destLon], { icon: destIcon })
                     .bindPopup(`<b>📍 ${placeName}</b>`)
                     .addTo(mapInstance.current!)
                     .openPopup();

              L.marker([userLat, userLon], { icon: userIcon })
                     .bindPopup('<b>📌 Tu ubicación</b>')
                     .addTo(mapInstance.current!);

              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 15000);

              fetch(`https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${destLon},${destLat}?overview=full&geometries=geojson&steps=true`, { signal: controller.signal })
                     .then(res => { clearTimeout(timeoutId); return res.json(); })
                     .then(data => {
                            if (data.code !== 'Ok' || !data.routes?.length) {
                                   setIsDrawing(false);
                                   setPermState('error');
                                   setErrorMsg('No se encontró una ruta hacia este destino.');
                                   return;
                            }

                            const route = data.routes[0];
                            const distKm = (route.distance / 1000).toFixed(1);
                            const totalMin = Math.round(route.duration / 60);
                            const durationStr = totalMin >= 60
                                   ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}min`
                                   : `${totalMin} min`;

                            // Extraer pasos de navegación
                            const steps: string[] = [];
                            route.legs?.[0]?.steps?.forEach((step: { maneuver: { type: string; modifier?: string }; name: string; distance: number }) => {
                                   if (step.maneuver?.type === 'arrive') {
                                          steps.push(`🏁 Llegar a ${placeName}`);
                                   } else if (step.name) {
                                          const type = step.maneuver?.type;
                                          const mod = step.maneuver?.modifier;
                                          let icon = '➡️';
                                          if (type === 'turn' && mod === 'left') icon = '⬅️';
                                          else if (type === 'turn' && mod === 'right') icon = '➡️';
                                          else if (type === 'turn' && mod?.includes('slight')) icon = '↗️';
                                          else if (type === 'depart') icon = '🚗';
                                          else if (type === 'roundabout') icon = '🔄';
                                          const dist = step.distance >= 1000
                                                 ? `${(step.distance / 1000).toFixed(1)} km`
                                                 : `${Math.round(step.distance)} m`;
                                          steps.push(`${icon} ${step.name} — ${dist}`);
                                   }
                            });

                            setRouteInfo({ distance: `${distKm} km`, duration: durationStr, steps });

                            // Dibujar la polilínea verde
                            L.geoJSON(route.geometry, {
                                   style: {
                                          color: '#22c55e',
                                          weight: 6,
                                          opacity: 0.85,
                                          lineCap: 'round',
                                          lineJoin: 'round',
                                   }
                            }).addTo(mapInstance.current!);

                            // Ajustar vista para mostrar toda la ruta
                            const bounds = L.latLngBounds(
                                   [userLat, userLon],
                                   [destLat, destLon]
                            );
                            mapInstance.current!.fitBounds(bounds, { padding: [60, 60] });

                            setIsDrawing(false);
                     })
                     .catch((err: Error) => {
                            clearTimeout(timeoutId);
                            console.error('Error al calcular la ruta:', err);
                            setIsDrawing(false);
                            setPermState('error');
                            setErrorMsg(err?.name === 'AbortError'
                                   ? 'La solicitud tardó demasiado. Verifica tu conexión e inténtalo de nuevo.'
                                   : 'Error de conexión al calcular la ruta. Inténtalo de nuevo.');
                     });
       };

       const requestLocation = () => {
              setPermState('requesting');

              if (!navigator.geolocation) {
                     setPermState('error');
                     setErrorMsg('Tu navegador no soporta geolocalización.');
                     return;
              }

              navigator.geolocation.getCurrentPosition(
                     (pos) => {
                            // Guardar coordenadas; drawRoute se llamará desde useEffect al inicializarse el mapa
                            pendingCoordsRef.current = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                            setPermState('ready');
                     },
                     (err) => {
                            if (err.code === err.PERMISSION_DENIED) {
                                   setPermState('denied');
                            } else {
                                   setPermState('error');
                                   setErrorMsg('No se pudo obtener tu ubicación. Inténtalo de nuevo.');
                            }
                     },
                     { enableHighAccuracy: true, timeout: 15000 }
              );
       };

       return (
              <div className="mt-8 rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-900 shadow-2xl">
                     {/* Header */}
                     <div className="flex items-center justify-between px-6 py-4 bg-neutral-800 border-b border-neutral-700">
                            <div className="flex items-center gap-3">
                                   <div className="w-9 h-9 rounded-full bg-green-600/20 flex items-center justify-center">
                                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                          </svg>
                                   </div>
                                   <div>
                                          <h3 className="text-white font-bold text-lg">Cómo llegar</h3>
                                          <p className="text-neutral-400 text-sm">Ruta hacia <span className="text-green-400">{placeName}</span></p>
                                   </div>
                            </div>
                            <button
                                   onClick={onClose}
                                   className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                                   title="Cerrar"
                            >
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                   </svg>
                            </button>
                     </div>

                     {/* Estado: permiso idle */}
                     {permState === 'idle' && (
                            <div className="flex flex-col items-center justify-center gap-6 py-16 px-6 text-center">
                                   <div className="w-20 h-20 rounded-full bg-blue-600/15 flex items-center justify-center">
                                          <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                          </svg>
                                   </div>
                                   <div>
                                          <h4 className="text-white text-xl font-bold mb-2">Necesitamos tu ubicación</h4>
                                          <p className="text-neutral-400 text-sm max-w-sm">
                                                 Para calcular la ruta, el navegador pedirá permiso para acceder a tu ubicación actual.
                                                 Haz clic en <span className="text-white font-semibold">"Permitir"</span> cuando aparezca el aviso.
                                          </p>
                                   </div>
                                   {/* Guía visual */}
                                   <div className="flex items-center gap-3 bg-neutral-800 border border-neutral-700 rounded-xl px-5 py-3 text-sm text-neutral-300 max-w-sm">
                                          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Aparecerá una ventana emergente en la parte superior de tu pantalla solicitando el permiso.
                                   </div>
                                   <button
                                          onClick={requestLocation}
                                          className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg"
                                   >
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                          </svg>
                                          Conceder permiso y calcular ruta
                                   </button>
                            </div>
                     )}

                     {/* Estado: solicitando */}
                     {permState === 'requesting' && (
                            <div className="flex flex-col items-center justify-center gap-5 py-16 px-6 text-center">
                                   <div className="w-16 h-16 rounded-full bg-blue-600/15 flex items-center justify-center">
                                          <svg className="w-8 h-8 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                          </svg>
                                   </div>
                                   <div>
                                          <h4 className="text-white text-xl font-bold mb-1">Esperando permiso...</h4>
                                          <p className="text-neutral-400 text-sm">Acepta el permiso de ubicación en el cuadro de diálogo del navegador.</p>
                                   </div>
                                   <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-600/10 border border-yellow-600/20 rounded-xl px-4 py-2">
                                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                          </svg>
                                          Busca el aviso en la barra de direcciones o en la parte superior del navegador
                                   </div>
                            </div>
                     )}

                     {/* Estado: permiso denegado */}
                     {permState === 'denied' && (
                            <div className="flex flex-col items-center justify-center gap-5 py-16 px-6 text-center">
                                   <div className="w-16 h-16 rounded-full bg-red-600/15 flex items-center justify-center">
                                          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                          </svg>
                                   </div>
                                   <div>
                                          <h4 className="text-white text-xl font-bold mb-2">Permiso denegado</h4>
                                          <p className="text-neutral-400 text-sm max-w-sm">
                                                 Bloqueaste el acceso a la ubicación. Para habilitarlo:
                                          </p>
                                   </div>
                                   <ol className="text-left space-y-2 text-sm text-neutral-300 bg-neutral-800 rounded-xl p-4 max-w-sm w-full">
                                          <li className="flex gap-2"><span className="text-green-400 font-bold">1.</span> Haz clic en el ícono de candado 🔒 en la barra de direcciones</li>
                                          <li className="flex gap-2"><span className="text-green-400 font-bold">2.</span> Busca <span className="text-white font-medium">"Ubicación"</span> y cámbialo a <span className="text-white font-medium">"Permitir"</span></li>
                                          <li className="flex gap-2"><span className="text-green-400 font-bold">3.</span> Recarga la página e inténtalo de nuevo</li>
                                   </ol>
                                   <div className="flex gap-3 flex-wrap justify-center">
                                          <button
                                                 onClick={() => setPermState('idle')}
                                                 className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl font-medium transition-all"
                                          >
                                                 Reintentar
                                          </button>
                                          <a
                                                 href={`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}`}
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="px-6 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl font-medium transition-all"
                                          >
                                                 Abrir en Google Maps
                                          </a>
                                   </div>
                            </div>
                     )}

                     {/* Estado: error */}
                     {permState === 'error' && (
                            <div className="flex flex-col items-center justify-center gap-5 py-16 px-6 text-center">
                                   <div className="w-16 h-16 rounded-full bg-red-600/15 flex items-center justify-center">
                                          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                          </svg>
                                   </div>
                                   <div>
                                          <h4 className="text-white text-xl font-bold mb-2">Error</h4>
                                          <p className="text-neutral-400 text-sm">{errorMsg}</p>
                                   </div>
                                   <div className="flex gap-3 flex-wrap justify-center">
                                          <button
                                                 onClick={() => setPermState('idle')}
                                                 className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl font-medium transition-all"
                                          >
                                                 Reintentar
                                          </button>
                                          <a
                                                 href={`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}`}
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="px-6 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-xl font-medium transition-all"
                                          >
                                                 Abrir en Google Maps
                                          </a>
                                   </div>
                            </div>
                     )}

                     {/* Estado: ready — mapa con ruta */}
                     {permState === 'ready' && (
                            <div>
                                   {/* Info de ruta */}
                                   {routeInfo && !isDrawing && (
                                          <div className="flex flex-wrap items-center justify-center gap-6 px-6 py-4 bg-neutral-800 border-b border-neutral-700">
                                                 <div className="flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                        </svg>
                                                        <span className="text-neutral-400 text-sm">Distancia</span>
                                                        <span className="text-white font-bold text-lg">{routeInfo.distance}</span>
                                                 </div>
                                                 <div className="w-px h-8 bg-neutral-600 hidden sm:block" />
                                                 <div className="flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-neutral-400 text-sm">Tiempo estimado</span>
                                                        <span className="text-white font-bold text-lg">{routeInfo.duration}</span>
                                                 </div>
                                                 <div className="w-px h-8 bg-neutral-600 hidden sm:block" />
                                                 <div className="flex items-center gap-3 text-xs text-neutral-400">
                                                        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span> Tú</span>
                                                        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-500"></span> Destino</span>
                                                        <span className="flex items-center gap-1"><span className="inline-block w-8 h-1 rounded bg-green-500"></span> Ruta</span>
                                                 </div>
                                          </div>
                                   )}

                                   {/* Controles de vista */}
                                   {!isDrawing && (
                                          <div className="flex gap-2 px-6 py-3 bg-neutral-850 border-b border-neutral-700 bg-neutral-800/60 flex-wrap">
                                                 {(['map', 'satellite', 'hybrid'] as RouteMapView[]).map(v => (
                                                        <button
                                                               key={v}
                                                               onClick={() => changeView(v)}
                                                               className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${mapView === v
                                                                      ? 'bg-green-600 text-black'
                                                                      : 'bg-neutral-700 text-white hover:bg-neutral-600'
                                                                      }`}
                                                        >
                                                               {v === 'map' ? '🗺️ Mapa' : v === 'satellite' ? '🛰️ Satélite' : '🌍 Híbrido'}
                                                        </button>
                                                 ))}
                                          </div>
                                   )}

                                   {/* Mapa grande */}
                                   <div className="relative">
                                          <div ref={mapRef} style={{ width: '100%', height: '560px' }} />
                                          {isDrawing && (
                                                 <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4">
                                                        <div className="w-14 h-14 rounded-full bg-neutral-900/90 flex items-center justify-center">
                                                               <svg className="animate-spin w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24">
                                                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                               </svg>
                                                        </div>
                                                        <p className="text-white font-semibold">Calculando la mejor ruta...</p>
                                                 </div>
                                          )}
                                   </div>

                                   {/* Pasos de navegación */}
                                   {routeInfo?.steps && !isDrawing && routeInfo.steps.length > 0 && (
                                          <div className="border-t border-neutral-700 bg-neutral-900">
                                                 <div className="px-6 py-4">
                                                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                                               <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                               </svg>
                                                               Instrucciones de navegación
                                                        </h4>
                                                        <ol className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                                               {routeInfo.steps.map((step, i) => (
                                                                      <li key={i} className="flex items-start gap-3 text-sm text-neutral-300 bg-neutral-800/60 rounded-lg px-4 py-2.5">
                                                                             <span className="text-neutral-500 text-xs mt-0.5 font-mono w-5 flex-shrink-0">{i + 1}.</span>
                                                                             <span>{step}</span>
                                                                      </li>
                                                               ))}
                                                        </ol>
                                                 </div>
                                          </div>
                                   )}
                            </div>
                     )}
              </div>
       );
}
