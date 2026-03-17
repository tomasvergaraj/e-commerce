import { Outlet, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  User,
  Heart,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  Headphones,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useThemeStore } from '@/stores/themeStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { categoriesApi, settingsApi } from '@/api/services';
import { asArray, cn } from '@/lib/utils';
import { useTransientFlag } from '@/lib/useTransientFlag';
import StoreSearchBox from '@/components/layout/StoreSearchBox';

type PublicSettings = {
  store_name?: string;
  store_description?: string;
  store_email?: string;
  store_phone?: string;
  store_address?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_twitter?: string;
  social_linkedin?: string;
};

type PublicPageLink = {
  id: string;
  title: string;
  slug: string;
};

type NavigationCategory = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
};

function normalizeExternalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

export default function StoreLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);
  const cartPulseTick = useCartStore((s) => s.cartPulseTick);
  const { dark, toggle: toggleTheme } = useThemeStore();
  const { isLoaded: isWishlistLoaded, sync: syncWishlist, clear: clearWishlist } = useWishlistStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { active: isCartAnimating, trigger: triggerCartAnimation } = useTransientFlag(520);
  const { data: publicSettingsData } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => settingsApi.getPublic(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: publicPagesData } = useQuery({
    queryKey: ['public-pages'],
    queryFn: () => settingsApi.getPublicPages(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: () => categoriesApi.getTree(),
    staleTime: 5 * 60 * 1000,
  });

  const settings = ((publicSettingsData as any)?.data || publicSettingsData || {}) as PublicSettings;
  const infoPages = asArray<PublicPageLink>(publicPagesData);
  const categories = asArray<NavigationCategory>(categoriesData);
  const storeName = settings.store_name?.trim() || 'Nexo';
  const storeDescription = settings.store_description?.trim() || 'Tu tienda de tecnología y desarrollo en Chile.';
  const storeEmail = settings.store_email?.trim() || 'contacto@nexo.cl';
  const storePhone = settings.store_phone?.trim() || '+56 9 1234 5678';
  const storeAddress = settings.store_address?.trim() || 'Santiago, Chile';
  const displayName = user?.firstName?.trim() || user?.email?.split('@')[0] || 'tu cuenta';
  const featuredCategories = categories.filter((category) => !category.parentId).slice(0, 4);
  const trustHighlights = [
    { label: 'Compra protegida', Icon: ShieldCheck },
    { label: 'Despacho rápido', Icon: Truck },
    { label: 'Soporte cercano', Icon: Headphones },
  ];
  const socialLinks = [
    settings.social_instagram
      ? { label: 'Instagram', href: normalizeExternalUrl(settings.social_instagram), Icon: Instagram }
      : null,
    settings.social_facebook
      ? { label: 'Facebook', href: normalizeExternalUrl(settings.social_facebook), Icon: Facebook }
      : null,
    settings.social_twitter
      ? { label: 'Twitter / X', href: normalizeExternalUrl(settings.social_twitter), Icon: Twitter }
      : null,
    settings.social_linkedin
      ? { label: 'LinkedIn', href: normalizeExternalUrl(settings.social_linkedin), Icon: Linkedin }
      : null,
  ].filter(Boolean) as Array<{ label: string; href: string; Icon: typeof Instagram }>;

  useEffect(() => {
    if (!isAuthenticated) {
      clearWishlist();
      return;
    }

    if (user?.id && !isWishlistLoaded) {
      syncWishlist(user.id).catch(() => {});
    }
  }, [clearWishlist, isAuthenticated, isWishlistLoaded, syncWishlist, user?.id]);

  useEffect(() => {
    if (!cartPulseTick) return;
    triggerCartAnimation();
  }, [cartPulseTick, triggerCartAnimation]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <div className="bg-primary-600 text-white text-xs py-1.5 text-center">
        Envío gratis en compras sobre $50.000 · Despacho a todo Chile
      </div>

      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-4">
            <div className="flex items-center justify-between gap-3">
              <Link to="/" className="flex min-w-0 items-center gap-2 shrink-0">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
                <div className="min-w-0">
                  <span className="block truncate text-xl font-bold text-gray-900 dark:text-white">{storeName}</span>
                  <span className="hidden xl:block text-xs text-gray-500 dark:text-gray-400">Tienda en línea con despacho a todo Chile</span>
                </div>
              </Link>

              <StoreSearchBox
                storeName={storeName}
                className="hidden lg:flex flex-1 max-w-xl"
                showSubmitButton
              />

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 lg:hidden">
                  <Search size={20} />
                </button>

                <button
                  onClick={toggleTheme}
                  aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-transform duration-200 active:scale-90"
                >
                  <span className="relative block h-5 w-5">
                    <Sun
                      size={20}
                      className={`absolute inset-0 transition-all duration-300 ${dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
                    />
                    <Moon
                      size={20}
                      className={`absolute inset-0 transition-all duration-300 ${dark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
                    />
                  </span>
                </button>

                {isAuthenticated && (
                  <Link to="/cuenta/favoritos" className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500">
                    <Heart size={20} />
                  </Link>
                )}

                <Link
                  to="/carrito"
                  className={cn(
                    'relative p-2 text-gray-600 transition-colors dark:text-gray-300 hover:text-primary-500',
                    isCartAnimating && 'text-primary-500',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'pointer-events-none absolute inset-0 rounded-full border border-primary-300/70 opacity-0 dark:border-primary-500/40',
                      isCartAnimating && 'cart-ring-pop',
                    )}
                  />
                  <ShoppingCart size={20} className={cn('relative z-10', isCartAnimating && 'cart-icon-pop')} />
                  {itemCount > 0 && (
                    <span
                      className={cn(
                        'absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-medium text-white',
                        isCartAnimating && 'cart-badge-bounce',
                      )}
                    >
                      {itemCount}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2 py-1.5 text-gray-600 transition-colors hover:border-primary-200 hover:text-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-800"
                    >
                      <div className="hidden text-right leading-tight lg:block">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-500">
                          Sesion activa
                        </span>
                        <span className="block max-w-[140px] truncate text-sm font-semibold text-gray-900 dark:text-white">
                          Hola, {displayName}
                        </span>
                      </div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white">
                        <User size={16} />
                      </span>
                      <ChevronDown size={14} />
                    </button>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-2">
                          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                            <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                          <Link to="/cuenta/pedidos" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Mis Pedidos</Link>
                          <Link to="/cuenta/perfil" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Mi Perfil</Link>
                          <Link to="/cuenta/favoritos" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Favoritos</Link>
                          {isAdmin && (
                            <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">Panel Admin</Link>
                          )}
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout({ clearGuestSession: true, hardRefresh: true, redirectTo: '/' });
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <LogOut size={14} /> Cerrar sesión
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="btn-primary hidden sm:inline-flex text-sm py-2 px-4">Ingresar</Link>
                )}

                <button className="md:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800 mt-4 pt-3">
              <nav className="flex flex-wrap items-center gap-5 text-sm font-medium">
                <Link to="/productos" className="text-gray-700 dark:text-gray-200 hover:text-primary-500 transition-colors">Explorar todo</Link>
                {featuredCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/categorias/${category.slug}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>

              <div className="hidden xl:flex items-center gap-2">
                {trustHighlights.map(({ label, Icon }) => (
                  <span key={label} className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <Icon size={14} className="text-primary-500" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {searchOpen && (
              <div className="mt-3 border-t border-gray-100 py-3 dark:border-gray-800 lg:hidden">
                <StoreSearchBox
                  storeName={storeName}
                  autoFocus
                  onAfterNavigate={() => setSearchOpen(false)}
                />
              </div>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <StoreSearchBox
                storeName={storeName}
                className="mb-4"
                placeholder="Buscar productos..."
                onAfterNavigate={() => setMobileMenuOpen(false)}
              />

              <div className="space-y-2">
                <Link to="/productos" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  Ver todo el catálogo
                </Link>
                {featuredCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/categorias/${category.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-xl px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {category.name}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-primary mt-2 inline-flex w-full justify-center text-sm">
                    Ingresar
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                {trustHighlights.slice(0, 2).map(({ label, Icon }) => (
                  <div key={label} className="rounded-xl border border-gray-200 px-3 py-3 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
                    <Icon size={14} className="text-primary-500 mb-2" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
                <span className="text-xl font-bold text-white">{storeName}</span>
              </div>
              <p className="text-sm text-gray-400">{storeDescription}</p>
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-5">
                  {socialLinks.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      title={label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-950 text-gray-300 transition-colors hover:border-primary-500 hover:text-primary-400"
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Tienda</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/productos" className="hover:text-primary-400">Todos los productos</Link></li>
                {featuredCategories.map((category) => (
                  <li key={category.id}>
                    <Link to={`/categorias/${category.slug}`} className="hover:text-primary-400">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Información</h4>
              <ul className="space-y-2 text-sm">
                {infoPages.length > 0 ? (
                  infoPages.map((page) => (
                    <li key={page.id}>
                      <Link to={`/pagina/${page.slug}`} className="hover:text-primary-400">
                        {page.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No hay páginas informativas publicadas.</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contacto</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <Mail size={16} className="mt-0.5 shrink-0" />
                  <a href={`mailto:${storeEmail}`} className="hover:text-primary-400 transition-colors">
                    {storeEmail}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone size={16} className="mt-0.5 shrink-0" />
                  <a href={`tel:${storePhone.replace(/\s+/g, '')}`} className="hover:text-primary-400 transition-colors">
                    {storePhone}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span>{storeAddress}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
