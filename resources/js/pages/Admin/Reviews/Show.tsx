import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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
       approved_at: string | null;
       helpful_votes_count: number;
       unhelpful_votes_count: number;
       user: User;
       approver: User | null;
}

interface Rating {
       id: number;
       rating: number;
       created_at: string;
       user: User;
}

interface Place {
       id: number;
       title: string;
       slug: string;
       description: string;
       thumbnail: string | null;
       active_images: Array<{
              id: number;
              image_path: string;
              title: string | null;
              is_main: boolean;
       }>;
}

interface RatingStats {
       average_rating: number;
       total_ratings: number;
       rating_distribution: Record<string, number>;
}

interface ReviewStats {
       total_reviews: number;
       approved_reviews: number;
       pending_reviews: number;
       helpful_votes_total: number;
       unhelpful_votes_total: number;
}

interface Props {
       place: Place;
       reviews: Review[];
       ratings: Rating[];
       ratingStats: RatingStats;
       reviewStats: ReviewStats;
}

export default function Show({ place, reviews, ratings, ratingStats, reviewStats }: Props) {
       const { patch, processing } = useForm();

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

       const breadcrumbs: BreadcrumbItem[] = [
              {
                     title: 'Dashboard',
                     href: '/dashboard',
              },
              {
                     title: 'Reseñas y Calificaciones',
                     href: '/admin/reviews',
              },
              {
                     title: place.title,
                     href: `/admin/reviews/${place.id}`,
              },
       ];

       return (
              <AppLayout breadcrumbs={breadcrumbs}>
                     <Head title={`Reseñas: ${place.title}`} />

                     <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                   <div>
                                          <h1 className="text-2xl font-semibold text-gray-900">
                                                 Reseñas y Calificaciones: {place.title}
                                          </h1>
                                          <Link
                                                 href="/admin/reviews"
                                                 className="text-sm text-blue-600 hover:underline"
                                          >
                                                 ← Volver a todas las reseñas
                                          </Link>
                                   </div>
                                   <Link
                                          href={`/places/${place.slug}`}
                                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                          target="_blank"
                                   >
                                          Ver Lugar Público
                                   </Link>
                            </div>

                            <div className="space-y-6">
                                   {/* Place Info */}
                                   <div className="relative p-6 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                                          <div className="flex flex-col md:flex-row gap-6">
                                                 {place.thumbnail && (
                                                        <div className="md:w-48 h-32 md:h-48">
                                                               <img
                                                                      src={`/storage/${place.thumbnail}`}
                                                                      alt={place.title}
                                                                      className="w-full h-full object-cover rounded-lg"
                                                               />
                                                        </div>
                                                 )}
                                                 <div className="flex-1">
                                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{place.title}</h3>
                                                        <p className="text-gray-600 mb-4">{place.description}</p>
                                                        <div className="flex items-center space-x-6">
                                                               <div className="text-center">
                                                                      <div className="text-2xl font-bold text-yellow-600">{ratingStats.average_rating ? ratingStats.average_rating.toFixed(1) : '0.0'}</div>
                                                                      <div className="text-sm text-gray-500">Rating Promedio</div>
                                                               </div>
                                                               <div className="text-center">
                                                                      <div className="text-2xl font-bold text-blue-600">{ratingStats.total_ratings}</div>
                                                                      <div className="text-sm text-gray-500">Calificaciones</div>
                                                               </div>
                                                               <div className="text-center">
                                                                      <div className="text-2xl font-bold text-green-600">{reviewStats.approved_reviews}</div>
                                                                      <div className="text-sm text-gray-500">Reseñas Aprobadas</div>
                                                               </div>
                                                               <div className="text-center">
                                                                      <div className="text-2xl font-bold text-orange-600">{reviewStats.pending_reviews}</div>
                                                                      <div className="text-sm text-gray-500">Reseñas Pendientes</div>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                          {/* Rating Statistics */}
                                          <div className="relative p-6 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                                                 <h4 className="text-lg font-semibold mb-4">Distribución de Calificaciones</h4>
                                                 <div className="space-y-3 mb-6">
                                                        {Object.entries(ratingStats.rating_distribution).reverse().map(([rating, count]) => (
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
                                                                                           style={{ width: `${ratingStats.total_ratings > 0 ? (count / ratingStats.total_ratings) * 100 : 0}%` }}
                                                                                    ></div>
                                                                             </div>
                                                                      </div>
                                                                      <div className="text-sm text-gray-600 w-16 text-right">
                                                                             {count} ({ratingStats.total_ratings > 0 ? ((count / ratingStats.total_ratings) * 100).toFixed(1) : 0}%)
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </div>

                                                 <h5 className="text-md font-medium mb-3">Calificaciones Recientes</h5>
                                                 <div className="space-y-2 max-h-64 overflow-y-auto">
                                                        {ratings.slice(0, 10).map((rating) => (
                                                               <div key={rating.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                                      <div className="flex items-center">
                                                                             {rating.user.avatar ? (
                                                                                    <img
                                                                                           src={`/storage/${rating.user.avatar}`}
                                                                                           alt={rating.user.name}
                                                                                           className="w-8 h-8 rounded-full mr-2"
                                                                                           onError={(e) => {
                                                                                                  (e.target as HTMLImageElement).style.display = 'none';
                                                                                           }}
                                                                                    />
                                                                             ) : (
                                                                                    <div className="w-8 h-8 rounded-full mr-2 bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                                                                                           {rating.user.name.charAt(0).toUpperCase()}
                                                                                    </div>
                                                                             )}
                                                                             <div>
                                                                                    <div className="text-sm font-medium">{rating.user.name}</div>
                                                                                    <div className="text-xs text-gray-500">
                                                                                           {new Date(rating.created_at).toLocaleDateString('es-ES')}
                                                                                    </div>
                                                                             </div>
                                                                      </div>
                                                                      <div className="flex items-center">
                                                                             {[...Array(5)].map((_, i) => (
                                                                                    <svg
                                                                                           key={i}
                                                                                           className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                                                           fill="currentColor"
                                                                                           viewBox="0 0 20 20"
                                                                                    >
                                                                                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                                    </svg>
                                                                             ))}
                                                                             <span className="ml-1 text-sm font-medium">{rating.rating}</span>
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </div>
                                          </div>

                                          {/* Review Statistics */}
                                          <div className="relative p-6 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                                                 <h4 className="text-lg font-semibold mb-4">Estadísticas de Reseñas</h4>
                                                 <div className="grid grid-cols-2 gap-4 mb-6">
                                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                               <div className="text-2xl font-bold text-green-600">{reviewStats.approved_reviews}</div>
                                                               <div className="text-sm text-gray-500">Aprobadas</div>
                                                        </div>
                                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                               <div className="text-2xl font-bold text-yellow-600">{reviewStats.pending_reviews}</div>
                                                               <div className="text-sm text-gray-500">Pendientes</div>
                                                        </div>
                                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                               <div className="text-2xl font-bold text-blue-600">{reviewStats.helpful_votes_total}</div>
                                                               <div className="text-sm text-gray-500">Votos Útiles</div>
                                                        </div>
                                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                               <div className="text-2xl font-bold text-red-600">{reviewStats.unhelpful_votes_total}</div>
                                                               <div className="text-sm text-gray-500">Votos Inútiles</div>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Reviews List */}
                                   <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white">
                                          <div className="px-6 py-4 border-b border-gray-200">
                                                 <h4 className="text-lg font-semibold">Todas las Reseñas ({reviews.length})</h4>
                                          </div>
                                          <div className="divide-y divide-gray-200">
                                                 {reviews.map((review) => (
                                                        <div key={review.id} className="p-6">
                                                               <div className="flex items-start justify-between">
                                                                      <div className="flex-1">
                                                                             <div className="flex items-center mb-2">
                                                                                    {review.user.avatar ? (
                                                                                           <img
                                                                                                  src={`/storage/${review.user.avatar}`}
                                                                                                  alt={review.user.name}
                                                                                                  className="w-10 h-10 rounded-full mr-3"
                                                                                                  onError={(e) => {
                                                                                                         (e.target as HTMLImageElement).style.display = 'none';
                                                                                                  }}
                                                                                           />
                                                                                    ) : (
                                                                                           <div className="w-10 h-10 rounded-full mr-3 bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                                                                                                  {review.user.name.charAt(0).toUpperCase()}
                                                                                           </div>
                                                                                    )}
                                                                                    <div>
                                                                                           <h5 className="text-sm font-medium text-gray-900">{review.user.name}</h5>
                                                                                           <p className="text-sm text-gray-500">{review.user.email}</p>
                                                                                    </div>
                                                                             </div>

                                                                             {review.title && (
                                                                                    <h6 className="font-medium text-gray-900 mb-2">{review.title}</h6>
                                                                             )}

                                                                             <p className="text-gray-700 mb-3">{review.content}</p>

                                                                             <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                                                    <span>{new Date(review.created_at).toLocaleDateString('es-ES')}</span>
                                                                                    <span className="flex items-center">
                                                                                           👍 {review.helpful_votes_count} útiles
                                                                                    </span>
                                                                                    <span className="flex items-center">
                                                                                           👎 {review.unhelpful_votes_count} inútiles
                                                                                    </span>
                                                                                    {review.approved_at && (
                                                                                           <span className="text-green-600">
                                                                                                  Aprobada el {new Date(review.approved_at).toLocaleDateString('es-ES')}
                                                                                           </span>
                                                                                    )}
                                                                             </div>
                                                                      </div>

                                                                      <div className="ml-4 flex flex-col items-end space-y-2">
                                                                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${review.is_approved
                                                                                    ? 'bg-green-100 text-green-800'
                                                                                    : 'bg-yellow-100 text-yellow-800'
                                                                                    }`}>
                                                                                    {review.is_approved ? 'Aprobada' : 'Pendiente'}
                                                                             </span>

                                                                             <div className="flex space-x-2">
                                                                                    {!review.is_approved ? (
                                                                                           <button
                                                                                                  onClick={() => handleApprove(review.id)}
                                                                                                  disabled={processing}
                                                                                                  className="text-green-600 hover:text-green-900 text-sm font-medium"
                                                                                           >
                                                                                                  Aprobar
                                                                                           </button>
                                                                                    ) : (
                                                                                           <button
                                                                                                  onClick={() => handleDisapprove(review.id)}
                                                                                                  disabled={processing}
                                                                                                  className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                                                                                           >
                                                                                                  Desaprobar
                                                                                           </button>
                                                                                    )}
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 ))}

                                                 {reviews.length === 0 && (
                                                        <div className="p-6 text-center text-gray-500">
                                                               No hay reseñas para este lugar todavía.
                                                        </div>
                                                 )}
                                          </div>
                                   </div>
                            </div>
                     </div>
              </AppLayout>
       );
}