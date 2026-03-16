import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { wishlistApi } from '@/api/services';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { formatPrice } from '@/lib/utils';
import { PageLoader } from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const qc = useQueryClient();
  const addItem = useCartStore((s) => s.addItem);
  const { setIds, setInWishlist } = useWishlistStore();
  const { data, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: () => wishlistApi.getAll() });
  const items = (data as any)?.data || data || [];

  useEffect(() => {
    setIds(items.map((item: any) => item.productId));
  }, [items, setIds]);

  const removeMut = useMutation({
    mutationFn: (productId: string) => wishlistApi.remove(productId),
    onSuccess: (_data, productId) => {
      setInWishlist(productId, false);
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Eliminado');
    },
  });

  if (isLoading) return <PageLoader />;

  if (items.length === 0) {
    return <EmptyState icon={<Heart size={48} />} title="Sin favoritos" description="Agrega productos a tus favoritos"
      action={<Link to="/productos" className="btn-primary">Explorar productos</Link>} />;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Mis Favoritos ({items.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item: any) => (
          <div key={item.id} className="card p-4 flex gap-4">
            <Link to={`/productos/${item.product.slug}`} className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <img src={item.product.images?.[0]?.url || 'https://placehold.co/200x200'} alt="" className="w-full h-full object-cover" />
            </Link>
            <div className="flex-1">
              <Link to={`/productos/${item.product.slug}`} className="font-medium text-sm hover:text-primary-500">{item.product.name}</Link>
              <p className="text-lg font-bold mt-1">{formatPrice(item.product.price)}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={async () => { await addItem(item.product.id); toast.success('Agregado'); }} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                  <ShoppingCart size={14} /> Agregar
                </button>
                <button onClick={() => removeMut.mutate(item.productId)} className="btn-outline text-xs py-1.5 px-3"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
