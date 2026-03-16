import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import WishlistButton from '@/components/store/WishlistButton';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const image = product.images?.[0]?.url || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=Sin+imagen';
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product.id);
      toast.success('Agregado al carrito');
    } catch {
      toast.error('Error al agregar');
    }
  };

  return (
    <Link to={`/productos/${product.slug}`} className="group card overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{Math.round((1 - product.price / product.comparePrice) * 100)}%
          </span>
        )}
        {product.isFeatured && !hasDiscount && (
          <span className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Destacado
          </span>
        )}
        <WishlistButton
          productId={product.id}
          className="absolute top-3 right-3 h-10 w-10 rounded-full shadow-md backdrop-blur-sm"
          iconSize={18}
        />
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 bg-white dark:bg-gray-800 p-2.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-500 hover:text-white"
        >
          <ShoppingCart size={18} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        {product.brand && (
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{product.brand}</p>
        )}
        <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 text-sm mb-2 group-hover:text-primary-500 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
        {product.stock <= 0 && (
          <p className="text-xs text-red-500 mt-1 font-medium">Agotado</p>
        )}
        {product.avgRating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`text-xs ${star <= Math.round(product.avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
