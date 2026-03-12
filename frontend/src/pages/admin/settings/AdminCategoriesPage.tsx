import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { categoriesApi } from '@/api/services';
import { PageLoader } from '@/components/common/Loading';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: () => categoriesApi.getAll({ includeInactive: 'true' }) });
  const categories = (data as any)?.data || data || [];

  const { register, handleSubmit, reset, setValue } = useForm();

  const createMut = useMutation({
    mutationFn: (d: any) => editId ? categoriesApi.update(editId, d) : categoriesApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setShowForm(false); setEditId(null); reset(); toast.success(editId ? 'Actualizada' : 'Creada'); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Eliminada'); },
  });

  const startEdit = (cat: any) => {
    setEditId(cat.id);
    reset({ name: cat.name, slug: cat.slug, description: cat.description, parentId: cat.parentId || '', isActive: cat.isActive });
    setShowForm(true);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <button onClick={() => { setEditId(null); reset({}); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nueva</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="card p-6 mb-6 space-y-4 max-w-lg">
          <div><label className="text-sm font-medium mb-1 block">Nombre *</label><input {...register('name', { required: true })} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">Slug</label><input {...register('slug')} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">Descripción</label><input {...register('description')} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">Categoría padre</label>
            <select {...register('parentId')} className="input-field"><option value="">Ninguna (raíz)</option>
              {categories.filter((c: any) => !c.parentId && c.id !== editId).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input {...register('isActive')} type="checkbox" defaultChecked /> Activa</label>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editId ? 'Guardar' : 'Crear'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-outline">Cancelar</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nombre</th>
              <th className="text-left px-4 py-3 font-medium">Slug</th>
              <th className="text-left px-4 py-3 font-medium">Padre</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-right px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {categories.map((cat: any) => (
              <tr key={cat.id}>
                <td className="px-4 py-3 font-medium">{cat.parentId ? '└ ' : ''}{cat.name}</td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{cat.slug}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{categories.find((c: any) => c.id === cat.parentId)?.name || '-'}</td>
                <td className="px-4 py-3"><span className={`badge ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{cat.isActive ? 'Activa' : 'Inactiva'}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => startEdit(cat)} className="text-primary-500 hover:underline text-sm mr-3"><Edit size={14} className="inline" /> Editar</button>
                  <button onClick={() => deleteMut.mutate(cat.id)} className="text-red-500 hover:underline text-sm"><Trash2 size={14} className="inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
