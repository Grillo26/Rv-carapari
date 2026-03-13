import { useState, useRef, useEffect, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────
interface Asset3D {
       id: number;
       name: string;
       description?: string;
       model_path?: string;
}

interface Hotspot {
       id: number;
       pos_x: number;
       pos_y: number;
       pos_z: number;
       label?: string;
       description?: string;
       asset_3d?: Asset3D | null;
}

interface Props {
       place: { id: number; title: string; slug: string };
       image: string | null;
       hotspots: Hotspot[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Cargar A-Frame una sola vez
// ─────────────────────────────────────────────────────────────────────────────
let aframePromise: Promise<void> | null = null;
function loadAFrame(): Promise<void> {
       if ((window as any).AFRAME) return Promise.resolve();
       if (aframePromise) return aframePromise;
       aframePromise = new Promise<void>((resolve) => {
              const existing = document.querySelector('script[data-aframe]');
              if (existing) {
                     (window as any).AFRAME
                            ? resolve()
                            : existing.addEventListener('load', () => resolve(), { once: true });
                     return;
              }
              const s = document.createElement('script');
              s.src = 'https://aframe.io/releases/1.4.1/aframe.min.js';
              s.setAttribute('data-aframe', 'true');
              s.onload = () => resolve();
              s.onerror = () => { aframePromise = null; resolve(); };
              document.head.appendChild(s);
       });
       return aframePromise;
}

function normalizePath(src: string | undefined | null): string {
       if (!src) return '';
       if (/^https?:\/\//i.test(src)) return src;
       if (src.startsWith('/storage/')) return src;
       if (src.startsWith('storage/')) return `/${src}`;
       if (src.startsWith('/')) return src;
       return `/storage/${src}`;
}

function loadModelViewer() {
       if (document.querySelector('script[data-model-viewer]')) return;
       const s = document.createElement('script');
       s.type = 'module';
       s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
       s.setAttribute('data-model-viewer', 'true');
       document.head.appendChild(s);
}

// Destruye la escena A-Frame liberando el contexto WebGL explícitamente.
// Sin esto, el navegador agota los contextos disponibles (~8) y falla con
// "WebGL context could not be created" al navegar entre páginas.
function destroyScene(container: HTMLDivElement) {
       const scene = container.querySelector('a-scene') as any;
       if (scene) {
              try { scene.pause?.(); } catch (_) { }
              try {
                     const renderer = scene.renderer;
                     if (renderer) {
                            renderer.setAnimationLoop(null);
                            const gl = renderer.getContext?.();
                            gl?.getExtension?.('WEBGL_lose_context')?.loseContext?.();
                            renderer.forceContextLoss?.();
                            renderer.dispose?.();
                     }
              } catch (_) { }
              try { scene.destroy?.(); } catch (_) { }
       }
       container.innerHTML = '';
}

// Componente A-Frame que hace que los hotspots miren siempre a la cámara
function registerLookAtCam() {
       const AFRAME = (window as any).AFRAME;
       if (!AFRAME || AFRAME.components['look-at-cam']) return;
       AFRAME.registerComponent('look-at-cam', {
              tick() {
                     const cam = this.el.sceneEl?.camera;
                     if (!cam) return;
                     const THREE = (window as any).THREE;
                     if (!THREE) return;
                     const wp = new THREE.Vector3();
                     cam.getWorldPosition(wp);
                     this.el.object3D.lookAt(wp);
              },
       });
}

function AFrameViewer({
       image,
       hotspots,
       onHotspotClick,
}: {
       image: string;
       hotspots: Hotspot[];
       onHotspotClick: (id: number) => void;
}) {
       const containerRef = useRef<HTMLDivElement>(null);
       const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
       const hotspotsRef = useRef(hotspots);
       const onClickRef = useRef(onHotspotClick);
       hotspotsRef.current = hotspots;
       onClickRef.current = onHotspotClick;

       useEffect(() => {
              let cancelled = false;
              let cleanupEvents: (() => void) | undefined;
              let inertiaAnim: number | null = null;

              const init = async () => {
                     await loadAFrame();
                     if (cancelled || !containerRef.current) return;

                     destroyScene(containerRef.current);
                     registerLookAtCam();

                     const hotspotsHTML = hotspotsRef.current.map((h) => {
                            const safeLabel = (h.label || h.asset_3d?.name || 'Punto')
                                   .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                            return `
                <a-entity
                    position="${h.pos_x} ${h.pos_y} ${h.pos_z}"
                    data-hotspot-id="${h.id}"
                    look-at-cam>
                    <a-torus
                        radius="0.18" radius-tubular="0.012"
                        color="#00CC55" opacity="0.6"
                        animation="property:scale;from:1 1 1;to:1.5 1.5 1.5;dir:alternate;dur:1100;easing:easeInOutSine;loop:true">
                    </a-torus>
                    <a-sphere
                        class="hotspot-trigger"
                        data-hotspot-id="${h.id}"
                        radius="0.14" color="#00CC55" opacity="0.9">
                    </a-sphere>
                    <a-sphere radius="0.07" color="#ffffff" opacity="0.8"></a-sphere>
                </a-entity>`;
                     }).join('');

                     containerRef.current.innerHTML = `
            <a-scene
                id="vr-scene"
                vr-mode-ui="enabled: false"
                embedded
                renderer="logarithmicDepthBuffer: true; antialias: true"
                style="height:100%;width:100%;">
                <a-assets timeout="15000">
                    <img id="pano-img" src="${image}" crossorigin="anonymous" />
                </a-assets>
                <a-sky id="vr-sky" src="#pano-img"></a-sky>
                <a-entity id="hotspots-root">${hotspotsHTML}</a-entity>
                <a-camera
                    id="vr-camera" position="0 0 0"
                    look-controls="reverseMouseDrag:true;reverseTouchDrag:true;touchEnabled:true"
                    wasd-controls="enabled:false">
                </a-camera>
            </a-scene>`;

                     const sceneEl = containerRef.current.querySelector('#vr-scene') as any;
                     if (!sceneEl) return;

                     const onLoaded = () => {
                            if (cancelled) return;
                            setStatus('ready');

                            const canvas = sceneEl.querySelector('canvas') as HTMLCanvasElement | null;
                            const cameraEl = sceneEl.querySelector('#vr-camera') as any;
                            if (!canvas || !cameraEl) return;

                            // Click → raycaster
                            let clickStartX = 0, clickStartY = 0;
                            const onMD = (e: MouseEvent) => { clickStartX = e.clientX; clickStartY = e.clientY; };
                            const onCK = (e: MouseEvent) => {
                                   if (Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY) > 6) return;
                                   const THREE = (window as any).THREE;
                                   if (!THREE || !sceneEl.camera) return;
                                   const rect = canvas.getBoundingClientRect();
                                   const ndc = {
                                          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
                                          y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
                                   };
                                   const ray = new THREE.Raycaster();
                                   ray.setFromCamera(ndc, sceneEl.camera);
                                   const meshes: any[] = [];
                                   sceneEl.querySelectorAll('.hotspot-trigger').forEach((el: any) => {
                                          el.object3D?.traverse((child: any) => {
                                                 if (child.isMesh) {
                                                        child.__hotspotId = parseInt(el.getAttribute('data-hotspot-id'), 10);
                                                        meshes.push(child);
                                                 }
                                          });
                                   });
                                   const hit = ray.intersectObjects(meshes, false)[0];
                                   if (hit?.object.__hotspotId) onClickRef.current(hit.object.__hotspotId);
                            };

                            // Inercia
                            let isDragging = false, lastX = 0, lastY = 0, velX = 0, velY = 0, lastT = 0;
                            const mom = { x: 0, y: 0 };
                            const FRICTION = 0.92, MIN_VEL = 0.0005;

                            const onDS = (e: MouseEvent) => {
                                   if ((e.target as HTMLElement).closest('button,a')) return;
                                   isDragging = true; lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
                                   if (inertiaAnim) { cancelAnimationFrame(inertiaAnim); inertiaAnim = null; }
                            };
                            const onDM = (e: MouseEvent) => {
                                   if (!isDragging) return;
                                   const now = performance.now(), dt = now - lastT;
                                   if (dt > 0) { velX = (e.clientX - lastX) / dt; velY = (e.clientY - lastY) / dt; }
                                   lastX = e.clientX; lastY = e.clientY; lastT = now;
                            };
                            const onDE = () => {
                                   if (!isDragging) return;
                                   isDragging = false;
                                   mom.x = velX * 0.35; mom.y = velY * 0.35;
                                   if (Math.abs(mom.x) > MIN_VEL || Math.abs(mom.y) > MIN_VEL) {
                                          const tick = () => {
                                                 mom.x *= FRICTION; mom.y *= FRICTION;
                                                 const rot = cameraEl.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
                                                 cameraEl.setAttribute('rotation', {
                                                        x: Math.max(-85, Math.min(85, (rot.x || 0) - mom.y * 2)),
                                                        y: (rot.y || 0) + mom.x * 2, z: 0,
                                                 });
                                                 if (Math.abs(mom.x) > MIN_VEL || Math.abs(mom.y) > MIN_VEL)
                                                        inertiaAnim = requestAnimationFrame(tick);
                                                 else inertiaAnim = null;
                                          };
                                          tick();
                                   }
                            };

                            canvas.addEventListener('mousedown', onMD);
                            canvas.addEventListener('click', onCK);
                            canvas.addEventListener('mousedown', onDS);
                            canvas.addEventListener('mousemove', onDM);
                            window.addEventListener('mouseup', onDE);

                            cleanupEvents = () => {
                                   canvas.removeEventListener('mousedown', onMD);
                                   canvas.removeEventListener('click', onCK);
                                   canvas.removeEventListener('mousedown', onDS);
                                   canvas.removeEventListener('mousemove', onDM);
                                   window.removeEventListener('mouseup', onDE);
                                   if (inertiaAnim) cancelAnimationFrame(inertiaAnim);
                            };
                     };

                     sceneEl.hasLoaded ? onLoaded() : sceneEl.addEventListener('loaded', onLoaded, { once: true });
              };

              init().catch(() => setStatus('error'));
              return () => {
                     cancelled = true;
                     cleanupEvents?.();
                     if (inertiaAnim) cancelAnimationFrame(inertiaAnim);
                     if (containerRef.current) destroyScene(containerRef.current);
              };
              // eslint-disable-next-line react-hooks/exhaustive-deps
       }, [image]);

       return (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                     <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

                     {/* Loading */}
                     {status === 'loading' && (
                            <div style={{
                                   position: 'absolute', inset: 0, zIndex: 50,
                                   background: 'rgba(0,0,0,0.92)',
                                   display: 'flex', flexDirection: 'column',
                                   alignItems: 'center', justifyContent: 'center', gap: 16, color: 'white',
                            }}>
                                   <div style={{
                                          width: 48, height: 48,
                                          border: '4px solid rgba(0,204,85,0.2)',
                                          borderTop: '4px solid #00CC55',
                                          borderRadius: '50%',
                                          animation: 'spin 0.9s linear infinite',
                                   }} />
                                   <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Cargando visor 360°…</span>
                            </div>
                     )}

                     {/* Error */}
                     {status === 'error' && (
                            <div style={{
                                   position: 'absolute', inset: 0, zIndex: 50,
                                   display: 'flex', flexDirection: 'column',
                                   alignItems: 'center', justifyContent: 'center', gap: 12, color: 'white',
                            }}>
                                   <span style={{ fontSize: 40 }}>⚠️</span>
                                   <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>No se pudo cargar el visor</span>
                                   <button onClick={() => window.location.reload()} style={{
                                          padding: '8px 20px', background: '#00CC55',
                                          border: 'none', borderRadius: 8,
                                          color: 'white', fontWeight: 700, cursor: 'pointer',
                                   }}>Recargar</button>
                            </div>
                     )}

                     {/* Hint */}
                     {status === 'ready' && (
                            <div style={{
                                   position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                                   zIndex: 30, pointerEvents: 'none',
                                   background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                                   color: 'white', fontSize: 12, padding: '6px 14px',
                                   borderRadius: 20, whiteSpace: 'nowrap',
                            }}>
                                   🖱 Arrastra para girar · Clic en un punto para ver detalle
                            </div>
                     )}
              </div>
       );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal de Hotspot
// ─────────────────────────────────────────────────────────────────────────────
function HotspotModal({ hotspot, onClose }: { hotspot: Hotspot; onClose: () => void }) {
       useEffect(() => { loadModelViewer(); }, []);

       const modelPath = hotspot.asset_3d?.model_path;
       const hasModel = modelPath && /\.(glb|gltf)$/i.test(modelPath);
       const title = hotspot.label || hotspot.asset_3d?.name || 'Elemento 3D';

       return (
              <div
                     onClick={onClose}
                     style={{
                            position: 'fixed', inset: 0, zIndex: 10000,
                            background: 'rgba(0,0,0,0.82)',
                            backdropFilter: 'blur(12px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: 16,
                            animation: 'modal-in 0.2s ease',
                     }}
              >
                     <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                   background: '#111',
                                   border: '1px solid rgba(255,255,255,0.12)',
                                   borderRadius: 16, maxWidth: 700, width: '100%',
                                   boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
                                   overflow: 'hidden',
                                   animation: 'hotspot-modal-in 0.25s cubic-bezier(.16,1,.3,1)',
                                   display: 'flex', flexDirection: 'column',
                                   maxHeight: '90vh',
                            }}
                     >
                            {/* Header */}
                            <div style={{
                                   padding: '14px 20px',
                                   display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                   borderBottom: '1px solid rgba(255,255,255,0.08)',
                                   flexShrink: 0,
                            }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                          <span style={{ fontSize: 20 }}>🧊</span>
                                          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
                                                 {title}
                                          </span>
                                   </div>
                                   <button
                                          onClick={onClose}
                                          style={{
                                                 background: 'rgba(255,255,255,0.08)', border: 'none',
                                                 borderRadius: '50%', width: 32, height: 32,
                                                 color: '#fff', fontSize: 16, cursor: 'pointer',
                                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                 transition: 'background 0.15s',
                                          }}
                                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                                   >✕</button>
                            </div>

                            {/* Body — visor 3D */}
                            <div style={{ flex: 1, minHeight: 0 }}>
                                   {hotspot.asset_3d && hasModel ? (
                                          <div style={{
                                                 height: 420, background: '#0a0a0a',
                                                 position: 'relative',
                                          }}>
                                                 {/* @ts-ignore */}
                                                 <model-viewer
                                                        src={normalizePath(modelPath)}
                                                        auto-rotate
                                                        camera-controls
                                                        shadow-intensity="1"
                                                        exposure="1"
                                                        rotation-per-second="30deg"
                                                        ar-modes="none"
                                                        style={{ width: '100%', height: '100%' }}
                                                 />
                                                 <div style={{
                                                        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                                                        color: 'rgba(255,255,255,0.35)', fontSize: 11,
                                                        pointerEvents: 'none', whiteSpace: 'nowrap',
                                                 }}>
                                                        Arrastra para rotar · Scroll para zoom
                                                 </div>
                                          </div>
                                   ) : (
                                          <div style={{
                                                 height: 300,
                                                 display: 'flex', flexDirection: 'column',
                                                 alignItems: 'center', justifyContent: 'center',
                                                 color: 'rgba(255,255,255,0.35)', gap: 12,
                                          }}>
                                                 <span style={{ fontSize: 48 }}>🔍</span>
                                                 <span style={{ fontSize: 14 }}>Sin modelo 3D disponible</span>
                                          </div>
                                   )}
                            </div>

                            {/* Footer — descripción del asset si existe */}
                            {hotspot.asset_3d?.description && (
                                   <div style={{
                                          padding: '12px 20px',
                                          borderTop: '1px solid rgba(255,255,255,0.08)',
                                          color: 'rgba(255,255,255,0.6)', fontSize: 13,
                                          lineHeight: 1.5, flexShrink: 0,
                                   }}>
                                          {hotspot.asset_3d.description}
                                   </div>
                            )}
                     </div>
              </div>
       );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────
export default function Viewer360({ place, image, hotspots }: Props) {
       const [selected, setSelected] = useState<Hotspot | null>(null);

       const handleHotspotClick = useCallback((id: number) => {
              const found = hotspots.find((h) => h.id === id);
              if (found) setSelected(found);
       }, [hotspots]);

       return (
              <>
                     <Head title={`Vista 360° — ${place.title}`} />

                     <style>{`
                html, body { margin: 0; padding: 0; overflow: hidden; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes hs-pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50%       { transform: scale(1.55); opacity: 0.45; }
                }
                @keyframes modal-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes hotspot-modal-in {
                    from { opacity: 0; transform: scale(0.88) translateY(16px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>

                     <div style={{ height: '100vh', width: '100vw', background: '#000', position: 'relative', overflow: 'hidden' }}>

                            {/* ── Visor A-Frame ─────────────────────────────────── */}
                            {image ? (
                                   <AFrameViewer
                                          image={image}
                                          hotspots={hotspots}
                                          onHotspotClick={handleHotspotClick}
                                   />
                            ) : (
                                   <div style={{
                                          position: 'absolute', inset: 0,
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          color: 'rgba(255,255,255,0.4)', fontSize: 14,
                                   }}>
                                          No hay imagen 360° disponible.
                                   </div>
                            )}

                            {/* ── Botón volver ──────────────────────────────────── */}
                            <Link
                                   href={`/places/${place.slug}`}
                                   style={{
                                          position: 'fixed', left: 16, top: 16, zIndex: 9999,
                                          padding: '8px 14px',
                                          background: 'rgba(0,0,0,0.75)',
                                          borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                                          color: 'white', fontWeight: 500, fontSize: 13,
                                          textDecoration: 'none',
                                          display: 'inline-flex', alignItems: 'center', gap: 6,
                                          backdropFilter: 'blur(8px)',
                                          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                                   }}
                            >
                                   ← Volver
                            </Link>

                            {/* ── Título ────────────────────────────────────────── */}
                            <div style={{
                                   position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
                                   zIndex: 9999,
                                   background: 'rgba(0,0,0,0.7)',
                                   backdropFilter: 'blur(8px)',
                                   padding: '6px 18px', borderRadius: 20,
                                   border: '1px solid rgba(255,255,255,0.1)',
                                   color: 'white', fontSize: 13, fontWeight: 600,
                                   whiteSpace: 'nowrap',
                            }}>
                                   {place.title}
                            </div>

                            {/* ── Contador hotspots ─────────────────────────────── */}
                            {hotspots.length > 0 && (
                                   <div style={{
                                          position: 'fixed', top: 16, right: 16, zIndex: 9999,
                                          background: 'rgba(0,0,0,0.7)',
                                          backdropFilter: 'blur(8px)',
                                          padding: '6px 12px', borderRadius: 20,
                                          border: '1px solid rgba(0,204,85,0.3)',
                                          color: '#00CC55', fontSize: 12, fontWeight: 600,
                                   }}>
                                          🟢 {hotspots.length} punto{hotspots.length !== 1 ? 's' : ''}
                                   </div>
                            )}

                            {/* ── Lista hotspots (bottom) ────────────────────────── */}
                            {/* {hotspots.length > 0 && (
                                   <div style={{
                                          position: 'fixed', bottom: 16, left: 0, right: 0,
                                          zIndex: 9999,
                                          display: 'flex', gap: 8, justifyContent: 'center',
                                          overflowX: 'auto',
                                          padding: '0 16px',
                                          WebkitOverflowScrolling: 'touch',
                                   }}>
                                          {hotspots.map((h) => (
                                                 <button
                                                        key={h.id}
                                                        onClick={() => setSelected(h)}
                                                        style={{
                                                               padding: '6px 14px',
                                                               background: selected?.id === h.id
                                                                      ? 'rgba(0,204,85,0.25)'
                                                                      : 'rgba(0,0,0,0.75)',
                                                               border: `1.5px solid ${selected?.id === h.id ? '#00CC55' : 'rgba(255,255,255,0.15)'}`,
                                                               borderRadius: 20,
                                                               color: selected?.id === h.id ? '#00CC55' : 'rgba(255,255,255,0.8)',
                                                               fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                                               backdropFilter: 'blur(8px)',
                                                               display: 'flex', alignItems: 'center', gap: 6,
                                                               transition: 'all 0.2s',
                                                               whiteSpace: 'nowrap',
                                                               flexShrink: 0,
                                                        }}
                                                 >
                                                        <span style={{
                                                               width: 8, height: 8, borderRadius: '50%',
                                                               background: selected?.id === h.id ? '#00CC55' : 'rgba(255,255,255,0.4)',
                                                               display: 'inline-block',
                                                        }} />
                                                        {h.label || h.asset_3d?.name || `Punto ${h.id}`}
                                                 </button>
                                          ))}
                                   </div>
                            )} */}
                     </div>

                     {/* ── Modal ─────────────────────────────────────────────── */}
                     {selected && (
                            <HotspotModal hotspot={selected} onClose={() => setSelected(null)} />
                     )}
              </>
       );
}