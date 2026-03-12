import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Save, Loader2 } from 'lucide-react';
import { productsApi, categoriesApi } from '@/api/services';
import toast from 'react-hot-toast';

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);

  const { data: product } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => productsApi.adminGetById(id!),
    enabled: isEdit,
  });

  const { data: cats } = useQuery({ queryKey: ['categories-all'], queryFn: () => categoriesApi.getAll({ includeInactive: 'true' }) });
  const categories = (cats as any)?.data || cats || [];

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    if (product) {
      const p = (product as any)?.data || product;
      reset({
        name: p.name, sku: p.sku, shortDesc: p.shortDesc, longDesc: p.longDesc,
        price: p.price, comparePrice: p.comparePrice, costPrice: p.costPrice,
        stock: p.stock, brand: p.brand, status: p.status, isVisible: p.isVisible,
        isFeatured: p.isFeatured, metaTitle: p.metaTitle, metaDesc: p.metaDesc,
        weight: p.weight, tags: p.tags?.join(', '),
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const payload: any = {
        ...data,
        price: parseInt(data.price),
        comparePrice: data.comparePrice ? parseInt(data.comparePrice) : undefined,
        costPrice: data.costPrice ? parseInt(data.costPrice) : undefined,
        stock: parseInt(data.stock || '0'),
        weight: data.weight ? parseFloat(data.weight) : undefined,
        isVisible: data.isVisible === true || data.isVisible === 'true',
        isFeatured: data.isFeatured === true || data.isFeatured === 'true',
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim().toLowerCase()) : [],
        categoryIds: data.categoryId ? [data.categoryId] : [],
        primaryCategoryId: data.categoryId,
      };

      if (isEdit) {
        await productsApi.update(id!, payload);
        toast.success('Producto actualizado');
      } else {
        await productsApi.create(payload);
        toast.success('Producto creado');
      }
      navigate('/admin/productos');
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Información básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="text-sm font-medium mb-1 block">Nombre *</label>
              <input {...register('name', { required: true })} className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">SKU *</label>
              <input {...register('sku', { required: true })} className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Marca</label>
              <input {...register('brand')} className="input-field" /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium mb-1 block">Descripción corta</label>
              <input {...register('shortDesc')} className="input-field" /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium mb-1 block">Descripción larga</label>
              <textarea {...register('longDesc')} rows={4} className="input-field" /></div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Precios y stock</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Precio (CLP) *</label>
              <input {...register('price', { required: true })} type="number" className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Precio anterior</label>
              <input {...register('comparePrice')} type="number" className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Costo</label>
              <input {...register('costPrice')} type="number" className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Stock *</label>
              <input {...register('stock')} type="number" className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Peso (kg)</label>
              <input {...register('weight')} type="number" step="0.01" className="input-field" /></div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Organización</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Categoría</label>
              <select {...register('categoryId')} className="input-field">
                <option value="">Seleccionar...</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Estado</label>
              <select {...register('status')} className="input-field">
                <option value="DRAFT">Borrador</option>
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Tags (separados por coma)</label>
              <input {...register('tags')} className="input-field" placeholder="tecnología, laptop" /></div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input {...register('isVisible')} type="checkbox" className="rounded" /> Visible
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input {...register('isFeatured')} type="checkbox" className="rounded" /> Destacado
            </label>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">SEO</h2>
          <div><label className="text-sm font-medium mb-1 block">Meta título</label>
            <input {...register('metaTitle')} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">Meta descripción</label>
            <textarea {...register('metaDesc')} rows={2} className="input-field" /></div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <button type="button" onClick={() => navigate('/admin/productos')} className="btn-outline">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
