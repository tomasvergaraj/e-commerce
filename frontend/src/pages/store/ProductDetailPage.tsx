import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ChevronRight, Heart, ShoppingCart, Minus, Plus, Star, Truck } from 'lucide-react';
import { productsApi, wishlistApi } from '@/api/services';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/store/ProductCard';
import { PageLoader } from '@/components/common/Loading';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ['related', slug],
    queryFn: () => productsApi.getRelated(slug!),
    enabled: !!slug,
  });

  const product = (data as any)?.data || data;
  const relatedList = (related as any)?.data || related || [];

  if (isLoading) return <PageLoader />;
  if (!product) return <div className="text-center py-20">Producto no encontrado</div>;

  const images = product.images || [];
  const variants = product.variants || [];
  const categories = product.categories || [];
  const primaryCat = categories.find((c: any) => c.isPrimary)?.category || categories[0]?.category;

  const activeVariant = variants.find((v: any) => v.id === selectedVariant);
  const displayPrice = activeVariant?.price || product.price;
  const displayStock = activeVariant ? activeVariant.stock : product.stock;
  const hasDiscount = product.comparePrice && product.comparePrice > displayPrice;

  const handleAddToCart = async () => {
    if (variants.length > 0 && !selectedVariant) {
      toast.error('Selecciona una variante');
      return;
    }
    try {
      await addItem(product.id, selectedVariant || undefined, quantity);
      toast.success('Agregado al carrito');
    } catch {
      toast.error('Error al agregar');
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Inicia sesión para usar favoritos'); return; }
    try {
      const res = await wishlistApi.toggle(product.id);
      const d = (res as any)?.data || res;
      toast.success(d.message || (d.added ? 'Agregado a favoritos' : 'Eliminado de favoritos'));
    } catch { toast.error('Error'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary-500">Inicio</Link>
        <ChevronRight size={14} />
        <Link to="/productos" className="hover:text-primary-500">Productos</Link>
        {primaryCat && (
          <>
            <ChevronRight size={14} />
            <Link to={`/categorias/${primaryCat.slug}`} className="hover:text-primary-500">{primaryCat.name}</Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
            <img
              src={images[selectedImage]?.url || 'https://placehold.co/800x800/e2e8f0/94a3b8?text=Sin+imagen'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img: any, i: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                    i === selectedImage ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">{product.brand}</p>}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>

          {/* Rating */}
          {product.avgRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} className={s <= Math.round(product.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.reviewCount} reseñas)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(displayPrice)}</span>
            {hasDiscount && <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>}
            {hasDiscount && (
              <span className="badge bg-red-100 text-red-700">
                -{Math.round((1 - displayPrice / product.comparePrice) * 100)}%
              </span>
            )}
          </div>

          {product.shortDesc && <p className="text-gray-600 dark:text-gray-400 mb-6">{product.shortDesc}</p>}

          {/* Variants */}
          {variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Variante</h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id)}
                    disabled={v.stock <= 0}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedVariant === v.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-600'
                        : v.stock <= 0
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                    }`}
                  >
                    {v.name} {v.stock <= 0 && '(Agotado)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Cantidad</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-l-lg">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(displayStock, quantity + 1))} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-lg">
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-gray-500">{displayStock} disponibles</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={displayStock <= 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <ShoppingCart size={20} />
              {displayStock > 0 ? 'Agregar al carrito' : 'Agotado'}
            </button>
            <button onClick={handleWishlist} className="btn-outline p-3">
              <Heart size={20} />
            </button>
          </div>

          {/* Shipping info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
            <Truck size={20} className="text-primary-500 shrink-0" />
            <div>
              <p className="font-medium">Envío a todo Chile</p>
              <p className="text-gray-500 text-xs">Despacho en 1-5 días hábiles</p>
            </div>
          </div>

          {/* SKU */}
          <p className="text-xs text-gray-400 mt-4">SKU: {activeVariant?.sku || product.sku}</p>
        </div>
      </div>

      {/* Description */}
      {product.longDesc && (
        <div className="mt-12 max-w-3xl">
          <h2 className="text-xl font-bold mb-4">Descripción</h2>
          <div className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{product.longDesc}</div>
        </div>
      )}

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Reseñas ({product.reviewCount})</h2>
          <div className="space-y-4 max-w-2xl">
            {product.reviews.map((review: any) => (
              <div key={review.id} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.user?.firstName} {review.user?.lastName}</span>
                </div>
                {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                {review.comment && <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      {relatedList.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedList.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
