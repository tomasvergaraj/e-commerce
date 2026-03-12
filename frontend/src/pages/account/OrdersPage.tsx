import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { ordersApi } from '@/api/services';
import { formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils';
import { PageLoader } from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';

export default function OrdersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: () => ordersApi.myOrders() });
  const result = (data as any)?.data || data || { items: [] };

  if (isLoading) return <PageLoader />;

  if (result.items.length === 0) {
    return <EmptyState icon={<Package size={48} />} title="No tienes pedidos" description="Tus compras aparecerán aquí"
      action={<Link to="/productos" className="btn-primary">Explorar productos</Link>} />;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Mis Pedidos</h2>
      <div className="space-y-4">
        {result.items.map((order: any) => (
          <Link key={order.id} to={`/cuenta/pedidos/${order.orderNumber}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-semibold text-sm">Pedido #{order.orderNumber}</p>
                <span className={`badge ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span>
              </div>
              <p className="text-sm text-gray-500">{formatDate(order.createdAt)} · {order.items.length} producto{order.items.length !== 1 ? 's' : ''}</p>
            </div>
            <p className="font-bold text-lg">{formatPrice(order.total)}</p>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
