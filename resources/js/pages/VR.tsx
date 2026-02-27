import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';

export default function VR() {
       const { props } = usePage<{ image?: string; place?: { title: string; id: number; images?: Array<{ title: string; url: string; id: number; is_main?: boolean }> } }>();
       const image: string | undefined = props.image;
       const place = props.place;
       const [showInstructions, setShowInstructions] = useState(true);
       const [sidebarMinimized, setSidebarMinimized] = useState(false);
       const vrContainerRef = useRef<HTMLDivElement>(null);

       // Procesar la imagen
       const sample = '/images/imagekkk.jpg';
       let panoSrc = image || sample;
       if (panoSrc && !/^https?:\/\//i.test(panoSrc) && panoSrc.charAt(0) !== '/') {
              panoSrc = '/' + panoSrc;
       }

       const normalizeImageUrl = (src: string) => {
              if (/^https?:\/\//i.test(src)) return src;
              if (src.startsWith('/')) return src;
              if (src.startsWith('storage/') || src.startsWith('images/')) return `/${src}`;
              return `/storage/${src}`;
       };

       // Función para cambiar la imagen panorámica
       const changeImage = (newImageUrl: string) => {
              const normalizedUrl = normalizeImageUrl(newImageUrl);
              const placeId = place?.id;
              const placeParam = placeId ? `&place_id=${encodeURIComponent(String(placeId))}` : '';
              // Forzar recarga completa para que el visor tome la nueva imagen del servidor
              window.location.href = `/vr?image=${encodeURIComponent(normalizedUrl)}${placeParam}`;
       };

       useEffect(() => {
              // Auto-hide instructions after 15 seconds
              const timer = setTimeout(() => {
                     setShowInstructions(false);
              }, 15000);

              return () => {
                     clearTimeout(timer);
              };
       }, []);

       // Inyectar la escena de A-Frame solo una vez
       useEffect(() => {
              if (!vrContainerRef.current || vrContainerRef.current.innerHTML) return;

              vrContainerRef.current.innerHTML = `
                     <a-scene vr-mode-ui="enabled: false" embedded style="height: 100%;" id="vr-scene">
                            <a-assets timeout="5000">
                                   <img id="pano" src="${panoSrc}" crossorigin="anonymous" />
                            </a-assets>
                            <a-sky id="sky" src="#pano"></a-sky>
                            <a-camera position="0 0 0" look-controls="reverseMouseDrag: true; reverseTouchDrag: true" wasd-controls="enabled: false" id="camera"></a-camera>
                     </a-scene>
                     
                     <script>
                            // Efecto de inercia tipo ruleta - ejecutar cuando la escena esté lista
                            (function() {
                                   const scene = document.querySelector('#vr-scene');
                                   if (!scene) return;
                                   
                                   const initInertia = function() {
                                          const camera = document.querySelector('#camera');
                                          const canvas = scene.querySelector('canvas') || document.body;
                                          if (!camera) return;
                                          
                                          let isDragging = false;
                                          let lastX = 0;
                                          let lastY = 0;
                                          let velocityX = 0;
                                          let velocityY = 0;
                                          let lastTime = 0;
                                          let inertiaAnimation = null;
                                          let momentum = { x: 0, y: 0 };
                                          const friction = 0.95;
                                          const minVelocity = 0.001;
                                          
                                          // Solo escuchar en el canvas de A-Frame
                                          canvas.addEventListener('mousedown', function(e) {
                                                 const target = e.target;
                                                 if (target.tagName === 'BUTTON' || target.closest('button, .places-sidebar, .instructions-menu, a')) return;
                                                 isDragging = true;
                                                 lastX = e.clientX;
                                                 lastY = e.clientY;
                                                 lastTime = performance.now();
                                                 if (inertiaAnimation) {
                                                        cancelAnimationFrame(inertiaAnimation);
                                                        inertiaAnimation = null;
                                                 }
                                          });
                                          
                                          canvas.addEventListener('mousemove', function(e) {
                                                 if (!isDragging) return;
                                                 const currentTime = performance.now();
                                                 const deltaTime = currentTime - lastTime;
                                                 if (deltaTime > 0) {
                                                        velocityX = (e.clientX - lastX) / deltaTime;
                                                        velocityY = (e.clientY - lastY) / deltaTime;
                                                        lastX = e.clientX;
                                                        lastY = e.clientY;
                                                        lastTime = currentTime;
                                                 }
                                          });
                                          
                                          document.addEventListener('mouseup', function(e) {
                                                 if (!isDragging) return;
                                                 isDragging = false;
                                                 momentum.x = velocityX * 0.3;
                                                 momentum.y = velocityY * 0.3;
                                                 if (Math.abs(momentum.x) > minVelocity || Math.abs(momentum.y) > minVelocity) {
                                                        startInertia();
                                                 }
                                          });
                                          
                                          function startInertia() {
                                                 function animate() {
                                                        momentum.x *= friction;
                                                        momentum.y *= friction;
                                                        const rotation = camera.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
                                                        const newYaw = (rotation.y || 0) + momentum.x * 2;
                                                        const newPitch = Math.max(-90, Math.min(90, (rotation.x || 0) - momentum.y * 2));
                                                        camera.setAttribute('rotation', { x: newPitch, y: newYaw, z: 0 });
                                                        if (Math.abs(momentum.x) > minVelocity || Math.abs(momentum.y) > minVelocity) {
                                                               inertiaAnimation = requestAnimationFrame(animate);
                                                        } else {
                                                               inertiaAnimation = null;
                                                        }
                                                 }
                                                 animate();
                                          }
                                   };
                                   
                                   if (scene.hasLoaded) {
                                          initInertia();
                                   } else {
                                          scene.addEventListener('loaded', initInertia, { once: true });
                                   }
                            })();
                     </script>
              `;
       }, [panoSrc]);

       return (
              <>
                     <Head>
                            <title>Visor 360° — CARAPARÍ VR</title>
                            <script src="https://aframe.io/releases/1.4.1/aframe.min.js"></script>
                            <style>{`
                                   @media (max-width: 768px) {
                                          .instructions-menu {
                                                 left: 50% !important;
                                                 transform: translateX(-50%) !important;
                                                 width: 90% !important;
                                                 max-width: 90% !important;
                                          }
                                          .places-sidebar {
                                                 width: 280px !important;
                                          }
                                          .help-button {
                                                 right: 20px !important;
                                          }
                                          .sidebar-toggle {
                                                 right: 20px !important;
                                          }
                                   }
                            `}</style>
                     </Head>

                     <div style={{ height: '100vh', margin: 0, background: '#000', position: 'relative' }}>
                            {/* A-Frame Scene */}
                            <div
                                   ref={vrContainerRef}
                                   style={{ height: '100%', width: '100%' }}
                            />

                            {/* Back Button */}
                            <a href="/#places" style={{
                                   position: 'fixed',
                                   left: 20,
                                   top: 20,
                                   zIndex: 9999,
                                   padding: '8px 14px',
                                   background: 'rgba(0,0,0,0.7)',
                                   borderRadius: 6,
                                   border: 'none',
                                   color: 'white',
                                   fontWeight: '500',
                                   fontSize: '14px',
                                   cursor: 'pointer',
                                   boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                   textDecoration: 'none',
                                   display: 'inline-flex',
                                   alignItems: 'center'
                            }}>
                                   ← Volver a lugares
                            </a>

                            {/* Instructions Menu */}
                            {showInstructions && (
                                   <div className="instructions-menu" style={{
                                          position: 'fixed',
                                          bottom: 20,
                                          left: 20, // Cambiado de center a left para desktop
                                          transform: 'none', // Removido el translateX para desktop
                                          zIndex: 9999,
                                          background: 'rgba(0,0,0,0.9)',
                                          borderRadius: 15,
                                          padding: '20px',
                                          color: 'white',
                                          textAlign: 'center',
                                          maxWidth: '350px', // Reducido para el costado
                                          width: '350px',
                                          border: '2px solid #00AAFF',
                                          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                   }}>
                                          <div style={{
                                                 display: 'flex',
                                                 justifyContent: 'space-between',
                                                 alignItems: 'center',
                                                 marginBottom: '15px'
                                          }}>
                                                 <h3 style={{
                                                        color: '#00AAFF',
                                                        margin: '0',
                                                        fontSize: '16px',
                                                        flex: 1
                                                 }}>
                                                        🎮 CÓMO NAVEGAR EN 360°
                                                 </h3>

                                                 {/* Botón de cerrar */}
                                                 <button
                                                        onClick={(e) => {
                                                               e.stopPropagation();
                                                               setShowInstructions(false);
                                                        }}
                                                        style={{
                                                               background: 'transparent',
                                                               border: 'none',
                                                               color: '#ff4444',
                                                               fontSize: '20px',
                                                               cursor: 'pointer',
                                                               padding: '0',
                                                               marginLeft: '10px'
                                                        }}
                                                        title="Cerrar instrucciones"
                                                 >
                                                        ✕
                                                 </button>
                                          </div>                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                 {/* Desktop Instructions */}
                                                 <div style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        padding: '10px',
                                                        borderRadius: '8px'
                                                 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFFF00' }}>
                                                               🖱️ En Computadora:
                                                        </div>
                                                        <div style={{ fontSize: '13px', marginTop: '5px' }}>
                                                               • <strong>ARRASTRA</strong> con el mouse para girar la vista
                                                        </div>
                                                        <div style={{ fontSize: '13px' }}>
                                                               • <strong>CTRL + RUEDA</strong> o <strong>PELLIZCA</strong> para zoom
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#88DDFF', marginTop: '5px' }}>
                                                               💫 <em>Efecto ruleta: suelta para que siga girando</em>
                                                        </div>
                                                 </div>

                                                 {/* Mobile Instructions */}
                                                 <div style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        padding: '10px',
                                                        borderRadius: '8px'
                                                 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFFF00' }}>
                                                               📱 En Móvil/Tablet:
                                                        </div>
                                                        <div style={{ fontSize: '13px', marginTop: '5px' }}>
                                                               • <strong>DESLIZA</strong> con un dedo para girar la vista
                                                        </div>
                                                        <div style={{ fontSize: '13px' }}>
                                                               • <strong>PELLIZCA</strong> con dos dedos para zoom
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#88DDFF', marginTop: '5px' }}>
                                                               💫 <em>Suelta el dedo para inercia tipo ruleta</em>
                                                        </div>
                                                 </div>

                                                 {/* VR Instructions */}
                                                 <div style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        padding: '10px',
                                                        borderRadius: '8px'
                                                 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFFF00' }}>
                                                               🥽 Modo VR:
                                                        </div>
                                                        <div style={{ fontSize: '13px', marginTop: '5px' }}>
                                                               • Presiona el ícono <strong>VR</strong> en la esquina
                                                        </div>
                                                        <div style={{ fontSize: '13px' }}>
                                                               • <strong>MUEVE</strong> tu cabeza para mirar alrededor
                                                        </div>
                                                 </div>
                                          </div>

                                          <button
                                                 onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowInstructions(false);
                                                 }}
                                                 style={{
                                                        marginTop: '15px',
                                                        padding: '8px 20px',
                                                        background: '#00AAFF',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: 'bold'
                                                 }}
                                          >
                                                 ✅ ¡Entendido! Comenzar a explorar
                                          </button>
                                   </div>
                            )}                            {/* Quick Help Toggle - Always visible */}
                            <button
                                   className="help-button"
                                   onClick={(e) => {
                                          e.stopPropagation();
                                          setShowInstructions(!showInstructions);
                                   }}
                                   style={{
                                          position: 'fixed',
                                          top: '50%',
                                          right: 20,
                                          transform: 'translateY(-50%)',
                                          zIndex: sidebarMinimized ? 9999 : 9997,
                                          width: '50px',
                                          height: '50px',
                                          borderRadius: '50%',
                                          background: 'rgba(0,0,0,0.8)',
                                          border: '2px solid #00AAFF',
                                          color: '#00AAFF',
                                          cursor: 'pointer',
                                          fontSize: '20px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          boxShadow: '0 2px 12px rgba(0,170,255,0.3)',
                                          transition: 'all 0.3s ease',
                                          opacity: sidebarMinimized ? 1 : 0.6
                                   }}
                                   onMouseEnter={(e) => {
                                          e.currentTarget.style.background = 'rgba(0,170,255,0.2)';
                                          e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                                          e.currentTarget.style.opacity = '1';
                                   }}
                                   onMouseLeave={(e) => {
                                          e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
                                          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                          e.currentTarget.style.opacity = sidebarMinimized ? '1' : '0.6';
                                   }}
                                   title="Mostrar/Ocultar instrucciones"
                            >
                                   ❓
                            </button>

                            {/* Places Sidebar */}
                            <div className="places-sidebar" style={{
                                   position: 'fixed',
                                   top: 0,
                                   right: sidebarMinimized ? -300 : 0,
                                   width: '300px',
                                   height: '100vh',
                                   background: 'rgba(0,0,0,0.9)',
                                   zIndex: 9998,
                                   transition: 'right 0.3s ease',
                                   borderLeft: sidebarMinimized ? 'none' : '2px solid #00AAFF'
                            }}>
                                   {/* Sidebar Header */}
                                   <div style={{
                                          padding: '20px',
                                          borderBottom: '1px solid rgba(255,255,255,0.1)'
                                   }}>
                                          <div style={{
                                                 display: 'flex',
                                                 justifyContent: 'space-between',
                                                 alignItems: 'center'
                                          }}>
                                                 <h3 style={{
                                                        color: '#00AAFF',
                                                        margin: '0',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold'
                                                 }}>
                                                        📍 Vistas del Lugar
                                                 </h3>
                                          </div>
                                          {place && (
                                                 <p style={{
                                                        color: 'white',
                                                        margin: '10px 0 0 0',
                                                        fontSize: '14px',
                                                        opacity: 0.8
                                                 }}>
                                                        {place.title}
                                                 </p>
                                          )}
                                   </div>

                                   {/* Places List */}
                                   <div style={{
                                          padding: '20px',
                                          height: 'calc(100vh - 120px)',
                                          overflowY: 'auto'
                                   }}>
                                          {(() => {
                                                 // Usar las imágenes del lugar directamente (ya incluyen la imagen principal con is_main)
                                                 const allImages = place?.images || [];

                                                 if (allImages.length === 0) {
                                                        return (
                                                               <div style={{
                                                                      textAlign: 'center',
                                                                      color: 'rgba(255,255,255,0.6)',
                                                                      fontSize: '14px',
                                                                      marginTop: '40px'
                                                               }}>
                                                                      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🗺️</div>
                                                                      <p>No hay vistas disponibles para este lugar</p>
                                                               </div>
                                                        );
                                                 }

                                                 return (
                                                        <div style={{
                                                               display: 'flex',
                                                               flexDirection: 'column',
                                                               gap: '12px'
                                                        }}>
                                                               {allImages.map((img, index) => {
                                                                      // Comparar directamente con la imagen actual (prop image)
                                                                      const normalizedImageUrl = normalizeImageUrl(img.url);
                                                                      const normalizedCurrentImage = image ? normalizeImageUrl(image) : '';
                                                                      const isCurrentImage = normalizedCurrentImage === normalizedImageUrl;

                                                                      // Determinar el título basado en is_main
                                                                      const displayTitle = img.is_main ? 'Vista Principal' : (img.title || `Vista ${index + 1}`);
                                                                      // Icono para imagen principal
                                                                      const displayIcon = isCurrentImage ? '📍' : (img.is_main ? '⭐' : '🌍');

                                                                      return (
                                                                             <div
                                                                                    key={img.id || index}
                                                                                    onClick={(e) => {
                                                                                           e.stopPropagation();
                                                                                           changeImage(img.url);
                                                                                    }}
                                                                                    style={{
                                                                                           padding: '12px',
                                                                                           background: isCurrentImage
                                                                                                  ? 'rgba(0,170,255,0.3)'
                                                                                                  : 'rgba(255,255,255,0.1)',
                                                                                           borderRadius: '8px',
                                                                                           cursor: 'pointer',
                                                                                           transition: 'all 0.2s ease',
                                                                                           border: isCurrentImage
                                                                                                  ? '2px solid #00AAFF'
                                                                                                  : '1px solid transparent',
                                                                                           transform: isCurrentImage ? 'scale(1.02)' : 'scale(1)'
                                                                                    }}
                                                                                    onMouseEnter={(e) => {
                                                                                           if (!isCurrentImage) {
                                                                                                  e.currentTarget.style.background = 'rgba(0,170,255,0.2)';
                                                                                                  e.currentTarget.style.border = '1px solid #00AAFF';
                                                                                           }
                                                                                    }}
                                                                                    onMouseLeave={(e) => {
                                                                                           if (!isCurrentImage) {
                                                                                                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                                                                                  e.currentTarget.style.border = '1px solid transparent';
                                                                                           }
                                                                                    }}
                                                                             >
                                                                                    <div style={{
                                                                                           color: 'white',
                                                                                           fontSize: '14px',
                                                                                           fontWeight: isCurrentImage ? 'bold' : '500',
                                                                                           display: 'flex',
                                                                                           alignItems: 'center',
                                                                                           gap: '8px'
                                                                                    }}>
                                                                                           <span style={{ fontSize: '16px' }}>
                                                                                                  {displayIcon}
                                                                                           </span>
                                                                                           {displayTitle}
                                                                                    </div>
                                                                                    <div style={{
                                                                                           color: isCurrentImage ? '#00AAFF' : '#88DDFF',
                                                                                           fontSize: '12px',
                                                                                           marginTop: '5px',
                                                                                           fontWeight: isCurrentImage ? '500' : 'normal'
                                                                                    }}>
                                                                                           {isCurrentImage ? '✅ Vista actual' : 'Click para cambiar vista'}
                                                                                    </div>
                                                                             </div>
                                                                      );
                                                               })}
                                                        </div>
                                                 );
                                          })()}
                                   </div>
                            </div>

                            {/* Sidebar Toggle Button - Always visible */}
                            <button
                                   className="sidebar-toggle"
                                   onClick={(e) => {
                                          e.stopPropagation();
                                          setSidebarMinimized(!sidebarMinimized);
                                   }}
                                   style={{
                                          position: 'fixed',
                                          top: '20px',
                                          right: 20,
                                          zIndex: 9999,
                                          width: '45px',
                                          height: '45px',
                                          borderRadius: '50%',
                                          background: 'rgba(0,0,0,0.8)',
                                          border: '2px solid #00AAFF',
                                          color: '#00AAFF',
                                          cursor: 'pointer',
                                          fontSize: '18px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          boxShadow: '0 2px 12px rgba(0,170,255,0.3)',
                                          transition: 'all 0.3s ease'
                                   }}
                                   onMouseEnter={(e) => {
                                          e.currentTarget.style.background = 'rgba(0,170,255,0.2)';
                                          e.currentTarget.style.transform = 'scale(1.05)';
                                   }}
                                   onMouseLeave={(e) => {
                                          e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
                                          e.currentTarget.style.transform = 'scale(1)';
                                   }}
                                   title={sidebarMinimized ? 'Mostrar vistas del lugar' : 'Ocultar panel'}
                            >
                                   {sidebarMinimized ? '📍' : '✕'}
                            </button>

                            {/* Navigation Indicators */}
                            <div style={{
                                   position: 'fixed',
                                   bottom: 20,
                                   left: 20,
                                   zIndex: 9998,
                                   display: showInstructions ? 'none' : 'flex',
                                   flexDirection: 'column',
                                   gap: '10px',
                                   opacity: 0.8
                            }}>
                                   {/* Mouse drag indicator */}
                                   <div style={{
                                          background: 'rgba(0,0,0,0.8)',
                                          padding: '8px 12px',
                                          borderRadius: 6,
                                          color: 'white',
                                          fontSize: '12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px'
                                   }}>
                                          <span style={{ fontSize: '16px' }}>🖱️</span>
                                          Arrastra para mirar
                                   </div>

                                   {/* Scroll indicator */}
                                   <div style={{
                                          background: 'rgba(0,0,0,0.8)',
                                          padding: '8px 12px',
                                          borderRadius: 6,
                                          color: 'white',
                                          fontSize: '12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px'
                                   }}>
                                          <span style={{ fontSize: '16px' }}>🔍</span>
                                          Rueda para zoom
                                   </div>
                            </div>
                     </div >
              </>
       );
}
