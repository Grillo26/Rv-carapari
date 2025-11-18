import { login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1800&q=80&auto=format&fit=crop',
];

const PLACE_LIST = [
    { title: 'Catedral', slug: 'catedral', img: HERO_IMAGES[0], description: 'La imponente catedral histórica en el corazón de Caraparí.', rating: 4.8, reviews: 230 },
    { title: 'Plaza Principal', slug: 'plaza-principal', img: HERO_IMAGES[1], description: 'Punto de encuentro con vida, ferias y actividades culturales.', rating: 4.6, reviews: 142 },
    { title: 'Mercado Central', slug: 'mercado-central', img: HERO_IMAGES[2], description: 'Sabores locales y artesanías en un ambiente tradicional.', rating: 4.4, reviews: 98 },
    { title: 'Plaza Moto Méndez', slug: 'plaza-moto-mendez', img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=1200&q=80&auto=format&fit=crop', description: 'Espacio moderno ideal para eventos al aire libre.', rating: 4.2, reviews: 64 },
    { title: 'Avenida Canal', slug: 'avenida-canal', img: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=1200&q=80&auto=format&fit=crop', description: 'Paseo arbolado y comercios locales con mucho encanto.', rating: 4.3, reviews: 77 },
    { title: 'Catedral (Antigua)', slug: 'catedral-antigua', img: 'https://images.unsplash.com/photo-1498550744923-4a5c0c7b8f3f?w=1200&q=80&auto=format&fit=crop', description: 'Otra vista histórica de la catedral y sus alrededores.', rating: 4.5, reviews: 55 },
];

export default function Landing({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;
    const [heroIndex, setHeroIndex] = useState(0);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    // Modal state for place info
    const [openPlace, setOpenPlace] = useState<null | typeof PLACE_LIST[0]>(null);

    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const id = setInterval(() => setHeroIndex((h) => (h + 1) % HERO_IMAGES.length), 5000);
        return () => clearInterval(id);
    }, []);

    return (
        <>
            <Head>
                <title>CARAPARÍ — Turismo</title>
                {/* Google Fonts placeholders: Inter + Playfair Display */}
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-neutral-900 text-white" style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto" }}>
                {/* NAVBAR */}
                <nav className="fixed left-0 right-0 top-0 z-40 bg-neutral-900/60 backdrop-blur-sm">
                    <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-2xl font-extrabold tracking-tight">CARAPARÍ</div>
                            <div className="hidden items-center gap-3 text-sm text-neutral-300 ml-6 md:flex">
                                <a href="#tours" className="hover:text-white">Tours</a>
                                <a href="#places" className="hover:text-white">Lugares</a>
                                <a href="#faq" className="hover:text-white">Preguntas</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 relative">
                            {!auth.user ? (
                                <>
                                    <Link href={login()} className="text-sm text-neutral-300 hover:text-white">Iniciar sesión</Link>
                                    {canRegister && <Link href={register()} className="rounded-md bg-amber-500 px-3 py-1 text-sm font-medium text-black">Registro</Link>}
                                </>
                            ) : (
                                <div className="relative">
                                    <button onClick={() => setMenuOpen((s) => !s)} className="flex items-center gap-2">
                                        <div className="h-8 w-8 overflow-hidden rounded-full bg-neutral-700">
                                            <img src={auth.user.avatar ? `/storage/${auth.user.avatar}` : '/images/default-avatar.png'} alt="avatar" className="h-full w-full object-cover" />
                                        </div>
                                        <div className="text-sm text-neutral-300 hidden md:block">{auth.user.name}</div>
                                    </button>

                                    {menuOpen && (
                                        <div className="absolute right-0 mt-2 w-40 rounded bg-neutral-800/90 p-2 shadow-lg">
                                            <Link href="/settings/profile" className="block px-2 py-1 text-sm text-neutral-200 hover:bg-neutral-700 rounded">Perfil</Link>
                                            <Link href="/dashboard" className="block px-2 py-1 text-sm text-neutral-200 hover:bg-neutral-700 rounded">Dashboard</Link>
                                            <Link method="post" href="/logout" as="button" className="mt-2 w-full rounded bg-red-600 px-3 py-1 text-sm font-medium text-white">Cerrar sesión</Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                <div className="pt-20" />
                {/* HERO */}
                <section className="relative h-screen overflow-hidden">
                    <img src={HERO_IMAGES[heroIndex]} alt="Hero" className="absolute inset-0 h-full w-full object-cover brightness-50" />

                    <div className="absolute inset-0 mx-auto max-w-6xl px-6 flex flex-col justify-center lg:flex-row lg:items-center lg:justify-between">
                        <div className="lg:w-1/2">
                            <h2 className="text-5xl font-extrabold tracking-tight">TIME TO TRAVEL</h2>
                            <p className="mt-4 max-w-xl text-neutral-300">Discover CARAPARÍ — historia, plazas, mercados y avenidas que cuentan historias. Vive la experiencia local.</p>

                            <div className="mt-6 flex gap-4">
                                <a href="#places" className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-white/5">MORE DETAILED</a>
                                <a href="#tours" className="rounded-md bg-amber-500 px-4 py-2 text-sm text-black">POPULAR TOURS</a>
                            </div>

                            <div className="mt-8 flex gap-6 text-neutral-300">
                                <div>
                                    <div className="text-sm">Usuarios</div>
                                    <div className="text-2xl font-semibold">1,245</div>
                                </div>
                                <div>
                                    <div className="text-sm">Valoración</div>
                                    <div className="text-2xl font-semibold">4.6</div>
                                </div>
                                <div>
                                    <div className="text-sm">Comentarios</div>
                                    <div className="text-2xl font-semibold">87</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 lg:mt-0 lg:w-1/3">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl font-bold">01</div>
                                    <div className="text-sm text-neutral-300">Explore the Cathedral and its history</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl font-bold">02</div>
                                    <div className="text-sm text-neutral-300">Walk the Plaza Principal</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl font-bold">03</div>
                                    <div className="text-sm text-neutral-300">Taste local food at Mercado Central</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-400 text-sm">Scroll to discover • CARAPARÍ</div>
                </section>

                {/* POPULAR TOURS */}
                <section id="tours" className="mx-auto max-w-6xl px-6 py-12">
                    <h3 className="text-3xl font-bold text-center">POPULAR TOURS</h3>
                    <p className="mt-2 text-center text-neutral-400">There will be a small title here.</p>

                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {PLACE_LIST.slice(0, 4).map((t) => (
                            <div key={t.slug} className="relative overflow-hidden rounded-lg bg-black/40 p-0 shadow-lg">
                                <img src={t.img} alt={t.title} className="h-48 w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <div className="text-sm font-semibold">{t.title}</div>
                                    <div className="text-xs text-neutral-300">There will be a small.</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* DISCOVER VIDEO/GALLERY */}
                <section className="mx-auto max-w-6xl px-6 py-12">
                    <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                        <div>
                            <h3 className="text-3xl font-bold">DISCOVER THE WORLD IN A NEW WAY</h3>
                            <p className="mt-4 text-neutral-400">Watch the video — a short presentation about the most remarkable places in CARAPARÍ.</p>
                            <button className="mt-6 inline-flex items-center gap-3 rounded-md bg-white/10 px-4 py-2">▶ WATCH THE VIDEO</button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {HERO_IMAGES.map((img, i) => (
                                <div key={i} className="relative overflow-hidden rounded">
                                    <img src={img} className="h-28 w-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-8 w-8 rounded-full bg-white/80 text-black flex items-center justify-center">▶</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PLACES CARDS (6) */}
                <section id="places" className="mx-auto max-w-6xl px-6 pb-20">
                    <h3 className="text-3xl font-bold text-center">Lugares para visitar</h3>
                    <p className="mt-2 text-center text-neutral-400">6 sitios destacados en CARAPARÍ</p>

                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {PLACE_LIST.map((place, idx) => {
                            const locked = !auth.user && idx !== 0; // only first available when not logged
                            return (
                                <article key={place.slug} className="relative rounded overflow-hidden bg-neutral-800 shadow-lg">
                                    <img src={place.img} alt={place.title} className="h-48 w-full object-cover" />
                                    <div className="p-4">
                                        <h4 className="text-lg font-semibold">{place.title}</h4>
                                        <p className="mt-1 text-sm text-neutral-300">{place.description}</p>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-sm text-neutral-300">{place.rating} ★ • {place.reviews} reseñas</div>
                                            <div>
                                                {locked ? (
                                                    <div className="flex items-center gap-3">
                                                        <button disabled className="rounded-md bg-neutral-600/40 px-3 py-1 text-sm text-neutral-400">Bloqueado</button>
                                                        <Link href={login()} className="text-sm underline">Inicia sesión</Link>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setOpenPlace(place)} className="rounded-md bg-amber-500 px-3 py-1 text-sm font-medium text-black">Ver más</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {locked && <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900/70" />}
                                </article>
                            );
                        })}
            {/* MODAL for place info */}
            {openPlace && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-2">
                    <div className="relative w-full max-w-3xl rounded-2xl bg-neutral-900 shadow-2xl p-0 flex flex-col md:flex-row overflow-hidden animate-fade-in">
                        <button onClick={() => setOpenPlace(null)} className="absolute right-4 top-4 text-neutral-400 hover:text-white text-3xl z-10">×</button>
                        {/* Image side */}
                        <div className="md:w-1/2 w-full h-64 md:h-auto flex-shrink-0">
                            <img src={openPlace.img} alt={openPlace.title} className="w-full h-full object-cover" />
                        </div>
                        {/* Info side */}
                        <div className="flex-1 p-6 flex flex-col justify-center">
                            <h3 className="text-3xl md:text-4xl font-extrabold mb-2">{openPlace.title}</h3>
                            <div className="mb-2 text-lg text-amber-400 font-semibold">{openPlace.rating} ★ <span className="text-neutral-400 font-normal">• {openPlace.reviews} reseñas</span></div>
                            <p className="mb-6 text-base md:text-lg text-neutral-200">{openPlace.description}</p>
                            <div className="flex justify-end">
                                <Link href={`/places/${openPlace.slug}`} className="rounded-lg bg-amber-500 px-8 py-3 text-lg font-bold text-black shadow-lg hover:bg-amber-400 transition">Explorar</Link>
                            </div>
                        </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenPlace(null)} />
                </div>
            )}
                    </div>
                </section>
                {/* COMMENTS / TESTIMONIALS */}
                <section id="comments" className="mx-auto max-w-6xl px-6 py-12">
                    <h3 className="text-3xl font-bold text-center">Comentarios</h3>
                    <p className="mt-2 text-center text-neutral-400">Lo que dicen los visitantes</p>

                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { name: 'María', text: 'Un lugar increíble y gente muy amable. Volvería sin duda.' },
                            { name: 'Carlos', text: 'La catedral es impresionante — imperdible para los fotógrafos.' },
                            { name: 'Lucía', text: 'Sabores locales en el mercado que no olvidarás.' },
                        ].map((c, i) => (
                            <div key={i} className="rounded-md bg-neutral-800/60 p-4">
                                <div className="font-semibold">{c.name}</div>
                                <div className="mt-2 text-sm text-neutral-300">{c.text}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="mx-auto max-w-6xl px-6 py-12">
                    <h3 className="text-3xl font-bold text-center">Preguntas frecuentes</h3>
                    <p className="mt-2 text-center text-neutral-400">Respuestas rápidas a dudas comunes</p>

                    <div className="mt-8 space-y-4">
                        {[
                            { q: '¿Cómo llego desde la ciudad más cercana?', a: 'Hay buses y transporte privado; recomendamos revisar horarios locales y reservar tours con antelación.' },
                            { q: '¿Hay visitas guiadas?', a: 'Sí, existen guías locales que ofrecen recorridos temáticos por la ciudad.' },
                            { q: '¿Es seguro visitar de noche?', a: 'Las zonas turísticas son seguras pero como en cualquier ciudad, recomendamos precaución y no alejarse de áreas concurridas.' },
                        ].map((f, idx) => (
                            <div key={idx} className="rounded-md bg-neutral-800/60 p-4">
                                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full text-left flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">{f.q}</div>
                                    </div>
                                    <div className="text-neutral-300">{openFaq === idx ? '−' : '+'}</div>
                                </button>
                                {openFaq === idx && <div className="mt-3 text-sm text-neutral-300">{f.a}</div>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="mt-12 border-t border-neutral-800/60 bg-neutral-900/80">
                    <div className="mx-auto max-w-6xl px-6 py-10">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div>
                                <div className="text-xl font-bold">CARAPARÍ</div>
                                <div className="mt-2 text-sm text-neutral-400">Explora, descubre y vive CARAPARÍ — turismo local y experiencias auténticas.</div>
                            </div>

                            <div className="text-sm text-neutral-300">
                                <div className="font-semibold">Contacto</div>
                                <div className="mt-2">info@carapari.example</div>
                                <div className="mt-1">+591 7 123 4567</div>
                            </div>

                            <div>
                                <div className="font-semibold text-sm text-neutral-300">Síguenos</div>
                                <div className="mt-2 flex gap-3 text-neutral-300">
                                    <a href="#" className="hover:text-white">Twitter</a>
                                    <a href="#" className="hover:text-white">Instagram</a>
                                    <a href="#" className="hover:text-white">Facebook</a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-sm text-neutral-500">© {new Date().getFullYear()} CARAPARÍ — Turismo. Todos los derechos reservados.</div>
                    </div>
                </footer>
            </div>
        </>
    );
}
