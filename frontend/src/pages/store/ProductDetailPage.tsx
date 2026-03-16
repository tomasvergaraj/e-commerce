import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ChevronRight, ShoppingCart, Minus, Plus, Star, Truck, Loader2, MessageSquare, ShieldCheck, RotateCcw, CreditCard,
} from 'lucide-react';
import { productsApi, reviewsApi } from '@/api/services';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { cn, formatPrice, resolveAssetUrl } from '@/lib/utils';
import { useTransientFlag } from '@/lib/useTransientFlag';
import ProductCard from '@/components/store/ProductCard';
import WishlistButton from '@/components/store/WishlistButton';
import { PageLoader } from '@/components/common/Loading';
import toast from 'react-hot-toast';

type ReviewFormValues = {
  title: string;
  comment: string;
};

type ReviewEligibility = {
  canReview: boolean;
  hasDeliveredPurchase: boolean;
  reason: string;
  existingReview?: {
    id: string;
    isApproved: boolean;
    createdAt: string;
  } | null;
  deliveredOrder?: {
    id: string;
    orderNumber: string;
    deliveredAt?: string | null;
  } | null;
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();
  const { active: isCartFeedbackActive, trigger: triggerCartFeedback } = useTransientFlag();
  const { register, handleSubmit, reset } = useForm<ReviewFormValues>({
    defaultValues: { title: '', comment: '' },
  });

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

  const { data: reviewEligibilityData, isLoading: isReviewEligibilityLoading } = useQuery({
    queryKey: ['review-eligibility', product?.id],
    queryFn: () => reviewsApi.getEligibility(product.id),
    enabled: isAuthenticated && !!product?.id,
  });

  const relatedList = (related as any)?.data || related || [];
  const reviewEligibility = ((reviewEligibilityData as any)?.data || reviewEligibilityData || null) as ReviewEligibility | null;

  useEffect(() => {
    if (location.hash !== '#reviews' || !product?.id) return;

    const timerId = window.setTimeout(() => {
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    return () => window.clearTimeout(timerId);
  }, [location.hash, product?.id]);

  const submitReviewMutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => reviewsApi.create({
      productId: product.id,
      rating: reviewRating,
      title: values.title.trim() || undefined,
      comment: values.comment.trim() || undefined,
    }),
    onSuccess: async () => {
      toast.success('Reseña enviada. Se publicará después de ser aprobada.');
      reset();
      setReviewRating(5);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['review-eligibility', product.id] }),
        queryClient.invalidateQueries({ queryKey: ['product', slug] }),
      ]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'No se pudo enviar tu reseña');
    },
  });

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
  const deliveryMessage = displayStock > 0 ? 'Recíbelo entre 1 y 5 días hábiles' : 'Te avisaremos cuando vuelva a estar disponible';
  const purchaseHighlights = [
    { title: 'Pago protegido', description: 'Proceso de compra claro y respaldado.', Icon: ShieldCheck },
    { title: 'Despacho visible', description: deliveryMessage, Icon: Truck },
    { title: 'Cambios simples', description: 'Compra con menos fricción y más tranquilidad.', Icon: RotateCcw },
  ];
  const productFacts = [
    product.brand ? { label: 'Marca', value: product.brand } : null,
    primaryCat ? { label: 'Categoría', value: primaryCat.name } : null,
    { label: 'SKU', value: activeVariant?.sku || product.sku || 'No informado' },
    { label: 'Stock', value: displayStock > 0 ? `${displayStock} unidades disponibles` : 'Agotado' },
    variants.length > 0 ? { label: 'Variantes', value: `${variants.length} opciones activas` } : null,
    product.reviewCount > 0 ? { label: 'Reseñas', value: `${product.reviewCount} opiniones publicadas` } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const handleAddToCart = async () => {
    if (variants.length > 0 && !selectedVariant) {
      toast.error('Selecciona una variante');
      return;
    }
    try {
      await addItem(product.id, selectedVariant || undefined, quantity);
      triggerCartFeedback();
      toast.success('Agregado al carrito');
    } catch {
      toast.error('Error al agregar');
    }
  };

  const onSubmitReview = handleSubmit(async (values) => {
    await submitReviewMutation.mutateAsync(values);
  });

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
              src={resolveAssetUrl(images[selectedImage]?.url) || 'https://placehold.co/800x800/e2e8f0/94a3b8?text=Sin+imagen'}
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
                  <img src={resolveAssetUrl(img.url)} alt="" className="w-full h-full object-cover" />
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
              <a href="#reviews" className="text-sm font-medium text-primary-500 hover:underline">
                Ver opiniones
              </a>
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

          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            {purchaseHighlights.map(({ title, description, Icon }) => (
              <div key={title} className="rounded-2xl border border-gray-200/80 bg-gray-50/80 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/70">
                <Icon size={18} className="text-primary-500" />
                <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
                <p className="mt-1 text-xs leading-6 text-gray-500 dark:text-gray-400">{description}</p>
              </div>
            ))}
          </div>

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
              className={cn(
                'btn-primary relative flex flex-1 items-center justify-center gap-2 overflow-hidden py-3',
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
              <ShoppingCart size={20} className={cn('relative z-10', isCartFeedbackActive && 'cart-icon-pop')} />
              {displayStock > 0 ? 'Agregar al carrito' : 'Agotado'}
            </button>
            <WishlistButton
              productId={product.id}
              className="h-12 w-12 rounded-lg p-0"
              activeClassName="h-12 w-12 rounded-lg border border-red-200 bg-red-50 text-red-500 dark:border-red-900/60 dark:bg-red-950/40"
              inactiveClassName="btn-outline h-12 w-12 rounded-lg p-0"
              iconSize={20}
            />
          </div>
          <p className="text-xs text-gray-500 -mt-4 mb-6">
            Confirmación inmediata del pedido · Soporte visible durante y después de la compra
          </p>

          {/* Shipping info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
              <Truck size={20} className="text-primary-500 shrink-0" />
            <div>
              <p className="font-medium">Envío a todo Chile</p>
              <p className="text-gray-500 text-xs">{deliveryMessage}</p>
            </div>
          </div>

          {/* SKU */}
          <p className="text-xs text-gray-400 mt-4">SKU: {activeVariant?.sku || product.sku}</p>

          <div className="mt-4 rounded-2xl border border-gray-200/80 bg-white px-5 py-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <CreditCard size={18} className="text-primary-500" />
              Medios de pago y compra segura
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Visa', 'Mastercard', 'Débito', 'Transferencia'].map((method) => (
                <span
                  key={method}
                  className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                >
                  {method}
                </span>
              ))}
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary-500" />
                <p>Proceso de compra protegido con confirmación inmediata del pedido.</p>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw size={16} className="mt-0.5 shrink-0 text-primary-500" />
                <p>Políticas visibles para que compres con más confianza y menos dudas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {product.longDesc && (
        <div className="mt-12 max-w-5xl grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <h2 className="text-xl font-bold mb-4">Descripción</h2>
            <div className="rounded-[24px] border border-gray-200/80 bg-white px-6 py-6 text-gray-600 leading-relaxed whitespace-pre-line shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              {product.longDesc}
            </div>
          </div>

          <aside className="self-start rounded-[24px] border border-gray-200/80 bg-white px-5 py-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Lo que debes saber
            </h3>
            <div className="mt-4 space-y-4">
              {productFacts.map((fact) => (
                <div key={fact.label} className="rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    {fact.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* Reviews */}
      <div id="reviews" className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare size={20} className="text-primary-500" />
          <h2 className="text-xl font-bold">Reseñas ({product.reviewCount})</h2>
        </div>

        <div className="card p-6 max-w-2xl mb-6">
          {!isAuthenticated ? (
            <>
              <h3 className="font-semibold mb-2">Inicia sesión para dejar tu reseña</h3>
              <p className="text-sm text-gray-500 mb-4">
                Solo los clientes con pedidos entregados pueden reseñar este producto.
              </p>
              <Link to="/login" state={{ from: location }} className="btn-primary inline-flex items-center gap-2">
                Iniciar sesión
              </Link>
            </>
          ) : isReviewEligibilityLoading ? (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Revisando si ya puedes dejar una reseña...
            </div>
          ) : reviewEligibility?.canReview ? (
            <form onSubmit={onSubmitReview} className="space-y-5">
              <div>
                <h3 className="font-semibold">Tu opinión sobre este producto</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tu reseña se enviará para moderación y se publicará una vez aprobada.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Calificación</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                      aria-label={`Calificar con ${star} estrellas`}
                    >
                      <Star
                        size={24}
                        className={star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">{reviewRating}/5</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Título</label>
                <input
                  {...register('title')}
                  maxLength={120}
                  className="input-field"
                  placeholder="Resume tu experiencia"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Comentario</label>
                <textarea
                  {...register('comment')}
                  rows={4}
                  className="input-field"
                  placeholder="Cuéntale a otros clientes cómo fue tu experiencia con este producto"
                />
              </div>

              <button
                type="submit"
                disabled={submitReviewMutation.isPending}
                className="btn-primary inline-flex items-center gap-2"
              >
                {submitReviewMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                Enviar reseña
              </button>
            </form>
          ) : (
            <>
              <h3 className="font-semibold mb-2">Aún no puedes reseñar este producto</h3>
              <p className="text-sm text-gray-500">{reviewEligibility?.reason || 'Todavía no cumples las condiciones para reseñar.'}</p>
              {reviewEligibility?.deliveredOrder?.orderNumber && (
                <p className="text-xs text-gray-400 mt-3">
                  Pedido asociado: {reviewEligibility.deliveredOrder.orderNumber}
                </p>
              )}
            </>
          )}
        </div>

        {product.reviews?.length > 0 ? (
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
        ) : (
          <div className="card p-6 max-w-2xl text-sm text-gray-500">
            Aún no hay reseñas aprobadas para este producto.
          </div>
        )}
      </div>

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
