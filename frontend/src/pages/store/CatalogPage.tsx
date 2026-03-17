import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import { productsApi, categoriesApi } from '@/api/services';
import ProductCard from '@/components/store/ProductCard';
import { CatalogPageSkeleton } from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { asArray, asPaginated } from '@/lib/utils';

export default function CatalogPage() {
  const { slug: categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const params: any = { page, limit: 12 };
  if (categorySlug) params.categorySlug = categorySlug;
  if (search) params.search = search;
  if (sortBy) params.sortBy = sortBy;
  if (minPrice) params.minPrice = parseInt(minPrice);
  if (maxPrice) params.maxPrice = parseInt(maxPrice);

  const { data, isLoading } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params),
  });

  const { data: category } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: () => categoriesApi.getBySlug(categorySlug!),
    enabled: !!categorySlug,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const result = asPaginated<any>(data);
  const catData = (category as any)?.data || category;
  const catList = asArray<any>(categories);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  if (isLoading) {
    return <CatalogPageSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-500">Inicio</Link>
        <ChevronRight size={14} />
        {categorySlug ? (
          <>
            <Link to="/productos" className="hover:text-primary-500">Productos</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 dark:text-white">{catData?.name || categorySlug}</span>
          </>
        ) : (
          <span className="text-gray-900 dark:text-white">Productos</span>
        )}
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{catData?.name || (search ? `Resultados para "${search}"` : 'Todos los productos')}</h1>
          <p className="text-sm text-gray-500 mt-1">{result.total} producto{result.total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn-outline flex items-center gap-2 text-sm md:hidden">
            <SlidersHorizontal size={16} /> Filtros
          </button>
          <select
            value={sortBy}
            onChange={(e) => updateParams('sortBy', e.target.value)}
            className="input-field text-sm py-2 w-auto"
          >
            <option value="">Relevancia</option>
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name">Nombre A-Z</option>
            <option value="sales">Más vendidos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
        {/* Filters sidebar */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block space-y-6`}>
          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Categorías</h3>
            <ul className="space-y-1.5">
              <li>
                <Link to="/productos" className={`text-sm ${!categorySlug ? 'text-primary-500 font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-primary-500'}`}>
                  Todas
                </Link>
              </li>
              {catList.filter((c: any) => !c.parentId).map((cat: any) => (
                <li key={cat.id}>
                  <Link
                    to={`/categorias/${cat.slug}`}
                    className={`text-sm ${categorySlug === cat.slug ? 'text-primary-500 font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-primary-500'}`}
                  >
                    {cat.name}
                  </Link>
                  {cat.children?.length > 0 && (
                    <ul className="ml-3 mt-1 space-y-1">
                      {cat.children.map((sub: any) => (
                        <li key={sub.id}>
                          <Link
                            to={`/categorias/${sub.slug}`}
                            className={`text-xs ${categorySlug === sub.slug ? 'text-primary-500 font-medium' : 'text-gray-500 hover:text-primary-500'}`}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Price filter */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Precio</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateParams('minPrice', e.target.value)}
                className="input-field text-sm py-1.5 w-full"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateParams('maxPrice', e.target.value)}
                className="input-field text-sm py-1.5 w-full"
              />
            </div>
          </div>

          {/* Active filters */}
          {(search || minPrice || maxPrice) && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Filtros activos</h3>
              <div className="flex flex-wrap gap-2">
                {search && (
                  <span className="badge bg-primary-100 text-primary-800 gap-1">
                    "{search}" <button onClick={() => updateParams('search', '')}><X size={12} /></button>
                  </span>
                )}
                {minPrice && (
                  <span className="badge bg-gray-100 text-gray-700 gap-1">
                    Min: ${minPrice} <button onClick={() => updateParams('minPrice', '')}><X size={12} /></button>
                  </span>
                )}
                {maxPrice && (
                  <span className="badge bg-gray-100 text-gray-700 gap-1">
                    Max: ${maxPrice} <button onClick={() => updateParams('maxPrice', '')}><X size={12} /></button>
                  </span>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Product grid */}
        <div>
          {result.items.length === 0 ? (
            <EmptyState
              title="No se encontraron productos"
              description="Intenta con otros filtros o categorías"
              action={<Link to="/productos" className="btn-primary">Ver todos los productos</Link>}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {result.items.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {result.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParams('page', String(p))}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        p === page ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
