/*
  Warnings:

  - You are about to alter the column `monto` on the `CashMovement` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `precioCosto` on the `Producto` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `precioVenta` on the `Producto` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `precioEspecial` on the `Producto` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the `Venta` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `Proveedor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fullName` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_usuarioId_fkey";

-- AlterTable
ALTER TABLE "CashMovement" ALTER COLUMN "monto" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Producto" ALTER COLUMN "precioCosto" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "precioVenta" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "precioEspecial" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Proveedor" ADD COLUMN     "contacto" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "fullName" TEXT NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "Venta";

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "numeroTicket" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketItem" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "TicketItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_ticket_usuario_fecha" ON "Ticket"("usuarioId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_usuarioId_fecha_numeroTicket_key" ON "Ticket"("usuarioId", "fecha", "numeroTicket");

-- CreateIndex
CREATE INDEX "idx_ticketitem_ticket" ON "TicketItem"("ticketId");

-- CreateIndex
CREATE INDEX "idx_ticketitem_producto" ON "TicketItem"("productoId");

-- CreateIndex
CREATE INDEX "idx_cashmovement_usuario_createdat" ON "CashMovement"("usuarioId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE INDEX "idx_categoria_nombre" ON "Categoria"("nombre");

-- CreateIndex
CREATE INDEX "idx_producto_nombre" ON "Producto"("nombre");

-- CreateIndex
CREATE INDEX "idx_producto_categoria" ON "Producto"("categoriaId");

-- CreateIndex
CREATE INDEX "idx_producto_proveedor" ON "Producto"("proveedorId");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_nombre_key" ON "Proveedor"("nombre");

-- CreateIndex
CREATE INDEX "idx_proveedor_nombre" ON "Proveedor"("nombre");

-- CreateIndex
CREATE INDEX "idx_sessionevent_usuario_timestamp" ON "SessionEvent"("usuarioId", "timestamp");

-- CreateIndex
CREATE INDEX "idx_usuario_email" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketItem" ADD CONSTRAINT "TicketItem_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketItem" ADD CONSTRAINT "TicketItem_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
