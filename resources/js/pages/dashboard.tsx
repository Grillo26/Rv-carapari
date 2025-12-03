import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Place {
    id: number;
    title: string;
    avg_rating: number;
    rating_count: number;
}

interface Review {
    id: number;
    title: string | null;
    content: string;
    is_approved: boolean;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    place: {
        id: number;
        title: string;
    };
}

interface OverallStats {
    total_places: number;
    total_reviews: number;
    pending_reviews: number;
    total_ratings: number;
    average_rating: number;
}

interface Props {
    overallStats?: OverallStats;
    topRatedPlaces?: Place[];
    recentReviews?: Review[];
    ratingDistribution?: Record<string, number>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({
    overallStats = { total_places: 0, total_reviews: 0, pending_reviews: 0, total_ratings: 0, average_rating: 0 },
    topRatedPlaces = [],
    recentReviews = [],
    ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative p-6 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                        <div className="text-3xl font-bold text-blue-600">{overallStats.total_places}</div>
                        <div className="text-gray-600">Lugares Totales</div>
                    </div>
                    <div className="relative p-6 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                        <div className="text-3xl font-bold text-green-600">{overallStats.total_reviews}</div>
                        <div className="text-gray-600">Reseñas Totales</div>
                    </div>
                    <div className="relative p-6 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                        <div className="text-3xl font-bold text-orange-600">{overallStats.pending_reviews}</div>
                        <div className="text-gray-600">Reseñas Pendientes</div>
                    </div>
                    <div className="relative p-6 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                        <div className="text-3xl font-bold text-purple-600">{overallStats.total_ratings}</div>
                        <div className="text-gray-600">Calificaciones</div>
                    </div>
                    <div className="relative p-6 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                        <div className="text-3xl font-bold text-yellow-600">{overallStats.average_rating}</div>
                        <div className="text-gray-600">Rating Promedio</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Top Rated Places */}
                    <div className="relative p-6 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                        <h3 className="text-lg font-semibold mb-4">Lugares Mejor Calificados</h3>
                        <div className="space-y-4">
                            {topRatedPlaces.length > 0 ? (
                                topRatedPlaces.map((place) => (
                                    <div key={place.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <Link
                                                href={`/admin/reviews?place_id=${place.id}`}
                                                className="font-medium text-blue-600 hover:underline"
                                            >
                                                {place.title}
                                            </Link>
                                            <div className="text-sm text-gray-600">
                                                {place.rating_count || 0} calificaciones
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-5 h-5 ${i < Math.floor((place.avg_rating || 0)) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="ml-2 text-sm font-medium">
                                                {place.avg_rating && typeof place.avg_rating === 'number' ? place.avg_rating.toFixed(1) : '0.0'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No hay lugares con calificaciones aún.</p>
                                    <Link href="/admin/places" className="text-blue-600 hover:underline mt-2 inline-block">
                                        Gestionar Lugares
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="relative p-6 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                        <h3 className="text-lg font-semibold mb-4">Distribución de Calificaciones</h3>
                        <div className="space-y-3">
                            {Object.entries(ratingDistribution).reverse().map(([rating, count]) => (
                                <div key={rating} className="flex items-center">
                                    <div className="flex items-center w-16">
                                        <span className="text-sm font-medium">{rating}</span>
                                        <svg className="w-4 h-4 ml-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 mx-3">
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-400 h-2 rounded-full"
                                                style={{ width: `${(count / Math.max(...Object.values(ratingDistribution))) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 w-12 text-right">{count}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Reviews */}
                <div className="relative p-6 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Reseñas Recientes</h3>
                        <Link
                            href="/admin/reviews"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                        >
                            Ver Todas las Reseñas
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Usuario</th>
                                    <th className="text-left py-2">Lugar</th>
                                    <th className="text-left py-2">Contenido</th>
                                    <th className="text-left py-2">Estado</th>
                                    <th className="text-left py-2">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentReviews.map((review) => (
                                    <tr key={review.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3">
                                            <div className="font-medium">{review.user.name}</div>
                                        </td>
                                        <td className="py-3">
                                            <Link
                                                href={`/admin/reviews?place_id=${review.place.id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {review.place.title}
                                            </Link>
                                        </td>
                                        <td className="py-3 max-w-xs">
                                            {review.title && (
                                                <div className="font-medium text-sm">{review.title}</div>
                                            )}
                                            <div className="text-gray-600 text-sm truncate">
                                                {review.content.substring(0, 100)}
                                                {review.content.length > 100 ? '...' : ''}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${review.is_approved
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {review.is_approved ? 'Aprobada' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-sm text-gray-600">
                                            {new Date(review.created_at).toLocaleDateString('es-ES')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
