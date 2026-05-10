'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/admin/ramos', label: 'Ramos', icon: '🌸' },
  { href: '/admin/materias-primas', label: 'Materias Primas', icon: '🌿' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: '📦' },
  { href: '/admin/reportes', label: 'Reportes', icon: '📊' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
          <p className="text-stone-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  async function handleLogout() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-stone-200 transition-all duration-300 z-40 flex flex-col ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-stone-100">
          {sidebarOpen && (
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-2xl">🌺</span>
              <span className="font-bold text-rose-700 text-lg">EternaFlor</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.includes(item.href.split('/').pop() || '');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-stone-100">
          <Link
            href="/catalogo"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <span className="text-lg">🛒</span>
            {sidebarOpen && <span className="text-sm font-medium">Ver Catálogo</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-red-600 transition-colors mt-1"
          >
            <span className="text-lg">🚪</span>
            {sidebarOpen && <span className="text-sm font-medium">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-stone-800">
              {navItems.find(n => pathname.includes(n.href.split('/').pop() || ''))?.label || 'Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">
              {user.email}
            </span>
            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-700 font-medium text-sm">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}