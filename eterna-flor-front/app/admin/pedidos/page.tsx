'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { labelTamano } from '@/lib/tamanos';
import {
  Button,
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


/** El color del estado, reutilizado por el selector que lo cambia en línea. */
const ESTADO_PILL: Record<string, string> = {
  Pendiente: 'border-warning/30 bg-warning/15 text-warning',
  EnPreparacion: 'border-line-strong bg-petal-deep text-ink',
  Entregado: 'border-success/30 bg-success/15 text-success',
  Pagado: 'border-blossom bg-blossom text-ink',
};

/** Día local en formato YYYY-MM-DD. La agenda agrupa por día, no por instante. */
function diaLocal(fecha: string | null): string | null {
  if (!fecha) return null;
  const soloFecha = fecha.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(soloFecha) ? soloFecha : null;
}

function claveHoy(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

const FORMATO_MES = new Intl.DateTimeFormat('es-PE', { month: 'short' });
const FORMATO_DIA = new Intl.DateTimeFormat('es-PE', { weekday: 'short' });

/**
 * Abreviatura de tres letras en mayúsculas: "Dic." -> "DIC", "mié" -> "MIÉ".
 * Se quita el punto final y se recorta por si el locale devuelve cuatro
 * letras. Los acentos se conservan porque en español MIÉ y SÁB los llevan.
 */
function abreviatura(formato: Intl.DateTimeFormat, fecha: Date): string {
  return formato
    .format(fecha)
    .replace(/\./g, '')
    .slice(0, 3)
    .toUpperCase();
}

function partesFecha(clave: string) {
  const [anio, mes, dia] = clave.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return {
    numero: String(dia),
    mes: abreviatura(FORMATO_MES, fecha),
    diaSemana: abreviatura(FORMATO_DIA, fecha),
  };
}

interface Banda {
  clave: string | null;
  pedidos: Pedido[];
}

/** Agrupa por fecha de entrega, ascendente, y deja los pedidos sin fecha al final. */
function agruparPorEntrega(pedidos: Pedido[]): Banda[] {
  const porDia = new Map<string, Pedido[]>();
  const sinFecha: Pedido[] = [];
  for (const pedido of pedidos) {
    const clave = diaLocal(pedido.fechaEntrega);
    if (!clave) {
      sinFecha.push(pedido);
      continue;
    }
    porDia.set(clave, [...(porDia.get(clave) ?? []), pedido]);
  }
  const bandas: Banda[] = [...porDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([clave, lista]) => ({ clave, pedidos: lista }));
  if (sinFecha.length > 0) bandas.push({ clave: null, pedidos: sinFecha });
  return bandas;
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

  const hoy = claveHoy();
  const bandas = agruparPorEntrega(pedidosFiltrados);
  const totalFacturado = pedidosFiltrados.reduce(
    (suma, p) => suma + p.montoTotal,
    0,
  );
  const paraHoy = pedidosFiltrados.filter(
    (p) => diaLocal(p.fechaEntrega) === hoy,
  ).length;
  const pendientes = pedidosFiltrados.filter(
    (p) => p.estado === 'Pendiente',
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner label="Cargando pedidos" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <dl className="flex flex-wrap gap-x-7 gap-y-2">
          <div>
            <dt className="text-[0.625rem] font-bold tracking-[0.1em] text-ink-muted uppercase">
              Pedidos
            </dt>
            <dd className="numeric font-display text-xl font-semibold text-ink">
              {pedidosFiltrados.length}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-bold tracking-[0.1em] text-ink-muted uppercase">
              Facturado
            </dt>
            <dd className="numeric font-display text-xl font-semibold text-ink">
              {money(totalFacturado)}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-bold tracking-[0.1em] text-ink-muted uppercase">
              Para hoy
            </dt>
            <dd
              className={`numeric font-display text-xl font-semibold ${
                paraHoy > 0 ? 'text-blossom-deep' : 'text-ink'
              }`}
            >
              {paraHoy}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-bold tracking-[0.1em] text-ink-muted uppercase">
              Pendientes
            </dt>
            <dd className="numeric font-display text-xl font-semibold text-ink">
              {pendientes}
            </dd>
          </div>
        </dl>
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
        <div className="grid gap-3">
          {bandas.map((banda) => {
            const esHoy = banda.clave === hoy;
            const esPasado = banda.clave !== null && banda.clave < hoy;
            const partes = banda.clave ? partesFecha(banda.clave) : null;
            const idDia = `dia-${banda.clave ?? 'sin-fecha'}`;

            return (
              <section
                key={banda.clave ?? 'sin-fecha'}
                aria-labelledby={idDia}
                className={`grid grid-cols-[132px_1fr] overflow-hidden rounded-lush border bg-surface shadow-[0_2px_10px_-4px_rgba(58,39,71,0.10)] ${
                  esHoy ? 'border-blossom' : 'border-line'
                }`}
              >
                <div
                  className={`flex flex-col justify-center gap-0.5 border-r border-line px-4 py-4 ${
                    esHoy ? 'bg-blossom/20' : esPasado ? 'bg-petal/40' : 'bg-petal/20'
                  }`}
                >
                  {partes ? (
                    <>
                      <span
                        id={idDia}
                        className="numeric font-display text-2xl leading-none font-semibold tracking-[-0.03em] text-ink"
                      >
                        {partes.numero}
                      </span>
                      <span className="text-[0.6875rem] font-bold tracking-[0.1em] text-ink-muted uppercase">
                        {partes.mes} · {partes.diaSemana}
                      </span>
                      {esHoy ? (
                        <span className="mt-1.5 self-start rounded-full bg-blossom px-2 py-0.5 text-[0.625rem] font-bold tracking-[0.08em] text-ink uppercase">
                          Hoy
                        </span>
                      ) : esPasado ? (
                        <span className="mt-1.5 self-start rounded-full border border-line-strong px-2 py-0.5 text-[0.625rem] font-bold tracking-[0.08em] text-ink-muted uppercase">
                          Pasado
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span
                      id={idDia}
                      className="font-display text-base font-semibold text-ink"
                    >
                      Sin fecha
                    </span>
                  )}
                </div>

                <div>
                  {banda.pedidos.map((pedido) => (
                    <article
                      key={pedido.id}
                      className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-line px-4 py-2.5 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {pedido.clienteNombre}
                        </p>
                        <p className="font-mono text-[0.6875rem] text-ink-muted">
                          {pedido.clienteWhatsapp}
                        </p>
                        <p className="truncate text-xs text-ink-muted">
                          {pedido.pedidoItems
                            .map(
                              (item) =>
                                `${item.ramo.nombre} (${labelTamano(item.ramo.tamano)}) ×${item.cantidad}`,
                            )
                            .join(' · ')}
                        </p>
                      </div>

                      <span className="numeric min-w-[84px] text-right font-mono text-sm text-ink">
                        {money(pedido.montoTotal)}
                      </span>

                      <Select
                        aria-label={`Estado del pedido de ${pedido.clienteNombre}`}
                        value={pedido.estado}
                        onChange={(e) =>
                          cambiarEstado(pedido.id, e.target.value)
                        }
                        className={`w-auto rounded-full border px-3 py-1 text-xs font-bold ${
                          ESTADO_PILL[pedido.estado] ?? ESTADO_PILL.Pendiente
                        }`}
                      >
                        {ESTADOS.map((e) => (
                          <option key={e} value={e}>
                            {ESTADO_LABELS[e]}
                          </option>
                        ))}
                      </Select>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarPedido(pedido.id)}
                        className="text-danger"
                      >
                        Eliminar
                      </Button>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
