import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/api/services';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const PASSWORD_POLICY = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Las contrasenas no coinciden');
      return;
    }

    if (!PASSWORD_POLICY.test(data.password)) {
      toast.error('La contrasena debe tener al menos 8 caracteres, una letra y un numero');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      const d = (res as any)?.data || res;
      setAuth(d.token, d.user);
      toast.success('Cuenta creada exitosamente');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">Crear cuenta</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nombre *</label>
              <input {...register('firstName', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Apellido *</label>
              <input {...register('lastName', { required: true })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email *</label>
            <input {...register('email', { required: true })} type="email" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Telefono</label>
            <input {...register('phone')} className="input-field" placeholder="+56 9 1234 5678" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Contrasena *</label>
            <input
              {...register('password', { required: true, minLength: 8 })}
              type="password"
              className="input-field"
            />
            <p className="mt-1 text-xs text-gray-500">
              Usa al menos 8 caracteres, incluyendo una letra y un numero.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Confirmar contrasena *</label>
            <input {...register('confirmPassword', { required: true })} type="password" className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 py-3">
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            Crear cuenta
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-primary-500 hover:underline">
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
