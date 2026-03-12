import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ShoppingCart, User, Heart, Search, Menu, X, Sun, Moon, ChevronDown, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useThemeStore } from '@/stores/themeStore';

export default function StoreLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);
  const { dark, toggle: toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
      {/* Top bar */}
      <div className="bg-primary-600 text-white text-xs py-1.5 text-center">
        Envío gratis en compras sobre $50.000 · Despacho a todo Chile
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Nexo</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/productos" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">Productos</Link>
              <Link to="/categorias/tecnologia" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">Tecnología</Link>
              <Link to="/categorias/accesorios" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">Accesorios</Link>
              <Link to="/categorias/servicios" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">Servicios</Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500">
                <Search size={20} />
              </button>

              {/* Theme toggle */}
              <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500">
                {dark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link to="/cuenta/favoritos" className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500">
                  <Heart size={20} />
                </Link>
              )}

              {/* Cart */}
              <Link to="/carrito" className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 relative">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User */}
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
                        <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                          <LogOut size={14} /> Cerrar sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-2 px-4">Ingresar</Link>
              )}

              {/* Mobile menu toggle */}
              <button className="md:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Search bar */}
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

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-3">
            <Link to="/productos" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium py-2">Productos</Link>
            <Link to="/categorias/tecnologia" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-300 py-2">Tecnología</Link>
            <Link to="/categorias/accesorios" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-300 py-2">Accesorios</Link>
            <Link to="/categorias/servicios" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-300 py-2">Servicios</Link>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
                <span className="text-xl font-bold text-white">Nexo Spa</span>
              </div>
              <p className="text-sm text-gray-400">Tu tienda de tecnología y desarrollo en Chile.</p>
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
                <li><Link to="/pagina/sobre-nosotros" className="hover:text-primary-400">Sobre Nosotros</Link></li>
                <li><Link to="/pagina/politica-envios" className="hover:text-primary-400">Política de Envíos</Link></li>
                <li><Link to="/pagina/politica-devoluciones" className="hover:text-primary-400">Devoluciones</Link></li>
                <li><Link to="/pagina/preguntas-frecuentes" className="hover:text-primary-400">Preguntas Frecuentes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contacto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>contacto@nexo.cl</li>
                <li>+56 9 1234 5678</li>
                <li>Santiago, Chile</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Nexo Spa. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
