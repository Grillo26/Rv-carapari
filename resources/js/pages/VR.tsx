import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState, useRef, useCallback } from 'react';

// ── TypeScript: declarar model-viewer como elemento JSX válido ──────────────
declare global {
       namespace JSX {
              interface IntrinsicElements {
                     'model-viewer': React.DetailedHTMLProps<
                            React.HTMLAttributes<HTMLElement> & {
                                   src?: string;
                                   'auto-rotate'?: boolean | string;
                                   'camera-controls'?: boolean | string;
                                   'shadow-intensity'?: string;
                                   'ar-modes'?: string;
                                   'environment-image'?: string;
                                   exposure?: string;
                                   'rotation-per-second'?: string;
                            },
                            HTMLElement
                     >;
              }
       }
}

type Asset3D = {
       id: number;
       name: string;
       description?: string;
       model_path?: string;
       is_active?: boolean;
};

type Hotspot = {
       id: number;
       pos_x: number;
       pos_y: number;
       pos_z: number;
       label?: string;
       description?: string;
       asset_3d?: Asset3D | null;
};

// ── Normaliza cualquier ruta a una URL utilizable ────────────────────────────
function normalizePath(src: string | undefined | null): string {
       if (!src) return '';
       if (/^https?:\/\//i.test(src)) return src;
       if (src.startsWith('/storage/')) return src;
       if (src.startsWith('storage/')) return `/${src}`;
       if (src.startsWith('/')) return src;
       return `/storage/${src}`;
}

// ── Estado global para rastrear si A-Frame ya fue cargado ───────────────────
// Esto evita múltiples instancias de Three.js en navegaciones SPA
let aframeLoadPromise: Promise<void> | null = null;

function loadAFrame(): Promise<void> {
       // Si ya existe en el DOM (navegación SPA), resolver inmediatamente
       if ((window as any).AFRAME) {
              return Promise.resolve();
       }

       // Si ya estamos cargando, devolver la misma promesa
       if (aframeLoadPromise) {
              return aframeLoadPromise;
       }

       aframeLoadPromise = new Promise<void>((resolve) => {
              // Verificar si el script ya está en el DOM
              const existing = document.querySelector('script[data-aframe]');
              if (existing) {
                     if ((window as any).AFRAME) {
                            resolve();
                     } else {
                            existing.addEventListener('load', () => resolve(), { once: true });
                     }
                     return;
              }

              const script = document.createElement('script');
              script.src = 'https://aframe.io/releases/1.4.1/aframe.min.js';
              script.setAttribute('data-aframe', 'true');
              script.onload = () => resolve();
              script.onerror = () => {
                     aframeLoadPromise = null; // permitir reintento
                     resolve(); // continuar aunque falle
              };
              document.head.appendChild(script);
       });

       return aframeLoadPromise;
}

function loadModelViewer(): void {
       if (document.querySelector('script[data-model-viewer]')) return;
       const script = document.createElement('script');
       script.type = 'module';
       script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
       script.setAttribute('data-model-viewer', 'true');
       document.head.appendChild(script);
}

// ════════════════════════════════════════════════════════════════════════════
export default function VR() {
       const { props } = usePage<{
              image?: string;
              hotspots?: Hotspot[];
              place?: {
                     title: string;
                     id: number;
                     images?: Array<{ title: string; url: string; id: number; is_main?: boolean }>;
              };
       }>();

       const image = props.image;
       const place = props.place;
       const hotspots: Hotspot[] = props.hotspots ?? [];

       const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
       const [showInstructions, setShowInstructions] = useState(true);
       const [sidebarMinimized, setSidebarMinimized] = useState(false);
       // 'loading' | 'ready' | 'error'
       const [sceneStatus, setSceneStatus] = useState<'loading' | 'ready' | 'error'>('loading');

       const vrContainerRef = useRef<HTMLDivElement>(null);
       // Guardamos refs estables para no recrear la escena
       const hotspotsRef = useRef(hotspots);
       const panoSrcRef = useRef('');

       const fallback = '/images/imagekkk.jpg';
       const panoSrc = normalizePath(image) || fallback;
       panoSrcRef.current = panoSrc;

       // ── Cambiar panorama ────────────────────────────────────────────────────
       const changeImage = useCallback((newImageUrl: string) => {
              const normalized = normalizePath(newImageUrl);
              const placeParam = place?.id ? `&place_id=${encodeURIComponent(String(place.id))}` : '';
              window.location.href = `/vr?image=${encodeURIComponent(normalized)}${placeParam}`;
       }, [place?.id]);

       // ── Click en hotspot ────────────────────────────────────────────────────
       const handleHotspotClick = useCallback((hotspotId: number) => {
              const found = hotspotsRef.current.find((h) => h.id === hotspotId);
              if (found) setSelectedHotspot(found);
       }, []);

       // ── Auto-ocultar instrucciones ──────────────────────────────────────────
       useEffect(() => {
              const t = setTimeout(() => setShowInstructions(false), 15000);
              return () => clearTimeout(t);
       }, []);

       // ── EFECTO PRINCIPAL: carga A-Frame → inyecta escena → adjunta eventos ──
       useEffect(() => {
              let cancelled = false;
              let inertiaAnim: number | null = null;
              let cleanupEvents: (() => void) | undefined;

              const init = async () => {
                     // 1. Cargar A-Frame (una sola instancia global)
                     await loadAFrame();

                     // 2. Cargar model-viewer en paralelo (no bloquea)
                     loadModelViewer();

                     if (cancelled || !vrContainerRef.current) return;

                     // 3. Si ya hay una escena en el DOM (hot-reload), destruirla limpiamente
                     const oldScene = vrContainerRef.current.querySelector('a-scene') as any;
                     if (oldScene) {
                            try { oldScene.destroy?.(); } catch (_) { }
                            vrContainerRef.current.innerHTML = '';
                     }

                     // 4. Construir el HTML de los hotspots
                     const hotspotsHTML = hotspotsRef.current.map((h) => {
                            const safeLabel = (h.label || h.asset_3d?.name || 'Punto')
                                   .replace(/"/g, '&quot;')
                                   .replace(/'/g, '&#39;');
                            return `
                    <a-entity
                        position="${h.pos_x} ${h.pos_y} ${h.pos_z}"
                        data-hotspot-id="${h.id}">
                        <a-torus
                            radius="0.18"
                            radius-tubular="0.012"
                            color="#00CC55"
                            opacity="0.6"
                            animation="property:scale;from:1 1 1;to:1.5 1.5 1.5;dir:alternate;dur:1100;easing:easeInOutSine;loop:true">
                        </a-torus>
                        <a-sphere
                            class="hotspot-trigger"
                            data-hotspot-id="${h.id}"
                            radius="0.14"
                            color="#00CC55"
                            opacity="0.9">
                        </a-sphere>
                        <a-sphere
                            radius="0.07"
                            color="#ffffff"
                            opacity="0.8">
                        </a-sphere>
                        <a-text
                            value="${safeLabel}"
                            align="center"
                            color="#ffffff"
                            width="1.6"
                            position="0 0.35 0"
                            side="double">
                        </a-text>
                    </a-entity>`;
                     }).join('');

                     // 5. Inyectar la escena A-Frame completa
                     vrContainerRef.current.innerHTML = `
                <a-scene
                    id="vr-scene"
                    vr-mode-ui="enabled: false"
                    embedded
                    renderer="logarithmicDepthBuffer: true; antialias: true"
                    style="height:100%;width:100%;">
                    <a-assets timeout="15000">
                        <img id="pano-img" src="${panoSrcRef.current}" crossorigin="anonymous" />
                    </a-assets>
                    <a-sky
                        id="vr-sky"
                        src="#pano-img"
                        rotation="0 -130 0">
                    </a-sky>
                    ${hotspotsHTML}
                    <a-camera
                        id="vr-camera"
                        position="0 0 0"
                        look-controls="reverseMouseDrag: true; reverseTouchDrag: true; touchEnabled: true"
                        wasd-controls="enabled: false">
                    </a-camera>
                </a-scene>`;

                     // 6. Esperar a que la escena esté lista
                     const sceneEl = vrContainerRef.current.querySelector('#vr-scene') as any;
                     if (!sceneEl) return;

                     const onSceneLoaded = () => {
                            if (cancelled) return;
                            setSceneStatus('ready');

                            const canvas = sceneEl.querySelector('canvas') as HTMLCanvasElement | null;
                            const cameraEl = sceneEl.querySelector('#vr-camera') as any;
                            if (!canvas || !cameraEl) return;

                            // ── Click via Raycaster ──────────────────────────────────────
                            let clickStartX = 0, clickStartY = 0;

                            const onMouseDown = (e: MouseEvent) => {
                                   clickStartX = e.clientX;
                                   clickStartY = e.clientY;
                            };

                            const onCanvasClick = (e: MouseEvent) => {
                                   if (Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY) > 6) return;

                                   const THREE = (window as any).THREE;
                                   if (!THREE || !sceneEl.camera) return;

                                   const rect = canvas.getBoundingClientRect();
                                   const ndc = {
                                          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
                                          y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
                                   };

                                   const raycaster = new THREE.Raycaster();
                                   raycaster.setFromCamera(ndc, sceneEl.camera);

                                   const meshes: any[] = [];
                                   sceneEl.querySelectorAll('.hotspot-trigger').forEach((el: any) => {
                                          el.object3D?.traverse((child: any) => {
                                                 if (child.isMesh) {
                                                        child.__hotspotId = parseInt(el.getAttribute('data-hotspot-id'), 10);
                                                        meshes.push(child);
                                                 }
                                          });
                                   });

                                   const hit = raycaster.intersectObjects(meshes, false)[0];
                                   if (hit?.object.__hotspotId) {
                                          handleHotspotClick(hit.object.__hotspotId);
                                   }
                            };

                            // ── Inercia ──────────────────────────────────────────────────
                            let isDragging = false;
                            let lastX = 0, lastY = 0;
                            let velX = 0, velY = 0, lastT = 0;
                            const momentum = { x: 0, y: 0 };
                            const FRICTION = 0.92, MIN_VEL = 0.0005;

                            const onDragStart = (e: MouseEvent) => {
                                   const target = e.target as HTMLElement;
                                   if (target.closest('button, a, .places-sidebar, .instructions-menu')) return;
                                   isDragging = true;
                                   lastX = e.clientX; lastY = e.clientY;
                                   lastT = performance.now();
                                   if (inertiaAnim) { cancelAnimationFrame(inertiaAnim); inertiaAnim = null; }
                            };

                            const onDragMove = (e: MouseEvent) => {
                                   if (!isDragging) return;
                                   const now = performance.now(), dt = now - lastT;
                                   if (dt > 0) {
                                          velX = (e.clientX - lastX) / dt;
                                          velY = (e.clientY - lastY) / dt;
                                          lastX = e.clientX; lastY = e.clientY; lastT = now;
                                   }
                            };

                            const onDragEnd = () => {
                                   if (!isDragging) return;
                                   isDragging = false;
                                   momentum.x = velX * 0.35;
                                   momentum.y = velY * 0.35;
                                   if (Math.abs(momentum.x) > MIN_VEL || Math.abs(momentum.y) > MIN_VEL) {
                                          const tick = () => {
                                                 momentum.x *= FRICTION; momentum.y *= FRICTION;
                                                 const rot = cameraEl.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
                                                 cameraEl.setAttribute('rotation', {
                                                        x: Math.max(-85, Math.min(85, (rot.x || 0) - momentum.y * 2)),
                                                        y: (rot.y || 0) + momentum.x * 2,
                                                        z: 0,
                                                 });
                                                 if (Math.abs(momentum.x) > MIN_VEL || Math.abs(momentum.y) > MIN_VEL) {
                                                        inertiaAnim = requestAnimationFrame(tick);
                                                 } else { inertiaAnim = null; }
                                          };
                                          tick();
                                   }
                            };

                            canvas.addEventListener('mousedown', onMouseDown);
                            canvas.addEventListener('click', onCanvasClick);
                            canvas.addEventListener('mousedown', onDragStart);
                            canvas.addEventListener('mousemove', onDragMove);
                            window.addEventListener('mouseup', onDragEnd);

                            cleanupEvents = () => {
                                   canvas.removeEventListener('mousedown', onMouseDown);
                                   canvas.removeEventListener('click', onCanvasClick);
                                   canvas.removeEventListener('mousedown', onDragStart);
                                   canvas.removeEventListener('mousemove', onDragMove);
                                   window.removeEventListener('mouseup', onDragEnd);
                                   if (inertiaAnim) cancelAnimationFrame(inertiaAnim);
                            };
                     };

                     if (sceneEl.hasLoaded) {
                            onSceneLoaded();
                     } else {
                            sceneEl.addEventListener('loaded', onSceneLoaded, { once: true });
                     }
              };

              init().catch((err) => {
                     console.error('[VR] Error al inicializar escena:', err);
                     setSceneStatus('error');
              });

              return () => {
                     cancelled = true;
                     cleanupEvents?.();
                     if (inertiaAnim) cancelAnimationFrame(inertiaAnim);
              };
              // eslint-disable-next-line react-hooks/exhaustive-deps
       }, []); // ← sin dependencias: solo se ejecuta UNA VEZ al montar

       return (
              <>
                     <Head>
                            <title>Visor 360°</title>
                            <style>{`
                    html, body { margin: 0; padding: 0; overflow: hidden; }

                    @keyframes hotspot-modal-in {
                        from { opacity: 0; transform: scale(0.88) translateY(16px); }
                        to   { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }

                    model-viewer {
                        width: 100%;
                        height: 100%;
                        background: transparent;
                        --poster-color: transparent;
                    }
                    model-viewer::part(default-ar-button) { display: none; }

                    .vr-sidebar-item:hover {
                        background: rgba(0,204,85,0.15) !important;
                        border-color: rgba(0,204,85,0.6) !important;
                    }

                    @media (max-width: 768px) {
                        .instructions-panel {
                            left: 50% !important;
                            transform: translateX(-50%) !important;
                            width: 88% !important;
                            max-width: 340px !important;
                        }
                        .vr-sidebar { width: 260px !important; }
                    }
                `}</style>
                     </Head>

                     <div style={{ height: '100vh', width: '100vw', background: '#000', position: 'relative', overflow: 'hidden' }}>

                            {/* ── Contenedor A-Frame ──────────────────────────────────── */}
                            <div
                                   ref={vrContainerRef}
                                   style={{ position: 'absolute', inset: 0 }}
                            />

                            {/* ── Pantalla de carga ───────────────────────────────────── */}
                            {sceneStatus === 'loading' && (
                                   <div style={{
                                          position: 'absolute', inset: 0, zIndex: 5000,
                                          background: 'rgba(0,0,0,0.92)',
                                          display: 'flex', flexDirection: 'column',
                                          alignItems: 'center', justifyContent: 'center', gap: 20,
                                          color: 'white',
                                   }}>
                                          <div style={{
                                                 width: 52, height: 52,
                                                 border: '4px solid rgba(0,204,85,0.2)',
                                                 borderTop: '4px solid #00CC55',
                                                 borderRadius: '50%',
                                                 animation: 'spin 0.9s linear infinite',
                                          }} />
                                          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>
                                                 Cargando visor 360°…
                                          </div>
                                   </div>
                            )}

                            {/* ── Error ──────────────────────────────────────────────── */}
                            {sceneStatus === 'error' && (
                                   <div style={{
                                          position: 'absolute', inset: 0, zIndex: 5000,
                                          display: 'flex', flexDirection: 'column',
                                          alignItems: 'center', justifyContent: 'center', gap: 16,
                                          color: 'white', padding: 32,
                                   }}>
                                          <div style={{ fontSize: 48 }}>⚠️</div>
                                          <div style={{ fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                                                 No se pudo cargar el visor 3D.<br />Verifica tu conexión e intenta recargar.
                                          </div>
                                          <button
                                                 onClick={() => window.location.reload()}
                                                 style={{
                                                        padding: '10px 24px', background: '#00CC55',
                                                        border: 'none', borderRadius: 8,
                                                        color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                                                 }}>
                                                 Recargar página
                                          </button>
                                   </div>
                            )}

                            {/* ── Botón volver ─────────────────────────────────────────── */}
                            <a href="/#places" style={{
                                   position: 'fixed', left: 16, top: 16, zIndex: 9999,
                                   padding: '8px 14px',
                                   background: 'rgba(0,0,0,0.75)',
                                   borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                                   color: 'white', fontWeight: 500, fontSize: 13,
                                   textDecoration: 'none',
                                   display: 'inline-flex', alignItems: 'center', gap: 6,
                                   backdropFilter: 'blur(8px)',
                                   boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                            }}>
                                   ← Volver a lugares
                            </a>

                            {/* ── Panel de instrucciones ──────────────────────────────── */}
                            {showInstructions && (
                                   <div className="instructions-panel" style={{
                                          position: 'fixed', bottom: 20, left: 20, zIndex: 9999,
                                          background: 'rgba(5,10,5,0.97)',
                                          borderRadius: 16, padding: 20,
                                          color: 'white', width: 330,
                                          border: '1.5px solid rgba(0,204,85,0.4)',
                                          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                                          backdropFilter: 'blur(16px)',
                                   }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                                 <h3 style={{ color: '#00CC55', margin: 0, fontSize: 14, letterSpacing: '0.04em' }}>
                                                        🎮 CÓMO NAVEGAR EN 360°
                                                 </h3>
                                                 <button onClick={() => setShowInstructions(false)}
                                                        style={{ background: 'none', border: 'none', color: '#ff5555', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>
                                                        ✕
                                                 </button>
                                          </div>

                                          {[
                                                 { icon: '🖱️', title: 'Computadora', tips: ['Arrastra para girar la vista', 'Rueda del mouse para zoom', 'Suelta para inercia tipo ruleta'] },
                                                 { icon: '📱', title: 'Móvil / Tablet', tips: ['Desliza un dedo para girar', 'Pellizca dos dedos para zoom'] },
                                                 { icon: '🥽', title: 'Modo VR', tips: ['Pulsa el ícono VR en la esquina', 'Mueve la cabeza para mirar'] },
                                          ].map(({ icon, title, tips }) => (
                                                 <div key={title} style={{
                                                        background: 'rgba(255,255,255,0.06)', borderRadius: 10,
                                                        padding: '10px 12px', marginBottom: 8,
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                 }}>
                                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#FFE600', marginBottom: 6 }}>
                                                               {icon} {title}
                                                        </div>
                                                        {tips.map(t => (
                                                               <div key={t} style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>• {t}</div>
                                                        ))}
                                                 </div>
                                          ))}

                                          <button onClick={() => setShowInstructions(false)} style={{
                                                 marginTop: 8, width: '100%', padding: '9px 0',
                                                 background: 'linear-gradient(90deg,#00CC55,#009940)',
                                                 border: 'none', borderRadius: 8, color: 'white',
                                                 fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                          }}>
                                                 ✅ ¡Entendido! Explorar ahora
                                          </button>
                                   </div>
                            )}

                            {/* ── Botón ayuda (siempre visible) ───────────────────────── */}
                            <button
                                   onClick={() => setShowInstructions(s => !s)}
                                   style={{
                                          position: 'fixed', top: '50%', right: 20,
                                          transform: 'translateY(-50%)',
                                          zIndex: sidebarMinimized ? 9999 : 9997,
                                          width: 46, height: 46, borderRadius: '50%',
                                          background: 'rgba(0,0,0,0.8)',
                                          border: '2px solid rgba(0,204,85,0.5)',
                                          color: '#00CC55', fontSize: 20, cursor: 'pointer',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          boxShadow: '0 2px 16px rgba(0,204,85,0.2)',
                                          transition: 'all 0.2s',
                                   }}
                                   title="Instrucciones"
                            >❓</button>

                            {/* ── Sidebar de vistas ───────────────────────────────────── */}
                            <div className="vr-sidebar" style={{
                                   position: 'fixed', top: 0,
                                   right: sidebarMinimized ? -320 : 0,
                                   width: 300, height: '100vh',
                                   background: 'rgba(4,10,4,0.97)',
                                   zIndex: 9998,
                                   transition: 'right 0.35s cubic-bezier(.16,1,.3,1)',
                                   borderLeft: '1.5px solid rgba(0,204,85,0.2)',
                                   backdropFilter: 'blur(16px)',
                                   display: 'flex', flexDirection: 'column',
                            }}>
                                   {/* Header sidebar */}
                                   <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                                          <h3 style={{ color: '#00CC55', margin: '0 0 6px 0', fontSize: 14, fontWeight: 700 }}>
                                                 📍 Vistas del Lugar
                                          </h3>
                                          {place && (
                                                 <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: 12 }}>
                                                        {place.title}
                                                 </p>
                                          )}
                                   </div>

                                   {/* Lista imágenes */}
                                   <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
                                          {(() => {
                                                 const allImages = place?.images ?? [];
                                                 if (allImages.length === 0) {
                                                        return (
                                                               <div style={{
                                                                      textAlign: 'center', color: 'rgba(255,255,255,0.4)',
                                                                      fontSize: 13, paddingTop: 48,
                                                               }}>
                                                                      <div style={{ fontSize: 40, marginBottom: 14 }}>🗺️</div>
                                                                      No hay vistas disponibles
                                                               </div>
                                                        );
                                                 }
                                                 return (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                               {allImages.map((img, index) => {
                                                                      const normalizedImg = normalizePath(img.url);
                                                                      const normalizedCurrent = normalizePath(image || '');
                                                                      const isCurrent = normalizedCurrent === normalizedImg;
                                                                      const displayTitle = img.is_main ? 'Vista Principal' : (img.title || `Vista ${index + 1}`);
                                                                      const icon = isCurrent ? '📍' : (img.is_main ? '⭐' : '🌍');

                                                                      return (
                                                                             <div
                                                                                    key={img.id ?? index}
                                                                                    className="vr-sidebar-item"
                                                                                    onClick={() => changeImage(img.url)}
                                                                                    style={{
                                                                                           padding: '11px 14px',
                                                                                           background: isCurrent ? 'rgba(0,204,85,0.18)' : 'rgba(255,255,255,0.05)',
                                                                                           borderRadius: 10, cursor: 'pointer',
                                                                                           border: isCurrent
                                                                                                  ? '1.5px solid #00CC55'
                                                                                                  : '1.5px solid rgba(255,255,255,0.08)',
                                                                                           transition: 'all 0.2s',
                                                                                    }}
                                                                             >
                                                                                    <div style={{
                                                                                           color: 'white', fontSize: 13,
                                                                                           fontWeight: isCurrent ? 700 : 500,
                                                                                           display: 'flex', alignItems: 'center', gap: 8,
                                                                                    }}>
                                                                                           <span>{icon}</span>{displayTitle}
                                                                                    </div>
                                                                                    <div style={{
                                                                                           color: isCurrent ? '#00CC55' : 'rgba(255,255,255,0.35)',
                                                                                           fontSize: 11, marginTop: 4,
                                                                                    }}>
                                                                                           {isCurrent ? '✅ Vista actual' : 'Click para cambiar'}
                                                                                    </div>
                                                                             </div>
                                                                      );
                                                               })}
                                                        </div>
                                                 );
                                          })()}
                                   </div>
                            </div>

                            {/* ── Toggle sidebar ──────────────────────────────────────── */}
                            <button
                                   onClick={() => setSidebarMinimized(s => !s)}
                                   style={{
                                          position: 'fixed', top: 16, right: 20, zIndex: 9999,
                                          width: 44, height: 44, borderRadius: '50%',
                                          background: 'rgba(0,0,0,0.8)',
                                          border: '2px solid #00CC55', color: '#00CC55',
                                          fontSize: 18, cursor: 'pointer',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          boxShadow: '0 2px 16px rgba(0,204,85,0.25)',
                                          transition: 'all 0.25s',
                                   }}
                                   title={sidebarMinimized ? 'Mostrar vistas' : 'Ocultar panel'}
                            >
                                   {sidebarMinimized ? '📍' : '✕'}
                            </button>

                            {/* ── Indicadores mini (post instrucciones) ───────────────── */}
                            {!showInstructions && (
                                   <div style={{
                                          position: 'fixed', bottom: 16, left: 16, zIndex: 9998,
                                          display: 'flex', flexDirection: 'column', gap: 6,
                                   }}>
                                          {[['🖱️', 'Arrastra para mirar'], ['🔍', 'Rueda para zoom']].map(([icon, text]) => (
                                                 <div key={String(text)} style={{
                                                        background: 'rgba(0,0,0,0.7)', padding: '5px 11px',
                                                        borderRadius: 6, color: 'rgba(255,255,255,0.75)', fontSize: 11,
                                                        display: 'flex', alignItems: 'center', gap: 7,
                                                        backdropFilter: 'blur(6px)',
                                                 }}>
                                                        <span style={{ fontSize: 14 }}>{icon}</span>{text}
                                                 </div>
                                          ))}
                                   </div>
                            )}

                            {/* ════════════════════════════════════════════════════════════
                    MODAL HOTSPOT
                    ✅ Usa <model-viewer> (Web Component de Google).
                       NO crea una segunda <a-scene>, evitando el conflicto
                       con Three.js y el error "a[e] is not a constructor".
                ════════════════════════════════════════════════════════════ */}
                            {selectedHotspot && (
                                   <div
                                          onClick={() => setSelectedHotspot(null)}
                                          style={{
                                                 position: 'fixed', inset: 0, zIndex: 10000,
                                                 background: 'rgba(0,0,0,0.72)',
                                                 backdropFilter: 'blur(10px)',
                                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                 padding: 20,
                                          }}
                                   >
                                          <div
                                                 onClick={e => e.stopPropagation()}
                                                 style={{
                                                        background: 'linear-gradient(150deg, rgb(8,18,8) 0%, rgb(4,28,14) 100%)',
                                                        border: '1.5px solid #00CC55',
                                                        borderRadius: 20, maxWidth: 480, width: '100%',
                                                        boxShadow: '0 0 60px rgba(0,204,85,0.18), 0 24px 64px rgba(0,0,0,0.85)',
                                                        overflow: 'hidden',
                                                        animation: 'hotspot-modal-in 0.25s cubic-bezier(.16,1,.3,1)',
                                                 }}
                                          >
                                                 {/* Header modal */}
                                                 <div style={{
                                                        background: 'linear-gradient(90deg,#00CC55 0%,#009940 100%)',
                                                        padding: '15px 20px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                               <span style={{ fontSize: 22 }}>📦</span>
                                                               <div>
                                                                      <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
                                                                             {selectedHotspot.label || selectedHotspot.asset_3d?.name || 'Elemento 3D'}
                                                                      </div>
                                                                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>
                                                                             Hotspot #{selectedHotspot.id}
                                                                      </div>
                                                               </div>
                                                        </div>
                                                        <button
                                                               onClick={() => setSelectedHotspot(null)}
                                                               style={{
                                                                      background: 'rgba(0,0,0,0.2)', border: 'none',
                                                                      borderRadius: '50%', width: 30, height: 30,
                                                                      color: '#fff', fontSize: 15, cursor: 'pointer',
                                                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                               }}>✕</button>
                                                 </div>

                                                 {/* Body modal */}
                                                 <div style={{ padding: 22, maxHeight: '68vh', overflowY: 'auto' }}>

                                                        {selectedHotspot.description && (
                                                               <p style={{
                                                                      color: 'rgba(255,255,255,0.8)', fontSize: 13,
                                                                      lineHeight: 1.65, margin: '0 0 18px 0',
                                                                      padding: '12px 14px',
                                                                      background: 'rgba(255,255,255,0.05)',
                                                                      borderRadius: 10,
                                                                      borderLeft: '3px solid #00CC55',
                                                               }}>
                                                                      {selectedHotspot.description}
                                                               </p>
                                                        )}

                                                        {selectedHotspot.asset_3d ? (
                                                               <>
                                                                      {/* Nombre asset */}
                                                                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                                             <div style={{
                                                                                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                                                                                    background: 'linear-gradient(135deg,#00CC55,#009940)',
                                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                                                                             }}>🧊</div>
                                                                             <div>
                                                                                    <div style={{ color: '#00CC55', fontWeight: 700, fontSize: 15 }}>
                                                                                           {selectedHotspot.asset_3d.name}
                                                                                    </div>
                                                                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                                                                                           Asset 3D · ID {selectedHotspot.asset_3d.id}
                                                                                    </div>
                                                                             </div>
                                                                      </div>

                                                                      {selectedHotspot.asset_3d.description && (
                                                                             <p style={{
                                                                                    color: 'rgba(255,255,255,0.7)', fontSize: 13,
                                                                                    lineHeight: 1.6, margin: '0 0 16px 0',
                                                                             }}>
                                                                                    {selectedHotspot.asset_3d.description}
                                                                             </p>
                                                                      )}

                                                                      {/* ── VISOR 3D ── model-viewer, sin conflicto con A-Frame ── */}
                                                                      {selectedHotspot.asset_3d.model_path &&
                                                                             /\.(glb|gltf)$/i.test(selectedHotspot.asset_3d.model_path) && (
                                                                                    <div style={{
                                                                                           borderRadius: 12, overflow: 'hidden',
                                                                                           border: '1px solid rgba(0,204,85,0.3)',
                                                                                           height: 220, marginBottom: 18,
                                                                                           background: '#060d06', position: 'relative',
                                                                                    }}>
                                                                                           <div style={{
                                                                                                  position: 'absolute', top: 8, left: 10, zIndex: 1,
                                                                                                  color: '#88FFB3', fontSize: 9, fontWeight: 700,
                                                                                                  letterSpacing: '0.08em', textTransform: 'uppercase',
                                                                                                  pointerEvents: 'none',
                                                                                                  background: 'rgba(0,0,0,0.5)',
                                                                                                  padding: '3px 8px', borderRadius: 4,
                                                                                           }}>
                                                                                                  ▶ Vista previa 3D — arrastra para rotar
                                                                                           </div>
                                                                                           {/* @ts-ignore */}
                                                                                           <model-viewer
                                                                                                  src={normalizePath(selectedHotspot.asset_3d.model_path)}
                                                                                                  auto-rotate
                                                                                                  camera-controls
                                                                                                  shadow-intensity="1.2"
                                                                                                  exposure="0.9"
                                                                                                  rotation-per-second="28deg"
                                                                                                  ar-modes="none"
                                                                                                  style={{ width: '100%', height: '100%' }}
                                                                                           />
                                                                                    </div>
                                                                             )}

                                                                      {/* Ruta normalizada */}
                                                                      {selectedHotspot.asset_3d.model_path && (
                                                                             <div style={{
                                                                                    background: 'rgba(0,204,85,0.06)',
                                                                                    border: '1px solid rgba(0,204,85,0.2)',
                                                                                    borderRadius: 10, padding: '9px 13px', marginBottom: 14,
                                                                             }}>
                                                                                    <div style={{
                                                                                           color: '#88FFB3', fontSize: 9, fontWeight: 700,
                                                                                           marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em',
                                                                                    }}>
                                                                                           📁 Archivo del modelo
                                                                                    </div>
                                                                                    <div style={{
                                                                                           color: 'rgba(255,255,255,0.55)', fontSize: 11,
                                                                                           fontFamily: 'monospace', wordBreak: 'break-all',
                                                                                    }}>
                                                                                           {normalizePath(selectedHotspot.asset_3d.model_path)}
                                                                                    </div>
                                                                             </div>
                                                                      )}

                                                                      {/* Badges */}
                                                                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                                             <span style={{
                                                                                    background: selectedHotspot.asset_3d.is_active ? 'rgba(0,204,85,0.15)' : 'rgba(255,80,80,0.15)',
                                                                                    border: `1px solid ${selectedHotspot.asset_3d.is_active ? '#00CC55' : '#ff5050'}`,
                                                                                    color: selectedHotspot.asset_3d.is_active ? '#00CC55' : '#ff5050',
                                                                                    borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700,
                                                                             }}>
                                                                                    {selectedHotspot.asset_3d.is_active ? '✅ Activo' : '⛔ Inactivo'}
                                                                             </span>
                                                                             <span style={{
                                                                                    background: 'rgba(255,255,255,0.06)',
                                                                                    border: '1px solid rgba(255,255,255,0.12)',
                                                                                    color: 'rgba(255,255,255,0.45)',
                                                                                    borderRadius: 20, padding: '3px 12px', fontSize: 11,
                                                                             }}>
                                                                                    🧊 Modelo 3D
                                                                             </span>
                                                                      </div>
                                                               </>
                                                        ) : (
                                                               <div style={{
                                                                      textAlign: 'center', color: 'rgba(255,255,255,0.4)',
                                                                      padding: '28px 0', fontSize: 13,
                                                               }}>
                                                                      <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                                                                      Sin asset 3D asignado
                                                               </div>
                                                        )}

                                                        {/* Coordenadas */}
                                                        <div style={{
                                                               marginTop: 16, padding: '9px 14px',
                                                               background: 'rgba(255,255,255,0.04)',
                                                               borderRadius: 8, display: 'flex', gap: 20, justifyContent: 'center',
                                                        }}>
                                                               {([['X', selectedHotspot.pos_x], ['Y', selectedHotspot.pos_y], ['Z', selectedHotspot.pos_z]] as [string, number][]).map(([axis, val]) => (
                                                                      <div key={axis} style={{ textAlign: 'center' }}>
                                                                             <div style={{ color: '#88FFB3', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>{axis}</div>
                                                                             <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'monospace' }}>
                                                                                    {val.toFixed(2)}
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            )}

                     </div>
              </>
       );
}
