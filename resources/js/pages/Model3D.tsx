import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Model3DViewer from '@/components/Model3DViewer';
import { login, register } from '@/routes';
import { type SharedData } from '@/types';

interface Model3D {
       id: number;
       name: string;
       model_path: string;
       description?: string | null;
       is_active: boolean;
       sort_order: number;
}

interface Model3DPageProps extends SharedData {
       model: Model3D;
       allAssets: Model3D[];
       modelExists: boolean;
}

export default function Model3DPage({ model, allAssets, modelExists }: Model3DPageProps) {
       const { auth } = usePage<SharedData>().props;
       const [isScrolled, setIsScrolled] = useState(false);

       // Índice del modelo actual para navegación
       const currentIndex = allAssets.findIndex(m => m.id === model.id);
       const previousModel = currentIndex > 0 ? allAssets[currentIndex - 1] : null;
       const nextModel = currentIndex < allAssets.length - 1 ? allAssets[currentIndex + 1] : null;

       return (
              <div className="min-h-screen bg-neutral-900 text-white" style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto" }}>
                     <Head title={`${model.name} - Modelo 3D - Caraparí Turismo`} />

                     <Navbar
                            isScrolled={isScrolled}
                            auth={auth}
                            canRegister={true}
                            loginRoute={login()}
                            registerRoute={register()}
                     />

                     <div className="pt-20 pb-20">
                            {/* Botón de Volver */}
                            <div className="mx-auto max-w-7xl px-6 mb-6">
                                   <Link href="#" onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                          </svg>
                                          Volver
                                   </Link>
                            </div>

                            {/* Contenedor principal */}
                            <div className="mx-auto max-w-7xl px-6 space-y-8">
                                   {/* Visor 3D */}
                                   <div className="relative rounded-2xl overflow-hidden bg-neutral-800/60 border border-neutral-700 shadow-2xl">
                                          <div style={{ height: '600px' }}>
                                                 {modelExists ? (
                                                        <Model3DViewer
                                                               modelPath={`/storage/${model.model_path}`}
                                                               title={model.name}
                                                               description={model.description}
                                                               autoRotate={false}
                                                        />
                                                 ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-neutral-900">
                                                               <span className="relative flex h-4 w-4">
                                                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                                                      <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
                                                               </span>
                                                               <p className="text-yellow-400 font-bold text-xl">Modelo en mantenimiento</p>
                                                               <p className="text-neutral-400 text-sm text-center max-w-xs">Este modelo 3D no está disponible en este momento. Vuelve a intentarlo más tarde.</p>
                                                        </div>
                                                 )}
                                          </div>
                                   </div>

                                   {/* Información del Modelo */}
                                   <div className="bg-neutral-800/60 rounded-2xl p-8 border border-neutral-700">
                                          <h1 className="text-4xl font-bold mb-4 text-white">{model.name}</h1>

                                          {model.description && (
                                                 <p className="text-neutral-300 text-lg leading-relaxed mb-6">
                                                        {model.description}
                                                 </p>
                                          )}

                                          <div className="flex items-center gap-2 text-neutral-400 mb-6">
                                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                 </svg>
                                                 <span>Modelo 3D Interactivo</span>
                                          </div>

                                          {/* Estado */}
                                          <div className="bg-neutral-700/50 rounded-lg p-4 mb-6">
                                                 <p className="text-sm text-neutral-400">
                                                        <span className="text-green-500 font-semibold">Estado:</span>{' '}
                                                        {modelExists ? (
                                                               <span className="text-green-400">Disponible</span>
                                                        ) : (
                                                               <span className="text-yellow-400">En mantenimiento</span>
                                                        )}
                                                 </p>
                                          </div>
                                   </div>

                                   {/* Navegación entre modelos */}
                                   {(previousModel || nextModel) && (
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 {previousModel ? (
                                                        <Link
                                                               href={`/model-3d/${previousModel.id}`}
                                                               className="group flex items-center gap-4 p-4 bg-neutral-800/60 rounded-xl border border-neutral-700 hover:border-green-600 hover:bg-neutral-800 transition-all"
                                                        >
                                                               <svg className="w-6 h-6 text-neutral-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                               </svg>
                                                               <div>
                                                                      <p className="text-xs text-neutral-500 uppercase">Anterior</p>
                                                                      <p className="text-white font-semibold group-hover:text-green-500 transition-colors">{previousModel.name}</p>
                                                               </div>
                                                        </Link>
                                                 ) : (
                                                        <div className="opacity-50"></div>
                                                 )}

                                                 {nextModel ? (
                                                        <Link
                                                               href={`/model-3d/${nextModel.id}`}
                                                               className="group flex items-center justify-end gap-4 p-4 bg-neutral-800/60 rounded-xl border border-neutral-700 hover:border-green-600 hover:bg-neutral-800 transition-all"
                                                        >
                                                               <div className="text-right">
                                                                      <p className="text-xs text-neutral-500 uppercase">Siguiente</p>
                                                                      <p className="text-white font-semibold group-hover:text-green-500 transition-colors">{nextModel.name}</p>
                                                               </div>
                                                               <svg className="w-6 h-6 text-neutral-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                               </svg>
                                                        </Link>
                                                 ) : (
                                                        <div className="opacity-50"></div>
                                                 )}
                                          </div>
                                   )}

                                   {/* Galería de modelos disponibles */}
                                   {allAssets.length > 1 && (
                                          <div>
                                                 <h2 className="text-2xl font-bold mb-6">Otros Modelos 3D</h2>
                                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        {allAssets.map((m) => (
                                                               <Link
                                                                      key={m.id}
                                                                      href={`/model-3d/${m.id}`}
                                                                      className={`group relative overflow-hidden rounded-xl p-4 transition-all ${m.id === model.id
                                                                                    ? 'bg-green-600/20 border-2 border-green-600 ring-2 ring-green-500/50'
                                                                                    : 'bg-neutral-800/60 border border-neutral-700 hover:border-green-600 hover:bg-neutral-800'
                                                                             }`}
                                                               >
                                                                      <div className="flex items-start gap-3">
                                                                             <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
                                                                             </svg>
                                                                             <div className="min-w-0 flex-1">
                                                                                    <h3 className="text-white font-semibold truncate group-hover:text-green-400 transition-colors">
                                                                                           {m.name}
                                                                                    </h3>
                                                                                    {m.description && (
                                                                                           <p className="text-neutral-400 text-xs mt-1 line-clamp-2">
                                                                                                  {m.description}
                                                                                           </p>
                                                                                    )}
                                                                             </div>
                                                                      </div>
                                                               </Link>
                                                        ))}
                                                 </div>
                                          </div>
                                   )}
                            </div>
                     </div>

                     {/* Footer */}
                     <footer className="mt-20 border-t border-neutral-800/60 bg-neutral-900/80">
                            <div className="mx-auto max-w-6xl px-6 py-10">
                                   <div className="text-center">
                                          <div className="text-xl font-bold mb-2">CARAPARÍ</div>
                                          <div className="text-sm text-neutral-400">
                                                 © {new Date().getFullYear()} CARAPARÍ — Turismo. Todos los derechos reservados.
                                          </div>
                                   </div>
                            </div>
                     </footer>
              </div>
       );
}
