'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface MateriaPrima {
  id: number;
  nombre: string;
  unidad: string;
  stockActual: number;
  costoUnitario: number;
  stockMinimoAlerta: number;
  alertaStock: boolean;
}

export default function MateriasPrimasPage() {
  const [materias, setMaterias] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    unidad: '',
    stockActual: '',
    costoUnitario: '',
    stockMinimoAlerta: '5',
  });

  useEffect(() => {
    loadMaterias();
  }, []);

  async function loadMaterias() {
    try {
      const data = await api.materiasPrimas.getAll();
      setMaterias(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = {
        nombre: form.nombre,
        unidad: form.unidad,
        stockActual: parseFloat(form.stockActual),
        costoUnitario: parseFloat(form.costoUnitario),
        stockMinimoAlerta: parseInt(form.stockMinimoAlerta),
      };

      if (editingId) {
        await api.materiasPrimas.update(editingId, data);
      } else {
        await api.materiasPrimas.create(data);
      }

      setForm({ nombre: '', unidad: '', stockActual: '', costoUnitario: '', stockMinimoAlerta: '5' });
      setShowForm(false);
      setEditingId(null);
      loadMaterias();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  }

  function handleEdit(materia: MateriaPrima) {
    setForm({
      nombre: materia.nombre,
      unidad: materia.unidad,
      stockActual: String(materia.stockActual),
      costoUnitario: String(materia.costoUnitario),
      stockMinimoAlerta: String(materia.stockMinimoAlerta),
    });
    setEditingId(materia.id);
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta materia prima?')) return;
    try {
      await api.materiasPrimas.delete(id);
      loadMaterias();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  }

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Materias Primas</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ nombre: '', unidad: '', stockActual: '', costoUnitario: '', stockMinimoAlerta: '5' }); }}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700"
        >
          + Nueva Materia Prima
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editar' : 'Nueva'} Materia Prima
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                <input
                  type="text"
                  value={form.unidad}
                  onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                  placeholder="ej: metros, unidades, rollos"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.stockActual}
                    onChange={(e) => setForm({ ...form, stockActual: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Unitario (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.costoUnitario}
                    onChange={(e) => setForm({ ...form, costoUnitario: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo de Alerta</label>
                <input
                  type="number"
                  value={form.stockMinimoAlerta}
                  onChange={(e) => setForm({ ...form, stockMinimoAlerta: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
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
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Unidad</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Costo Unit.</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {materias.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{m.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{m.unidad}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{m.stockActual}</td>
                  <td className="px-4 py-3 text-gray-600">S/ {m.costoUnitario.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {m.alertaStock ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Stock bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(m)}
                      className="text-rose-600 hover:text-rose-800 text-sm mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {materias.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay materias primas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}