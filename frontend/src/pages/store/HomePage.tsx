import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Truck, Shield, Headphones, CreditCard, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { productsApi, bannersApi, categoriesApi } from '@/api/services';
import ProductCard from '@/components/store/ProductCard';
import { resolveAssetUrl } from '@/lib/utils';

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
};

export default function HomePage() {
  const { data: banners } = useQuery({ queryKey: ['banners'], queryFn: () => bannersApi.getActive() });
  const { data: featured } = useQuery({ queryKey: ['featured'], queryFn: () => productsApi.getFeatured(8) });
  const { data: onSale } = useQuery({ queryKey: ['on-sale'], queryFn: () => productsApi.getOnSale(4) });
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: () => productsApi.getBrands() });
  const { data: categories } = useQuery({ queryKey: ['categories-tree'], queryFn: () => categoriesApi.getTree() });

  const bannerList = ((banners as any)?.data || banners || []) as Banner[];
  const featuredList = (featured as any)?.data || featured || [];
  const saleList = (onSale as any)?.data || onSale || [];
  const brandsList = ((brands as any)?.data || brands || []) as string[];
  const catList = (categories as any)?.data || categories || [];

  const [activeBanner, setActiveBanner] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    if (bannerList.length === 0) {
      setActiveBanner(0);
      return;
    }

    if (activeBanner >= bannerList.length) {
      setActiveBanner(0);
    }
  }, [activeBanner, bannerList.length]);

  useEffect(() => {
    if (bannerList.length <= 1 || isCarouselPaused) return;

    const intervalId = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % bannerList.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [bannerList.length, isCarouselPaused]);

  const currentBanner = bannerList[activeBanner] ?? bannerList[0];
  const hasMultipleBanners = bannerList.length > 1;

  const goToPreviousBanner = () => {
    setActiveBanner((current) => (current === 0 ? bannerList.length - 1 : current - 1));
  };

  const goToNextBanner = () => {
    setActiveBanner((current) => (current + 1) % bannerList.length);
  };

  return (
    <div>
      {/* Hero Banner */}
      {currentBanner && (
        <section
          className="relative h-[420px] md:h-[500px] overflow-hidden bg-gray-950"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
          onFocusCapture={() => setIsCarouselPaused(true)}
          onBlurCapture={() => setIsCarouselPaused(false)}
        >
          <div className="absolute inset-0">
            {bannerList.map((banner, index) => (
              <div
                key={banner.id || `${banner.imageUrl}-${index}`}
                className={`absolute inset-0 transition-opacity duration-700 ${index === activeBanner ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-hidden={index !== activeBanner}
              >
                <img
                  src={resolveAssetUrl(banner.imageUrl)}
                  alt={banner.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,18,0.92)_0%,rgba(3,7,18,0.62)_45%,rgba(3,7,18,0.2)_100%)]" />
              </div>
            ))}
          </div>

          <div className="relative z-10 flex h-full items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <div className="max-w-xl">
                {hasMultipleBanners && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-white/80 backdrop-blur-sm">
                    {String(activeBanner + 1).padStart(2, '0')} / {String(bannerList.length).padStart(2, '0')}
                  </span>
                )}
                <h1 className="mt-4 text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {currentBanner.title}
                </h1>
                {currentBanner.subtitle && (
                  <p className="text-lg text-gray-200 mb-6 max-w-lg">
                    {currentBanner.subtitle}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <Link to={currentBanner.linkUrl || '/productos'} className="btn-primary inline-flex items-center gap-2 text-base py-3 px-8">
                    Ver más <ArrowRight size={18} />
                  </Link>
                  <Link to="/productos" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                    Explorar catálogo
                  </Link>
                  {hasMultipleBanners && (
                    <span className="text-sm text-white/70">
                      Carrusel automático cada 5 segundos
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {hasMultipleBanners && (
            <>
              <div className="absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between px-3 md:px-6 pointer-events-none">
                <button
                  type="button"
                  onClick={goToPreviousBanner}
                  className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/45"
                  aria-label="Banner anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={goToNextBanner}
                  className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/45"
                  aria-label="Banner siguiente"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 backdrop-blur-sm">
                {bannerList.map((banner, index) => (
                  <button
                    key={`${banner.id}-indicator`}
                    type="button"
                    onClick={() => setActiveBanner(index)}
                    className={`h-2.5 rounded-full transition-all ${index === activeBanner ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'}`}
                    aria-label={`Ir al banner ${index + 1}`}
                    aria-pressed={index === activeBanner}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Features bar */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[ 
              { icon: Truck, title: 'Envío a todo Chile', desc: 'Despacho rápido y seguro' },
              { icon: Shield, title: 'Compra segura', desc: 'Pago protegido' },
              { icon: Headphones, title: 'Soporte', desc: 'Asistencia personalizada' },
              { icon: CreditCard, title: 'Pago flexible', desc: 'Tarjeta de crédito y débito' },
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <feat.icon size={28} className="text-primary-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{feat.title}</p>
                  <p className="text-xs text-gray-500">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: `${catList.length || 0}+`, label: 'categorías activas' },
              { value: `${brandsList.length || 0}+`, label: 'marcas disponibles' },
              { value: `${featuredList.length || 0}+`, label: 'productos destacados' },
              { value: `${saleList.length || 0}+`, label: 'ofertas visibles hoy' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {catList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Categorías</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {catList.map((cat: any) => (
              <Link
                key={cat.id}
                to={`/categorias/${cat.slug}`}
                className="card p-6 text-center hover:shadow-md transition-shadow group"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">{cat.name}</h3>
                {cat._count?.products > 0 && <p className="text-xs text-gray-500 mt-1">{cat._count.products} productos</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {brandsList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-6">
          <div className="rounded-[28px] border border-gray-200/80 bg-white px-6 py-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-500">Selección curada</p>
                <h2 className="text-2xl font-bold mt-2">Marcas presentes en la tienda</h2>
              </div>
              <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Una vitrina clara ayuda a comparar mejor y reduce la fricción al momento de decidir qué comprar.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {brandsList.slice(0, 12).map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Productos Destacados</h2>
            <Link to="/productos?isFeatured=true" className="text-primary-500 text-sm font-medium hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredList.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Shield,
              title: 'Compra con tranquilidad',
              description: 'Señales claras de stock, precios visibles y navegación pensada para decidir rápido.',
            },
            {
              icon: Truck,
              title: 'Despacho y seguimiento',
              description: 'Información simple de envío y una experiencia post-compra coherente con la tienda.',
            },
            {
              icon: Headphones,
              title: 'Soporte que acompaña',
              description: 'Canales de contacto visibles para resolver dudas antes y después de la compra.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[24px] border border-gray-200/80 bg-white px-6 py-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <item.icon size={24} className="text-primary-500" />
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* On Sale */}
      {saleList.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Ofertas</h2>
              <Link to="/productos?onSale=true" className="text-primary-500 text-sm font-medium hover:underline flex items-center gap-1">
                Ver todas <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {saleList.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Compra productos con respaldo y explora soluciones a medida</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            La tienda ya te permite comprar rápido, pero también puedes llevar tu proyecto un paso más allá si necesitas una solución personalizada.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/productos" className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors inline-block">
              Ver productos
            </Link>
            <Link to="/categorias/servicios" className="rounded-lg border border-white/30 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10 inline-block">
              Ver servicios
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
