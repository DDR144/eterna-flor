'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Icon,
  Input,
  Spinner,
} from '@/components/ui';

interface MateriaPrima {
  id: number;
  nombre: string;
  unidad: string;
  stockActual: number;
  costoUnitario: number;
  stockMinimoAlerta: number;
  alertaStock: boolean;
}

const emptyForm = {
  nombre: '',
  unidad: '',
  stockActual: '',
  costoUnitario: '',
  stockMinimoAlerta: '5',
};

export default function MateriasPrimasPage() {
  const [materias, setMaterias] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(emptyForm);

  const resetForm = useCallback(() => {
    setForm(emptyForm);
    setFormError('');
    setShowForm(false);
    setEditingId(null);
  }, []);

  useEffect(() => {
    loadMaterias();
  }, []);

  useEffect(() => {
    if (!showForm) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') resetForm();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showForm, resetForm]);

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
    setFormError('');

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

      resetForm();
      loadMaterias();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'No se pudo guardar la materia prima.',
      );
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
    setFormError('');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner label="Cargando materias primas" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {materias.length === 1
            ? '1 materia prima registrada'
            : `${materias.length} materias primas registradas`}
        </p>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Icon name="mas" className="h-4 w-4" />
          Nueva Materia Prima
        </Button>
      </div>

      {showForm ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-ink/40 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetForm();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-formulario-materia"
            className="my-8 w-full max-w-lg animate-fade-in rounded-lush border border-line bg-surface"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2
                id="titulo-formulario-materia"
                className="font-display text-lg font-semibold text-ink"
              >
                {editingId ? 'Editar' : 'Nueva'} Materia Prima
              </h2>
              <button
                type="button"
                onClick={resetForm}
                aria-label="Cerrar formulario"
                className="rounded-tight p-1.5 text-ink-muted transition-colors duration-150 hover:bg-petal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <Icon name="cerrar" className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
              {formError ? (
                <p
                  role="alert"
                  className="rounded-tight border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger"
                >
                  {formError}
                </p>
              ) : null}

              <Field label="Nombre" name="nombre" required>
                <Input
                  type="text"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({ ...form, nombre: e.target.value })
                  }
                />
              </Field>

              <Field label="Unidad" name="unidad" required>
                <Input
                  type="text"
                  value={form.unidad}
                  onChange={(e) =>
                    setForm({ ...form, unidad: e.target.value })
                  }
                  placeholder="ej: metros, unidades, rollos"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Stock Actual" name="stockActual" required>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={form.stockActual}
                    onChange={(e) =>
                      setForm({ ...form, stockActual: e.target.value })
                    }
                  />
                </Field>

                <Field
                  label="Costo Unitario (S/)"
                  name="costoUnitario"
                  required
                >
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={form.costoUnitario}
                    onChange={(e) =>
                      setForm({ ...form, costoUnitario: e.target.value })
                    }
                  />
                </Field>
              </div>

              <Field
                label="Stock Mínimo de Alerta"
                name="stockMinimoAlerta"
              >
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={form.stockMinimoAlerta}
                  onChange={(e) =>
                    setForm({ ...form, stockMinimoAlerta: e.target.value })
                  }
                />
              </Field>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Actualizar' : 'Crear'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {materias.length === 0 ? (
        <EmptyState
          title="No hay materias primas registradas"
          action={
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <Icon name="mas" className="h-4 w-4" />
              Nueva Materia Prima
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-petal">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold text-ink-muted"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold text-ink-muted"
                  >
                    Unidad
                  </th>
                  <th
                    scope="col"
                    className="numeric px-4 py-3 text-right text-sm font-semibold text-ink-muted"
                  >
                    Stock
                  </th>
                  <th
                    scope="col"
                    className="numeric px-4 py-3 text-right text-sm font-semibold text-ink-muted"
                  >
                    Costo Unit.
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold text-ink-muted"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-sm font-semibold text-ink-muted"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {materias.map((m) => (
                  <tr
                    key={m.id}
                    className="transition-colors duration-150 hover:bg-petal"
                  >
                    <td className="px-4 py-3 text-sm text-ink">{m.nombre}</td>
                    <td className="px-4 py-3 text-sm text-ink-muted">
                      {m.unidad}
                    </td>
                    <td className="numeric px-4 py-3 text-right text-sm font-medium text-ink">
                      {m.stockActual}
                    </td>
                    <td className="numeric px-4 py-3 text-right text-sm text-ink-muted">
                      {money(m.costoUnitario)}
                    </td>
                    <td className="px-4 py-3">
                      {m.alertaStock ? (
                        <Badge tone="danger">Stock bajo</Badge>
                      ) : (
                        <Badge tone="success">Normal</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(m)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(m.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
