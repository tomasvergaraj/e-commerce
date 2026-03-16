import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import { ordersApi } from '@/api/services';
import {
  cn,
  formatDateTime,
  formatPrice,
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  resolveAssetUrl,
} from '@/lib/utils';
import { PageLoader } from '@/components/common/Loading';

const ORDER_STEPS = [
  { status: 'PENDING', label: 'Recibido' },
  { status: 'CONFIRMED', label: 'Confirmado' },
  { status: 'PREPARING', label: 'Preparacion' },
  { status: 'SHIPPED', label: 'Despacho' },
  { status: 'DELIVERED', label: 'Entrega' },
];

function getCurrentStepIndex(status: string) {
  return ORDER_STEPS.findIndex((step) => step.status === status);
}

function getHistoryTone(status: string) {
  const tones: Record<string, string> = {
    PENDING: 'border-primary-100 bg-primary-50/70 dark:border-primary-900/60 dark:bg-primary-950/30',
    CONFIRMED: 'border-sky-100 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/30',
    PREPARING: 'border-cyan-100 bg-cyan-50/70 dark:border-cyan-900/60 dark:bg-cyan-950/30',
    SHIPPED: 'border-indigo-100 bg-indigo-50/70 dark:border-indigo-900/60 dark:bg-indigo-950/30',
    DELIVERED: 'border-emerald-100 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30',
    CANCELLED: 'border-red-100 bg-red-50/70 dark:border-red-900/60 dark:bg-red-950/30',
    REFUNDED: 'border-amber-100 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30',
  };

  return tones[status] || 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900';
}

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => ordersApi.myOrderDetail(orderNumber!),
    enabled: !!orderNumber,
  });

  const order = (data as any)?.data || data;

  if (isLoading) return <PageLoader />;
  if (!order) return <div className="py-10 text-center text-gray-500">Pedido no encontrado</div>;

  const items = Array.isArray(order.items) ? order.items : [];
  const statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
  const stepIndex = getCurrentStepIndex(order.status);
  const showLinearProgress = !['CANCELLED', 'REFUNDED'].includes(order.status);

  return (
    <div>
      <Link to="/cuenta/pedidos" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500">
        <ChevronLeft size={16} /> Volver a pedidos
      </Link>

      <section className="relative overflow-hidden rounded-[30px] border border-gray-200/80 bg-white px-6 py-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_34%),linear-gradient(125deg,rgba(6,182,212,0.06),transparent_46%,rgba(14,165,233,0.04)_74%,transparent_100%)]" />

        <div className="relative">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl rounded-[26px] border border-white/80 bg-white/80 px-5 py-5 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/45">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600 dark:text-primary-400">
                Compra #{order.orderNumber}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">Resumen y seguimiento del pedido</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                Revisa el estado de tu compra, los productos incluidos, la direccion de entrega y cada actualizacion del proceso.
              </p>
            </div>

            <span className={`badge px-3 py-1.5 text-sm ${getOrderStatusColor(order.status)}`}>
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                <Package size={14} className="text-primary-500" />
                Estado
              </div>
              <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{getOrderStatusLabel(order.status)}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{items.length} producto{items.length !== 1 ? 's' : ''} en esta compra.</p>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                <CreditCard size={14} className="text-primary-500" />
                Pago
              </div>
              <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{getPaymentStatusLabel(order.paymentStatus)}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Total confirmado: {formatPrice(order.total)}</p>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                <Clock3 size={14} className="text-primary-500" />
                Fecha
              </div>
              <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{formatDateTime(order.createdAt)}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Compra registrada en tu historial.</p>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                <Truck size={14} className="text-primary-500" />
                Seguimiento
              </div>
              <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                {order.trackingCode ? order.trackingCode : 'Pendiente'}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {order.trackingCode ? 'Codigo de seguimiento disponible.' : 'Se mostrara cuando el pedido salga a despacho.'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            {showLinearProgress ? (
              <div className="rounded-[24px] border border-gray-200/80 bg-white/80 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="grid gap-3 md:grid-cols-5">
                  {ORDER_STEPS.map((step, index) => {
                    const completed = stepIndex >= index;
                    const current = step.status === order.status;

                    return (
                      <div key={step.status} className="flex items-center gap-3 md:flex-col md:items-start">
                        <span
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                            completed
                              ? 'border-primary-500 bg-primary-500 text-white'
                              : 'border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900',
                          )}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className={cn('text-sm font-semibold', current ? 'text-primary-600 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200')}>
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {completed ? 'Etapa alcanzada' : 'Pendiente'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/50">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {order.status === 'CANCELLED' ? 'Este pedido fue cancelado.' : 'Esta compra fue reembolsada.'}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Revisa el historial inferior para ver el detalle de las actualizaciones registradas.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200/80 px-5 py-4 dark:border-gray-800">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Productos de la compra</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Revisa cantidades, precios y accesos directos a cada producto.
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((item: any) => (
                <div key={item.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                    <img src={resolveAssetUrl(item.product?.images?.[0]?.url) || 'https://placehold.co/100x100'} alt="" className="h-full w-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{item.productName}</p>
                    {item.variantName && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.variantName}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
                        SKU: {item.sku}
                      </span>
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
                        Cantidad: {item.quantity}
                      </span>
                    </div>

                    {order.status === 'DELIVERED' && item.product?.slug && (
                      <Link
                        to={`/productos/${item.product.slug}#reviews`}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-500 hover:underline"
                      >
                        <Star size={12} />
                        Escribir reseña
                      </Link>
                    )}
                  </div>

                  <div className="shrink-0 rounded-2xl bg-gray-50 px-4 py-3 text-right dark:bg-gray-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                      Precio
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{formatPrice(item.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-[28px] border border-gray-200/80 bg-white px-5 py-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <MapPin size={18} className="text-primary-500" />
                Direccion de envio
              </div>
              <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                {order.shippingStreet} {order.shippingNumber}
                {order.shippingApartment ? `, ${order.shippingApartment}` : ''}
                <br />
                {order.shippingCommune}, {order.shippingCity}
              </p>
            </section>

            <section className="rounded-[28px] border border-gray-200/80 bg-white px-5 py-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Truck size={18} className="text-primary-500" />
                Estado de despacho
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                {order.trackingCode
                  ? `Seguimiento disponible con codigo ${order.trackingCode}.`
                  : 'Tu codigo de seguimiento se mostrara aqui cuando el pedido este listo para despacho.'}
              </p>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Estado actual: {getOrderStatusLabel(order.status)}
              </p>
            </section>
          </div>

          {statusHistory.length > 0 && (
            <section className="rounded-[28px] border border-gray-200/80 bg-white px-5 py-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5">
                <h3 className="font-semibold text-gray-900 dark:text-white">Historial del pedido</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Cada cambio de estado registrado en tu compra.
                </p>
              </div>

              <div className="space-y-4">
                {statusHistory.map((historyItem: any, index: number) => (
                  <div key={historyItem.id} className="relative pl-8">
                    {index !== statusHistory.length - 1 && (
                      <span className="absolute left-[5px] top-6 h-[calc(100%+0.5rem)] w-px bg-gray-200 dark:bg-gray-800" />
                    )}
                    <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-primary-500 ring-4 ring-primary-500/10" />

                    <div className={cn('rounded-2xl border px-4 py-4', getHistoryTone(historyItem.status))}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {getOrderStatusLabel(historyItem.status)}
                          </p>
                          {historyItem.note && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{historyItem.note}</p>
                          )}
                        </div>
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                          {formatDateTime(historyItem.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-gray-200/80 bg-white px-5 py-5 shadow-sm xl:sticky xl:top-24 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <CreditCard size={18} className="text-primary-500" />
              Resumen de pago
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                  <span>Descuento</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span>Envio</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-3 dark:border-gray-700">
                <div className="flex items-center justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-primary-200/80 bg-gray-950 px-5 py-5 text-white shadow-sm dark:border-primary-900/60">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={18} className="text-primary-300" />
              Tu compra sigue protegida
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              Guarda este detalle para consultar seguimiento, productos comprados y estados del pedido siempre que lo necesites.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-200">
              Pedido #{order.orderNumber}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
