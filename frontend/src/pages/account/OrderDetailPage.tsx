import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Star } from 'lucide-react';
import { ordersApi } from '@/api/services';
import { formatPrice, formatDateTime, getOrderStatusLabel, getOrderStatusColor, getPaymentStatusLabel } from '@/lib/utils';
import { PageLoader } from '@/components/common/Loading';

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => ordersApi.myOrderDetail(orderNumber!),
    enabled: !!orderNumber,
  });

  const order = (data as any)?.data || data;

  if (isLoading) return <PageLoader />;
  if (!order) return <div className="text-center py-10 text-gray-500">Pedido no encontrado</div>;

  return (
    <div>
      <Link to="/cuenta/pedidos" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-4">
        <ChevronLeft size={16} /> Volver a pedidos
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Pedido #{order.orderNumber}</h2>
        <span className={`badge ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-2">Estado</h3>
          <p className="text-sm">Pedido: <span className="font-medium">{getOrderStatusLabel(order.status)}</span></p>
          <p className="text-sm">Pago: <span className="font-medium">{getPaymentStatusLabel(order.paymentStatus)}</span></p>
          {order.trackingCode && <p className="text-sm mt-1">Tracking: <span className="font-mono">{order.trackingCode}</span></p>}
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-2">Dirección de envío</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {order.shippingStreet} {order.shippingNumber} {order.shippingApartment && `, ${order.shippingApartment}`}
            <br />{order.shippingCommune}, {order.shippingCity}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="card overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold">Productos</h3>
        </div>
        {order.items.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <img src={item.product?.images?.[0]?.url || 'https://placehold.co/100x100'} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{item.productName}</p>
              {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
              <p className="text-xs text-gray-500">SKU: {item.sku}</p>
              {order.status === 'DELIVERED' && item.product?.slug && (
                <Link
                  to={`/productos/${item.product.slug}#reviews`}
                  className="inline-flex items-center gap-1 text-xs text-primary-500 hover:underline mt-2"
                >
                  <Star size={12} />
                  Escribir reseña
                </Link>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm">{formatPrice(item.price)} x {item.quantity}</p>
              <p className="font-semibold">{formatPrice(item.total)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="card p-4 max-w-sm ml-auto">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Descuento</span><span className="text-green-600">-{formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-gray-500">Envío</span><span>{formatPrice(order.shippingCost)}</span></div>
          <hr className="border-gray-200 dark:border-gray-700" />
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
      </div>

      {/* Timeline */}
      {order.statusHistory?.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Historial</h3>
          <div className="space-y-3">
            {order.statusHistory.map((h: any) => (
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
      )}
    </div>
  );
}
