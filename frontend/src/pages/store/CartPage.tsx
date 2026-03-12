import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';
import EmptyState from '@/components/common/EmptyState';

export default function CartPage() {
  const { items, subtotal, itemCount, updateItem, removeItem, loading } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          icon={<ShoppingBag size={48} />}
          title="Tu carrito está vacío"
          description="Agrega productos para comenzar tu compra"
          action={<Link to="/productos" className="btn-primary">Explorar productos</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-8">Carrito de compras ({itemCount} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => {
            const image = item.product?.images?.[0]?.url || 'https://placehold.co/200x200/e2e8f0/94a3b8?text=Producto';
            return (
              <div key={item.id} className="card p-4 flex gap-4">
                <Link to={`/productos/${item.product?.slug}`} className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <img src={image} alt={item.product?.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/productos/${item.product?.slug}`} className="font-medium text-sm hover:text-primary-500 line-clamp-2">
                    {item.product?.name}
                  </Link>
                  {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}</p>}
                  <p className="text-lg font-bold mt-2">{formatPrice(item.unitPrice)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button onClick={() => updateItem(item.id, Math.max(0, item.quantity - 1))} className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.itemTotal)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-bold text-lg mb-4">Resumen</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Envío</span>
              <span className="text-gray-500">Calculado en checkout</span>
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary w-full text-center mt-6 block py-3">
            Ir al checkout
          </Link>
          <Link to="/productos" className="block text-center text-sm text-gray-500 hover:text-primary-500 mt-3">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
