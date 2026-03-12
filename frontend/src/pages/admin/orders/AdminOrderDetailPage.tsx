import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { ordersApi } from '@/api/services';
import { formatPrice, formatDateTime, getOrderStatusLabel, getOrderStatusColor, getPaymentStatusLabel } from '@/lib/utils';
import { PageLoader } from '@/components/common/Loading';
import toast from 'react-hot-toast';

const statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => ordersApi.adminGetById(id!),
    enabled: !!id,
  });

  const statusMut = useMutation({
    mutationFn: () => ordersApi.updateStatus(id!, { status: newStatus, note, trackingCode: trackingCode || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-order', id] }); toast.success('Estado actualizado'); setNote(''); },
    onError: (e: any) => toast.error(e.message || 'Error'),
  });

  const order = (data as any)?.data || data;
  if (isLoading) return <PageLoader />;
  if (!order) return <div>Pedido no encontrado</div>;

  return (
    <div>
      <Link to="/admin/pedidos" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-4">
        <ChevronLeft size={16} /> Volver
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pedido #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`badge text-sm ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-2">Cliente</h3>
          <p className="text-sm">{order.user?.firstName || order.guestFirstName} {order.user?.lastName || order.guestLastName}</p>
          <p className="text-sm text-gray-500">{order.user?.email || order.guestEmail}</p>
          {(order.guestPhone || order.user?.phone) && <p className="text-sm text-gray-500">{order.guestPhone || order.user?.phone}</p>}
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-2">Envío</h3>
          <p className="text-sm">{order.shippingMethod?.name}</p>
          <p className="text-sm text-gray-500">{order.shippingStreet} {order.shippingNumber}, {order.shippingCommune}, {order.shippingCity}</p>
          {order.trackingCode && <p className="text-sm mt-1">Tracking: <span className="font-mono">{order.trackingCode}</span></p>}
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-2">Pago</h3>
          <p className="text-sm">Estado: {getPaymentStatusLabel(order.paymentStatus)}</p>
          <p className="text-sm">Método: {order.payment?.method}</p>
          {order.payment?.transactionId && <p className="text-xs text-gray-500 font-mono mt-1">{order.payment.transactionId}</p>}
        </div>
      </div>

      {/* Items */}
      <div className="card overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3">Producto</th>
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-right px-4 py-3">Precio</th>
              <th className="text-right px-4 py-3">Cant.</th>
              <th className="text-right px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {order.items.map((item: any) => (
              <tr key={item.id}>
                <td className="px-4 py-3"><p className="font-medium">{item.productName}</p>{item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}</td>
                <td className="px-4 py-3 text-xs font-mono">{item.sku}</td>
                <td className="px-4 py-3 text-right">{formatPrice(item.price)}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatPrice(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-200 dark:border-gray-700">
            <tr><td colSpan={4} className="px-4 py-2 text-right text-gray-500">Subtotal</td><td className="px-4 py-2 text-right">{formatPrice(order.subtotal)}</td></tr>
            {order.discount > 0 && <tr><td colSpan={4} className="px-4 py-2 text-right text-gray-500">Descuento</td><td className="px-4 py-2 text-right text-green-600">-{formatPrice(order.discount)}</td></tr>}
            <tr><td colSpan={4} className="px-4 py-2 text-right text-gray-500">Envío</td><td className="px-4 py-2 text-right">{formatPrice(order.shippingCost)}</td></tr>
            <tr><td colSpan={4} className="px-4 py-2 text-right font-bold text-base">Total</td><td className="px-4 py-2 text-right font-bold text-base">{formatPrice(order.total)}</td></tr>
          </tfoot>
        </table>
      </div>

      {/* Update status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Actualizar estado</h3>
          <div className="space-y-3">
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field">
              <option value="">Seleccionar nuevo estado</option>
              {statuses.map((s) => <option key={s} value={s}>{getOrderStatusLabel(s)}</option>)}
            </select>
            <input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} placeholder="Código de seguimiento (opcional)" className="input-field" />
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota (opcional)" className="input-field" />
            <button onClick={() => statusMut.mutate()} disabled={!newStatus || statusMut.isPending} className="btn-primary">
              Actualizar
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Historial</h3>
          <div className="space-y-3">
            {order.statusHistory?.map((h: any) => (
              <div key={h.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 shrink-0" />
                <div>
                  <p className="font-medium">{getOrderStatusLabel(h.status)}</p>
                  {h.note && <p className="text-gray-500 text-xs">{h.note}</p>}
                  <p className="text-gray-400 text-xs">{formatDateTime(h.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
