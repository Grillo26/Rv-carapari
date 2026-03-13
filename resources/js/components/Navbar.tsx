import { Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { THEME_COLORS } from '@/constants/theme';

interface NavbarProps {
       isScrolled: boolean;
       auth: {
              user?: {
                     id: number;
                     name: string;
                     avatar?: string;
                     role?: string;
              };
       };
       canRegister?: boolean;
       loginRoute: string | any;
       registerRoute: string | any;
}

export default function Navbar({
       isScrolled,
       auth,
       canRegister = true,
       loginRoute,
       registerRoute,
}: NavbarProps) {
       const [menuOpen, setMenuOpen] = useState(false);
       const dropdownRef = useRef<HTMLDivElement>(null);

       useEffect(() => {
              const handleClickOutside = (e: MouseEvent) => {
                     if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                            setMenuOpen(false);
                     }
              };
              if (menuOpen) {
                     document.addEventListener('mousedown', handleClickOutside);
              }
              return () => document.removeEventListener('mousedown', handleClickOutside);
       }, [menuOpen]);

       return (
              <nav
                     className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-neutral-900/60 backdrop-blur-sm' : 'bg-transparent'
                            }`}
              >
                     <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between h-20">
                            {/* Logo - Izquierda */}
                            <div className="flex-shrink-0">
                                   <Link href="/" className="text-2xl font-extrabold tracking-tight hover:opacity-80 transition">
                                          CARAPARÍ
                                   </Link>
                            </div>

                            {/* Menú - Centro */}
                            <div
                                   className={`hidden items-center gap-8 text-sm ${THEME_COLORS.textSecondary} md:flex flex-1 justify-center`}
                            >
                                   <a href="#tours" className="hover:text-green-600 transition">
                                          Tours
                                   </a>
                                   <a href="#vr-tours" className="hover:text-green-600 transition">
                                          VR Tours
                                   </a>
                                   <a href="#places" className="hover:text-green-600 transition">
                                          Lugares
                                   </a>
                                   <a href="#faq" className="hover:text-green-600 transition">
                                          Preguntas
                                   </a>
                            </div>

                            {/* Botones - Derecha */}
                            <div className="flex items-center gap-4 relative flex-shrink-0">
                                   {!auth.user ? (
                                          <>
                                                 <Link
                                                        href={loginRoute}
                                                        className={`text-sm ${THEME_COLORS.textSecondary} hover:text-green-600 transition`}
                                                 >
                                                        Iniciar sesión
                                                 </Link>
                                                 {canRegister && (
                                                        <Link
                                                               href={registerRoute}
                                                               className="rounded-md border border-white px-3 py-1 text-sm font-medium text-white transition hover:bg-white/10"
                                                        >
                                                               Registro
                                                        </Link>
                                                 )}
                                          </>
                                   ) : (
                                          <div className="relative" ref={dropdownRef}>
                                                 <button
                                                        onClick={() => setMenuOpen((s) => !s)}
                                                        className="flex items-center gap-2"
                                                 >
                                                        <div className="h-8 w-8 overflow-hidden rounded-full bg-neutral-700">
                                                               <img
                                                                      src={
                                                                             auth.user.avatar
                                                                                    ? `/storage/${auth.user.avatar}`
                                                                                    : '/storage/avatars/default-avatar.avif'
                                                                      }
                                                                      alt="avatar"
                                                                      className="h-full w-full object-cover"
                                                               />
                                                        </div>
                                                        <div className="text-sm text-neutral-300 hidden md:block">
                                                               {auth.user.name}
                                                        </div>
                                                        <span className={`text-neutral-400 text-xs transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}>
                                                               ▾
                                                        </span>
                                                 </button>

                                                 {menuOpen && (
                                                        <div className="absolute right-0 mt-2 w-40 rounded bg-neutral-800/90 p-2 shadow-lg">
                                                               <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-neutral-700">
                                                                      <span className="text-xs text-neutral-500 font-medium">Mi cuenta</span>
                                                                      <button
                                                                             onClick={() => setMenuOpen(false)}
                                                                             className="text-neutral-500 hover:text-white transition text-sm leading-none"
                                                                             aria-label="Cerrar menú"
                                                                      >✕</button>
                                                               </div>
                                                               <Link
                                                                      href="/settings/profile"
                                                                      className="block px-2 py-1 text-sm text-neutral-200 hover:bg-neutral-700 rounded transition"
                                                               >
                                                                      Perfil
                                                               </Link>
                                                               {auth.user?.role === 'admin' && (
                                                                      <Link
                                                                             href="/dashboard"
                                                                             className="block px-2 py-1 text-sm text-neutral-200 hover:bg-neutral-700 rounded transition"
                                                                      >
                                                                             Dashboard
                                                                      </Link>
                                                               )}
                                                               <Link
                                                                      method="post"
                                                                      href="/logout"
                                                                      as="button"
                                                                      className={`mt-2 w-full rounded ${THEME_COLORS.buttonSecondary} px-3 py-1 text-sm font-medium text-white`}
                                                               >
                                                                      Cerrar sesión
                                                               </Link>
                                                        </div>
                                                 )}
                                          </div>
                                   )}
                            </div>
                     </div>
              </nav>
       );
}
