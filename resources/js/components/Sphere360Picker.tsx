import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { BackSide, Vector3 } from 'three';
import type { ThreeEvent } from '@react-three/fiber';

interface Props {
       imageUrl: string;
       onPick: (x: number, y: number, z: number) => void;
       initialPosition?: { x: number; y: number; z: number } | null;
}

function PanoramaScene({
       imageUrl,
       onPick,
       markerPos,
}: {
       imageUrl: string;
       onPick: (point: Vector3) => void;
       markerPos: Vector3 | null;
}) {
       const texture = useTexture(imageUrl);

       const handleClick = (e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              const point = e.intersections[0]?.point;
              if (!point) return;
              // Place marker slightly inside the sphere surface to avoid z-fighting
              const inner = point.clone().normalize().multiplyScalar(9.7);
              onPick(inner);
       };

       return (
              <>
                     <mesh onClick={handleClick}>
                            <sphereGeometry args={[10, 64, 64]} />
                            <meshBasicMaterial map={texture} side={BackSide} />
                     </mesh>
                     {markerPos && (
                            <mesh position={markerPos}>
                                   <sphereGeometry args={[0.18, 16, 16]} />
                                   <meshBasicMaterial color="#ef4444" />
                            </mesh>
                     )}
              </>
       );
}

function LoadingFallback() {
       return (
              <mesh>
                     <sphereGeometry args={[10, 16, 16]} />
                     <meshBasicMaterial color="#1f2937" side={BackSide} />
              </mesh>
       );
}

export default function Sphere360Picker({ imageUrl, onPick, initialPosition }: Props) {
       const getInitialMarker = (): Vector3 | null => {
              if (!initialPosition) return null;
              const { x, y, z } = initialPosition;
              if (x === 0 && y === 0 && z === 0) return null;
              return new Vector3(x, y, z).normalize().multiplyScalar(9.7);
       };

       const [markerPos, setMarkerPos] = useState<Vector3 | null>(getInitialMarker);
       const [hasSelection, setHasSelection] = useState(() => {
              if (!initialPosition) return false;
              return initialPosition.x !== 0 || initialPosition.y !== 0 || initialPosition.z !== 0;
       });

       const handlePick = (point: Vector3) => {
              setMarkerPos(point.clone());
              setHasSelection(true);
              onPick(
                     parseFloat(point.x.toFixed(4)),
                     parseFloat(point.y.toFixed(4)),
                     parseFloat(point.z.toFixed(4)),
              );
       };

       return (
              <div className="relative w-full h-96 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-900">
                     <Canvas camera={{ position: [0, 0, 0.001], fov: 75, near: 0.01, far: 100 }}>
                            <Suspense fallback={<LoadingFallback />}>
                                   <PanoramaScene imageUrl={imageUrl} onPick={handlePick} markerPos={markerPos} />
                            </Suspense>
                            <OrbitControls
                                   enableZoom={false}
                                   enablePan={false}
                                   rotateSpeed={-0.4}
                                   makeDefault
                            />
                     </Canvas>

                     {/* Bottom instruction overlay */}
                     <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none select-none whitespace-nowrap">
                            🖱 Arrastra para girar &nbsp;·&nbsp; Clic para fijar posición
                     </div>

                     {/* Selection status badge */}
                     {hasSelection ? (
                            <div className="absolute top-3 right-3 bg-green-600/80 text-white text-xs px-2.5 py-1 rounded-full pointer-events-none select-none flex items-center gap-1">
                                   <span className="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
                                   Posición seleccionada
                            </div>
                     ) : (
                            <div className="absolute top-3 right-3 bg-yellow-500/80 text-white text-xs px-2.5 py-1 rounded-full pointer-events-none select-none flex items-center gap-1">
                                   <span className="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
                                   Sin selección
                            </div>
                     )}
              </div>
       );
}
