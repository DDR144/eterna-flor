'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';

interface RecetaItem {
  materiaPrimaId: number;
  cantidad: number;
  nombre?: string;
}

interface Ramo {
  id: number;
  nombre: string;
  tamano: string;
  fotoUrl: string | null;
  precioVenta: number;
  costoCalculado: number;
  stock: number;
  margen: number;
  alertaStock: boolean;
  recetas: Array<{
    id: number;
    cantidad: number;
    materiaPrima: { id: number; nombre: string };
  }>;
}

const TAMANOS = ['Pequeño', 'Mediano', 'Grande', 'Jumbo'];

export default function RamosPage() {
  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [materias, setMaterias] = useState<Array<{ id: number; nombre: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    tamano: 'Mediano' as string,
    precioVenta: '',
    stock: '0',
  });
  const [recetas, setRecetas] = useState<RecetaItem[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ramosData, materiasData] = await Promise.all([
        api.ramos.getAll(),
        api.materiasPrimas.getAll(),
      ]);
      setRamos(ramosData);
      setMaterias(materiasData.map((m: any) => ({ id: m.id, nombre: m.nombre })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  function addReceta() {
    if (materias.length === 0) {
      alert('Primero crea materias primas');
      return;
    }
    setRecetas([...recetas, { materiaPrimaId: materias[0].id, cantidad: 1 }]);
  }

  function updateReceta(index: number, field: string, value: any) {
    const updated = [...recetas];
    (updated[index] as any)[field] = value;
    setRecetas(updated);
  }

  function removeReceta(index: number) {
    setRecetas(recetas.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = {
        nombre: form.nombre,
        tamano: form.tamano,
        precioVenta: parseFloat(form.precioVenta),
        stock: parseInt(form.stock),
        recetas: recetas.filter(r => r.materiaPrimaId && r.cantidad > 0),
      };

      if (editingId) {
        await api.ramos.update(editingId, data, foto || undefined);
      } else {
        await api.ramos.create(data, foto || undefined);
      }

      resetForm();
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  }

  function resetForm() {
    setForm({ nombre: '', tamano: 'Mediano', precioVenta: '', stock: '0' });
    setRecetas([]);
    setFoto(null);
    setPreview(null);
    setShowForm(false);
    setEditingId(null);
  }

  function handleEdit(ramo: Ramo) {
    setForm({
      nombre: ramo.nombre,
      tamano: ramo.tamano,
      precioVenta: String(ramo.precioVenta),
      stock: String(ramo.stock),
    });
    setRecetas(ramo.recetas.map(r => ({
      materiaPrimaId: r.materiaPrima.id,
      cantidad: Number(r.cantidad),
      nombre: r.materiaPrima.nombre,
    })));
    setPreview(ramo.fotoUrl);
    setEditingId(ramo.id);
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este ramo?')) return;
    try {
      await api.ramos.delete(id);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  }

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ramos</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700"
        >
          + Nuevo Ramo
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg my-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editar' : 'Nuevo'} Ramo
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
                  <select
                    value={form.tamano}
                    onChange={(e) => setForm({ ...form, tamano: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {TAMANOS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precioVenta}
                    onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {preview && (
                  <div className="mt-2 relative inline-block">
                    <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => { setFoto(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Receta (Materias Primas)</label>
                  <button
                    type="button"
                    onClick={addReceta}
                    className="text-rose-600 text-sm hover:underline"
                  >
                    + Agregar materia
                  </button>
                </div>
                {recetas.map((r, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select
                      value={r.materiaPrimaId}
                      onChange={(e) => updateReceta(i, 'materiaPrimaId', parseInt(e.target.value))}
                      className="flex-1 px-2 py-2 border rounded-lg text-sm"
                    >
                      {materias.map((m) => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      value={r.cantidad}
                      onChange={(e) => updateReceta(i, 'cantidad', parseFloat(e.target.value))}
                      className="w-24 px-2 py-2 border rounded-lg text-sm"
                      placeholder="Cant."
                    />
                    <button
                      type="button"
                      onClick={() => removeReceta(i)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {recetas.length > 0 && (
                  <p className="text-xs text-gray-500">
                    El costo se calculará automáticamente basado en las materias primas
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ramos.map((ramo) => (
          <div key={ramo.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {ramo.fotoUrl ? (
              <img src={ramo.fotoUrl} alt={ramo.nombre} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                Sin foto
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{ramo.nombre}</h3>
                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                  {ramo.tamano}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio:</span>
                  <span className="font-medium">S/ {ramo.precioVenta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Costo:</span>
                  <span className="text-gray-600">S/ {ramo.costoCalculado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Margen:</span>
                  <span className={ramo.margen > 0 ? 'text-green-600' : 'text-red-600'}>
                    S/ {ramo.margen.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stock:</span>
                  <span className={ramo.alertaStock ? 'text-red-600 font-medium' : ''}>
                    {ramo.stock} {ramo.alertaStock && '⚠️'}
                  </span>
                </div>
              </div>
              {ramo.recetas.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500 mb-1">Receta:</p>
                  <div className="flex flex-wrap gap-1">
                    {ramo.recetas.map((r, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {r.materiaPrima.nombre}: {Number(r.cantidad)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(ramo)}
                  className="flex-1 text-rose-600 hover:bg-rose-50 py-2 rounded-lg text-sm border border-rose-200"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(ramo.id)}
                  className="flex-1 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm border border-red-200"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
        {ramos.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No hay ramos registrados
          </div>
        )}
      </div>
    </div>
  );
}