import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import ErrorBoundary from './ErrorBoundary';

interface Model3DViewerProps {
       modelPath: string;
       title?: string;
       description?: string | null;
       autoRotate?: boolean;
}

// Componente que carga y renderiza el modelo 3D
const ModelContent = ({ modelPath }: { modelPath: string }) => {
       console.log('ModelContent intentando cargar:', modelPath);
       const gltf = useGLTF(modelPath);
       const scene = gltf.scene.clone();

       // Ajustar la cámara al tamaño del modelo
       React.useEffect(() => {
              const box = new THREE.Box3().setFromObject(scene);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              const fov = 75;
              const cameraZ = (maxDim / 2) / Math.tan((fov * Math.PI) / 360);

              scene.position.sub(center);
              console.log('Modelo cargado exitosamente:', modelPath);
       }, [scene]);

       return <primitive object={scene} />;
};

// Indicador de carga
const LoadingIndicator = () => (
       <div className="absolute inset-0 flex items-center justify-center bg-neutral-800/50 backdrop-blur-sm">
              <div className="text-center">
                     <div className="inline-block">
                            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                     </div>
                     <p className="text-white mt-4">Cargando modelo 3D...</p>
              </div>
       </div>
);

// Componente principal del visor
export default function Model3DViewer({
       modelPath,
       title,
       description,
       autoRotate = true
}: Model3DViewerProps) {
       const [isLoading, setIsLoading] = useState(true);
       const canvasRef = useRef(null);

       return (
              <ErrorBoundary>
                     <div className="w-full h-full bg-neutral-900 relative">
                            <Canvas
                                   ref={canvasRef}
                                   camera={{ position: [0, 0, 5], fov: 75 }}
                                   onCreated={() => setIsLoading(false)}
                                   gl={{ antialias: true, alpha: true }}
                                   style={{ width: '100%', height: '100%' }}
                            >
                                   {/* Iluminación */}
                                   <ambientLight intensity={0.6} />
                                   <directionalLight position={[10, 10, 5]} intensity={0.8} />
                                   <directionalLight position={[-10, -10, 5]} intensity={0.4} />
                                   <pointLight position={[0, 5, 10]} intensity={0.5} />

                                   {/* Fondo degradado */}
                                   <color attach="background" args={['#171717']} />

                                   {/* Controles orbitales para rotación con mouse */}
                                   <OrbitControls
                                          autoRotate={autoRotate}
                                          autoRotateSpeed={4}
                                          enableZoom={true}
                                          enablePan={true}
                                          enableDamping={true}
                                          dampingFactor={0.05}
                                   />

                                   {/* Carga suspensiva del modelo */}
                                   <Suspense fallback={null}>
                                          <ModelContent modelPath={modelPath} />
                                   </Suspense>
                            </Canvas>

                            {/* Indicador de carga */}
                            {isLoading && <LoadingIndicator />}

                            {/* Información del modelo */}
                            {(title || description) && (
                                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                                          {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
                                          {description && <p className="text-neutral-300 text-sm">{description}</p>}
                                   </div>
                            )}

                            {/* Controles e instrucciones */}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-lg p-3 text-white text-xs space-y-1">
                                   <p className="font-semibold text-green-400">Controles del visor 3D</p>
                                   <p>🖱️ Arrastra para rotar</p>
                                   <p>🔍 Scroll para zoom</p>
                                   <p>⌨️ Click derecho para pan</p>
                            </div>
                     </div>
              </ErrorBoundary>
       );
}
