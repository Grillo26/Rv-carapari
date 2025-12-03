import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface User {
       id: number;
       name: string;
       email: string;
}

interface Place {
       id: number;
       title: string;
}

interface Review {
       id: number;
       title: string | null;
       content: string;
       is_approved: boolean;
       created_at: string;
       updated_at: string;
       approved_at: string | null;
       helpful_votes_count: number;
       unhelpful_votes_count: number;
       user: User;
       place: Place;
       approver: User | null;
}

interface Stats {
       total_reviews: number;
       pending_reviews: number;
       approved_reviews: number;
       total_ratings: number;
       average_rating: number;
}

interface Filters {
       status?: string;
       place_id?: number;
       search?: string;
}

interface Props {
       reviews: {
              data: Review[];
              current_page: number;
              last_page: number;
              per_page: number;
              total: number;
              links: any[];
       };
       stats: Stats;
       places: Array<{ id: number; title: string }>;
       filters: Filters;
}

export default function Index({ reviews, stats, places, filters }: Props) {
       const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
       const [searchTerm, setSearchTerm] = useState(filters.search || '');
       const [statusFilter, setStatusFilter] = useState(filters.status || '');
       const [placeFilter, setPlaceFilter] = useState(filters.place_id || '');

       const { patch, processing } = useForm();

       const breadcrumbs: BreadcrumbItem[] = [
              {
                     title: 'Dashboard',
                     href: '/dashboard',
              },
              {
                     title: 'Reseñas y Calificaciones',
                     href: '/admin/reviews',
              },
       ];

       const handleApprove = (reviewId: number) => {
              patch(`/admin/reviews/${reviewId}/approve`, {
                     preserveScroll: true,
              });
       };

       const handleDisapprove = (reviewId: number) => {
              patch(`/admin/reviews/${reviewId}/disapprove`, {
                     preserveScroll: true,
              });
       };

       const handleDelete = (reviewId: number) => {
              if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
                     router.delete(`/admin/reviews/${reviewId}`, {
                            preserveScroll: true,
                     });
              }
       };

       const applyFilters = () => {
              router.get('/admin/reviews', {
                     status: statusFilter,
                     place_id: placeFilter,
                     search: searchTerm,
              }, {
                     preserveState: true,
              });
       };

       const clearFilters = () => {
              setSearchTerm('');
              setStatusFilter('');
              setPlaceFilter('');
              router.get('/admin/reviews');
       };

       return (
              <AppLayout breadcrumbs={breadcrumbs}>
                     <Head title="Gestión de Reseñas" />

                     <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                            {/* Header with action button */}
                            <div className="flex justify-between items-center mb-4">
                                   <h1 className="text-2xl font-semibold text-gray-900">Gestión de Reseñas</h1>
                                   <Link
                                          href="/dashboard"
                                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                   >
                                          Ver Dashboard
                                   </Link>
                            </div>

                            <div className="space-y-6">
                                   {/* Statistics */}
                                   <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                          <div className="relative p-4 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white text-center">
                                                 <div className="text-2xl font-bold text-gray-800">{stats.total_reviews}</div>
                                                 <div className="text-gray-600 text-sm">Total Reseñas</div>
                                          </div>
                                          <div className="relative p-4 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white text-center">
                                                 <div className="text-2xl font-bold text-yellow-600">{stats.pending_reviews}</div>
                                                 <div className="text-gray-600 text-sm">Pendientes</div>
                                          </div>
                                          <div className="relative p-4 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white text-center">
                                                 <div className="text-2xl font-bold text-green-600">{stats.approved_reviews}</div>
                                                 <div className="text-gray-600 text-sm">Aprobadas</div>
                                          </div>
                                          <div className="relative p-4 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white text-center">
                                                 <div className="text-2xl font-bold text-blue-600">{stats.total_ratings}</div>
                                                 <div className="text-gray-600 text-sm">Calificaciones</div>
                                          </div>
                                          <div className="relative p-4 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white text-center">
                                                 <div className="text-2xl font-bold text-purple-600">{stats.average_rating}</div>
                                                 <div className="text-gray-600 text-sm">Rating Promedio</div>
                                          </div>
                                   </div>

                                   {/* Filters */}
                                   <div className="relative p-6 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                                 <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                               Buscar
                                                        </label>
                                                        <input
                                                               type="text"
                                                               value={searchTerm}
                                                               onChange={(e) => setSearchTerm(e.target.value)}
                                                               placeholder="Buscar por contenido o usuario..."
                                                               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                 </div>
                                                 <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                               Estado
                                                        </label>
                                                        <select
                                                               value={statusFilter}
                                                               onChange={(e) => setStatusFilter(e.target.value)}
                                                               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                               <option value="">Todos</option>
                                                               <option value="pending">Pendientes</option>
                                                               <option value="approved">Aprobadas</option>
                                                        </select>
                                                 </div>
                                                 <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                               Lugar
                                                        </label>
                                                        <select
                                                               value={placeFilter}
                                                               onChange={(e) => setPlaceFilter(e.target.value)}
                                                               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                               <option value="">Todos los lugares</option>
                                                               {places.map((place) => (
                                                                      <option key={place.id} value={place.id}>
                                                                             {place.title}
                                                                      </option>
                                                               ))}
                                                        </select>
                                                 </div>
                                                 <div className="flex gap-2">
                                                        <button
                                                               onClick={applyFilters}
                                                               className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                        >
                                                               Filtrar
                                                        </button>
                                                        <button
                                                               onClick={clearFilters}
                                                               className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                                        >
                                                               Limpiar
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Reviews Table */}
                                   <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                                          <div className="overflow-x-auto">
                                                 <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                               <tr>
                                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                             Usuario
                                                                      </th>
                                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                             Lugar
                                                                      </th>
                                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                             Reseña
                                                                      </th>
                                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                             Votos
                                                                      </th>
                                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                             Estado
                                                                      </th>
                                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                             Fecha
                                                                      </th>
                                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                             Acciones
                                                                      </th>
                                                               </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                               {reviews.data.map((review) => (
                                                                      <tr key={review.id} className="hover:bg-gray-50">
                                                                             <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <div className="font-medium text-gray-900">{review.user.name}</div>
                                                                                    <div className="text-sm text-gray-500">{review.user.email}</div>
                                                                             </td>
                                                                             <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <Link
                                                                                           href={`/admin/reviews/${review.place.id}`}
                                                                                           className="text-blue-600 hover:underline font-medium"
                                                                                    >
                                                                                           {review.place.title}
                                                                                    </Link>
                                                                             </td>
                                                                             <td className="px-6 py-4">
                                                                                    <div className="max-w-xs">
                                                                                           {review.title && (
                                                                                                  <div className="font-medium text-sm text-gray-900 mb-1">
                                                                                                         {review.title}
                                                                                                  </div>
                                                                                           )}
                                                                                           <div className="text-sm text-gray-600">
                                                                                                  {review.content.length > 100
                                                                                                         ? review.content.substring(0, 100) + '...'
                                                                                                         : review.content
                                                                                                  }
                                                                                           </div>
                                                                                    </div>
                                                                             </td>
                                                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                                    <div className="flex items-center space-x-2">
                                                                                           <span className="text-green-600">👍 {review.helpful_votes_count}</span>
                                                                                           <span className="text-red-600">👎 {review.unhelpful_votes_count}</span>
                                                                                    </div>
                                                                             </td>
                                                                             <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${review.is_approved
                                                                                           ? 'bg-green-100 text-green-800'
                                                                                           : 'bg-yellow-100 text-yellow-800'
                                                                                           }`}>
                                                                                           {review.is_approved ? 'Aprobada' : 'Pendiente'}
                                                                                    </span>
                                                                             </td>
                                                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                                    {new Date(review.created_at).toLocaleDateString('es-ES')}
                                                                             </td>
                                                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                                    <div className="flex space-x-2">
                                                                                           {!review.is_approved ? (
                                                                                                  <button
                                                                                                         onClick={() => handleApprove(review.id)}
                                                                                                         disabled={processing}
                                                                                                         className="text-green-600 hover:text-green-900"
                                                                                                  >
                                                                                                         Aprobar
                                                                                                  </button>
                                                                                           ) : (
                                                                                                  <button
                                                                                                         onClick={() => handleDisapprove(review.id)}
                                                                                                         disabled={processing}
                                                                                                         className="text-yellow-600 hover:text-yellow-900"
                                                                                                  >
                                                                                                         Desaprobar
                                                                                                  </button>
                                                                                           )}
                                                                                           <button
                                                                                                  onClick={() => handleDelete(review.id)}
                                                                                                  className="text-red-600 hover:text-red-900 ml-2"
                                                                                           >
                                                                                                  Eliminar
                                                                                           </button>
                                                                                    </div>
                                                                             </td>
                                                                      </tr>
                                                               ))}
                                                        </tbody>
                                                 </table>
                                          </div>

                                          {/* Pagination */}
                                          {reviews.last_page > 1 && (
                                                 <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                                        <div className="flex-1 flex justify-between sm:hidden">
                                                               {reviews.current_page > 1 && (
                                                                      <Link
                                                                             href={`/admin/reviews?page=${reviews.current_page - 1}`}
                                                                             className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                                      >
                                                                             Anterior
                                                                      </Link>
                                                               )}
                                                               {reviews.current_page < reviews.last_page && (
                                                                      <Link
                                                                             href={`/admin/reviews?page=${reviews.current_page + 1}`}
                                                                             className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                                      >
                                                                             Siguiente
                                                                      </Link>
                                                               )}
                                                        </div>
                                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                                               <div>
                                                                      <p className="text-sm text-gray-700">
                                                                             Mostrando {((reviews.current_page - 1) * reviews.per_page) + 1} a{' '}
                                                                             {Math.min(reviews.current_page * reviews.per_page, reviews.total)} de{' '}
                                                                             {reviews.total} resultados
                                                                      </p>
                                                               </div>
                                                               <div>
                                                                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                                             {reviews.links.map((link, index) => (
                                                                                    <Link
                                                                                           key={index}
                                                                                           href={link.url || '#'}
                                                                                           className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                                                                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                                                  } ${index === 0 ? 'rounded-l-md' : ''} ${index === reviews.links.length - 1 ? 'rounded-r-md' : ''
                                                                                                  }`}
                                                                                           dangerouslySetInnerHTML={{ __html: link.label }}
                                                                                    />
                                                                             ))}
                                                                      </nav>
                                                               </div>
                                                        </div>
                                                 </div>
                                          )}
                                   </div>
                            </div>
                     </div>
              </AppLayout>
       );
}