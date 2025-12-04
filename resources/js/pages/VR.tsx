import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function VR() {
       const { props } = usePage<{ image?: string }>();
       const image: string | undefined = props.image;
       const [showInstructions, setShowInstructions] = useState(true);

       useEffect(() => {
              // Inject A-Frame script if not already present
              if (!(window as any).AFRAME) {
                     const s = document.createElement('script');
                     s.src = 'https://aframe.io/releases/1.4.1/aframe.min.js';
                     s.async = true;
                     document.head.appendChild(s);
              }

              // Auto-hide instructions after 15 seconds
              const timer = setTimeout(() => {
                     setShowInstructions(false);
              }, 15000);

              return () => clearTimeout(timer);
       }, []);

       const sample = '/images/imagekkk.jpg';
       let panoSrc = image || sample;
       if (panoSrc && !/^https?:\/\//i.test(panoSrc) && panoSrc.charAt(0) !== '/') {
              panoSrc = '/' + panoSrc;
       }

       return (
              <>
                     <Head>
                            <title>Visor 360° — CARAPARÍ VR</title>
                            <style>{`
                                   @media (max-width: 768px) {
                                          .instructions-menu {
                                                 left: 50% !important;
                                                 transform: translateX(-50%) !important;
                                                 width: 90% !important;
                                                 max-width: 90% !important;
                                          }
                                   }
                            `}</style>
                     </Head>

                     <div style={{ height: '100vh', margin: 0, background: '#000', position: 'relative' }}>
                            {/* A-Frame Scene */}
                            <div
                                   dangerouslySetInnerHTML={{
                                          __html: `
                                                 <a-scene vr-mode-ui="enterVRButton: true" embedded style="height: 100%;">
                                                        <a-assets>
                                                               <img id="pano" src="${panoSrc}" crossorigin="anonymous" />
                                                        </a-assets>
                                                        <a-sky id="sky" src="#pano"></a-sky>
                                                        <a-camera 
                                                               look-controls="
                                                                      enabled: true; 
                                                                      reverseMouseDrag: true; 
                                                                      reverseTouchDrag: true;
                                                                      touchEnabled: true;
                                                                      mouseEnabled: true;
                                                                      pointerLockEnabled: false;
                                                                      magicWindowTrackingEnabled: true;
                                                               " 
                                                               wasd-controls="enabled: false"
                                                               id="camera">
                                                        </a-camera>
                                                 </a-scene>
                                                 
                                                 <script>
                                                        // Efecto de inercia tipo ruleta
                                                        document.addEventListener('DOMContentLoaded', function() {
                                                               setTimeout(function() {
                                                                      const camera = document.querySelector('#camera');
                                                                      if (!camera) return;
                                                                      
                                                                      let isDragging = false;
                                                                      let lastMouseX = 0;
                                                                      let lastMouseY = 0;
                                                                      let velocityX = 0;
                                                                      let velocityY = 0;
                                                                      let lastTime = 0;
                                                                      let inertiaAnimation = null;
                                                                      
                                                                      // Variables para el momentum
                                                                      let momentum = { x: 0, y: 0 };
                                                                      const friction = 0.95; // Factor de fricción (0.9-0.99)
                                                                      const minVelocity = 0.001; // Velocidad mínima antes de parar
                                                                      
                                                                      // Detectar inicio del arrastre
                                                                      document.addEventListener('mousedown', function(e) {
                                                                             isDragging = true;
                                                                             lastMouseX = e.clientX;
                                                                             lastMouseY = e.clientY;
                                                                             lastTime = performance.now();
                                                                             velocityX = 0;
                                                                             velocityY = 0;
                                                                             
                                                                             // Cancelar animación de inercia existente
                                                                             if (inertiaAnimation) {
                                                                                    cancelAnimationFrame(inertiaAnimation);
                                                                                    inertiaAnimation = null;
                                                                             }
                                                                      });
                                                                      
                                                                      // Calcular velocidad durante el arrastre
                                                                      document.addEventListener('mousemove', function(e) {
                                                                             if (!isDragging) return;
                                                                             
                                                                             const currentTime = performance.now();
                                                                             const deltaTime = currentTime - lastTime;
                                                                             
                                                                             if (deltaTime > 0) {
                                                                                    const deltaX = e.clientX - lastMouseX;
                                                                                    const deltaY = e.clientY - lastMouseY;
                                                                                    
                                                                                    velocityX = deltaX / deltaTime;
                                                                                    velocityY = deltaY / deltaTime;
                                                                                    
                                                                                    lastMouseX = e.clientX;
                                                                                    lastMouseY = e.clientY;
                                                                                    lastTime = currentTime;
                                                                             }
                                                                      });
                                                                      
                                                                      // Activar inercia al soltar
                                                                      document.addEventListener('mouseup', function(e) {
                                                                             if (!isDragging) return;
                                                                             isDragging = false;
                                                                             
                                                                             // Iniciar momentum con la velocidad calculada
                                                                             momentum.x = velocityX * 0.3; // Factor de escala
                                                                             momentum.y = velocityY * 0.3;
                                                                             
                                                                             // Solo aplicar inercia si hay velocidad significativa
                                                                             if (Math.abs(momentum.x) > minVelocity || Math.abs(momentum.y) > minVelocity) {
                                                                                    startInertia();
                                                                             }
                                                                      });
                                                                      
                                                                      // Touch events para móviles
                                                                      document.addEventListener('touchstart', function(e) {
                                                                             if (e.touches.length === 1) {
                                                                                    isDragging = true;
                                                                                    lastMouseX = e.touches[0].clientX;
                                                                                    lastMouseY = e.touches[0].clientY;
                                                                                    lastTime = performance.now();
                                                                                    velocityX = 0;
                                                                                    velocityY = 0;
                                                                                    
                                                                                    if (inertiaAnimation) {
                                                                                           cancelAnimationFrame(inertiaAnimation);
                                                                                           inertiaAnimation = null;
                                                                                    }
                                                                             }
                                                                      });
                                                                      
                                                                      document.addEventListener('touchmove', function(e) {
                                                                             if (!isDragging || e.touches.length !== 1) return;
                                                                             
                                                                             const currentTime = performance.now();
                                                                             const deltaTime = currentTime - lastTime;
                                                                             
                                                                             if (deltaTime > 0) {
                                                                                    const deltaX = e.touches[0].clientX - lastMouseX;
                                                                                    const deltaY = e.touches[0].clientY - lastMouseY;
                                                                                    
                                                                                    velocityX = deltaX / deltaTime;
                                                                                    velocityY = deltaY / deltaTime;
                                                                                    
                                                                                    lastMouseX = e.touches[0].clientX;
                                                                                    lastMouseY = e.touches[0].clientY;
                                                                                    lastTime = currentTime;
                                                                             }
                                                                      });
                                                                      
                                                                      document.addEventListener('touchend', function(e) {
                                                                             if (!isDragging) return;
                                                                             isDragging = false;
                                                                             
                                                                             momentum.x = velocityX * 0.3;
                                                                             momentum.y = velocityY * 0.3;
                                                                             
                                                                             if (Math.abs(momentum.x) > minVelocity || Math.abs(momentum.y) > minVelocity) {
                                                                                    startInertia();
                                                                             }
                                                                      });
                                                                      
                                                                      // Función de animación de inercia
                                                                      function startInertia() {
                                                                             function animate() {
                                                                                    // Aplicar fricción
                                                                                    momentum.x *= friction;
                                                                                    momentum.y *= friction;
                                                                                    
                                                                                    // Obtener rotación actual de la cámara
                                                                                    const rotation = camera.getAttribute('rotation');
                                                                                    const currentYaw = rotation.y;
                                                                                    const currentPitch = rotation.x;
                                                                                    
                                                                                    // Aplicar momentum (invertido para naturalidad)
                                                                                    const newYaw = currentYaw + momentum.x * 2;
                                                                                    const newPitch = Math.max(-90, Math.min(90, currentPitch - momentum.y * 2));
                                                                                    
                                                                                    // Actualizar rotación
                                                                                    camera.setAttribute('rotation', {
                                                                                           x: newPitch,
                                                                                           y: newYaw,
                                                                                           z: 0
                                                                                    });
                                                                                    
                                                                                    // Continuar si aún hay momentum significativo
                                                                                    if (Math.abs(momentum.x) > minVelocity || Math.abs(momentum.y) > minVelocity) {
                                                                                           inertiaAnimation = requestAnimationFrame(animate);
                                                                                    } else {
                                                                                           inertiaAnimation = null;
                                                                                    }
                                                                             }
                                                                             
                                                                             animate();
                                                                      }
                                                                      
                                                                      // Parar inercia al hacer clic nuevamente
                                                                      document.addEventListener('click', function(e) {
                                                                             if (inertiaAnimation) {
                                                                                    cancelAnimationFrame(inertiaAnimation);
                                                                                    inertiaAnimation = null;
                                                                                    momentum.x = 0;
                                                                                    momentum.y = 0;
                                                                             }
                                                                      });
                                                                      
                                                               }, 2000); // Esperar a que A-Frame se cargue
                                                        });
                                                 </script>
                                          `
                                   }}
                                   style={{ height: '100%', width: '100%' }}
                            />

                            {/* Back Button */}
                            <button onClick={() => window.history.back()} style={{
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
                                   boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}>
                                   ← Volver
                            </button>

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
                                                        onClick={() => setShowInstructions(false)}
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
                                                 onClick={() => setShowInstructions(false)}
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
                                   onClick={() => setShowInstructions(!showInstructions)}
                                   style={{
                                          position: 'fixed',
                                          top: '50%',
                                          right: 20,
                                          transform: 'translateY(-50%)',
                                          zIndex: 9999,
                                          width: '50px',
                                          height: '50px',
                                          borderRadius: '50%',
                                          background: 'rgba(0,170,255,0.9)',
                                          border: '2px solid white',
                                          color: 'white',
                                          cursor: 'pointer',
                                          fontSize: '20px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                                   }}
                                   title="Mostrar/Ocultar instrucciones"
                            >
                                   ❓
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
                     </div>
              </>
       );
}
