import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';

// Importar estilos de Leaflet
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
       latitude?: number;
       longitude?: number;
       placeName?: string;
}

type MapViewType = 'satellite' | 'map' | 'hybrid';

export default function LocationMap({
       latitude = -21.82840189264017,
       longitude = -63.74364026082149,
       placeName = 'Caraparí'
}: LocationMapProps) {
       const mapRef = useRef<HTMLDivElement>(null);
       const mapInstance = useRef<L.Map | null>(null);
       const tileLayerRef = useRef<L.TileLayer | null>(null);
       const [mapView, setMapView] = useState<MapViewType>('satellite');

       // Definir capas disponibles
       const tileLayers = {
              satellite: L.tileLayer(
                     'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                     {
                            attribution: '© Google',
                            maxZoom: 20,
                     }
              ),
              map: L.tileLayer(
                     'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                     {
                            attribution: '© OpenStreetMap contributors',
                            maxZoom: 19,
                     }
              ),
              hybrid: L.tileLayer(
                     'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
                     {
                            attribution: '© Google',
                            maxZoom: 20,
                     }
              )
       };

       const changeMapView = (newView: MapViewType) => {
              if (!mapInstance.current) return;

              // Remover capa anterior
              if (tileLayerRef.current) {
                     mapInstance.current.removeLayer(tileLayerRef.current);
              }

              // Agregar nueva capa
              tileLayerRef.current = tileLayers[newView];
              tileLayerRef.current.addTo(mapInstance.current);

              setMapView(newView);
       };

       useEffect(() => {
              if (!mapRef.current) return;

              // Inicializar mapa
              mapInstance.current = L.map(mapRef.current).setView(
                     [latitude, longitude],
                     13
              );

              // Agregar capa satelital por defecto
              tileLayerRef.current = tileLayers.satellite;
              tileLayerRef.current.addTo(mapInstance.current);

              // Agregar marcador
              L.marker([latitude, longitude])
                     .bindPopup(`<b>${placeName}</b>`)
                     .addTo(mapInstance.current)
                     .openPopup();

              // Cleanup
              return () => {
                     if (mapInstance.current) {
                            mapInstance.current.remove();
                            mapInstance.current = null;
                     }
              };
       }, [latitude, longitude, placeName]);

       return (
              <div className="space-y-4">
                     {/* Botones de control de vista */}
                     <div className="flex gap-2 justify-center flex-wrap">
                            <button
                                   onClick={() => changeMapView('satellite')}
                                   className={`px-4 py-2 rounded-lg font-semibold transition-all ${mapView === 'satellite'
                                          ? 'bg-green-600 text-black'
                                          : 'bg-neutral-700 text-white hover:bg-neutral-600'
                                          }`}
                            >
                                   🛰️ Satélite
                            </button>
                            <button
                                   onClick={() => changeMapView('map')}
                                   className={`px-4 py-2 rounded-lg font-semibold transition-all ${mapView === 'map'
                                          ? 'bg-green-600 text-black'
                                          : 'bg-neutral-700 text-white hover:bg-neutral-600'
                                          }`}
                            >
                                   🗺️ Mapa
                            </button>
                            <button
                                   onClick={() => changeMapView('hybrid')}
                                   className={`px-4 py-2 rounded-lg font-semibold transition-all ${mapView === 'hybrid'
                                          ? 'bg-green-600 text-black'
                                          : 'bg-neutral-700 text-white hover:bg-neutral-600'
                                          }`}
                            >
                                   🌍 Híbrido
                            </button>
                     </div>

                     {/* Mapa */}
                     <div
                            ref={mapRef}
                            style={{
                                   width: '100%',
                                   height: '400px',
                                   borderRadius: '12px',
                                   border: '1px solid rgba(229, 231, 235, 0.2)',
                                   boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                            }}
                     />
              </div>
       );
}
