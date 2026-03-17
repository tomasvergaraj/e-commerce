import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import { authApi, usersApi } from '@/api/services';
import toast from 'react-hot-toast';

const PASSWORD_POLICY = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });
  const { register: regPwd, handleSubmit: handlePwd, reset } = useForm();

  const onSaveProfile = async (data: any) => {
    setSaving(true);
    try {
      const res = await usersApi.updateProfile(data);
      const d = (res as any)?.data || res;
      setUser({ ...user!, ...d });
      toast.success('Perfil actualizado');
    } catch {
      toast.error('Error');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Las contrasenas no coinciden');
      return;
    }

    if (!PASSWORD_POLICY.test(data.newPassword)) {
      toast.error('La nueva contrasena debe tener al menos 8 caracteres, una letra y un numero');
      return;
    }

    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Contrasena actualizada');
      reset();
    } catch (e: any) {
      toast.error(e.message || 'Error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h2 className="mb-4 text-xl font-bold">Datos personales</h2>
        <form onSubmit={handleSubmit(onSaveProfile)} className="max-w-md space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input value={user?.email} disabled className="input-field bg-gray-50 dark:bg-gray-800" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nombre</label>
              <input {...register('firstName')} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Apellido</label>
              <input {...register('lastName')} className="input-field" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Telefono</label>
            <input {...register('phone')} className="input-field" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            Guardar cambios
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-xl font-bold">Cambiar contrasena</h2>
        <form onSubmit={handlePwd(onChangePassword)} className="max-w-md space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Contrasena actual</label>
            <input {...regPwd('currentPassword', { required: true })} type="password" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Nueva contrasena</label>
            <input {...regPwd('newPassword', { required: true, minLength: 8 })} type="password" className="input-field" />
            <p className="mt-1 text-xs text-gray-500">
              Usa al menos 8 caracteres, incluyendo una letra y un numero.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Confirmar nueva contrasena</label>
            <input {...regPwd('confirmPassword', { required: true })} type="password" className="input-field" />
          </div>
          <button type="submit" className="btn-primary">
            Cambiar contrasena
          </button>
        </form>
      </div>
    </div>
  );
}
