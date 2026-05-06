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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-rose-100">
      <header className="bg-rose-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold">EternaFlor</h1>
          <p className="mt-2 text-rose-100">Ramos artificiales exclusivos</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          <a
            href="/catalogo"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !tamano
                ? 'bg-rose-600 text-white'
                : 'bg-white text-rose-600 border border-rose-200'
            }`}
          >
            Todos
          </a>
          {['Pequeño', 'Mediano', 'Grande', 'Jumbo'].map((t) => (
            <a
              key={t}
              href={`/catalogo?tamano=${t}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tamano === t
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-600 border border-rose-200'
              }`}
            >
              {t}
            </a>
          ))}
        </div>

        {ramos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No hay ramos disponibles en este momento.
            </p>
            <p className="text-gray-500 mt-2">
              Vuelve pronto, estamos preparando nuevos diseños.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ramos.map((ramo) => (
              <div
                key={ramo.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {ramo.fotoUrl ? (
                  <img
                    src={ramo.fotoUrl}
                    alt={ramo.nombre}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-rose-100 flex items-center justify-center">
                    <span className="text-rose-300 text-4xl">✿</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {ramo.nombre}
                    </h3>
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                      {ramo.tamano}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-rose-700">
                      S/ {ramo.precioVenta.toFixed(2)}
                    </span>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(MENSAJE_BASE + ': ' + ramo.nombre + ' (' + ramo.tamano + ')')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Consultar
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>© 2026 EternaFlor - Ramos artesanales exclusivos</p>
      </footer>
    </div>
  );
}
