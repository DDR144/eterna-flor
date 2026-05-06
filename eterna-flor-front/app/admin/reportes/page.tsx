'use client';

import { useEffect, useState } from 'react';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

interface Resumen {
  periodo: string;
  ingresosTotales: number;
  costosTotales: number;
  margenTotal: number;
  porcentajeMargen: number;
  totalPedidos: number;
  margenesPorTamano: Array<{
    tamano: string;
    ingresos: number;
    costos: number;
    margen: number;
    porcentajeMargen: number;
    cantidad: number;
  }>;
}

interface PedidoPendiente {
  id: number;
  clienteNombre: string;
  montoTotal: number;
  estado: string;
  fechaEntrega: string | null;
  items: Array<{ nombre: string; cantidad: number }>;
}

interface RamoVendido {
  id: number;
  nombre: string;
  tamano: string;
  cantidad: number;
  ingresos: number;
}

export default function ReportesPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [pendientes, setPendientes] = useState<PedidoPendiente[]>([]);
  const [masVendidos, setMasVendidos] = useState<RamoVendido[]>([]);
  const [periodo, setPeriodo] = useState('semana');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const token = getToken();
    try {
      const [resumenRes, pendientesRes, masVendidosRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/reportes/resumen?periodo=${periodo}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/reportes/pendientes`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/reportes/mas-vendidos?periodo=${periodo}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      const resumenData = await resumenRes.json();
      const pendientesData = await pendientesRes.json();
      const masVendidosData = await masVendidosRes.json();

      setResumen(resumenData || null);
      setPendientes(Array.isArray(pendientesData) ? pendientesData : []);
      setMasVendidos(Array.isArray(masVendidosData) ? masVendidosData : []);
    } catch (err) {
      console.error(err);
      setResumen(null);
      setPendientes([]);
      setMasVendidos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [periodo]);

  async function exportarDatos() {
    const token = getToken();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reportes/exportar`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eternaflor_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al exportar datos');
    }
  }

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <div className="flex gap-3">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="dia">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="todos">Todo el tiempo</option>
          </select>
          <button
            onClick={exportarDatos}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      {resumen && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Ingresos</p>
              <p className="text-2xl font-bold text-green-600">S/ {resumen.ingresosTotales.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Costos</p>
              <p className="text-2xl font-bold text-red-600">S/ {resumen.costosTotales.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Margen</p>
              <p className="text-2xl font-bold text-rose-600">S/ {resumen.margenTotal.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Margen %</p>
              <p className="text-2xl font-bold text-blue-600">{resumen.porcentajeMargen.toFixed(1)}%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Margen por Tamaño</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Tamaño</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Cantidad</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Ingresos</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Costos</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Margen</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">% Margen</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {resumen.margenesPorTamano.map((m) => (
                    <tr key={m.tamano}>
                      <td className="px-4 py-2 font-medium">{m.tamano}</td>
                      <td className="px-4 py-2 text-right">{m.cantidad}</td>
                      <td className="px-4 py-2 text-right">S/ {m.ingresos.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">S/ {m.costos.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-medium text-green-600">S/ {m.margen.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">{m.porcentajeMargen.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {resumen.margenesPorTamano.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                        No hay datos en este período
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Pedidos Pendientes</h2>
          {pendientes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay pedidos pendientes</p>
          ) : (
            <div className="space-y-3">
              {pendientes.map((p) => (
                <div key={p.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{p.clienteNombre}</p>
                      <p className="text-sm text-gray-500">
                        {p.items.map(i => `${i.nombre} x${i.cantidad}`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-600">S/ {p.montoTotal.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {p.estado === 'Pendiente' ? 'Pendiente' : 'En Preparación'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Ramos Más Vendidos</h2>
          {masVendidos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay ventas en este período</p>
          ) : (
            <div className="space-y-3">
              {masVendidos.map((r, i) => (
                <div key={r.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{r.nombre}</p>
                      <p className="text-sm text-gray-500">{r.tamano}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{r.cantidad} vendidos</p>
                    <p className="text-sm text-gray-500">S/ {r.ingresos.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}