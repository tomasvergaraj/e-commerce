import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { usersApi } from '@/api/services';
import { PageLoader } from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AddressesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['addresses'], queryFn: () => usersApi.getAddresses() });
  const addresses = (data as any)?.data || data || [];

  const { register, handleSubmit, reset } = useForm();
  const createMut = useMutation({
    mutationFn: (d: any) => usersApi.createAddress(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); setShowForm(false); reset(); toast.success('Dirección agregada'); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => usersApi.deleteAddress(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Dirección eliminada'); },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Direcciones</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Nueva dirección
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Etiqueta</label><input {...register('label')} className="input-field" placeholder="Casa, Oficina" /></div>
            <div><label className="text-sm font-medium mb-1 block">Nombre</label><input {...register('firstName', { required: true })} className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Apellido</label><input {...register('lastName', { required: true })} className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Teléfono</label><input {...register('phone')} className="input-field" /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium mb-1 block">Calle</label><input {...register('street', { required: true })} className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Número</label><input {...register('number')} className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Depto</label><input {...register('apartment')} className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Comuna</label><input {...register('commune', { required: true })} className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Ciudad</label><input {...register('city', { required: true })} className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Región</label><input {...register('region', { required: true })} className="input-field" defaultValue="Metropolitana" /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn-primary">Guardar</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancelar</button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <EmptyState icon={<MapPin size={48} />} title="Sin direcciones" description="Agrega una dirección de envío" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr: any) => (
            <div key={addr.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{addr.label || 'Dirección'} {addr.isDefault && <span className="badge bg-primary-100 text-primary-700 ml-2">Principal</span>}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {addr.firstName} {addr.lastName}<br />
                    {addr.street} {addr.number} {addr.apartment && `, ${addr.apartment}`}<br />
                    {addr.commune}, {addr.city}, {addr.region}
                  </p>
                </div>
                <button onClick={() => deleteMut.mutate(addr.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
