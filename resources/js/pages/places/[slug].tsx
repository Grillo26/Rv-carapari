import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LocationMap from '@/components/LocationMap';
import { login, register } from '@/routes';
import { type SharedData } from '@/types';
import { THEME_COLORS } from '@/constants/theme';
import { useRef } from 'react';

interface PlaceImage {
    id: number;
    title: string | null;
    image_path: string;
    description: string | null;
    is_main: boolean;
    is_active: boolean;
    sort_order: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface Review {
    id: number;
    title: string | null;
    content: string;
    is_approved: boolean;
    created_at: string;
    user: User;
    helpful_votes_count: number;
    unhelpful_votes_count: number;
}

interface Rating {
    id: number;
    rating: number;
    created_at: string;
    user: User;
}

interface Model3D {
    id: number;
    title: string;
    model_path: string;
    thumbnail?: string | null;
    description?: string | null;
    is_active: boolean;
    sort_order: number;
}

interface Place {
    id: number;
    title: string;
    slug: string;
    short_description: string;
    description: string;
    thumbnail: string | null;
    main_360_image: string | null;
    is_available: boolean;
    sort_order: number;
    latitude?: number | null;
    longitude?: number | null;
    address?: string | null;
    created_at: string;
    updated_at: string;
    active_images: PlaceImage[];
    average_rating?: number;
    total_ratings?: number;
    total_reviews?: number;
    reviews?: Review[];
    ratings?: Rating[];
    models_3d?: Model3D[];
    user_rating?: number;
    user_has_review?: boolean;
}

interface PlaceShowProps extends SharedData {
    place: Place;
    canRegister?: boolean;
}

export default function PlaceShow({ place, canRegister = true }: PlaceShowProps) {
    const { auth } = usePage<SharedData>().props;
    const [isScrolled, setIsScrolled] = useState(false);
    const [userRating, setUserRating] = useState<number>(place.user_rating || 0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [editingReview, setEditingReview] = useState<number | null>(null);
    const [userVotes, setUserVotes] = useState<{ [key: number]: 'helpful' | 'unhelpful' | null }>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    // Estado para los votos de cada comentario
    const [reviewVoteCounts, setReviewVoteCounts] = useState<{ [key: number]: { helpful: number; unhelpful: number } }>({});

    // Inicializar los conteos de votos
    useEffect(() => {
        if (place.reviews) {
            const voteCounts: { [key: number]: { helpful: number; unhelpful: number } } = {};
            place.reviews.forEach(review => {
                voteCounts[review.id] = {
                    helpful: review.helpful_votes_count,
                    unhelpful: review.unhelpful_votes_count
                };
            });
            setReviewVoteCounts(voteCounts);
        }
    }, [place.reviews]);

    // Cargar los votos del usuario actual
    useEffect(() => {
        if (!auth.user) {
            setUserVotes({});
            return;
        }

        const loadUserVotes = async () => {
            try {
                const csrfTokenElement = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
                const csrfToken = csrfTokenElement?.content || '';

                const response = await fetch(`/api/review-votes/user-votes/${place.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Votos del usuario cargados:', data.votes);
                    setUserVotes(data.votes || {});
                } else {
                    console.error('Error cargando votos del usuario:', response.status);
                }
            } catch (error) {
                console.error('Error al cargar votos del usuario:', error);
            }
        };

        loadUserVotes();
    }, [auth.user, place.id]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Form para nueva reseña
    const { data: reviewData, setData: setReviewData, post: postReview, processing: reviewProcessing, reset: resetReview } = useForm({
        title: '',
        content: '',
        place_id: place.id,
    });

    // Verificar si el usuario ya tiene una reseña
    const userHasReview = place.user_has_review || false;

    // Form para editar reseña
    const { data: editData, setData: setEditData, patch, processing: editProcessing } = useForm({
        title: '',
        content: '',
    });

    const placeholderImage = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80&auto=format&fit=crop";

    const mainImage = place.thumbnail
        ? `/storage/${place.thumbnail}`
        : place.active_images.find(img => img.is_main)?.image_path
            ? `/storage/${place.active_images.find(img => img.is_main)?.image_path}`
            : placeholderImage;

    // Rating data from database
    const rating = Number(place.average_rating) || 0;
    const reviewsCount = place.total_reviews || 0;

    // Funciones para calificaciones
    const handleRatingClick = (ratingValue: number) => {
        if (!auth.user) {
            router.get('/login');
            return;
        }

        setUserRating(ratingValue);

        router.post('/api/ratings', {
            place_id: place.id,
            rating: ratingValue
        });
    };

    // Funciones para reseñas
    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();

        if (!auth.user) {
            router.get('/login');
            return;
        }

        if (userHasReview) {
            return; // No permitir enviar si ya tiene reseña
        }

        // Usar el método form de useForm para envío directo
        postReview('/api/reviews', {
            onSuccess: () => {
                resetReview(); // Limpiar formulario después del éxito
            }
        });
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review.id);
        setEditData({
            title: review.title || '',
            content: review.content
        });
    };

    const handleUpdateReview = (e: React.FormEvent, reviewId: number) => {
        e.preventDefault();

        router.put(`/api/reviews/${reviewId}`, editData, {
            onSuccess: () => {
                setEditingReview(null);
                setEditData({ title: '', content: '' });
                setSuccessMessage('✓ Comentario editado correctamente');
                setTimeout(() => setSuccessMessage(null), 3000);
            },
            onError: () => {
                setSuccessMessage('✗ Error al guardar el comentario');
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        });
    };

    const cancelEdit = () => {
        setEditingReview(null);
        setEditData({ title: '', content: '' });
    };

    // Función para manejar votos de utilidad en reseñas
    const handleReviewVote = async (reviewId: number, voteType: 'helpful' | 'unhelpful') => {
        if (!auth.user) {
            router.get('/login');
            return;
        }

        // Obtener el estado actual de votos
        const currentVote = userVotes[reviewId];
        const isToggling = currentVote === voteType;

        // Actualizar estado localmente inmediatamente - optimistic update
        const oldCounts = reviewVoteCounts[reviewId] || { helpful: 0, unhelpful: 0 };
        const newCounts = { ...oldCounts };

        if (isToggling) {
            // Si está desmarcando
            if (voteType === 'helpful') newCounts.helpful = Math.max(0, newCounts.helpful - 1);
            else newCounts.unhelpful = Math.max(0, newCounts.unhelpful - 1);
        } else {
            // Si está marcando
            if (currentVote === 'helpful') newCounts.helpful = Math.max(0, newCounts.helpful - 1);
            else if (currentVote === 'unhelpful') newCounts.unhelpful = Math.max(0, newCounts.unhelpful - 1);

            if (voteType === 'helpful') newCounts.helpful += 1;
            else newCounts.unhelpful += 1;
        }

        setReviewVoteCounts({ ...reviewVoteCounts, [reviewId]: newCounts });
        setUserVotes({ ...userVotes, [reviewId]: isToggling ? null : voteType });

        try {
            const csrfTokenElement = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
            const csrfToken = csrfTokenElement?.content || '';

            const payload = {
                vote_type: isToggling ? null : voteType
            };

            console.log('Enviando voto:', { reviewId, payload });

            const response = await fetch(`/api/review-votes/${reviewId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error al registrar voto:', response.status, errorData);
                // Revertir cambios si hay error
                setReviewVoteCounts({ ...reviewVoteCounts, [reviewId]: oldCounts });
                setUserVotes({ ...userVotes, [reviewId]: currentVote });
                alert('Error: ' + (errorData.message || 'No se pudo registrar el voto'));
                return;
            }

            const data = await response.json();

            console.log('Respuesta del servidor:', data);

            if (data.success) {
                // Actualizar con los conteos del servidor
                setReviewVoteCounts({
                    ...reviewVoteCounts,
                    [reviewId]: {
                        helpful: data.helpful_votes_count,
                        unhelpful: data.unhelpful_votes_count
                    }
                });
                console.log('Voto registrado exitosamente');
            }
        } catch (error) {
            console.error('Error registrando voto:', error);
            // Revertir el voto si hay error
            setReviewVoteCounts({ ...reviewVoteCounts, [reviewId]: oldCounts });
            setUserVotes({ ...userVotes, [reviewId]: currentVote });
            alert('Error de conexión: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    // Componente de estrellas
    const StarRating = ({ rating: currentRating, onRate, size = 'w-6 h-6', interactive = false }: {
        rating: number;
        onRate?: (rating: number) => void;
        size?: string;
        interactive?: boolean;
    }) => {
        return (
            <div className="flex items-center justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`${size} ${interactive ? 'cursor-pointer hover:scale-125 transition-transform' : 'cursor-default'}`}
                        onClick={() => interactive && onRate && onRate(star)}
                        onMouseEnter={() => interactive && setHoverRating(star)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                        disabled={!interactive}
                    >
                        <svg
                            className={`w-full h-full ${star <= (interactive ? (hoverRating || currentRating) : currentRating)
                                ? 'text-green-500'
                                : 'text-neutral-600'
                                }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                ))}
            </div>
        );
    };

    const handleDirections = () => {
        if (place.latitude && place.longitude) {
            // Esta URL abre Google Maps con la ruta desde la ubicación actual del usuario
            const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
            window.open(url, '_blank');
        }
    };

    // 1. Definimos el tipo de la referencia para que TypeScript sepa que es un elemento HTML
    const scrollRef = useRef<HTMLDivElement>(null);
    const commentsRef = useRef<HTMLElement>(null);

    // 2. Especificamos que 'direction' es un string (solo 'left' o 'right')
    const scroll = (direction: 'left' | 'right') => {
        // 3. Usamos una comprobación de seguridad para asegurar que scrollRef.current existe
        if (scrollRef.current) {
            const scrollAmount = 400;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const imagePath = place.main_360_image || place.active_images[0]?.image_path;

    // Datos estáticos de modelos 3D para prueba
    const staticModels3D: Model3D[] = [
        {
            id: 1,
            title: "Monumento Principal",
            model_path: "/images/3d/1.glb",
            thumbnail: "placeholder-place.png",
            description: "Modelo 3D del monumento principal del lugar",
            is_active: true,
            sort_order: 1
        },
        {
            id: 2,
            title: "Estructura Histórica",
            model_path: "/images/3d/1.glb",
            thumbnail: "placeholder-place.png",
            description: "Recreación 3D de la estructura histórica",
            is_active: true,
            sort_order: 2
        },
        {
            id: 3,
            title: "Mapa del Territorio",
            model_path: "/images/3d/1.glb",
            thumbnail: "placeholder-place.png",
            description: "Mapa 3D interactivo del territorio",
            is_active: true,
            sort_order: 3
        },
        {
            id: 4,
            title: "Artefacto Cultural",
            model_path: "/images/3d/1.glb",
            thumbnail: "placeholder-place.png",
            description: "Modelo de artefacto cultural importante",
            is_active: true,
            sort_order: 4
        }
    ];

    return (
        <div className="min-h-screen bg-neutral-900 text-white" style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto" }}>
            <Head title={`${place.title} - Caraparí Turismo`} />

            <Navbar
                isScrolled={isScrolled}
                auth={auth}
                canRegister={canRegister}
                loginRoute={login()}
                registerRoute={register()}
            />

            <div className="pt-20">
                {/* Hero Section */}
                <section className="relative group overflow-hidden bg-neutral-900"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(23, 23, 23, 1) 0%, rgba(23, 23, 23, 1) 40%, rgba(23, 23, 23, 0) 80%), 
                            linear-gradient(rgba(23, 23, 23, 0.2), rgba(23, 23, 23, 0.2)), 
                            url('${mainImage}')
                        `,
                        backgroundSize: 'cover',
                        backgroundPosition: 'right center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {/* Fusión inferior con el fondo de la página bg-neutral-900 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-100"></div>

                    <div className="relative z-10 mx-auto max-w-6xl px-0 py-16 lg:py-24">
                        {/* Botón Volver */}
                        <div className="mb-10">
                            <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Volver al inicio
                            </Link>
                        </div>

                        <div className="max-w-2xl space-y-6">
                            {/* Título Principal */}
                            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white uppercase leading-none drop-shadow-md">
                                {place.title}
                            </h1>

                            {/* Fila de Metadatos */}
                            <div className="flex flex-wrap items-center gap-5">

                                {/*Verificamos si hay lugar, si no muestre un mensaje */}
                                <span className={`font-bold text-lg px-3 py-1 rounded-full ${imagePath
                                    ? "text-green-500 bg-green-500/10"
                                    : "text-yellow-500 bg-yellow-500/10"
                                    }`}>
                                    {imagePath ? "Lugar destacado" : "Lugar en mantenimiento"}
                                </span>

                                {!imagePath && (
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                    </span>
                                )}

                                {/* Puntuación con Estrellas */}
                                <div className="flex items-center gap-1">
                                    <span className="text-white font-bold mr-1">{Number(rating || 0).toFixed(1)}</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.round(Number(rating) || 0) ? 'text-yellow-500' : 'text-neutral-600'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>

                                {/* Cantidad de Comentarios */}
                                <span className="text-neutral-400 text-sm font-medium border-l border-neutral-700 pl-5">
                                    {place.total_reviews || 0} {place.total_reviews === 1 ? 'comentario' : 'comentarios'}
                                </span>
                            </div>

                            {/* Descripción */}
                            <p className="text-neutral-200 text-xl leading-relaxed drop-shadow-lg">
                                {place.description}
                            </p>

                            {/* Botones de Acción */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                {/* Botón Explorar con icono de Lentes VR */}
                                <button
                                    onClick={() => {
                                        if (imagePath) {
                                            router.get('/vr', { image: `/storage/${imagePath}`, place_id: place.id });
                                        }
                                    }}
                                    disabled={!imagePath} // Deshabilita el botón si no hay imagen
                                    className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 font-extrabold text-lg rounded transition-all transform shadow-xl ${imagePath
                                        ? "bg-white hover:bg-neutral-200 text-black active:scale-95"
                                        : "bg-neutral-700 text-neutral-400 cursor-not-allowed opacity-70"
                                        }`}
                                >
                                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 10h-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2h2a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1z" />
                                        <circle cx="7" cy="14" r="2" />
                                        <circle cx="13" cy="14" r="2" />
                                    </svg>
                                    Explorar
                                </button>



                                {/* Botón Comentarios con icono de Mensaje */}
                                <button onClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-neutral-600/60 hover:bg-neutral-600/80 text-white font-extrabold text-lg rounded transition-all backdrop-blur-md shadow-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    Comentarios
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de Galería */}
                <div className="relative -mt-24 z-30 px-6 pb-12 max-w-7xl mx-auto group/gallery">
                    <div className="flex items-center justify-between mb-6 pt-20 px-2">
                        <h3 className="text-neutral-500 font-bold text-sm uppercase tracking-[0.2em]">
                            Fotos Destacadas
                        </h3>

                        {/* Botones de Navegación */}
                        <div className="hidden md:flex gap-2">
                            <button
                                onClick={() => scroll('left')}
                                className="p-2 rounded-full bg-neutral-800/80 text-white hover:bg-white hover:text-black transition-all shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="p-2 rounded-full bg-neutral-800/80 text-white hover:bg-white hover:text-black transition-all shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Contenedor de Scroll - Eliminamos overflow-hidden del padre inmediato */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto py-10 px-2 scrollbar-hide snap-x select-none"
                        style={{ margin: '-40px 0' }} // Compensamos el padding para que no ocupe espacio extra en el layout
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                            <div
                                key={item}
                                className="flex-none w-64 lg:w-80 aspect-video relative rounded-md transition-all duration-500 hover:scale-110 hover:z-50 cursor-pointer shadow-2xl bg-neutral-800 snap-start group/item outline outline-1 outline-white/5"
                            >
                                {/* La imagen debe tener rounded-md también para que el hover se vea limpio */}
                                <img
                                    src={`https://picsum.photos/seed/${item + 100}/800/450`}
                                    alt="Vista de Caraparí"
                                    className="w-full h-full object-cover rounded-md"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 rounded-md">
                                    <p className="text-white text-xs font-bold uppercase tracking-widest">Explorar en 360°</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mapa de Ubicación */}
                {(place.latitude && place.longitude) && (
                    <section className="mx-auto max-w-7xl px-6 py-16">
                        <h2 className="text-3xl font-bold mb-8 text-center">Ubicación</h2>
                        <div className="bg-neutral-800/60 rounded-2xl p-8">
                            <LocationMap
                                latitude={Number(place.latitude)}
                                longitude={Number(place.longitude)}
                                placeName={place.title}
                            />
                            <div className="mt-6 text-center">
                                <h3 className="text-xl font-semibold text-white mb-2">{place.title}</h3>
                                {place.address && (
                                    <p className="text-neutral-400">
                                        📍 {place.address}
                                    </p>
                                )}
                                <p className="text-neutral-500 text-sm mt-2">
                                    Coordenadas: {Number(place.latitude).toFixed(6)}, {Number(place.longitude).toFixed(6)}
                                </p>


                                <button
                                    onClick={handleDirections}
                                    className="w-auto inline-flex items-center justify-center gap-3 mt-2 px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-lg rounded-md transition-all border border-white/10 shadow-lg group"
                                >
                                    <svg
                                        className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Cómo llegar?
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Images Gallery */}
                {
                    place.active_images.length > 0 && (
                        <section className="mx-auto max-w-7xl px-6 py-16">
                            <h2 className="text-3xl font-bold mb-8 text-center">Galería de Imágenes 360°</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {place.active_images.map((image, index) => (
                                    <div
                                        key={image.id}
                                        className="relative group cursor-pointer"
                                        onClick={() => router.get('/vr', { image: `/storage/${image.image_path}` })}
                                    >
                                        <div className="relative overflow-hidden rounded-xl bg-neutral-800">
                                            <img
                                                src={`/storage/${image.image_path}`}
                                                alt={image.title || `${place.title} - Imagen ${index + 1}`}
                                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = placeholderImage;
                                                }}
                                            />

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 group-hover:opacity-80 transition-opacity duration-300"></div>

                                            {/* Play Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-green-600/90 text-black rounded-full p-3">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Main Badge */}
                                            {image.is_main && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="bg-green-600 text-black text-xs px-2 py-1 rounded-full font-bold">
                                                        Principal
                                                    </span>
                                                </div>
                                            )}

                                            {/* Title */}
                                            {image.title && (
                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <p className="bg-black/70 text-white text-sm px-3 py-1 rounded-lg truncate">
                                                        {image.title}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )
                }

                {/* Sección de Modelos 3D */}
                {
                    staticModels3D && staticModels3D.length > 0 && (
                        <section className="mx-auto max-w-7xl px-6 py-16">
                            <h2 className="text-3xl font-bold mb-8 text-center">Modelos 3D</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {staticModels3D.map((model, index) => (
                                    <div
                                        key={model.id}
                                        className="relative group cursor-pointer"
                                        onClick={() => router.get(`/model-3d/${model.id}`)}
                                    >
                                        <div className="relative overflow-hidden rounded-xl bg-neutral-800 aspect-square">
                                            {model.thumbnail ? (
                                                <img
                                                    src={`/storage/${model.thumbnail}`}
                                                    alt={model.title}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = placeholderImage;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                                                    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 008.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 group-hover:opacity-80 transition-opacity duration-300"></div>

                                            {/* 3D Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-green-600/90 text-black rounded-full p-3">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <h3 className="text-white font-semibold truncate">{model.title}</h3>
                                                {model.description && (
                                                    <p className="text-neutral-300 text-xs mt-1 line-clamp-2">{model.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )
                }

                {/* Sección de Calificaciones y Comentarios */}
                <section ref={commentsRef} className="mx-auto max-w-7xl px-6 py-16">
                    <div className="bg-neutral-800/60 rounded-2xl p-8 mb-8">
                        {/* Calificación */}
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold mb-4 text-white">Califica este lugar</h3>
                            {auth.user ? (
                                <div className="flex flex-col items-center gap-4">
                                    <StarRating
                                        rating={userRating}
                                        onRate={handleRatingClick}
                                        size="w-10 h-10"
                                        interactive={true}
                                    />
                                    <p className="text-neutral-400 text-sm">
                                        {hoverRating > 0
                                            ? `${hoverRating} estrella${hoverRating > 1 ? 's' : ''}`
                                            : userRating > 0
                                                ? `Tu calificación: ${userRating} estrella${userRating > 1 ? 's' : ''}`
                                                : 'Haz clic en las estrellas para calificar'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <StarRating rating={0} size="w-10 h-10" />
                                    <p className="text-neutral-400 mt-4">
                                        <Link href={login()} className="text-green-500 hover:underline">
                                            Inicia sesión
                                        </Link>
                                        {' '}para calificar este lugar
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Formulario de comentario */}
                        {auth.user && !userHasReview && (
                            <form onSubmit={handleSubmitReview} className="mb-8">
                                <h4 className="text-xl font-semibold mb-4 text-white">Escribe una reseña</h4>
                                <div className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Título (opcional)"
                                            value={reviewData.title}
                                            onChange={(e) => setReviewData('title', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-neutral-700 text-white placeholder-neutral-400 border border-neutral-600 focus:border-green-500 focus:outline-none"
                                            disabled={reviewProcessing}
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            placeholder="Comparte tu experiencia..."
                                            value={reviewData.content}
                                            onChange={(e) => setReviewData('content', e.target.value)}
                                            rows={4}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-neutral-700 text-white placeholder-neutral-400 border border-neutral-600 focus:border-green-500 focus:outline-none resize-none"
                                            disabled={reviewProcessing}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={reviewProcessing || !reviewData.content.trim()}
                                            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {reviewProcessing ? 'Enviando...' : 'Enviar reseña'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Mensaje si ya tiene reseña */}
                        {auth.user && userHasReview && (
                            <div className="mb-8 p-4 bg-green-600/10 border border-green-600/20 rounded-lg">
                                <p className="text-green-500 text-center">
                                    ¡Gracias por tu reseña! Ya has dejado un comentario para este lugar. Si deseas hacer algún cambio, puedes editar tu reseña desde la lista de comentarios.
                                </p>
                            </div>
                        )}

                        {/* Lista de comentarios */}
                        <div>
                            <h4 className="text-xl font-semibold mb-6 text-white text-center">
                                Reseñas ({place.total_reviews || 0})
                            </h4>

                            {/* Mensaje de éxito */}
                            {successMessage && (
                                <div className={`mb-6 p-4 rounded-lg text-center font-semibold transition-all ${successMessage.includes('✓')
                                    ? 'bg-green-600/20 border border-green-600/50 text-green-400'
                                    : 'bg-red-600/20 border border-red-600/50 text-red-400'
                                    }`}>
                                    {successMessage}
                                </div>
                            )}

                            {place.reviews && place.reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {place.reviews.map((review) => (
                                        <div key={review.id} className="bg-neutral-700/50 rounded-xl p-6 border border-neutral-600">
                                            {/* Header de la reseña */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-600">
                                                        <img
                                                            src={review.user.avatar ? `/storage/${review.user.avatar}` : '/storage/avatars/default-avatar.avif'}
                                                            alt={review.user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{review.user.name}</p>
                                                        <p className="text-sm text-neutral-400">
                                                            {new Date(review.created_at).toLocaleDateString('es-ES', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Botón de editar (solo para el autor) */}
                                                {auth.user && auth.user.id === review.user.id && (
                                                    <button
                                                        onClick={() => handleEditReview(review)}
                                                        className="text-neutral-400 hover:text-green-500 transition-colors"
                                                        title="Editar reseña"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Badge de aprobación pendiente */}
                                            {!review.is_approved && (
                                                <div className="mb-3 p-2 bg-yellow-600/10 border border-yellow-600/20 rounded">
                                                    <p className="text-yellow-500 text-xs">⏳ Pendiente de aprobación</p>
                                                </div>
                                            )}

                                            {/* Contenido de la reseña */}
                                            {editingReview === review.id ? (
                                                <form onSubmit={(e) => handleUpdateReview(e, review.id)} className="space-y-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Título (opcional)"
                                                        value={editData.title}
                                                        onChange={(e) => setEditData('title', e.target.value)}
                                                        className="w-full px-4 py-2 rounded-lg bg-neutral-600 text-white placeholder-neutral-400 border border-neutral-500 focus:border-green-500 focus:outline-none"
                                                    />
                                                    <textarea
                                                        value={editData.content}
                                                        onChange={(e) => setEditData('content', e.target.value)}
                                                        rows={3}
                                                        required
                                                        className="w-full px-4 py-2 rounded-lg bg-neutral-600 text-white placeholder-neutral-400 border border-neutral-500 focus:border-green-500 focus:outline-none resize-none"
                                                    />
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={cancelEdit}
                                                            className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={editProcessing}
                                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {editProcessing ? 'Guardando...' : 'Guardar'}
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div>
                                                    {review.title && (
                                                        <h5 className="font-semibold text-white mb-2">{review.title}</h5>
                                                    )}
                                                    <p className="text-neutral-300 mb-4 leading-relaxed">{review.content}</p>

                                                    {/* Votos útiles */}
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReviewVote(review.id, 'helpful')}
                                                            disabled={auth.user && auth.user.id === review.user.id}
                                                            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${auth.user && auth.user.id === review.user.id
                                                                ? 'text-neutral-500 cursor-not-allowed bg-neutral-800/50 border border-neutral-700'
                                                                : userVotes[review.id] === 'helpful'
                                                                    ? 'bg-green-600/30 text-green-400 border border-green-600'
                                                                    : 'text-neutral-400 hover:text-green-400 hover:bg-green-600/10 border border-transparent hover:border-green-600/30'
                                                                }`}
                                                        >
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M2 10.5a1.5 1.5 0 113 0v-6a1.5 1.5 0 01-3 0v6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                            </svg>
                                                            {reviewVoteCounts[review.id]?.helpful || review.helpful_votes_count} De acuerdo{(reviewVoteCounts[review.id]?.helpful || review.helpful_votes_count) !== 1 ? 's' : ''}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReviewVote(review.id, 'unhelpful')}
                                                            disabled={auth.user && auth.user.id === review.user.id}
                                                            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${auth.user && auth.user.id === review.user.id
                                                                ? 'text-neutral-500 cursor-not-allowed bg-neutral-800/50 border border-neutral-700'
                                                                : userVotes[review.id] === 'unhelpful'
                                                                    ? 'bg-red-600/30 text-red-400 border border-red-600'
                                                                    : 'text-neutral-400 hover:text-red-400 hover:bg-red-600/10 border border-transparent hover:border-red-600/30'
                                                                }`}
                                                        >
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V9a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            {reviewVoteCounts[review.id]?.unhelpful || review.unhelpful_votes_count} Desacuerdo{(reviewVoteCounts[review.id]?.helpful || review.helpful_votes_count) !== 1 ? 's' : ''}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-neutral-400">Aún no hay reseñas para este lugar.</p>
                                    {!auth.user && (
                                        <p className="text-neutral-400 mt-2">
                                            <Link href={login()} className="text-green-500 hover:underline">
                                                Inicia sesión
                                            </Link>
                                            {' '}para ser el primero en comentar
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

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
            </div >
        </div >
    );
}
