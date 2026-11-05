import { EstadoPedido, PrismaClient, TamanoRamo } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { assertLocalDatabase } from '../src/common/local-database';

const prisma = new PrismaClient();

// Every row this script owns carries one of these prefixes. Cleanup removes
// only those rows, so running the seed never touches hand-made data.
//
// The ramo prefix deliberately does not start with "Ramo ": the e2e suite
// cleans up with `nombre: { startsWith: 'Ramo ' }` and would otherwise try to
// delete seeded ramos, which fails on the pedido_items foreign key.
const RAMO_PREFIX = '[prueba] ';
const MATERIA_PREFIX = 'Materia prima de prueba: ';
const CLIENTE_PREFIX = 'Cliente de prueba ';

const USUARIO_EMAIL = 'admin@eternaflor.local';
const USUARIO_PASSWORD = 'local1234';

/**
 * The dataset is chosen to break the bugs this app actually had, not to look
 * pretty:
 *
 * - all four sizes, including `Pequeño`, whose enum member is `Pequeno`. A
 *   filter that compares the accented label against the member names silently
 *   returns everything, and with a single ramo you cannot tell "filtered" from
 *   "ignored". Two small ones make that visible.
 * - one ramo with `stock: 0` and one with `activo: false`, both of which the
 *   public catalogue must hide.
 * - ramos at stock 0, 1 and 2, so `/ramos/alertas` (which lists `activo` ramos
 *   with `stock <= 2`) is not empty, and materias primas above and below their
 *   threshold for `/materias-primas/alertas`.
 * - all four order states, including `En preparación`, whose enum member is
 *   `EnPreparacion`: same accent trap on the orders endpoint.
 */
type MateriaSeed = {
  nombre: string;
  unidad: string;
  stock: string;
  costo: string;
  minimo: number;
};

const MATERIAS: MateriaSeed[] = [
  {
    nombre: 'Rosas artificiales',
    unidad: 'unidad',
    stock: '40',
    costo: '1.50',
    minimo: 10,
  },
  {
    nombre: 'Cinta satinada',
    unidad: 'metro',
    stock: '12',
    costo: '0.75',
    minimo: 5,
  },
  {
    nombre: 'Base de unicel',
    unidad: 'unidad',
    stock: '3',
    costo: '2.00',
    minimo: 5,
  },
  {
    nombre: 'Papel coreano',
    unidad: 'pliego',
    stock: '0',
    costo: '0.90',
    minimo: 5,
  },
];

type RamoSeed = {
  nombre: string;
  tamano: TamanoRamo;
  precio: string;
  stock: number;
  activo: boolean;
  recetas?: { materia: string; cantidad: string }[];
};

const RAMOS: RamoSeed[] = [
  {
    nombre: 'Peonía pastel',
    tamano: TamanoRamo.Pequeno,
    precio: '45.00',
    stock: 5,
    activo: true,
    recetas: [
      { materia: 'Rosas artificiales', cantidad: '5' },
      { materia: 'Cinta satinada', cantidad: '1.5' },
    ],
  },
  {
    nombre: 'Peonía chica',
    tamano: TamanoRamo.Pequeno,
    precio: '38.00',
    stock: 1,
    activo: true,
  },
  {
    nombre: 'Rosa clásica',
    tamano: TamanoRamo.Mediano,
    precio: '70.00',
    stock: 0,
    activo: true,
  },
  {
    nombre: 'Girasol grande',
    tamano: TamanoRamo.Grande,
    precio: '120.00',
    stock: 3,
    activo: true,
    recetas: [
      { materia: 'Base de unicel', cantidad: '2' },
      { materia: 'Papel coreano', cantidad: '3' },
      { materia: 'Cinta satinada', cantidad: '2' },
    ],
  },
  {
    nombre: 'Jumbo premium',
    tamano: TamanoRamo.Jumbo,
    precio: '180.00',
    stock: 2,
    activo: true,
  },
  {
    nombre: 'Ramo archivado',
    tamano: TamanoRamo.Mediano,
    precio: '60.00',
    stock: 9,
    activo: false,
  },
];

type PedidoSeed = {
  cliente: string;
  whatsapp: string;
  estado: EstadoPedido;
  metodoPago: string | null;
  diasEntrega: number | null;
  items: { ramo: string; cantidad: number }[];
};

const PEDIDOS: PedidoSeed[] = [
  {
    cliente: '1 (pendiente)',
    whatsapp: '999111222',
    estado: EstadoPedido.Pendiente,
    metodoPago: null,
    diasEntrega: 3,
    items: [{ ramo: 'Peonía pastel', cantidad: 1 }],
  },
  {
    cliente: '2 (en preparación)',
    whatsapp: '999333444',
    estado: EstadoPedido.EnPreparacion,
    metodoPago: 'Yape',
    diasEntrega: 2,
    items: [
      { ramo: 'Girasol grande', cantidad: 1 },
      { ramo: 'Peonía chica', cantidad: 2 },
    ],
  },
  {
    cliente: '3 (entregado)',
    whatsapp: '999555666',
    estado: EstadoPedido.Entregado,
    metodoPago: 'Efectivo',
    diasEntrega: -2,
    items: [{ ramo: 'Jumbo premium', cantidad: 1 }],
  },
  {
    cliente: '4 (pagado)',
    whatsapp: '999777888',
    estado: EstadoPedido.Pagado,
    metodoPago: 'Transferencia',
    diasEntrega: -1,
    items: [{ ramo: 'Rosa clásica', cantidad: 2 }],
  },
];

function obtener<T>(mapa: Map<string, T>, clave: string, contexto: string): T {
  const valor = mapa.get(clave);
  if (!valor) {
    throw new Error(`Dato de prueba inconsistente: ${contexto} "${clave}".`);
  }
  return valor;
}

function sumarDias(dias: number): Date {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

async function limpiar(): Promise<void> {
  // Order matters: pedido_items points at ramos without a cascade, so pedidos
  // go first (their items follow). Recipes disappear along with their ramo.
  await prisma.pedido.deleteMany({
    where: { clienteNombre: { startsWith: CLIENTE_PREFIX } },
  });
  await prisma.ramo.deleteMany({
    where: { nombre: { startsWith: RAMO_PREFIX } },
  });
  await prisma.materiaPrima.deleteMany({
    where: { nombre: { startsWith: MATERIA_PREFIX } },
  });
}

async function sembrarMaterias(): Promise<
  Map<string, { id: number; costo: number }>
> {
  const porNombre = new Map<string, { id: number; costo: number }>();

  for (const materia of MATERIAS) {
    const fila = await prisma.materiaPrima.create({
      data: {
        nombre: MATERIA_PREFIX + materia.nombre,
        unidad: materia.unidad,
        stockActual: materia.stock,
        costoUnitario: materia.costo,
        stockMinimoAlerta: materia.minimo,
      },
    });
    porNombre.set(materia.nombre, {
      id: fila.id,
      costo: Number(fila.costoUnitario),
    });
  }

  return porNombre;
}

async function sembrarRamos(
  materias: Map<string, { id: number; costo: number }>,
): Promise<Map<string, { id: number; precio: number }>> {
  const porNombre = new Map<string, { id: number; precio: number }>();

  for (const ramo of RAMOS) {
    const recetas = ramo.recetas ?? [];
    const costoCalculado = recetas.reduce((total, receta) => {
      const materia = obtener(materias, receta.materia, 'materia prima');
      return total + Number(receta.cantidad) * materia.costo;
    }, 0);

    const fila = await prisma.ramo.create({
      data: {
        nombre: RAMO_PREFIX + ramo.nombre,
        tamano: ramo.tamano,
        precioVenta: ramo.precio,
        costoCalculado: costoCalculado.toFixed(2),
        stock: ramo.stock,
        activo: ramo.activo,
        recetas: {
          create: recetas.map((receta) => ({
            materiaPrimaId: obtener(materias, receta.materia, 'materia prima')
              .id,
            cantidad: receta.cantidad,
          })),
        },
      },
    });

    porNombre.set(ramo.nombre, {
      id: fila.id,
      precio: Number(fila.precioVenta),
    });
  }

  return porNombre;
}

async function sembrarPedidos(
  ramos: Map<string, { id: number; precio: number }>,
): Promise<void> {
  for (const pedido of PEDIDOS) {
    const items = pedido.items.map((item) => {
      const ramo = obtener(ramos, item.ramo, 'ramo del pedido');
      return {
        ramoId: ramo.id,
        cantidad: item.cantidad,
        precioUnitario: ramo.precio.toFixed(2),
      };
    });

    const montoTotal = items.reduce(
      (total, item) => total + item.cantidad * Number(item.precioUnitario),
      0,
    );

    await prisma.pedido.create({
      data: {
        clienteNombre: CLIENTE_PREFIX + pedido.cliente,
        clienteWhatsapp: pedido.whatsapp,
        estado: pedido.estado,
        metodoPago: pedido.metodoPago,
        montoTotal: montoTotal.toFixed(2),
        fechaEntrega:
          pedido.diasEntrega === null ? null : sumarDias(pedido.diasEntrega),
        pedidoItems: { create: items },
      },
    });
  }
}

async function sembrarUsuario(): Promise<void> {
  // The password is always re-hashed from the constant, so a local login is
  // predictable no matter how many times the seed runs.
  const passwordHash = await bcrypt.hash(USUARIO_PASSWORD, 12);

  await prisma.usuario.upsert({
    where: { email: USUARIO_EMAIL },
    update: { passwordHash },
    create: { email: USUARIO_EMAIL, passwordHash },
  });
}

async function resumen(): Promise<void> {
  const [materias, ramos, pedidos] = await Promise.all([
    prisma.materiaPrima.count({
      where: { nombre: { startsWith: MATERIA_PREFIX } },
    }),
    prisma.ramo.count({ where: { nombre: { startsWith: RAMO_PREFIX } } }),
    prisma.pedido.count({
      where: { clienteNombre: { startsWith: CLIENTE_PREFIX } },
    }),
  ]);

  console.log('');
  console.log(`Materias primas de prueba: ${materias}`);
  console.log(`Ramos de prueba:           ${ramos}`);
  console.log(`Pedidos de prueba:         ${pedidos}`);
  console.log('');
  console.log(`Usuario local: ${USUARIO_EMAIL} / ${USUARIO_PASSWORD}`);
  console.log('');
  console.log(
    'Matriz para probar el filtro del catálogo (API local en :3001):',
  );
  console.log(
    '  curl -s "http://localhost:3001/catalogo"                     # 4 visibles',
  );
  console.log(
    '  curl -s "http://localhost:3001/catalogo?tamano=Peque%C3%B1o" # 2 pequeños',
  );
  console.log(
    '  curl -s "http://localhost:3001/catalogo?tamano=Jumbo"        # 1 jumbo',
  );
  console.log(
    '  curl -s "http://localhost:3001/catalogo?tamano=Gigante"      # se ignora',
  );
  console.log('');
  console.log(
    'Los endpoints de alertas (/ramos/alertas y /materias-primas/alertas)',
  );
  console.log(
    'necesitan el token de POST /auth/login en la cabecera Authorization.',
  );
}

async function main(): Promise<void> {
  // Before any query: this script deletes and recreates rows, and the local
  // `.env` is one copy-paste away from pointing at production.
  assertLocalDatabase();

  console.log('Sembrando datos de prueba en la base local…');
  await limpiar();

  const materias = await sembrarMaterias();
  const ramos = await sembrarRamos(materias);
  await sembrarPedidos(ramos);
  await sembrarUsuario();
  await resumen();
}

main()
  .catch((error: unknown) => {
    console.error('El seed falló:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
