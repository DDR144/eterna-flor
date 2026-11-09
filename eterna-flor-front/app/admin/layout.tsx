'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button, Icon, IconoMarca, Logo, Spinner } from '@/components/ui';
import type { IconName } from '@/components/ui';

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

const navItems: NavItem[] = [
  { href: '/admin/ramos', label: 'Ramos', icon: 'ramos' },
  { href: '/admin/materias-primas', label: 'Materias primas', icon: 'materias' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: 'pedidos' },
  { href: '/admin/reportes', label: 'Reportes', icon: 'reportes' },
];

function matchNav(pathname: string): NavItem | undefined {
  return navItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

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
      <div className="flex min-h-screen items-center justify-center bg-petal">
        <Spinner label="Cargando el panel" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const active = matchNav(pathname);

  async function handleLogout() {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    router.replace('/login');
  }

  return (
    <div className="flex min-h-screen bg-petal">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-tight focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:outline-2 focus:outline-offset-2 focus:outline-ink"
      >
        Saltar al contenido
      </a>

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-line-strong bg-surface transition-[width] duration-200 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div
          className={`flex h-16 items-center border-b border-line ${
            sidebarOpen
              ? 'justify-between gap-2 px-4'
              : 'justify-center gap-1 px-2'
          }`}
        >
          {sidebarOpen ? (
            <Link
              href="/admin"
              aria-label="EternaFlor, ir al panel"
              className="flex items-center text-ink"
            >
              <Logo tamaño="1.125rem" />
            </Link>
          ) : (
            <Link
              href="/admin"
              aria-label="EternaFlor, ir al panel"
              className="shrink-0"
            >
              <IconoMarca className="h-7 w-7" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Contraer menú' : 'Expandir menú'}
            aria-expanded={sidebarOpen}
            aria-controls="menu-lateral"
            className={`shrink-0 rounded-tight text-ink-muted transition-colors duration-150 hover:bg-petal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              sidebarOpen ? 'p-1.5' : 'p-1'
            }`}
          >
            <Icon
              name={sidebarOpen ? 'izquierda' : 'derecha'}
              className="h-4 w-4"
            />
          </button>
        </div>

        <nav id="menu-lateral" aria-label="Secciones del panel" className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = active?.href === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={sidebarOpen ? undefined : item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-tight px-3 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  isActive
                    ? 'bg-ink font-semibold text-surface'
                    : 'font-medium text-ink-muted hover:bg-petal hover:text-ink'
                }`}
              >
                <Icon name={item.icon} />
                {sidebarOpen ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-line p-3">
          <Link
            href="/catalogo"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver catálogo"
            aria-label={sidebarOpen ? undefined : 'Ver catálogo'}
            className="flex items-center gap-3 rounded-tight px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-petal hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <Icon name="catalogo" />
            {sidebarOpen ? <span>Ver catálogo</span> : null}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            aria-label={sidebarOpen ? undefined : 'Cerrar sesión'}
            className="flex w-full items-center gap-3 rounded-tight px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-petal hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <Icon name="salir" />
            {sidebarOpen ? <span>Cerrar sesión</span> : null}
          </button>
        </div>
      </aside>

      <div
        className={`flex flex-1 flex-col transition-[margin-left] duration-200 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line-strong bg-surface px-6">
          <h1 className="font-display text-xl font-semibold text-ink">
            {active?.label ?? 'Panel'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-muted sm:inline" title={user.email}>
              {user.email}
            </span>
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blossom text-sm font-semibold text-ink"
            >
              {user.email?.[0]?.toUpperCase() ?? 'U'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="sm:hidden"
            >
              Salir
            </Button>
          </div>
        </header>
        <main id="contenido" className="animate-fade-in p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
