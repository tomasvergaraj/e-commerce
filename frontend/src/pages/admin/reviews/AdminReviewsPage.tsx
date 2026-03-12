import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Star } from 'lucide-react';
import { reviewsApi } from '@/api/services';
import { formatDate } from '@/lib/utils';
import { PageLoader } from '@/components/common/Loading';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const { data: pending, isLoading: loadingP } = useQuery({ queryKey: ['pending-reviews'], queryFn: () => reviewsApi.adminGetPending() });
  const { data: all, isLoading: loadingA } = useQuery({ queryKey: ['all-reviews'], queryFn: () => reviewsApi.adminGetAll() });

  const pendingList = (pending as any)?.data || pending || [];
  const allList = (all as any)?.data || all || [];

  const approveMut = useMutation({
    mutationFn: (id: string) => reviewsApi.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pending-reviews'] }); qc.invalidateQueries({ queryKey: ['all-reviews'] }); toast.success('Aprobada'); },
  });
  const rejectMut = useMutation({
    mutationFn: (id: string) => reviewsApi.reject(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pending-reviews'] }); qc.invalidateQueries({ queryKey: ['all-reviews'] }); toast.success('Rechazada'); },
  });

  if (loadingP || loadingA) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reseñas</h1>

      {pendingList.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold mb-4 flex items-center gap-2">Pendientes de aprobación <span className="badge bg-yellow-100 text-yellow-800">{pendingList.length}</span></h2>
          <div className="space-y-3">
            {pendingList.map((review: any) => (
              <div key={review.id} className="card p-4 flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />)}</div>
                    <span className="text-sm font-medium">{review.user.firstName} {review.user.lastName}</span>
                    <span className="text-xs text-gray-500">{review.user.email}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Producto: {review.product.name}</p>
                  {review.title && <p className="font-medium text-sm">{review.title}</p>}
                  {review.comment && <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => approveMut.mutate(review.id)} className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg"><Check size={16} /></button>
                  <button onClick={() => rejectMut.mutate(review.id)} className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"><X size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-semibold mb-4">Todas las reseñas ({allList.length})</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3">Producto</th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Rating</th>
              <th className="text-left px-4 py-3">Comentario</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {allList.map((r: any) => (
              <tr key={r.id}>
                <td className="px-4 py-3">{r.product?.name}</td>
                <td className="px-4 py-3">{r.user?.firstName} {r.user?.lastName}</td>
                <td className="px-4 py-3">{r.rating}/5</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.comment || '-'}</td>
                <td className="px-4 py-3"><span className={`badge ${r.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{r.isApproved ? 'Aprobada' : 'Pendiente'}</span></td>
                <td className="px-4 py-3 text-xs text-gray-500">{formatDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
