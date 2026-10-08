-- CreateEnum
CREATE TYPE "TamanoRamo" AS ENUM ('Pequeño', 'Mediano', 'Grande', 'Jumbo');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('Pendiente', 'En preparación', 'Entregado', 'Pagado');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ramos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "tamano" "TamanoRamo" NOT NULL,
    "foto_url" VARCHAR(500),
    "precioVenta" DECIMAL(10,2) NOT NULL,
    "costo_calculado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ramos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias_primas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "unidad" VARCHAR(50) NOT NULL,
    "stock_actual" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "costoUnitario" DECIMAL(10,2) NOT NULL,
    "stock_minimo_alerta" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materias_primas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recetas" (
    "id" SERIAL NOT NULL,
    "ramo_id" INTEGER NOT NULL,
    "materia_prima_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "recetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "cliente_nombre" VARCHAR(255) NOT NULL,
    "cliente_whatsapp" VARCHAR(20) NOT NULL,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'Pendiente',
    "metodo_pago" VARCHAR(100),
    "monto_total" DECIMAL(10,2) NOT NULL,
    "fecha_entrega" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_items" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "ramo_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedido_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "recetas_ramo_id_materia_prima_id_key" ON "recetas"("ramo_id", "materia_prima_id");

-- AddForeignKey
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_ramo_id_fkey" FOREIGN KEY ("ramo_id") REFERENCES "ramos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materias_primas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_ramo_id_fkey" FOREIGN KEY ("ramo_id") REFERENCES "ramos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
