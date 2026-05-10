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

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ tamano?: string }>;
}) {
  const { tamano } = await searchParams;
  const ramos = await getRamos(tamano);

  const WHATSAPP_NUMERO = '930190189';
  const MENSAJE_BASE = 'Hola, me interesa uno de los Ramos';

  const TAMANOS = ['Pequeño', 'Mediano', 'Grande', 'Jumbo'];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#FFF3F7', fontFamily: 'var(--font-nunito)' }}
    >
      {/* ── Header ── */}
      <header className="bg-white border-b" style={{ borderColor: '#9E82B533' }}>
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1
            className="text-[2.25rem] font-semibold tracking-tight"
            style={{
              fontFamily: 'var(--font-fraunces)',
              color: '#3A2747',
              letterSpacing: '-0.02em',
            }}
          >
            EternaFlor
          </h1>
          <p className="mt-2 text-base" style={{ color: '#9E82B5' }}>
            Ramos artificiales exclusivos
          </p>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          <a
            href="/catalogo"
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            style={{
              backgroundColor: !tamano ? '#3A2747' : '#FFFFFF',
              color: !tamano ? '#FFFFFF' : '#9E82B5',
              border: '1.5px solid',
              borderColor: !tamano ? '#3A2747' : '#9E82B5',
            }}
          >
            Todos
          </a>
          {TAMANOS.map((t) => (
            <a
              key={t}
              href={`/catalogo?tamano=${t}`}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: tamano === t ? '#3A2747' : '#FFFFFF',
                color: tamano === t ? '#FFFFFF' : '#9E82B5',
                border: '1.5px solid',
                borderColor: tamano === t ? '#3A2747' : '#9E82B5',
              }}
            >
              {t}
            </a>
          ))}
        </div>

        {/* Grid / Empty State */}
        {ramos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6" aria-hidden>
              💐
            </div>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#3A2747' }}
            >
              Pronto tendremos novedades
            </h2>
            <p className="mt-2" style={{ color: '#9E82B5' }}>
              Estamos preparando nuevos diseños para ti
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {ramos.map((ramo, index) => (
              <article
                key={ramo.id}
                className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-card-in"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Image */}
                <div className="relative">
                  {ramo.fotoUrl ? (
                    <img
                      src={ramo.fotoUrl}
                      alt={ramo.nombre}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-56 flex items-center justify-center"
                      style={{ backgroundColor: '#9E82B515' }}
                    >
                      <span className="text-5xl" style={{ color: '#9E82B5' }}>
                        ✿
                      </span>
                    </div>
                  )}

                  {/* Size badge */}
                  <span
                    className="absolute top-4 right-4 px-3 py-1 text-xs font-bold uppercase tracking-widest"
                    style={{
                      backgroundColor: '#FFFFFFCC',
                      color: '#9E82B5',
                      borderRadius: '12px',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {ramo.tamano}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3
                    className="text-lg font-semibold truncate"
                    style={{ fontFamily: 'var(--font-fraunces)', color: '#3A2747' }}
                  >
                    {ramo.nombre}
                  </h3>

                  <div className="flex items-center justify-between mt-5">
                    <span
                      className="text-2xl font-bold"
                      style={{ fontFamily: 'var(--font-fraunces)', color: '#3A2747' }}
                    >
                      S/ {ramo.precioVenta.toFixed(2)}
                    </span>

                    {/* Single accent — Tertiary #FF8AB8 per Pastel Candy rule */}
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(MENSAJE_BASE + ': ' + ramo.nombre + ' (' + ramo.tamano + ')')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                      style={{ backgroundColor: '#FF8AB8', borderRadius: '20px' }}
                    >
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Consultar
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-8">
        <p className="text-sm" style={{ color: '#9E82B5' }}>
          © 2026 EternaFlor — Ramos artesanales exclusivos
        </p>
      </footer>
    </div>
  );
}
