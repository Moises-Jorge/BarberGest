-- AlterTable
ALTER TABLE "barbeiros" ADD COLUMN     "imagem_url" TEXT,
ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "imagem_url" TEXT;
