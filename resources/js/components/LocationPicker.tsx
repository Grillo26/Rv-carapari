import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
       initialLatitude?: number;
       initialLongitude?: number;
       initialAddress?: string;
       onLocationChange?: (latitude: number, longitude: number, address: string) => void;
}

const DEFAULT_LATITUDE = -21.82840189264017;
const DEFAULT_LONGITUDE = -63.74364026082149;

export default function LocationPicker({
       initialLatitude,
       initialLongitude,
       initialAddress = '',
       onLocationChange
}: LocationPickerProps) {
       const mapRef = useRef<HTMLDivElement>(null);
       const mapInstance = useRef<L.Map | null>(null);
       const markerRef = useRef<L.Marker | null>(null);
       const [latitude, setLatitude] = useState(initialLatitude ?? DEFAULT_LATITUDE);
       const [longitude, setLongitude] = useState(initialLongitude ?? DEFAULT_LONGITUDE);
       const [address, setAddress] = useState(initialAddress);
       const [hasSetLocation, setHasSetLocation] = useState(initialLatitude !== undefined && initialLongitude !== undefined);

       // Actualizar ubicación cuando cambian los inputs
       const handleLocationUpdate = (lat: number, lng: number, addr: string) => {
              setLatitude(lat);
              setLongitude(lng);
              setAddress(addr);
              setHasSetLocation(true);
              onLocationChange?.(lat, lng, addr);

              // Actualizar marcador en el mapa
              if (mapInstance.current && markerRef.current) {
                     mapInstance.current.removeLayer(markerRef.current);
                     markerRef.current = L.marker([lat, lng])
                            .bindPopup(`<b>${addr || 'Ubicación'}</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
                            .addTo(mapInstance.current)
                            .openPopup();

                     mapInstance.current.setView([lat, lng], 13);
              }
       };

       useEffect(() => {
              if (!mapRef.current) return;

              // Inicializar mapa
              mapInstance.current = L.map(mapRef.current).setView(
                     [latitude, longitude],
                     13
              );

              // Agregar capa satelital
              L.tileLayer(
                     'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                     {
                            attribution: '© Google',
                            maxZoom: 20,
                     }
              ).addTo(mapInstance.current);

              // Agregar marcador inicial
              markerRef.current = L.marker([latitude, longitude])
                     .bindPopup(`<b>${address || 'Ubicación'}</b><br>Lat: ${latitude.toFixed(6)}<br>Lng: ${longitude.toFixed(6)}`)
                     .addTo(mapInstance.current)
                     .openPopup();

              // Permitir hacer click en el mapa para seleccionar ubicación
              mapInstance.current.on('click', async (e) => {
                     const { lat, lng } = e.latlng;
                     handleLocationUpdate(lat, lng, address);
              });

              return () => {
                     if (mapInstance.current) {
                            mapInstance.current.remove();
                            mapInstance.current = null;
                     }
              };
       }, []);

       return (
              <div className="space-y-6">
                     {/* Instrucciones */}
                     <div className="bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-600/20 rounded-lg p-4">
                            <p className="text-blue-700 dark:text-blue-400 text-sm">
                                   📍 <strong>Instrucciones:</strong> Haz click en el mapa para seleccionar la ubicación del lugar, o ingresa las coordenadas manualmente.
                            </p>
                     </div>

                     {/* Mapa */}
                     <div>
                            <label className="block text-gray-900 dark:text-gray-100 font-semibold mb-3">Selecciona la ubicación en el mapa</label>
                            <div
                                   ref={mapRef}
                                   style={{
                                          width: '100%',
                                          height: '450px',
                                          borderRadius: '12px',
                                          border: '2px solid rgba(34, 197, 94, 0.3)',
                                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                                   }}
                            />
                     </div>

                     {/* Formulario de coordenadas */}
                     <div className="bg-white dark:bg-neutral-800/60 rounded-lg p-6 space-y-4 border border-gray-200 dark:border-neutral-700">
                            <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-lg">Datos de Ubicación</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {/* Latitud */}
                                   <div>
                                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                                                 Latitud
                                          </label>
                                          <input
                                                 type="number"
                                                 step="0.00000001"
                                                 value={latitude}
                                                 onChange={(e) => handleLocationUpdate(parseFloat(e.target.value), longitude, address)}
                                                 className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-neutral-600 focus:border-green-500 dark:focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                                 placeholder="-21.8"
                                          />
                                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Rango: -90 a 90</p>
                                   </div>

                                   {/* Longitud */}
                                   <div>
                                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                                                 Longitud
                                          </label>
                                          <input
                                                 type="number"
                                                 step="0.00000001"
                                                 value={longitude}
                                                 onChange={(e) => handleLocationUpdate(latitude, parseFloat(e.target.value), address)}
                                                 className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-neutral-600 focus:border-green-500 dark:focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                                 placeholder="-65.4"
                                          />
                                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Rango: -180 a 180</p>
                                   </div>
                            </div>

                            {/* Dirección */}
                            <div>
                                   <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                                          Dirección (Opcional)
                                   </label>
                                   <input
                                          type="text"
                                          value={address}
                                          onChange={(e) => handleLocationUpdate(latitude, longitude, e.target.value)}
                                          className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-neutral-600 focus:border-green-500 dark:focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                          placeholder="Ej: Calle Principal 123, Caraparí..."
                                   />
                            </div>

                            {/* Info de coordenadas actuales */}
                            <div className={`rounded-lg p-4 mt-4 border ${hasSetLocation ?
                                   'bg-green-50 dark:bg-green-600/10 border-green-200 dark:border-green-600/20' :
                                   'bg-red-50 dark:bg-red-600/10 border-red-200 dark:border-red-600/20'
                                   }`}>
                                   {hasSetLocation ? (
                                          <p className="text-green-700 dark:text-green-400 text-sm">
                                                 <strong>Ubicación actual:</strong><br />
                                                 Lat: <span className="font-mono">{latitude.toFixed(8)}</span><br />
                                                 Lng: <span className="font-mono">{longitude.toFixed(8)}</span>
                                                 {address && <><br />Dirección: <span className="font-mono">{address}</span></>}
                                          </p>
                                   ) : (
                                          <p className="text-red-700 dark:text-red-400 text-sm">
                                                 <strong>⚠️ Ubicación requerida</strong><br />
                                                 Debes agregar un lugar haciendo click en el mapa o ingresando las coordenadas.
                                          </p>
                                   )}
                            </div>
                     </div>
              </div>
       );
}
