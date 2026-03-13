import { useEffect, useRef, useState } from 'react';

interface Props {
       imageUrl: string;
       onPick: (x: number, y: number, z: number) => void;
       initialPosition?: { x: number; y: number; z: number } | null;
}

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

// Registrar componente look-at-cam una sola vez
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

// Convierte NDC + rotación de cámara → punto en la esfera (radio r)
function ndcToSpherePoint(
       ndcX: number, ndcY: number,
       rotXdeg: number, rotYdeg: number,
       r = 9.5,
) {
       const THREE = (window as any).THREE;
       // Crear cámara virtual con la misma rotación
       const cam = new THREE.PerspectiveCamera(80, 1, 0.1, 1000);
       cam.rotation.order = 'YXZ';
       cam.rotation.y = THREE.MathUtils.degToRad(rotYdeg);
       cam.rotation.x = THREE.MathUtils.degToRad(rotXdeg);
       cam.updateMatrixWorld();

       const ray = new THREE.Raycaster();
       ray.setFromCamera({ x: ndcX, y: ndcY }, cam);
       return ray.ray.direction.clone().normalize().multiplyScalar(r);
}

// Destruye la escena A-Frame liberando el contexto WebGL
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

export default function Sphere360Picker({ imageUrl, onPick, initialPosition }: Props) {
       const containerRef = useRef<HTMLDivElement>(null);
       const markerRef = useRef<any>(null);
       const positionRef = useRef(initialPosition);
       const rotRef = useRef({ x: 0, y: 0 }); // rotación actual de la cámara

       const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
       const [hasSelection, setHasSelection] = useState(
              () => !!initialPosition && (initialPosition.x !== 0 || initialPosition.y !== 0 || initialPosition.z !== 0)
       );
       const [coords, setCoords] = useState<{ x: number; y: number; z: number } | null>(
              () => (initialPosition && (initialPosition.x !== 0 || initialPosition.y !== 0 || initialPosition.z !== 0))
                     ? initialPosition : null
       );

       // Sincronizar marcador si cambia initialPosition desde el padre
       useEffect(() => {
              if (!initialPosition) return;
              const { x, y, z } = initialPosition;
              if (x === 0 && y === 0 && z === 0) return;
              positionRef.current = initialPosition;
              setCoords({ x, y, z });
              setHasSelection(true);
              if (markerRef.current) {
                     markerRef.current.setAttribute('position', `${x} ${y} ${z}`);
                     markerRef.current.setAttribute('visible', 'true');
              }
              // eslint-disable-next-line react-hooks/exhaustive-deps
       }, [initialPosition?.x, initialPosition?.y, initialPosition?.z]);

       useEffect(() => {
              let cancelled = false;
              let cleanup: (() => void) | undefined;

              const init = async () => {
                     await loadAFrame();
                     if (cancelled || !containerRef.current) return;

                     registerLookAtCam();

                     // Destruir escena anterior liberando contexto WebGL
                     destroyScene(containerRef.current);

                     const ip = positionRef.current;
                     const hasInit = ip && (ip.x !== 0 || ip.y !== 0 || ip.z !== 0);
                     const initPos = hasInit ? `${ip!.x} ${ip!.y} ${ip!.z}` : '0 0 -9.5';
                     const initVis = hasInit ? 'true' : 'false';

                     containerRef.current.innerHTML = `
            <a-scene
                id="picker-scene"
                vr-mode-ui="enabled:false"
                embedded
                renderer="antialias:true"
                style="height:100%;width:100%">
                <a-assets timeout="20000">
                    <img id="picker-pano" src="${imageUrl}" crossorigin="anonymous" />
                </a-assets>

                <a-sky src="#picker-pano"></a-sky>

                <!-- Marcador: usa look-at-cam para siempre mirar a la cámara -->
                <a-entity id="pick-marker" position="${initPos}" visible="${initVis}" look-at-cam>
                    <a-torus
                        radius="0.22" radius-tubular="0.016"
                        color="#ef4444" opacity="1"
                        animation="property:scale;from:1 1 1;to:1.6 1.6 1.6;dir:alternate;dur:900;easing:easeInOutSine;loop:true">
                    </a-torus>
                    <a-sphere radius="0.13" color="#ef4444" opacity="1"></a-sphere>
                    <a-sphere radius="0.065" color="#ffffff" opacity="1"></a-sphere>
                </a-entity>

                <!-- Cámara manual (sin look-controls nativos) -->
                <a-camera id="picker-cam" position="0 0 0"
                    look-controls="enabled:false"
                    wasd-controls="enabled:false">
                </a-camera>
            </a-scene>`;

                     const scene = containerRef.current.querySelector('#picker-scene') as any;
                     if (!scene) return;

                     const onLoaded = () => {
                            if (cancelled) return;
                            setStatus('ready');

                            markerRef.current = scene.querySelector('#pick-marker');
                            const canvas = scene.querySelector('canvas') as HTMLCanvasElement | null;
                            const cameraEl = scene.querySelector('#picker-cam') as any;
                            if (!canvas || !cameraEl) return;

                            // ── Rotación manual de cámara ─────────────────────────────
                            const SENS = 0.28, FRICTION = 0.87;
                            let isDragging = false;
                            let lastX = 0, lastY = 0;
                            let velX = 0, velY = 0;
                            let inertiaId: number | null = null;

                            const applyRot = () => {
                                   rotRef.current.x = Math.max(-85, Math.min(85, rotRef.current.x));
                                   cameraEl.setAttribute('rotation', `${rotRef.current.x} ${rotRef.current.y} 0`);
                            };

                            // Botón derecho → girar
                            const onMouseDown = (e: MouseEvent) => {
                                   if (e.button !== 2) return;
                                   isDragging = true;
                                   lastX = e.clientX; lastY = e.clientY;
                                   velX = 0; velY = 0;
                                   if (inertiaId) { cancelAnimationFrame(inertiaId); inertiaId = null; }
                                   e.preventDefault();
                            };

                            const onMouseMove = (e: MouseEvent) => {
                                   if (!isDragging) return;
                                   const dx = e.clientX - lastX;
                                   const dy = e.clientY - lastY;
                                   velX = dx; velY = dy;
                                   rotRef.current.y += dx * SENS;
                                   rotRef.current.x -= dy * SENS;
                                   applyRot();
                                   lastX = e.clientX; lastY = e.clientY;
                            };

                            const onMouseUp = (e: MouseEvent) => {
                                   if (e.button !== 2 || !isDragging) return;
                                   isDragging = false;
                                   let vx = velX * 0.28, vy = velY * 0.28;
                                   const tick = () => {
                                          vx *= FRICTION; vy *= FRICTION;
                                          rotRef.current.y += vx * SENS;
                                          rotRef.current.x -= vy * SENS;
                                          applyRot();
                                          if (Math.abs(vx) > 0.04 || Math.abs(vy) > 0.04)
                                                 inertiaId = requestAnimationFrame(tick);
                                          else inertiaId = null;
                                   };
                                   inertiaId = requestAnimationFrame(tick);
                            };

                            // Touch → girar
                            let tx = 0, ty = 0;
                            const onTouchStart = (e: TouchEvent) => {
                                   if (e.touches.length !== 1) return;
                                   tx = e.touches[0].clientX; ty = e.touches[0].clientY;
                                   if (inertiaId) { cancelAnimationFrame(inertiaId); inertiaId = null; }
                            };
                            const onTouchMove = (e: TouchEvent) => {
                                   if (e.touches.length !== 1) return;
                                   const dx = e.touches[0].clientX - tx;
                                   const dy = e.touches[0].clientY - ty;
                                   rotRef.current.y += dx * SENS;
                                   rotRef.current.x -= dy * SENS;
                                   applyRot();
                                   tx = e.touches[0].clientX; ty = e.touches[0].clientY;
                                   e.preventDefault();
                            };

                            // ── Click izquierdo → colocar marcador ───────────────────
                            let downX = 0, downY = 0;
                            const onLeftDown = (e: MouseEvent) => {
                                   if (e.button === 0) { downX = e.clientX; downY = e.clientY; }
                            };

                            const onLeftClick = (e: MouseEvent) => {
                                   if (e.button !== 0) return;
                                   if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;

                                   const THREE = (window as any).THREE;
                                   if (!THREE) return;

                                   const rect = canvas.getBoundingClientRect();
                                   // NDC respecto al canvas
                                   const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                                   const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

                                   // Convertir usando la rotación actual de la cámara
                                   const pt = ndcToSpherePoint(ndcX, ndcY, rotRef.current.x, rotRef.current.y);

                                   const x = parseFloat(pt.x.toFixed(4));
                                   const y = parseFloat(pt.y.toFixed(4));
                                   const z = parseFloat(pt.z.toFixed(4));

                                   if (markerRef.current) {
                                          markerRef.current.setAttribute('position', `${x} ${y} ${z}`);
                                          markerRef.current.setAttribute('visible', 'true');
                                   }

                                   setCoords({ x, y, z });
                                   setHasSelection(true);
                                   onPick(x, y, z);
                            };

                            const onContextMenu = (e: Event) => e.preventDefault();

                            canvas.addEventListener('mousedown', onMouseDown);
                            canvas.addEventListener('mousedown', onLeftDown);
                            canvas.addEventListener('click', onLeftClick);
                            canvas.addEventListener('contextmenu', onContextMenu);
                            window.addEventListener('mousemove', onMouseMove);
                            window.addEventListener('mouseup', onMouseUp);
                            canvas.addEventListener('touchstart', onTouchStart, { passive: false });
                            canvas.addEventListener('touchmove', onTouchMove, { passive: false });

                            cleanup = () => {
                                   canvas.removeEventListener('mousedown', onMouseDown);
                                   canvas.removeEventListener('mousedown', onLeftDown);
                                   canvas.removeEventListener('click', onLeftClick);
                                   canvas.removeEventListener('contextmenu', onContextMenu);
                                   window.removeEventListener('mousemove', onMouseMove);
                                   window.removeEventListener('mouseup', onMouseUp);
                                   canvas.removeEventListener('touchstart', onTouchStart);
                                   canvas.removeEventListener('touchmove', onTouchMove);
                                   if (inertiaId) cancelAnimationFrame(inertiaId);
                            };
                     };

                     scene.hasLoaded
                            ? onLoaded()
                            : scene.addEventListener('loaded', onLoaded, { once: true });
              };

              init().catch(() => setStatus('error'));
              return () => {
                     cancelled = true;
                     cleanup?.();
                     if (containerRef.current) destroyScene(containerRef.current);
              };
              // eslint-disable-next-line react-hooks/exhaustive-deps
       }, [imageUrl]);

       return (
              <div className="relative select-none">
                     <div
                            ref={containerRef}
                            className="relative w-full rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-900"
                            style={{ height: 420 }}
                     />

                     {status === 'loading' && (
                            <div style={{
                                   position: 'absolute', inset: 0,
                                   display: 'flex', flexDirection: 'column',
                                   alignItems: 'center', justifyContent: 'center', gap: 12,
                                   background: '#111827', borderRadius: 12, zIndex: 20,
                            }}>
                                   <div style={{
                                          width: 36, height: 36,
                                          border: '3px solid rgba(0,204,85,0.2)',
                                          borderTop: '3px solid #00CC55',
                                          borderRadius: '50%',
                                          animation: 'spin360pick 0.8s linear infinite',
                                   }} />
                                   <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                                          Cargando visor 360°…
                                   </span>
                            </div>
                     )}

                     {status === 'ready' && (
                            <div style={{
                                   position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                                   zIndex: 30, pointerEvents: 'none', display: 'flex', gap: 8,
                            }}>
                                   <span style={{
                                          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
                                          color: '#fff', fontSize: 11, padding: '4px 10px',
                                          borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)',
                                          whiteSpace: 'nowrap',
                                   }}>
                                          🖱️ Clic der: girar
                                   </span>
                                   <span style={{
                                          background: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(6px)',
                                          color: '#fff', fontSize: 11, padding: '4px 10px',
                                          borderRadius: 20, border: '1px solid rgba(239,68,68,0.4)',
                                          whiteSpace: 'nowrap',
                                   }}>
                                          🖱️ Clic izq: marcar punto
                                   </span>
                            </div>
                     )}

                     {status === 'ready' && (
                            hasSelection ? (
                                   <div className="absolute top-3 right-3 bg-green-600/80 text-white text-xs px-2.5 py-1 rounded-full pointer-events-none flex items-center gap-1"
                                          style={{ zIndex: 30 }}>
                                          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                                          Posición seleccionada
                                   </div>
                            ) : (
                                   <div className="absolute top-3 right-3 bg-yellow-500/80 text-white text-xs px-2.5 py-1 rounded-full pointer-events-none flex items-center gap-1"
                                          style={{ zIndex: 30 }}>
                                          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                                          Sin selección
                                   </div>
                            )
                     )}

                     {coords && (
                            <div className="mt-2 flex gap-3 text-xs text-gray-400 font-mono px-1">
                                   <span>X: <strong className="text-gray-200">{coords.x}</strong></span>
                                   <span>Y: <strong className="text-gray-200">{coords.y}</strong></span>
                                   <span>Z: <strong className="text-gray-200">{coords.z}</strong></span>
                            </div>
                     )}

                     <style>{`@keyframes spin360pick { to { transform: rotate(360deg); } }`}</style>
              </div>
       );
}