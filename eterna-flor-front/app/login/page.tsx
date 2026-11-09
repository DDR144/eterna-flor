'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button, Card, CardBody, CardHeader, Field, Input, Logo, Spinner } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:w-1/2">
        <div className="relative z-10 flex w-full flex-col items-center justify-center p-12 text-surface">
          <h2 className="mb-4 text-center text-surface">
            <Logo tamaño="2.25rem" />
          </h2>
          <p className="max-w-md text-center text-lg text-surface/80">
            Sistema de gestión integral para tu negocio de ramos florales
          </p>
          <div className="mt-12 flex gap-8 text-sm text-surface/80">
            <span>Elegante</span>
            <span>Moderno</span>
            <span>Floral</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-petal p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="mb-1 flex justify-center text-ink">
              <Logo tamaño="1.5rem" />
            </h1>
            <p className="mt-1 text-sm text-ink-muted">Gestión de Ramos Florales</p>
          </div>

          <Card className="w-full">
            <CardHeader
              title="Bienvenido"
              description="Ingresa tus credenciales para continuar"
            />
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error ? (
                  <p
                    role="alert"
                    className="rounded-tight border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger"
                  >
                    {error}
                  </p>
                ) : null}

                <Field label="Correo electrónico" name="email" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    autoComplete="email"
                  />
                </Field>

                <Field label="Contraseña" name="password" required>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    minLength={6}
                  />
                </Field>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Spinner label="Ingresando" /> : 'Iniciar Sesión'}
                </Button>
              </form>
            </CardBody>
          </Card>

          <p className="mt-6 text-center text-sm text-ink-muted">
            ¿Primera vez? Contacta al administrador
          </p>
        </div>
      </div>
    </div>
  );
}
