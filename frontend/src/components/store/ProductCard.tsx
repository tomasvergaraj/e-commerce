import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import WishlistButton from '@/components/store/WishlistButton';
import { cn, resolveAssetUrl } from '@/lib/utils';
import { useTransientFlag } from '@/lib/useTransientFlag';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();
  const { active: isCartFeedbackActive, trigger: triggerCartFeedback } = useTransientFlag();
  const image = resolveAssetUrl(product.images?.[0]?.url) || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=Sin+imagen';
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      navigate(`/productos/${product.slug}`);
      return;
    }

    try {
      await addItem(product.id);
      triggerCartFeedback();
      toast.success('Agregado al carrito');
    } catch {
      toast.error('Error al agregar');
    }
  };

  return (
    <Link to={`/productos/${product.slug}`} className="group card block h-full min-w-0 overflow-hidden border-gray-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <span className="absolute left-2 top-2 max-w-[calc(100%-4.75rem)] truncate rounded-full bg-red-500 px-2 py-1 text-[11px] font-bold text-white sm:left-3 sm:top-3 sm:max-w-[calc(100%-5.5rem)] sm:text-xs">
            -{Math.round((1 - product.price / product.comparePrice) * 100)}%
          </span>
        )}
        {product.isFeatured && !hasDiscount && (
          <span className="absolute left-2 top-2 max-w-[calc(100%-4.75rem)] truncate rounded-full bg-primary-500 px-2 py-1 text-[11px] font-bold text-white sm:left-3 sm:top-3 sm:max-w-[calc(100%-5.5rem)] sm:text-xs">
            Destacado
          </span>
        )}
        <WishlistButton
          productId={product.id}
          className="absolute right-2 top-2 h-9 w-9 rounded-full shadow-md backdrop-blur-sm sm:right-3 sm:top-3 sm:h-10 sm:w-10"
          iconSize={16}
        />
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            'absolute bottom-2 right-2 inline-flex h-10 max-w-[calc(100%-1rem)] items-center justify-center gap-1.5 overflow-hidden rounded-full bg-white px-2.5 py-2 text-xs font-medium shadow-md transition-all hover:bg-primary-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-800 sm:bottom-3 sm:right-3 sm:h-auto sm:max-w-[calc(100%-1.5rem)] sm:px-3 sm:py-2 md:px-2.5 md:py-2.5 md:opacity-0 md:group-hover:opacity-100',
            isCartFeedbackActive && 'cart-button-pop bg-primary-500 text-white shadow-lg shadow-primary-500/25',
          )}
          aria-label={hasVariants ? 'Elegir variante' : 'Agregar al carrito'}
        >
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-0 rounded-full border border-primary-300/70 opacity-0',
              isCartFeedbackActive && 'cart-ring-pop',
            )}
          />
          <ShoppingCart size={16} className={cn('relative z-10 shrink-0', isCartFeedbackActive && 'cart-icon-pop')} />
          <span className="hidden sm:inline md:hidden">{hasVariants ? 'Elegir' : 'Agregar'}</span>
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
        {isOutOfStock ? (
          <p className="text-xs text-red-500 mt-2 font-medium">Agotado</p>
        ) : (
          <p className="text-xs text-gray-500 mt-2">Despacho estimado entre 1 y 5 días hábiles</p>
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
