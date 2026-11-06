'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { money, percent } from '@/lib/format';
import { labelTamano } from '@/lib/tamanos';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Select,
  Spinner,
} from '@/components/ui';

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
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      const token = getToken();
      try {
        const [resumenRes, pendientesRes, masVendidosRes] = await Promise.all([
          fetch(`${API_URL}/reportes/resumen?periodo=${periodo}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch(`${API_URL}/reportes/pendientes`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch(`${API_URL}/reportes/mas-vendidos?periodo=${periodo}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        const resumenData = await resumenRes.json();
        const pendientesData = await pendientesRes.json();
        const masVendidosData = await masVendidosRes.json();

        if (!cancelled) {
          setResumen(resumenData || null);
          setPendientes(Array.isArray(pendientesData) ? pendientesData : []);
          setMasVendidos(Array.isArray(masVendidosData) ? masVendidosData : []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setResumen(null);
          setPendientes([]);
          setMasVendidos([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [periodo]);

  async function exportarDatos() {
    setExportError('');
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/reportes/exportar`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eternaflor_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Error al exportar datos');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner label="Cargando reportes" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">Resumen del período</p>
        <div className="flex items-center gap-3">
          <label htmlFor="periodo" className="sr-only">
            Período
          </label>
          <Select
            id="periodo"
            name="periodo"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="w-auto"
          >
            <option value="dia">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="todos">Todo el tiempo</option>
          </Select>
          <Button variant="secondary" onClick={exportarDatos}>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Exportar CSV
          </Button>
        </div>
      </div>

      {exportError ? (
        <p
          role="alert"
          className="mb-6 rounded-tight border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {exportError}
        </p>
      ) : null}

      {resumen && (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardBody>
                <p className="mb-1 text-sm text-ink-muted">Ingresos</p>
                <p className="font-display text-2xl font-semibold text-ink numeric">
                  {money(resumen.ingresosTotales)}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="mb-1 text-sm text-ink-muted">Costos</p>
                <p className="font-display text-2xl font-semibold text-ink numeric">
                  {money(resumen.costosTotales)}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="mb-1 text-sm text-ink-muted">Margen</p>
                <p
                  className={`font-display text-2xl font-semibold numeric ${
                    resumen.margenTotal < 0 ? 'text-danger' : 'text-success'
                  }`}
                >
                  {money(resumen.margenTotal)}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="mb-1 text-sm text-ink-muted">Margen %</p>
                <p
                  className={`font-display text-2xl font-semibold numeric ${
                    resumen.porcentajeMargen < 0 ? 'text-danger' : 'text-success'
                  }`}
                >
                  {percent(resumen.porcentajeMargen)}
                </p>
              </CardBody>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader title="Margen por Tamaño" />
            <CardBody className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="bg-petal">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-sm font-medium text-ink-muted">
                      Tamaño
                    </th>
                    <th scope="col" className="px-4 py-2 text-right text-sm font-medium text-ink-muted numeric">
                      Cantidad
                    </th>
                    <th scope="col" className="px-4 py-2 text-right text-sm font-medium text-ink-muted numeric">
                      Ingresos
                    </th>
                    <th scope="col" className="px-4 py-2 text-right text-sm font-medium text-ink-muted numeric">
                      Costos
                    </th>
                    <th scope="col" className="px-4 py-2 text-right text-sm font-medium text-ink-muted numeric">
                      Margen
                    </th>
                    <th scope="col" className="px-4 py-2 text-right text-sm font-medium text-ink-muted numeric">
                      % Margen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {resumen.margenesPorTamano.map((m) => (
                    <tr key={m.tamano}>
                      <td className="px-4 py-2 font-medium">{labelTamano(m.tamano)}</td>
                      <td className="px-4 py-2 text-right numeric">{m.cantidad}</td>
                      <td className="px-4 py-2 text-right numeric">{money(m.ingresos)}</td>
                      <td className="px-4 py-2 text-right numeric">{money(m.costos)}</td>
                      <td
                        className={`px-4 py-2 text-right font-medium numeric ${
                          m.margen < 0 ? 'text-danger' : 'text-success'
                        }`}
                      >
                        {money(m.margen)}
                      </td>
                      <td className="px-4 py-2 text-right numeric">{percent(m.porcentajeMargen)}</td>
                    </tr>
                  ))}
                  {resumen.margenesPorTamano.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-sm text-ink-muted">
                        No hay datos en este período
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader title="Pedidos Pendientes" />
          <CardBody>
            {pendientes.length === 0 ? (
              <EmptyState title="No hay pedidos pendientes" />
            ) : (
              <div className="space-y-3">
                {pendientes.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-tight border border-line p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink">{p.clienteNombre}</p>
                        <p className="text-sm text-ink-muted">
                          {p.items.map((i) => `${i.nombre} x${i.cantidad}`).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-ink numeric">{money(p.montoTotal)}</p>
                        <Badge tone={p.estado === 'Pendiente' ? 'warning' : 'neutral'}>
                          {p.estado === 'Pendiente' ? 'Pendiente' : 'En Preparación'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Ramos Más Vendidos" />
          <CardBody>
            {masVendidos.length === 0 ? (
              <EmptyState title="No hay ventas en este período" />
            ) : (
              <div className="space-y-3">
                {masVendidos.map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-petal text-sm font-medium text-ink-muted">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-ink">{r.nombre}</p>
                        <p className="text-sm text-ink-muted">{labelTamano(r.tamano)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-ink">{r.cantidad} vendidos</p>
                      <p className="text-sm text-ink-muted numeric">{money(r.ingresos)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
