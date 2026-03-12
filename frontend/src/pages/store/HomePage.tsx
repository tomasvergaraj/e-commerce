import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, CreditCard } from 'lucide-react';
import { productsApi, bannersApi, categoriesApi } from '@/api/services';
import ProductCard from '@/components/store/ProductCard';
import { Skeleton } from '@/components/common/Loading';

export default function HomePage() {
  const { data: banners } = useQuery({ queryKey: ['banners'], queryFn: () => bannersApi.getActive() });
  const { data: featured } = useQuery({ queryKey: ['featured'], queryFn: () => productsApi.getFeatured(8) });
  const { data: onSale } = useQuery({ queryKey: ['on-sale'], queryFn: () => productsApi.getOnSale(4) });
  const { data: categories } = useQuery({ queryKey: ['categories-tree'], queryFn: () => categoriesApi.getTree() });

  const bannerList = (banners as any)?.data || banners || [];
  const featuredList = (featured as any)?.data || featured || [];
  const saleList = (onSale as any)?.data || onSale || [];
  const catList = (categories as any)?.data || categories || [];

  return (
    <div>
      {/* Hero Banner */}
      {bannerList.length > 0 && (
        <section className="relative h-[420px] md:h-[500px] overflow-hidden bg-gray-900">
          <img
            src={bannerList[0].imageUrl}
            alt={bannerList[0].title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <div className="max-w-lg">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{bannerList[0].title}</h1>
                {bannerList[0].subtitle && <p className="text-lg text-gray-300 mb-6">{bannerList[0].subtitle}</p>}
                {bannerList[0].linkUrl && (
                  <Link to={bannerList[0].linkUrl} className="btn-primary inline-flex items-center gap-2 text-base py-3 px-8">
                    Ver más <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            </div>
          </div>
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
          <h2 className="text-3xl font-bold mb-4">¿Necesitas un proyecto a medida?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">En Nexo Spa desarrollamos soluciones tecnológicas personalizadas para tu negocio.</p>
          <Link to="/categorias/servicios" className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors inline-block">
            Ver servicios
          </Link>
        </div>
      </section>
    </div>
  );
}
