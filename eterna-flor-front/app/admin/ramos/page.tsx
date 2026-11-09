'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { TAMANOS, labelTamano } from '@/lib/tamanos';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Icon,
  Input,
  Select,
  Spinner,
} from '@/components/ui';

interface RecetaItem {
  materiaPrimaId: number;
  cantidad: number;
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
  const [formError, setFormError] = useState('');
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

  const resetForm = useCallback(() => {
    setForm({ nombre: '', tamano: 'Mediano', precioVenta: '', stock: '0' });
    setRecetas([]);
    setFoto(null);
    setPreview(null);
    setFormError('');
    setShowForm(false);
    setEditingId(null);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!showForm) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') resetForm();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showForm, resetForm]);

  async function loadData() {
    try {
      const [ramosData, materiasData] = await Promise.all([
        api.ramos.getAll(),
        api.materiasPrimas.getAll(),
      ]);
      setRamos(ramosData);
      setMaterias(
        materiasData.map((m: { id: number; nombre: string }) => ({
          id: m.id,
          nombre: m.nombre,
        })),
      );
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
      setFormError('Primero crea al menos una materia prima.');
      return;
    }
    setRecetas([...recetas, { materiaPrimaId: materias[0].id, cantidad: 1 }]);
  }

  function updateReceta<K extends keyof RecetaItem>(
    index: number,
    field: K,
    value: RecetaItem[K],
  ) {
    const updated = [...recetas];
    updated[index] = { ...updated[index], [field]: value };
    setRecetas(updated);
  }

  function removeReceta(index: number) {
    setRecetas(recetas.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    const precioVenta = Number.parseFloat(form.precioVenta);
    if (!Number.isFinite(precioVenta) || precioVenta <= 0) {
      setFormError('El precio debe ser un número mayor que cero.');
      return;
    }

    try {
      const data = {
        nombre: form.nombre.trim(),
        tamano: form.tamano,
        precioVenta,
        stock: Number.parseInt(form.stock, 10) || 0,
        recetas: recetas.filter((r) => r.materiaPrimaId && r.cantidad > 0),
      };

      if (editingId) {
        await api.ramos.update(editingId, data, foto || undefined);
      } else {
        await api.ramos.create(data, foto || undefined);
      }

      resetForm();
      loadData();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'No se pudo guardar el ramo.',
      );
    }
  }

  function handleEdit(ramo: Ramo) {
    setForm({
      nombre: ramo.nombre,
      tamano: ramo.tamano,
      precioVenta: String(ramo.precioVenta),
      stock: String(ramo.stock),
    });
    setRecetas(
      ramo.recetas.map((r) => ({
        materiaPrimaId: r.materiaPrima.id,
        cantidad: Number(r.cantidad),
      })),
    );
    setPreview(ramo.fotoUrl);
    setFormError('');
    setEditingId(ramo.id);
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este ramo? La acción no se puede deshacer.')) return;
    try {
      await api.ramos.delete(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner label="Cargando ramos" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {ramos.length === 1
            ? '1 ramo registrado'
            : `${ramos.length} ramos registrados`}
        </p>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Icon name="mas" className="h-4 w-4" />
          Nuevo ramo
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
            aria-labelledby="titulo-formulario-ramo"
            className="my-8 w-full max-w-lg animate-fade-in rounded-lush border border-line bg-surface"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2
                id="titulo-formulario-ramo"
                className="font-display text-lg font-semibold text-ink"
              >
                {editingId ? 'Editar ramo' : 'Nuevo ramo'}
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
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ramo Romantic"
                  autoComplete="off"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Tamaño" name="tamano">
                  <Select
                    value={form.tamano}
                    onChange={(e) => setForm({ ...form, tamano: e.target.value })}
                  >
                    {TAMANOS.map((t) => (
                      <option key={t} value={t}>
                        {labelTamano(t)}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Precio (S/)" name="precioVenta" required>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={form.precioVenta}
                    onChange={(e) =>
                      setForm({ ...form, precioVenta: e.target.value })
                    }
                    placeholder="0,00"
                  />
                </Field>
              </div>

              <Field label="Stock" name="stock">
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                />
              </Field>

              <div className="space-y-1.5">
                <span className="block text-sm font-medium text-ink">Foto</span>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer rounded-tight border border-dashed border-line-strong px-4 py-4 text-center text-sm text-ink-muted transition-colors duration-150 hover:border-blossom hover:text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
                    <input
                      type="file"
                      ref={fileInputRef}
                      name="foto"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="sr-only"
                    />
                    Elegir imagen
                  </label>
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Vista previa de la foto del ramo"
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-tight object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFoto(null);
                          setPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        aria-label="Quitar la imagen seleccionada"
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-surface transition-colors duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      >
                        <Icon name="cerrar" className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">
                    Receta (materias primas)
                  </span>
                  <Button variant="ghost" size="sm" onClick={addReceta}>
                    <Icon name="mas" className="h-3.5 w-3.5" />
                    Agregar
                  </Button>
                </div>

                {recetas.length === 0 ? (
                  <p className="text-sm text-ink-muted">
                    Sin materias primas agregadas.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recetas.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Select
                          aria-label="Materia prima"
                          value={r.materiaPrimaId}
                          onChange={(e) =>
                            updateReceta(i, 'materiaPrimaId', Number.parseInt(e.target.value, 10))
                          }
                          className="flex-1"
                        >
                          {materias.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nombre}
                            </option>
                          ))}
                        </Select>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          inputMode="decimal"
                          aria-label="Cantidad utilizada"
                          value={r.cantidad}
                          onChange={(e) =>
                            updateReceta(i, 'cantidad', Number.parseFloat(e.target.value))
                          }
                          className="w-24"
                        />
                        <button
                          type="button"
                          onClick={() => removeReceta(i)}
                          aria-label="Quitar materia prima de la receta"
                          className="rounded-tight p-2 text-ink-muted transition-colors duration-150 hover:bg-petal hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                        >
                          <Icon name="basura" className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Guardar cambios' : 'Crear ramo'}
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

      {ramos.length === 0 ? (
        <EmptyState
          title="Todavía no hay ramos"
          description="Crea el primero para que aparezca en el catálogo."
          action={
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <Icon name="mas" className="h-4 w-4" />
              Nuevo ramo
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ramos.map((ramo) => (
            <Card key={ramo.id} className="overflow-hidden">
              {ramo.fotoUrl ? (
                <img
                  src={ramo.fotoUrl}
                  alt={`Ramo ${ramo.nombre}`}
                  width={400}
                  height={176}
                  loading="lazy"
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 w-full items-center justify-center bg-petal-deep text-ink-muted">
                  <Icon name="ramos" className="h-8 w-8" />
                </div>
              )}

              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="min-w-0 flex-1 truncate font-display text-base font-semibold text-ink">
                    {ramo.nombre}
                  </h2>
                  <Badge tone="neutral">{labelTamano(ramo.tamano)}</Badge>
                </div>

                <dl className="space-y-1.5 text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-muted">Precio</dt>
                    <dd className="numeric font-semibold text-ink">
                      {money(ramo.precioVenta)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-muted">Costo</dt>
                    <dd className="numeric text-ink-muted">
                      {money(ramo.costoCalculado)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-muted">Margen</dt>
                    <dd
                      className={`numeric font-medium ${
                        ramo.margen > 0 ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {money(ramo.margen)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-muted">Stock</dt>
                    <dd className="numeric flex items-center gap-2">
                      <span
                        className={ramo.alertaStock ? 'text-danger' : 'text-ink'}
                      >
                        {ramo.stock}
                      </span>
                      {ramo.alertaStock ? <Badge tone="danger">Bajo</Badge> : null}
                    </dd>
                  </div>
                </dl>

                {ramo.recetas.length > 0 ? (
                  <div className="border-t border-line pt-3">
                    <p className="mb-2 text-xs font-medium text-ink-muted">
                      Receta
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {ramo.recetas.slice(0, 3).map((r) => (
                        <Badge key={r.id} tone="neutral">
                          {r.materiaPrima.nombre}
                        </Badge>
                      ))}
                      {ramo.recetas.length > 3 ? (
                        <span className="text-xs text-ink-muted">
                          +{ramo.recetas.length - 3}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(ramo)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(ramo.id)}
                    aria-label={`Eliminar ${ramo.nombre}`}
                  >
                    <Icon name="basura" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
