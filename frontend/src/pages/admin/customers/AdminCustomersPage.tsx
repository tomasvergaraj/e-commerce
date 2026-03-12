import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { usersApi } from '@/api/services';
import { formatDate } from '@/lib/utils';
import { PageLoader } from '@/components/common/Loading';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search],
    queryFn: () => usersApi.list({ page: 1, limit: 50, search }),
  });
  const result = (data as any)?.data || data || { items: [] };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>
      <div className="relative max-w-md mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o email..."
          className="input-field pl-10" />
      </div>
      {isLoading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Rol</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-left px-4 py-3 font-medium">Pedidos</th>
                <th className="text-left px-4 py-3 font-medium">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {result.items.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3"><span className="badge bg-gray-100 text-gray-700">{user.role}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span></td>
                  <td className="px-4 py-3">{user._count?.orders || 0}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
