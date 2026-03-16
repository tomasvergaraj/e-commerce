import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { CreditCard, Truck, ChevronLeft, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { ordersApi, shippingApi, paymentsApi, usersApi } from '@/api/services';
import { formatPrice, resolveAssetUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      guestEmail: '',
      guestFirstName: '',
      guestLastName: '',
      guestPhone: '',
      shippingStreet: '',
      shippingNumber: '',
      shippingApartment: '',
      shippingCommune: '',
      shippingCity: '',
      shippingRegion: 'Metropolitana',
    },
  });

  const { data: shippingMethods } = useQuery({
    queryKey: ['shipping-methods'],
    queryFn: () => shippingApi.getMethods(),
  });

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => usersApi.getAddresses(),
    enabled: isAuthenticated,
  });

  const methods = (shippingMethods as any)?.data || shippingMethods || [];
  const addrList = (addresses as any)?.data || addresses || [];
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const shippingCost = selectedShipping?.price || 0;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
        <Link to="/productos" className="btn-primary">Ver productos</Link>
      </div>
    );
  }

  const onSubmit = async (formData: any) => {
    if (isAuthenticated && addrList.length > 0 && !selectedAddress) {
      const message = 'Selecciona una dirección guardada para continuar';
      setCheckoutError(message);
      toast.error(message);
      return;
    }

    if (!selectedShipping) {
      const message = 'Selecciona un método de envío';
      setCheckoutError(message);
      toast.error(message);
      return;
    }

    setSubmitting(true);
    setCheckoutError('');
    try {
      const orderData: any = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || undefined,
          quantity: i.quantity,
        })),
        shippingMethodId: selectedShipping.id,
        paymentMethod: 'MOCK_GATEWAY',
      };

      if (isAuthenticated && selectedAddress) {
        orderData.addressId = selectedAddress;
      } else {
        orderData.guestEmail = formData.guestEmail || user?.email;
        orderData.guestFirstName = formData.guestFirstName || user?.firstName;
        orderData.guestLastName = formData.guestLastName || user?.lastName;
        orderData.guestPhone = formData.guestPhone;
        orderData.shippingStreet = formData.shippingStreet;
        orderData.shippingNumber = formData.shippingNumber;
        orderData.shippingApartment = formData.shippingApartment;
        orderData.shippingCommune = formData.shippingCommune;
        orderData.shippingCity = formData.shippingCity;
        orderData.shippingRegion = formData.shippingRegion;
      }

      const res = await ordersApi.checkout(orderData);
      const order = (res as any)?.data || res;

      // Process payment via mock gateway
      try {
        await paymentsApi.process(order.id);
      } catch {}

      await clearCart();
      navigate(`/pedido-confirmado/${order.orderNumber}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/carrito" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <ChevronLeft size={16} /> Volver al carrito
      </Link>
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid gap-3 sm:grid-cols-3 mb-8">
        {[
          { title: '1. Carrito', description: 'Revisa tus productos', active: true },
          { title: '2. Datos y envío', description: 'Completa tu información', active: true },
          { title: '3. Confirmación', description: 'Pago y cierre de compra', active: false },
        ].map((step) => (
          <div
            key={step.title}
            className={`rounded-2xl border px-4 py-4 ${
              step.active
                ? 'border-primary-200 bg-primary-50 dark:border-primary-900/60 dark:bg-primary-950/40'
                : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
            }`}
          >
            <p className="text-sm font-semibold">{step.title}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {[
          { title: 'Compra protegida', description: 'Tus datos y tu pedido se procesan con confirmación inmediata.', Icon: ShieldCheck },
          { title: 'Despacho claro', description: 'Elige el método de envío y revisa el costo antes de pagar.', Icon: Truck },
          { title: 'Cierre simple', description: 'Resumen visible, totales claros y pasos fáciles de seguir.', Icon: CheckCircle2 },
        ].map(({ title, description, Icon }) => (
          <div key={title} className="rounded-2xl border border-gray-200/80 bg-white px-5 py-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Icon size={20} className="text-primary-500" />
            <p className="mt-3 font-semibold">{title}</p>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-8">
            {/* Customer info */}
            {!isAuthenticated && (
              <div className="card p-6">
                <h2 className="font-bold text-lg mb-4">Información de contacto</h2>
                <p className="text-sm text-gray-500 mb-4">
                  ¿Ya tienes cuenta? <Link to="/login" className="text-primary-500 hover:underline">Inicia sesión</Link>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email *</label>
                    <input {...register('guestEmail', { required: true })} type="email" className="input-field" placeholder="tu@email.com" />
                    {errors.guestEmail && <p className="mt-1 text-xs text-red-500">Ingresa un email válido para continuar.</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Teléfono</label>
                    <input {...register('guestPhone')} className="input-field" placeholder="+56 9 1234 5678" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nombre *</label>
                    <input {...register('guestFirstName', { required: true })} className="input-field" />
                    {errors.guestFirstName && <p className="mt-1 text-xs text-red-500">Completa tu nombre.</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Apellido *</label>
                    <input {...register('guestLastName', { required: true })} className="input-field" />
                    {errors.guestLastName && <p className="mt-1 text-xs text-red-500">Completa tu apellido.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">Dirección de envío</h2>
              {isAuthenticated && addrList.length > 0 ? (
                <div className="space-y-3">
                  {addrList.map((addr: any) => (
                    <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedAddress === addr.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700'
                    }`}>
                      <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id}
                        onChange={() => {
                          setSelectedAddress(addr.id);
                          setCheckoutError('');
                        }} className="mt-1" />
                      <div>
                        <p className="font-medium text-sm">{addr.label || 'Dirección'}</p>
                        <p className="text-sm text-gray-500">{addr.street} {addr.number} {addr.apartment}, {addr.commune}, {addr.city}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">Calle *</label>
                    <input {...register('shippingStreet', { required: true })} className="input-field" />
                    {errors.shippingStreet && <p className="mt-1 text-xs text-red-500">Ingresa la calle de despacho.</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Número</label>
                    <input {...register('shippingNumber')} className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Depto/Oficina</label>
                    <input {...register('shippingApartment')} className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Comuna *</label>
                    <input {...register('shippingCommune', { required: true })} className="input-field" />
                    {errors.shippingCommune && <p className="mt-1 text-xs text-red-500">Ingresa la comuna.</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ciudad *</label>
                    <input {...register('shippingCity', { required: true })} className="input-field" />
                    {errors.shippingCity && <p className="mt-1 text-xs text-red-500">Ingresa la ciudad.</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Región</label>
                    <input {...register('shippingRegion')} className="input-field" />
                  </div>
                </div>
              )}
            </div>

            {/* Shipping method */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Truck size={20} /> Método de envío</h2>
              <div className="space-y-3">
                {methods.map((method: any) => (
                  <label key={method.id} className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedShipping?.id === method.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shipping" checked={selectedShipping?.id === method.id}
                        onChange={() => {
                          setSelectedShipping(method);
                          setCheckoutError('');
                        }} />
                      <div>
                        <p className="font-medium text-sm">{method.name}</p>
                        <p className="text-xs text-gray-500">{method.description} · {method.minDays}-{method.maxDays} días</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">{formatPrice(method.price)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard size={20} /> Método de pago</h2>
              <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-900/60 dark:bg-primary-950/40">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" checked readOnly />
                  <div>
                    <p className="font-medium text-sm">Pago en línea</p>
                    <p className="text-xs text-gray-500">Tarjeta de crédito/débito</p>
                  </div>
                </label>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Visa', 'Mastercard', 'Débito', 'Transferencia'].map((method) => (
                    <span key={method} className="inline-flex rounded-full border border-primary-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 dark:border-primary-900/60 dark:bg-gray-900 dark:text-gray-200">
                      {method}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  Tu pedido se confirma al instante y verás el total final antes de terminar la compra.
                </p>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="card p-6 h-fit sticky top-24">
            <h2 className="font-bold text-lg mb-4">Resumen del pedido</h2>
            {checkoutError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {checkoutError}
              </div>
            )}
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={resolveAssetUrl(item.product?.images?.[0]?.url) || 'https://placehold.co/100x100'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                    {item.variant && <p className="text-xs text-gray-500">{item.variant.name}</p>}
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.itemTotal)}</p>
                </div>
              ))}
            </div>
            <hr className="border-gray-200 dark:border-gray-700 mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Envío</span><span>{selectedShipping ? formatPrice(shippingCost) : '-'}</span></div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <div className="mt-5 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-600 dark:bg-gray-950 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary-500" />
                <p>Compra protegida, resumen claro y soporte visible durante el proceso.</p>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 size={18} className="animate-spin" /> Procesando...</> : 'Confirmar pedido'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
