import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, Clock } from 'lucide-react';
import { ordersApi, productsApi } from '@/api/services';
import { formatPrice, formatDateTime, getOrderStatusLabel, getOrderStatusColor, resolveAssetUrl } from '@/lib/utils';
import { PageLoader } from '@/components/common/Loading';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: () => ordersApi.getStats() });
  const { data: lowStock } = useQuery({ queryKey: ['low-stock'], queryFn: () => productsApi.getLowStock() });

  const s = (stats as any)?.data || stats;
  const lowStockItems = (lowStock as any)?.data || lowStock || [];

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: DollarSign, label: 'Ventas del mes', value: formatPrice(s?.monthRevenue || 0), color: 'text-green-500 bg-green-50 dark:bg-green-950' },
          { icon: ShoppingBag, label: 'Total pedidos', value: s?.totalOrders || 0, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
          { icon: Clock, label: 'Pedidos pendientes', value: s?.pendingOrders || 0, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950' },
          { icon: Users, label: 'Total clientes', value: s?.totalCustomers || 0, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950' },
        ].map((card, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold">Pedidos recientes</h2>
            <Link to="/admin/pedidos" className="text-sm text-primary-500 hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {(s?.recentOrders || []).map((order: any) => (
              <Link key={order.id} to={`/admin/pedidos/${order.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div>
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.user?.firstName} {order.user?.lastName} · {formatDateTime(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatPrice(order.total)}</p>
                  <span className={`badge text-xs ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-500" />
            <h2 className="font-semibold">Stock bajo</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {lowStockItems.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                  <img src={resolveAssetUrl(p.images?.[0]?.url) || 'https://placehold.co/80x80'} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                </div>
                <span className="badge bg-yellow-100 text-yellow-800">{p.stock} uds</span>
              </div>
            ))}
            {lowStockItems.length === 0 && <p className="p-4 text-sm text-gray-500">Sin alertas de stock</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
