import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { wishlistApi } from '@/api/services';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { cn, formatPrice } from '@/lib/utils';
import { PageLoader } from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const qc = useQueryClient();
  const addItem = useCartStore((s) => s.addItem);
  const setIds = useWishlistStore((s) => s.setIds);
  const setInWishlist = useWishlistStore((s) => s.setInWishlist);
  const [animatedProductId, setAnimatedProductId] = useState<string | null>(null);
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.getAll(),
  });
  const rawItems = (data as any)?.data || data;
  const items = Array.isArray(rawItems) ? rawItems : [];

  useEffect(() => {
    if (isLoading || isError) return;
    setIds(items.map((item: any) => item.productId));
  }, [isError, isLoading, items, setIds]);

  useEffect(() => {
    if (!animatedProductId) return;

    const timerId = window.setTimeout(() => setAnimatedProductId(null), 420);
    return () => window.clearTimeout(timerId);
  }, [animatedProductId]);

  const removeMut = useMutation({
    mutationFn: (productId: string) => wishlistApi.remove(productId),
    onSuccess: (_data, productId) => {
      setInWishlist(productId, false);
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Eliminado');
    },
    onError: (mutationError: any) => {
      toast.error(mutationError.message || 'No se pudo quitar el producto de favoritos');
    },
  });

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <EmptyState
        icon={<Heart size={48} />}
        title="No pudimos cargar tus favoritos"
        description={(error as any)?.message || 'Intenta nuevamente en unos segundos.'}
        action={(
          <button type="button" onClick={() => refetch()} className="btn-primary">
            Reintentar
          </button>
        )}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={48} />}
        title="Sin favoritos"
        description="Agrega productos a tus favoritos"
        action={<Link to="/productos" className="btn-primary">Explorar productos</Link>}
      />
    );
  }

  const handleAddToCart = async (productId: string) => {
    try {
      await addItem(productId);
      setAnimatedProductId(null);
      window.requestAnimationFrame(() => setAnimatedProductId(productId));
      toast.success('Agregado');
    } catch {
      toast.error('No se pudo agregar al carrito');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Mis Favoritos ({items.length})</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item: any) => {
          const isCartFeedbackActive = animatedProductId === item.product.id;

          return (
            <div key={item.id} className="card flex gap-4 p-4">
              <Link to={`/productos/${item.product.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img src={item.product.images?.[0]?.url || 'https://placehold.co/200x200'} alt="" className="h-full w-full object-cover" />
              </Link>

              <div className="flex-1">
                <Link to={`/productos/${item.product.slug}`} className="font-medium text-sm hover:text-primary-500">
                  {item.product.name}
                </Link>
                <p className="mt-1 text-lg font-bold">{formatPrice(item.product.price)}</p>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item.product.id)}
                    className={cn(
                      'btn-primary relative flex items-center gap-1 overflow-hidden px-3 py-1.5 text-xs',
                      isCartFeedbackActive && 'cart-button-pop bg-primary-600 shadow-lg shadow-primary-500/25 hover:bg-primary-600',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none absolute inset-0 rounded-lg border border-primary-300/70 opacity-0',
                        isCartFeedbackActive && 'cart-ring-pop',
                      )}
                    />
                    <ShoppingCart size={14} className={cn('relative z-10', isCartFeedbackActive && 'cart-icon-pop')} />
                    <span className="relative z-10">Agregar</span>
                  </button>

                  <button
                    onClick={() => removeMut.mutate(item.productId)}
                    disabled={removeMut.isPending}
                    className="btn-outline px-3 py-1.5 text-xs disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
