import { Badge, Card, EmptyState } from '@/components/ui';
import { money } from '@/lib/format';
import { TAMANOS, labelTamano } from '@/lib/tamanos';

interface Ramo {
  id: number;
  nombre: string;
  tamano: string;
  fotoUrl: string | null;
  precioVenta: number;
}

async function getRamos(tamano?: string): Promise<Ramo[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const url = tamano
    ? `${API_URL}/catalogo?tamano=${tamano}`
    : `${API_URL}/catalogo`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

const WHATSAPP_NUMERO = '930190189';
const MENSAJE_BASE = 'Hola, me interesa uno de los Ramos';

function whatsappHref(ramo: Ramo): string {
  const texto = `${MENSAJE_BASE}: ${ramo.nombre} (${labelTamano(ramo.tamano)})`;
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
}

/**
 * Marca de verificación del bloque de confianza. Vive aquí y no en
 * `components/ui/Icon` porque el catálogo es la única pantalla que la usa;
 * si aparece una tercera, se mueve al set compartido.
 */
function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="h-4 w-4 text-success"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * Enlace con la apariencia del botón primario. No se usa `Button` porque
 * esto navega a WhatsApp: un `<a>` es el elemento correcto, y así el
 * teclado y el "abrir en pestaña nueva" se comportan como se espera.
 */
function WhatsAppLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-soft bg-blossom px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-blossom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className="h-4 w-4 shrink-0"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
      {children}
    </a>
  );
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ tamano?: string }>;
}) {
  const { tamano } = await searchParams;
  const ramos = await getRamos(tamano);

  return (
    <div className="min-h-screen bg-petal font-body text-ink">
      <header className="px-6 pt-14 pb-10 text-center sm:px-12">
        <p className="inline-block rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
          Ramos artificiales · Hechos a mano
        </p>
        <h1 className="mx-auto mt-6 max-w-[18ch] font-display text-4xl leading-[1.05] font-semibold tracking-[-0.025em] sm:text-5xl">
          Flores que <em>no se marchitan</em>
        </h1>
        <p className="mx-auto mt-4 max-w-[46ch] text-base text-ink-muted">
          Arreglos armados pieza por pieza en nuestro taller de Lima. Elige un
          tamaño, escríbenos y coordinamos la entrega.
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm font-semibold text-ink-muted">
          <li className="inline-flex items-center gap-2">
            <Check />
            Entrega en 48 h
          </li>
          <li className="inline-flex items-center gap-2">
            <Check />
            Pago con Yape o Plin
          </li>
          <li className="inline-flex items-center gap-2">
            <Check />
            Diseño a medida
          </li>
        </ul>
      </header>

      <nav
        aria-label="Filtrar por tamaño"
        className="flex flex-wrap justify-center gap-2.5 px-6 pb-10 sm:px-12"
      >
        <a
          href="/catalogo"
          aria-current={!tamano ? 'true' : undefined}
          className={
            !tamano
              ? 'rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-surface'
              : 'rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
          }
        >
          Todos
        </a>
        {TAMANOS.map((t) => (
          <a
            key={t}
            href={`/catalogo?tamano=${t}`}
            aria-current={tamano === t ? 'true' : undefined}
            className={
              tamano === t
                ? 'rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-surface'
                : 'rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
            }
          >
            {labelTamano(t)}
          </a>
        ))}
      </nav>

      <main className="mx-auto max-w-6xl px-6 pb-14 sm:px-12">
        {ramos.length === 0 ? (
          <EmptyState
            title="Pronto tendremos novedades"
            description="Estamos preparando nuevos diseños para ti"
          />
        ) : (
          <ul className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {ramos.map((ramo) => (
              <li key={ramo.id}>
                <Card className="h-full overflow-hidden">
                  <article className="flex h-full flex-col">
                    <div className="relative flex aspect-[5/4] items-center justify-center bg-petal-deep">
                      {ramo.fotoUrl ? (
                        <img
                          src={ramo.fotoUrl}
                          alt={ramo.nombre}
                          width={480}
                          height={384}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="font-display text-4xl text-ink-muted"
                        >
                          ✿
                        </span>
                      )}
                      <span className="absolute top-4 right-4">
                        <Badge tone="neutral">
                          {labelTamano(ramo.tamano)}
                        </Badge>
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
                        {ramo.nombre}
                      </h2>

                      <div className="mt-auto flex items-center justify-between gap-4">
                        <p className="font-display text-2xl font-semibold tracking-[-0.02em] numeric">
                          <span className="mb-0.5 block font-body text-xs font-semibold tracking-[0.06em] text-ink-muted uppercase">
                            Precio
                          </span>
                          {money(ramo.precioVenta)}
                        </p>
                        <WhatsAppLink href={whatsappHref(ramo)}>
                          Consultar
                        </WhatsAppLink>
                      </div>
                    </div>
                  </article>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <Card className="mt-10 px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-display text-lg font-semibold text-ink">
                ¿Buscas algo distinto?
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Armamos arreglos a medida con las flores que prefieras.
              </p>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent('Hola, quiero un arreglo a medida')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-soft border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-petal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Escribir al 930 190 189
            </a>
          </div>
        </Card>
      </main>

      <footer className="px-6 pb-10 text-center text-sm text-ink-muted">
        © 2026 EternaFlor — Ramos artesanales exclusivos
      </footer>
    </div>
  );
}
