import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, Package, ShoppingBag, Truck, Wallet } from 'lucide-react';
import { ordersApi } from '@/api/services';
import { formatDate, formatPrice, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils';
import { PageLoader } from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

const ORDER_PROGRESS: Record<string, { label: string; value: number; barClassName: string }> = {
  PENDING: {
    label: 'Pedido recibido',
    value: 18,
    barClassName: 'bg-gradient-to-r from-primary-500 to-sky-400',
  },
  CONFIRMED: {
    label: 'Pago confirmado',
    value: 34,
    barClassName: 'bg-gradient-to-r from-primary-500 to-sky-400',
  },
  PREPARING: {
    label: 'Preparando compra',
    value: 58,
    barClassName: 'bg-gradient-to-r from-primary-500 via-sky-400 to-cyan-300',
  },
  SHIPPED: {
    label: 'En camino',
    value: 82,
    barClassName: 'bg-gradient-to-r from-primary-500 via-sky-400 to-emerald-400',
  },
  DELIVERED: {
    label: 'Entrega completada',
    value: 100,
    barClassName: 'bg-gradient-to-r from-primary-500 via-sky-400 to-emerald-400',
  },
  CANCELLED: {
    label: 'Pedido cancelado',
    value: 100,
    barClassName: 'bg-gradient-to-r from-red-500 to-rose-400',
  },
  REFUNDED: {
    label: 'Compra reembolsada',
    value: 100,
    barClassName: 'bg-gradient-to-r from-amber-500 to-orange-400',
  },
};

function getOrderProgress(status: string) {
  return ORDER_PROGRESS[status] || ORDER_PROGRESS.PENDING;
}

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.myOrders(),
  });
  const result = (data as any)?.data || data || { items: [] };
  const orders = Array.isArray(result.items) ? result.items : [];
  const deliveredCount = orders.filter((order: any) => order.status === 'DELIVERED').length;
  const inProgressCount = orders.filter((order: any) => ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED'].includes(order.status)).length;
  const totalSpent = orders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);

  if (isLoading) return <PageLoader />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package size={48} />}
        title="No tienes pedidos"
        description="Tus compras apareceran aqui"
        action={<Link to="/productos" className="btn-primary">Explorar productos</Link>}
      />
    );
  }

  return (
    <div>
      <section className="relative overflow-hidden rounded-[30px] border border-gray-200/80 bg-white px-6 py-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_34%),linear-gradient(125deg,rgba(6,182,212,0.06),transparent_46%,rgba(14,165,233,0.04)_74%,transparent_100%)]" />

        <div className="relative">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl rounded-[26px] border border-white/80 bg-white/80 px-5 py-5 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/45">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600 dark:text-primary-400">
                Historial de compras
              </p>
              <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                Revisa tus pedidos y su avance en un solo lugar
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                Consulta el estado de cada compra, vuelve a revisar sus productos y entra al detalle cuando necesites
                seguimiento, direccion o resumen de pago.
              </p>
            </div>

            <Link
              to="/productos"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-100 dark:border-primary-900/70 dark:bg-primary-950/40 dark:text-primary-300"
            >
              <ShoppingBag size={16} />
              Seguir comprando
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                <Package size={14} className="text-primary-500" />
                Pedidos
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Compras registradas en tu cuenta.</p>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                <Truck size={14} className="text-primary-500" />
                En curso
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{inProgressCount}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Pedidos que aun se estan procesando o despachando.</p>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                <Wallet size={14} className="text-primary-500" />
                Total comprado
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalSpent)}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {deliveredCount} pedido{deliveredCount !== 1 ? 's entregados' : ' entregado'} hasta ahora.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 space-y-4">
        {orders.map((order: any) => {
          const progress = getOrderProgress(order.status);
          const itemCount = Array.isArray(order.items) ? order.items.length : 0;
          const featuredItems = (order.items || [])
            .map((item: any) => item.productName || item.product?.name)
            .filter(Boolean)
            .slice(0, 2);

          return (
            <Link
              key={order.id}
              to={`/cuenta/pedidos/${order.orderNumber}`}
              className="group block overflow-hidden rounded-[28px] border border-gray-200/80 bg-white px-5 py-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-900/60"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:bg-primary-950/50 dark:text-primary-300">
                      Pedido #{order.orderNumber}
                    </span>
                    <span className={`badge ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span>
                  </div>

                  <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                    Compra realizada el {formatDate(order.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {featuredItems.length > 0
                      ? `Incluye ${featuredItems.join(' y ')}${itemCount > 2 ? ` y ${itemCount - 2} mas` : ''}.`
                      : `${itemCount} producto${itemCount !== 1 ? 's' : ''} en esta compra.`}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
                      <CalendarDays size={13} className="text-primary-500" />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
                      <Package size={13} className="text-primary-500" />
                      {itemCount} producto{itemCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Total pagado
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors group-hover:text-primary-500 dark:text-primary-300">
                    Ver detalle
                    <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                  <span>Estado del pedido</span>
                  <span>{progress.label}</span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={cn('h-full rounded-full transition-[width] duration-500', progress.barClassName)}
                    style={{ width: `${progress.value}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
