import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { ordersApi } from '@/api/services';
import { formatPrice, formatDateTime, getOrderStatusLabel, getOrderStatusColor, getPaymentStatusLabel } from '@/lib/utils';
import { PageLoader } from '@/components/common/Loading';

export default function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search, status],
    queryFn: () => ordersApi.adminList({ page, limit: 20, search, status: status || undefined }),
  });

  const result = (data as any)?.data || data || { items: [], total: 0 };
  const statuses = ['', 'PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); setSearchParams({ search, page: '1' }); }} className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por número o email..."
            className="input-field pl-10" />
        </form>
        <select value={status} onChange={(e) => setSearchParams({ status: e.target.value, page: '1' })}
          className="input-field w-auto text-sm">
          {statuses.map((s) => <option key={s} value={s}>{s ? getOrderStatusLabel(s) : 'Todos los estados'}</option>)}
        </select>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Pedido</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 font-medium">Pago</th>
                  <th className="text-left px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="text-right px-4 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {result.items.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium font-mono text-xs">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{order.user?.firstName || order.guestFirstName} {order.user?.lastName || order.guestLastName}</p>
                      <p className="text-xs text-gray-500">{order.user?.email || order.guestEmail}</p>
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span></td>
                    <td className="px-4 py-3 text-xs">{getPaymentStatusLabel(order.paymentStatus)}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/pedidos/${order.id}`} className="text-primary-500 hover:underline inline-flex items-center gap-1 text-sm">
                        <Eye size={14} /> Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
