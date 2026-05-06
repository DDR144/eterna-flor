'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-rose-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-rose-700">EternaFlor</h1>
          <nav className="flex gap-4">
            <Link href="/admin/materias-primas" className={`text-sm ${pathname.includes('materias') ? 'text-rose-600 font-medium' : 'text-gray-600'}`}>
              Materias Primas
            </Link>
            <Link href="/admin/ramos" className={`text-sm ${pathname.includes('ramos') ? 'text-rose-600 font-medium' : 'text-gray-600'}`}>
              Ramos
            </Link>
            <Link href="/admin/pedidos" className={`text-sm ${pathname.includes('pedidos') ? 'text-rose-600 font-medium' : 'text-gray-600'}`}>
              Pedidos
            </Link>
            <Link href="/admin/reportes" className={`text-sm ${pathname.includes('reportes') ? 'text-rose-600 font-medium' : 'text-gray-600'}`}>
              Reportes
            </Link>
            <Link href="/catalogo" target="_blank" className="text-sm text-gray-600 hover:text-rose-600">
              Ver Catálogo
            </Link>
            <button
              onClick={async () => {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                  method: 'POST',
                  credentials: 'include',
                });
                window.location.href = '/login';
              }}
              className="text-sm text-gray-600 hover:text-rose-600"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}