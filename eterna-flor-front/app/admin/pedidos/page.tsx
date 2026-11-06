'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { labelTamano } from '@/lib/tamanos';
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

interface PedidoItem {
  id: number;
  cantidad: number;
  precioUnitario: number;
  ramo: { id: number; nombre: string; tamano: string };
}

interface Pedido {
  id: number;
  clienteNombre: string;
  clienteWhatsapp: string;
  estado: string;
  metodoPago: string | null;
  montoTotal: number;
  fechaEntrega: string | null;
  createdAt: string;
  pedidoItems: PedidoItem[];
}

interface RamoOption {
  id: number;
  nombre: string;
  stock: number;
}

const ESTADOS = ['Pendiente', 'EnPreparacion', 'Entregado', 'Pagado'];

const ESTADO_LABELS: Record<string, string> = {
  Pendiente: 'Pendiente',
  EnPreparacion: 'En Preparación',
  Entregado: 'Entregado',
  Pagado: 'Pagado',
};

function toneForEstado(estado: string) {
  switch (estado) {
    case 'Pendiente':
      return 'warning' as const;
    case 'EnPreparacion':
      return 'neutral' as const;
    case 'Entregado':
      return 'success' as const;
    case 'Pagado':
      return 'accent' as const;
    default:
      return 'neutral' as const;
  }
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [ramos, setRamos] = useState<RamoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clienteNombre: '',
    clienteWhatsapp: '',
    metodoPago: '',
    fechaEntrega: '',
  });
  const [items, setItems] = useState<Array<{ ramoId: number; cantidad: number }>>(
    [],
  );
  const [filtroEstado, setFiltroEstado] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setForm({
      clienteNombre: '',
      clienteWhatsapp: '',
      metodoPago: '',
      fechaEntrega: '',
    });
    setItems([]);
    setShowForm(false);
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

  useEffect(() => {
    if (showForm) {
      dialogRef.current?.focus();
    }
  }, [showForm]);

  async function loadData() {
    try {
      setLoading(true);
      const [pedidosData, ramosData] = await Promise.all([
        api.pedidos.getAll(),
        api.ramos.getAll(),
      ]);
      setPedidos(pedidosData);
      setRamos(
        ramosData.map((r: { id: number; nombre: string; stock: number }) => ({
          id: r.id,
          nombre: r.nombre,
          stock: r.stock,
        })),
      );
    } catch (err) {
      console.error(err);
      setPedidos([]);
      setRamos([]);
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    if (ramos.length === 0) {
      alert('Primero crea algunos ramos');
      return;
    }
    setItems([...items, { ramoId: ramos[0].id, cantidad: 1 }]);
  }

  function updateItem(
    index: number,
    field: keyof (typeof items)[number],
    value: string,
  ) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: Number(value) };
    setItems(updated);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.pedidos.create({
        clienteNombre: form.clienteNombre,
        clienteWhatsapp: form.clienteWhatsapp,
        metodoPago: form.metodoPago || null,
        fechaEntrega: form.fechaEntrega || null,
        items,
      });

      setForm({
        clienteNombre: '',
        clienteWhatsapp: '',
        metodoPago: '',
        fechaEntrega: '',
      });
      setItems([]);
      setShowForm(false);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  }

  async function cambiarEstado(pedidoId: number, nuevoEstado: string) {
    try {
      await api.pedidos.update(pedidoId, { estado: nuevoEstado });
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  }

  async function eliminarPedido(pedidoId: number) {
    if (!confirm('¿Eliminar este pedido? Se restaurará el stock.')) return;
    try {
      await api.pedidos.delete(pedidoId);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  }

  const pedidosFiltrados = filtroEstado
    ? pedidos.filter((p) => p.estado === filtroEstado)
    : pedidos;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner label="Cargando pedidos" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {pedidos.length === 1
            ? '1 pedido registrado'
            : `${pedidos.length} pedidos registrados`}
        </p>
        <div className="flex items-center gap-3">
          <Select
            aria-label="Filtrar por estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABELS[e]}
              </option>
            ))}
          </Select>
          <Button onClick={() => setShowForm(true)}>
            <Icon name="mas" className="h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>
      </div>

      {showForm ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-ink/40 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetForm();
          }}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-formulario-pedido"
            className="my-8 w-full max-w-lg animate-fade-in rounded-lush border border-line bg-surface"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2
                id="titulo-formulario-pedido"
                className="font-display text-lg font-semibold text-ink"
              >
                Nuevo Pedido
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
              <Field label="Nombre del cliente" name="clienteNombre" required>
                <Input
                  type="text"
                  value={form.clienteNombre}
                  onChange={(e) =>
                    setForm({ ...form, clienteNombre: e.target.value })
                  }
                />
              </Field>

              <Field label="WhatsApp" name="clienteWhatsapp" required>
                <Input
                  type="text"
                  value={form.clienteWhatsapp}
                  onChange={(e) =>
                    setForm({ ...form, clienteWhatsapp: e.target.value })
                  }
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Método de pago" name="metodoPago">
                  <Select
                    value={form.metodoPago}
                    onChange={(e) =>
                      setForm({ ...form, metodoPago: e.target.value })
                    }
                  >
                    <option value="">Seleccionar</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Yape">Yape</option>
                    <option value="Plin">Plin</option>
                  </Select>
                </Field>

                <Field label="Fecha de entrega" name="fechaEntrega">
                  <Input
                    type="date"
                    value={form.fechaEntrega}
                    onChange={(e) =>
                      setForm({ ...form, fechaEntrega: e.target.value })
                    }
                  />
                </Field>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">Ramos</span>
                  <Button variant="ghost" size="sm" onClick={addItem}>
                    <Icon name="mas" className="h-3.5 w-3.5" />
                    Agregar ramo
                  </Button>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Select
                      aria-label="Ramo"
                      value={item.ramoId}
                      onChange={(e) =>
                        updateItem(i, 'ramoId', e.target.value)
                      }
                      className="flex-1"
                    >
                      {ramos.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre} (Stock: {r.stock})
                        </option>
                      ))}
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      aria-label="Cantidad"
                      value={item.cantidad}
                      onChange={(e) =>
                        updateItem(i, 'cantidad', e.target.value)
                      }
                      className="w-24"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      aria-label="Quitar ramo"
                      className="rounded-tight p-2 text-ink-muted transition-colors duration-150 hover:bg-petal hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      <Icon name="cerrar" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  Crear Pedido
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

      {pedidosFiltrados.length === 0 ? (
        <EmptyState title="No hay pedidos registrados" />
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido) => (
            <Card key={pedido.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-base font-semibold text-ink">
                    {pedido.clienteNombre}
                  </h2>
                  <p className="text-sm text-ink-muted">
                    {pedido.clienteWhatsapp}
                  </p>
                </div>
                <Badge tone={toneForEstado(pedido.estado)}>
                  {ESTADO_LABELS[pedido.estado]}
                </Badge>
              </div>

              <div className="my-4 border-t border-line pt-4">
                <p className="mb-2 text-sm font-medium text-ink">Items:</p>
                <div className="space-y-1">
                  {pedido.pedidoItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-baseline justify-between gap-2 text-sm"
                    >
                      <span className="text-ink-muted">
                        {item.ramo.nombre} ({labelTamano(item.ramo.tamano)}) ×{' '}
                        {item.cantidad}
                      </span>
                      <span className="numeric text-ink">
                        {money(item.precioUnitario * item.cantidad)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
                <div className="font-display text-lg font-semibold text-ink">
                  Total: {money(pedido.montoTotal)}
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    aria-label={`Estado del pedido de ${pedido.clienteNombre}`}
                    value={pedido.estado}
                    onChange={(e) =>
                      cambiarEstado(pedido.id, e.target.value)
                    }
                    className="text-sm"
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {ESTADO_LABELS[e]}
                      </option>
                    ))}
                  </Select>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => eliminarPedido(pedido.id)}
                  >
                    Eliminar
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
