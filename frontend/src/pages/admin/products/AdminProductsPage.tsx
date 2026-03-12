import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { productsApi } from '@/api/services';
import { formatPrice } from '@/lib/utils';
import { PageLoader } from '@/components/common/Loading';

export default function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => productsApi.adminList({ page, limit: 20, search }),
  });

  const result = (data as any)?.data || data || { items: [], total: 0 };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search, page: '1' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn-primary flex items-center gap-2"><Plus size={18} /> Nuevo producto</Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o SKU..."
            className="input-field pl-10" />
        </div>
      </form>

      {isLoading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Producto</th>
                  <th className="text-left px-4 py-3 font-medium">SKU</th>
                  <th className="text-left px-4 py-3 font-medium">Precio</th>
                  <th className="text-left px-4 py-3 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {result.items.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                          <img src={product.images?.[0]?.url || 'https://placehold.co/80x80'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.categories?.[0]?.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{product.sku}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${product.stock <= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/productos/${product.id}/editar`} className="inline-flex items-center gap-1 text-primary-500 hover:underline text-sm mr-3">
                        <Edit size={14} /> Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.total > 20 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 text-center">
              {result.total} productos en total
            </div>
          )}
        </div>
      )}
    </div>
  );
}
