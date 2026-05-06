'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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

const ESTADOS = ['Pendiente', 'EnPreparacion', 'Entregado', 'Pagado'];

const ESTADO_LABELS: Record<string, string> = {
  Pendiente: 'Pendiente',
  EnPreparacion: 'En Preparación',
  Entregado: 'Entregado',
  Pagado: 'Pagado',
};

const ESTADO_COLORS: Record<string, string> = {
  Pendiente: 'bg-yellow-100 text-yellow-700',
  EnPreparacion: 'bg-blue-100 text-blue-700',
  Entregado: 'bg-purple-100 text-purple-700',
  Pagado: 'bg-green-100 text-green-700',
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [ramos, setRamos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clienteNombre: '',
    clienteWhatsapp: '',
    metodoPago: '',
    fechaEntrega: '',
  });
  const [items, setItems] = useState<Array<{ ramoId: number; cantidad: number }>>([]);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [pedidosData, ramosData] = await Promise.all([
        api.pedidos.getAll(),
        api.ramos.getAll(),
      ]);
      setPedidos(pedidosData);
      setRamos(ramosData);
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

  function updateItem(index: number, field: string, value: any) {
    const updated = [...items];
    (updated[index] as any)[field] = field === 'ramoId' ? Number(value) : Number(value);
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

      setForm({ clienteNombre: '', clienteWhatsapp: '', metodoPago: '', fechaEntrega: '' });
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

  const pedidosFiltrados = filtroEstado ? pedidos.filter(p => p.estado === filtroEstado) : pedidos;

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
        <div className="flex gap-3">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => (
              <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700"
          >
            + Nuevo Pedido
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg my-8">
            <h2 className="text-xl font-semibold mb-4">Nuevo Pedido</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cliente</label>
                <input
                  type="text"
                  value={form.clienteNombre}
                  onChange={(e) => setForm({ ...form, clienteNombre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={form.clienteWhatsapp}
                  onChange={(e) => setForm({ ...form, clienteWhatsapp: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
                  <select
                    value={form.metodoPago}
                    onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Yape">Yape</option>
                    <option value="Plin">Plin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de entrega</label>
                  <input
                    type="date"
                    value={form.fechaEntrega}
                    onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Ramos</label>
                  <button type="button" onClick={addItem} className="text-rose-600 text-sm hover:underline">
                    + Agregar ramo
                  </button>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select
                      value={item.ramoId}
                      onChange={(e) => updateItem(i, 'ramoId', e.target.value)}
                      className="flex-1 px-2 py-2 border rounded-lg text-sm"
                    >
                      {ramos.map((r: any) => (
                        <option key={r.id} value={r.id}>{r.nombre} (Stock: {r.stock})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => updateItem(i, 'cantidad', e.target.value)}
                      className="w-20 px-2 py-2 border rounded-lg text-sm"
                    />
                    <button type="button" onClick={() => removeItem(i)} className="text-red-500 px-2">
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700">
                  Crear Pedido
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setItems([]); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {pedidosFiltrados.map((pedido) => (
          <div key={pedido.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{pedido.clienteNombre}</h3>
                <p className="text-sm text-gray-500">{pedido.clienteWhatsapp}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[pedido.estado]}`}>
                {ESTADO_LABELS[pedido.estado]}
              </span>
            </div>

            <div className="border-t pt-3 mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
              <div className="space-y-1">
                {pedido.pedidoItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.ramo.nombre} ({item.ramo.tamano}) × {item.cantidad}
                    </span>
                    <span className="text-gray-800">S/ {(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <div className="text-lg font-bold text-rose-700">
                Total: S/ {pedido.montoTotal.toFixed(2)}
              </div>
              <div className="flex gap-2">
                <select
                  value={pedido.estado}
                  onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                  className="text-sm border rounded-lg px-2 py-1"
                >
                  {ESTADOS.map(e => (
                    <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
                  ))}
                </select>
                <button
                  onClick={() => eliminarPedido(pedido.id)}
                  className="text-red-600 hover:text-red-800 text-sm px-2"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
        {pedidosFiltrados.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay pedidos registrados
          </div>
        )}
      </div>
    </div>
  );
}