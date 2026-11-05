'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { TAMANOS, labelTamano } from '@/lib/tamanos';

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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
        <p className="text-stone-500 text-sm">Cargando...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Ramos</h1>
          <p className="text-stone-500 text-sm mt-1">{ramos.length} productos registrados</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <span>+</span> Nuevo Ramo
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h2 className="text-xl font-semibold text-stone-800">
                {editingId ? 'Editar' : 'Nuevo'} Ramo
              </h2>
              <button
                onClick={resetForm}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Ramo Romantic"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Tamaño</label>
                  <select
                    value={form.tamano}
                    onChange={(e) => setForm({ ...form, tamano: e.target.value })}
                    className="input-field"
                  >
                    {TAMANOS.map((t) => (
                      <option key={t} value={t}>{labelTamano(t)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Precio (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precioVenta}
                    onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Foto</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 text-center hover:border-rose-400 hover:bg-rose-50 transition-colors">
                      <span className="text-stone-500 text-sm">📷 Subir imagen</span>
                    </div>
                  </label>
                  {preview && (
                    <div className="relative">
                      <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => { setFoto(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-stone-700">Receta (Materias Primas)</label>
                  <button
                    type="button"
                    onClick={addReceta}
                    className="text-rose-600 text-sm font-medium hover:text-rose-700"
                  >
                    + Agregar
                  </button>
                </div>
                {recetas.length === 0 ? (
                  <p className="text-stone-400 text-sm italic">Sin materias primas agregadas</p>
                ) : (
                  <div className="space-y-2">
                    {recetas.map((r, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <select
                          value={r.materiaPrimaId}
                          onChange={(e) => updateReceta(i, 'materiaPrimaId', parseInt(e.target.value))}
                          className="flex-1 input-field text-sm"
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
                          className="w-24 input-field text-sm"
                          placeholder="Cant"
                        />
                        <button
                          type="button"
                          onClick={() => removeReceta(i)}
                          className="text-stone-400 hover:text-red-500 p-2"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {ramos.map((ramo) => (
          <div key={ramo.id} className="card card-hover overflow-hidden group">
            <div className="relative">
              {ramo.fotoUrl ? (
                <img src={ramo.fotoUrl} alt={ramo.nombre} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-44 bg-stone-100 flex items-center justify-center text-stone-400">
                  <span className="text-4xl">🌸</span>
                </div>
              )}
              <span className="absolute top-3 right-3 text-xs bg-white/90 backdrop-blur text-stone-700 px-2.5 py-1 rounded-full font-medium">
                {labelTamano(ramo.tamano)}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-stone-800 mb-3">{ramo.nombre}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Precio</span>
                  <span className="font-semibold text-stone-800">S/ {ramo.precioVenta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Costo</span>
                  <span className="text-stone-600">S/ {ramo.costoCalculado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Margen</span>
                  <span className={ramo.margen > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    S/ {ramo.margen.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Stock</span>
                  <span className={`font-medium ${ramo.alertaStock ? 'text-red-600' : 'text-stone-700'}`}>
                    {ramo.stock} {ramo.alertaStock && '⚠️'}
                  </span>
                </div>
              </div>
              {ramo.recetas.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <p className="text-xs text-stone-400 mb-2">Receta</p>
                  <div className="flex flex-wrap gap-1">
                    {ramo.recetas.slice(0, 3).map((r, i) => (
                      <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                        {r.materiaPrima.nombre}
                      </span>
                    ))}
                    {ramo.recetas.length > 3 && (
                      <span className="text-xs text-stone-400">+{ramo.recetas.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(ramo)}
                  className="flex-1 text-sm py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(ramo.id)}
                  className="flex-1 text-sm py-2 rounded-lg border border-stone-200 text-stone-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
        {ramos.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-stone-400">
            <span className="text-5xl mb-4">🌺</span>
            <p className="text-lg">No hay ramos registrados</p>
            <p className="text-sm mt-1">Crea tu primer ramo floral</p>
          </div>
        )}
      </div>
    </div>
  );
}