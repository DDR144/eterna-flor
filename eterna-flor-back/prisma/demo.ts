import { EstadoPedido, PrismaClient, TamanoRamo } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { assertLocalDatabase } from '../src/common/local-database';

const prisma = new PrismaClient();

/**
 * Datos de demostración: el catálogo que se puede mirar y fotografiar.
 *
 * `seed.ts` hace lo contrario a propósito. Su dataset existe para romper los
 * bugs reales de esta aplicación (el enum acentuado, el stock en 0, el ramo
 * archivado) y por eso nombra las filas con el prefijo `[prueba] `, que en una
 * captura para el README se lee como un descuido.
 *
 * Este script vacía la base y siembra un catálogo presentable: cinco ramos
 * visibles, uno agotado, uno archivado, materias primas arriba y abajo de su
 * umbral, y pedidos en los cuatro estados.
 *
 * Vacía la base, así que se niega a correr fuera de localhost. Nunca lo apuntes
 * a producción.
 */

const USUARIO_EMAIL = 'admin@eternaflor.local';
const USUARIO_PASSWORD = 'local1234';

type MateriaDemo = {
  nombre: string;
  unidad: string;
  stock: string;
  costo: string;
  minimo: number;
};

const MATERIAS: MateriaDemo[] = [
  {
    nombre: 'Rosas artificiales',
    unidad: 'unidad',
    stock: '40',
    costo: '1.50',
    minimo: 10,
  },
  {
    nombre: 'Tulipanes artificiales',
    unidad: 'unidad',
    stock: '18',
    costo: '1.20',
    minimo: 8,
  },
  {
    nombre: 'Girasoles artificiales',
    unidad: 'unidad',
    stock: '12',
    costo: '1.80',
    minimo: 8,
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

type RamoDemo = {
  nombre: string;
  tamano: TamanoRamo;
  precio: string;
  stock: number;
  activo: boolean;
  recetas?: { materia: string; cantidad: string }[];
};

/**
 * Cinco ramos visibles, uno agotado y uno archivado. El catálogo público oculta
 * los dos últimos (`activo: true` y `stock > 0`), que es justo el estado que
 * conviene poder mirar desde el panel.
 */
const RAMOS: RamoDemo[] = [
  {
    nombre: 'Peonía pastel',
    tamano: TamanoRamo.Pequeno,
    precio: '45.00',
    stock: 6,
    activo: true,
    recetas: [
      { materia: 'Rosas artificiales', cantidad: '5' },
      { materia: 'Cinta satinada', cantidad: '1.5' },
    ],
  },
  {
    nombre: 'Tulipán suave',
    tamano: TamanoRamo.Pequeno,
    precio: '38.00',
    stock: 5,
    activo: true,
    recetas: [
      { materia: 'Tulipanes artificiales', cantidad: '5' },
      { materia: 'Cinta satinada', cantidad: '1' },
    ],
  },
  {
    nombre: 'Rosa eterna',
    tamano: TamanoRamo.Mediano,
    precio: '70.00',
    stock: 4,
    activo: true,
    recetas: [
      { materia: 'Rosas artificiales', cantidad: '9' },
      { materia: 'Cinta satinada', cantidad: '2' },
    ],
  },
  {
    nombre: 'Girasol de otoño',
    tamano: TamanoRamo.Grande,
    precio: '120.00',
    stock: 3,
    activo: true,
    recetas: [
      { materia: 'Girasoles artificiales', cantidad: '7' },
      { materia: 'Base de unicel', cantidad: '2' },
      { materia: 'Papel coreano', cantidad: '3' },
    ],
  },
  {
    nombre: 'Jumbo premium',
    tamano: TamanoRamo.Jumbo,
    precio: '180.00',
    stock: 2,
    activo: true,
    recetas: [
      { materia: 'Rosas artificiales', cantidad: '18' },
      { materia: 'Base de unicel', cantidad: '3' },
      { materia: 'Papel coreano', cantidad: '5' },
    ],
  },
  {
    nombre: 'Ramo de temporada',
    tamano: TamanoRamo.Mediano,
    precio: '60.00',
    stock: 0,
    activo: true,
  },
  {
    nombre: 'Ramo archivado',
    tamano: TamanoRamo.Grande,
    precio: '90.00',
    stock: 9,
    activo: false,
  },
];

type PedidoDemo = {
  cliente: string;
  whatsapp: string;
  estado: EstadoPedido;
  metodoPago: string | null;
  diasEntrega: number | null;
  items: { ramo: string; cantidad: number }[];
};

const PEDIDOS: PedidoDemo[] = [
  {
    cliente: 'María Quispe',
    whatsapp: '900111222',
    estado: EstadoPedido.Pendiente,
    metodoPago: null,
    diasEntrega: 3,
    items: [{ ramo: 'Peonía pastel', cantidad: 1 }],
  },
  {
    cliente: 'Carlos Mendoza',
    whatsapp: '900333444',
    estado: EstadoPedido.EnPreparacion,
    metodoPago: 'Yape',
    diasEntrega: 2,
    items: [
      { ramo: 'Girasol de otoño', cantidad: 1 },
      { ramo: 'Tulipán suave', cantidad: 2 },
    ],
  },
  {
    cliente: 'Lucía Ramírez',
    whatsapp: '900555666',
    estado: EstadoPedido.Entregado,
    metodoPago: 'Efectivo',
    diasEntrega: -2,
    items: [{ ramo: 'Jumbo premium', cantidad: 1 }],
  },
  {
    cliente: 'Ana Torres',
    whatsapp: '900777888',
    estado: EstadoPedido.Pagado,
    metodoPago: 'Transferencia',
    diasEntrega: -1,
    items: [{ ramo: 'Rosa eterna', cantidad: 2 }],
  },
];

function obtener<T>(mapa: Map<string, T>, clave: string, contexto: string): T {
  const valor = mapa.get(clave);
  if (!valor) {
    throw new Error(
      `Dato de demostración inconsistente: ${contexto} "${clave}".`,
    );
  }
  return valor;
}

function sumarDias(dias: number): Date {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

/**
 * Orden obligatorio: `pedido_items` apunta a `ramos` sin cascada, así que los
 * pedidos van primero (sus items los siguen). Las recetas caen con su ramo.
 */
async function vaciar(): Promise<void> {
  await prisma.pedido.deleteMany();
  await prisma.ramo.deleteMany();
  await prisma.materiaPrima.deleteMany();
  await prisma.usuario.deleteMany();
}

async function sembrarMaterias(): Promise<
  Map<string, { id: number; costo: number }>
> {
  const porNombre = new Map<string, { id: number; costo: number }>();

  for (const materia of MATERIAS) {
    const fila = await prisma.materiaPrima.create({
      data: {
        nombre: materia.nombre,
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
        nombre: ramo.nombre,
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
        clienteNombre: pedido.cliente,
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
  await prisma.usuario.create({
    data: {
      email: USUARIO_EMAIL,
      passwordHash: await bcrypt.hash(USUARIO_PASSWORD, 12),
    },
  });
}

async function main(): Promise<void> {
  assertLocalDatabase();

  await vaciar();
  const materias = await sembrarMaterias();
  const ramos = await sembrarRamos(materias);
  await sembrarPedidos(ramos);
  await sembrarUsuario();

  console.log(
    `Listo: ${RAMOS.length} ramos, ${MATERIAS.length} materias primas, ` +
      `${PEDIDOS.length} pedidos y el usuario ${USUARIO_EMAIL}.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error('El sembrador de demostración falló:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
