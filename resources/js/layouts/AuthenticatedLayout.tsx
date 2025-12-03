import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useState } from 'react';

interface Props {
       header?: React.ReactNode;
       children: React.ReactNode;
}

export default function AuthenticatedLayout({ header, children }: Props) {
       const { auth } = usePage<SharedData>().props;
       const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

       return (
              <div className="min-h-screen bg-gray-100">
                     <nav className="bg-white border-b border-gray-100">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                   <div className="flex justify-between h-16">
                                          <div className="flex">
                                                 <div className="shrink-0 flex items-center">
                                                        <Link href="/">
                                                               <span className="text-2xl font-bold text-gray-800">CARAPARÍ</span>
                                                        </Link>
                                                 </div>

                                                 {auth.user?.role === 'admin' && (
                                                        <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                                               <Link
                                                                      href="/dashboard"
                                                                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                                                               >
                                                                      Dashboard
                                                               </Link>
                                                               <Link
                                                                      href="/admin/places"
                                                                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                                                               >
                                                                      Lugares
                                                               </Link>
                                                               <Link
                                                                      href="/admin/users"
                                                                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                                                               >
                                                                      Usuarios
                                                               </Link>
                                                               <Link
                                                                      href="/admin/reviews/dashboard"
                                                                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                                                               >
                                                                      Reseñas
                                                               </Link>
                                                        </div>
                                                 )}
                                          </div>

                                          <div className="hidden sm:flex sm:items-center sm:ml-6">
                                                 <div className="ml-3 relative">
                                                        <div className="relative">
                                                               <button
                                                                      onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                                                      className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                               >
                                                                      <div className="flex items-center">
                                                                             {auth.user?.avatar ? (
                                                                                    <img
                                                                                           className="h-8 w-8 rounded-full object-cover mr-2"
                                                                                           src={`/storage/${auth.user.avatar}`}
                                                                                           alt={auth.user.name}
                                                                                    />
                                                                             ) : (
                                                                                    <img
                                                                                           className="h-8 w-8 rounded-full object-cover mr-2"
                                                                                           src="/storage/avatars/default-avatar.avif"
                                                                                           alt={auth.user.name}
                                                                                    />
                                                                             )}
                                                                             <span className="text-gray-700">{auth.user?.name}</span>
                                                                      </div>
                                                               </button>

                                                               {showingNavigationDropdown && (
                                                                      <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                                                                             <Link
                                                                                    href="/settings/profile"
                                                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                             >
                                                                                    Perfil
                                                                             </Link>
                                                                             <Link
                                                                                    href="/logout"
                                                                                    method="post"
                                                                                    as="button"
                                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                             >
                                                                                    Cerrar Sesión
                                                                             </Link>
                                                                      </div>
                                                               )}
                                                        </div>
                                                 </div>
                                          </div>

                                          <div className="-mr-2 flex items-center sm:hidden">
                                                 <button
                                                        onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                                                 >
                                                        <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                                        </svg>
                                                 </button>
                                          </div>
                                   </div>
                            </div>

                            {showingNavigationDropdown && (
                                   <div className="sm:hidden">
                                          <div className="pt-2 pb-3 space-y-1">
                                                 <Link
                                                        href="/dashboard"
                                                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
                                                 >
                                                        Dashboard
                                                 </Link>
                                                 {auth.user?.role === 'admin' && (
                                                        <>
                                                               <Link
                                                                      href="/admin/places"
                                                                      className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
                                                               >
                                                                      Lugares
                                                               </Link>
                                                               <Link
                                                                      href="/admin/users"
                                                                      className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
                                                               >
                                                                      Usuarios
                                                               </Link>
                                                               <Link
                                                                      href="/admin/reviews/dashboard"
                                                                      className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
                                                               >
                                                                      Reseñas
                                                               </Link>
                                                        </>
                                                 )}
                                          </div>

                                          <div className="pt-4 pb-1 border-t border-gray-200">
                                                 <div className="px-4">
                                                        <div className="font-medium text-base text-gray-800">{auth.user?.name}</div>
                                                        <div className="font-medium text-sm text-gray-500">{auth.user?.email}</div>
                                                 </div>

                                                 <div className="mt-3 space-y-1">
                                                        <Link
                                                               href="/settings/profile"
                                                               className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:text-gray-800 focus:bg-gray-100 transition duration-150 ease-in-out"
                                                        >
                                                               Perfil
                                                        </Link>
                                                        <Link
                                                               href="/logout"
                                                               method="post"
                                                               as="button"
                                                               className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:text-gray-800 focus:bg-gray-100 transition duration-150 ease-in-out"
                                                        >
                                                               Cerrar Sesión
                                                        </Link>
                                                 </div>
                                          </div>
                                   </div>
                            )}
                     </nav>

                     {header && (
                            <header className="bg-white shadow">
                                   <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                                          {header}
                                   </div>
                            </header>
                     )}

                     <main>{children}</main>
              </div>
       );
}