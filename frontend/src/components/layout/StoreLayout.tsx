import { Outlet, Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useThemeStore } from '@/stores/themeStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { settingsApi } from '@/api/services';

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
  const { dark, toggle: toggleTheme } = useThemeStore();
  const { isLoaded: isWishlistLoaded, sync: syncWishlist, clear: clearWishlist } = useWishlistStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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

  const settings = ((publicSettingsData as any)?.data || publicSettingsData || {}) as PublicSettings;
  const infoPages = ((publicPagesData as any)?.data || publicPagesData || []) as PublicPageLink[];
  const storeName = settings.store_name?.trim() || 'Nexo';
  const storeDescription = settings.store_description?.trim() || 'Tu tienda de tecnología y desarrollo en Chile.';
  const storeEmail = settings.store_email?.trim() || 'contacto@nexo.cl';
  const storePhone = settings.store_phone?.trim() || '+56 9 1234 5678';
  const storeAddress = settings.store_address?.trim() || 'Santiago, Chile';
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-primary-600 text-white text-xs py-1.5 text-center">
        Envío gratis en compras sobre $50.000 · Despacho a todo Chile
      </div>

      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{storeName}</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/productos" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">Productos</Link>
              <Link to="/categorias/tecnologia" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">Tecnología</Link>
              <Link to="/categorias/accesorios" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">Accesorios</Link>
              <Link to="/categorias/servicios" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">Servicios</Link>
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500">
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

              <Link to="/carrito" className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 relative">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1 p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500">
                    <User size={20} />
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
                            logout();
                            setUserMenuOpen(false);
                            navigate('/');
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
                <Link to="/login" className="btn-primary text-sm py-2 px-4">Ingresar</Link>
              )}

              <button className="md:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <form onSubmit={handleSearch} className="py-3 border-t border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  autoFocus
                  className="input-field pl-10"
                />
              </div>
            </form>
          )}
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-3">
            <Link to="/productos" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium py-2">Productos</Link>
            <Link to="/categorias/tecnologia" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-300 py-2">Tecnología</Link>
            <Link to="/categorias/accesorios" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-300 py-2">Accesorios</Link>
            <Link to="/categorias/servicios" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-300 py-2">Servicios</Link>
          </div>
        )}
      </header>

      <main className="flex-1">
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
                <li><Link to="/categorias/tecnologia" className="hover:text-primary-400">Tecnología</Link></li>
                <li><Link to="/categorias/accesorios" className="hover:text-primary-400">Accesorios</Link></li>
                <li><Link to="/categorias/servicios" className="hover:text-primary-400">Servicios</Link></li>
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
