import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  
  const adminExists = await prisma.barbeiro.findFirst({
    where: { isAdmin: true },
  });

  if (!adminExists) {
    const nome = process.env.ADMIN_NAME || "Administrador Geral";
    const telefone = process.env.ADMIN_PHONE;
    const senha = process.env.ADMIN_PASSWORD;

    if (!telefone || !senha) {
      console.log(
        "⚠️ Seed ignorado: INITIAL_ADMIN_PHONE ou INITIAL_ADMIN_PASSWORD não configurados no .env."
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const admin = await prisma.barbeiro.create({
      data: {
        nome,
        telefone,
        senha: hashedPassword,
        h_entrada: "08:00",
        h_saida: "18:00",
        isAdmin: true,
      },
    });

    console.log(`✅ Admin inicial criado com sucesso: ${admin.telefone}`);
  } else {
    console.log("ℹ️ Admin já existente na base de dados. Seed ignorado.");
  }
}

main()
  .catch((error) => {
    console.error("❌ Erro ao executar o seed do admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });