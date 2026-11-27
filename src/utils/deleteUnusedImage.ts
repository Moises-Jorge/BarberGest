import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../database/prisma.js";
import { UPLOADS_FOLDER } from "../config/upload.js";

// Apaga uma imagem local que deixou de ser usada. URLs externos são ignorados.
export async function deleteUnusedImage(imagemUrl: string | null | undefined): Promise<void> {
    const name = imagemUrl?.split("/files/")[1];

    if (!name || name === "." || name === ".." || /[\\/]/.test(name))
        return;

    // o imagemUrl pode ser escrito pelo utilizador: não apagar ficheiros usados por outro registo
    const where = { imagemUrl: { endsWith: `/files/${name}` } };
    const references = await Promise.all([
        prisma.barbeiro.count({ where }),
        prisma.cliente.count({ where }),
        prisma.servico.count({ where }),
    ]);

    if (references.some((total) => total > 0))
        return;

    // o ficheiro pode não existir neste servidor
    await unlink(path.join(UPLOADS_FOLDER, name)).catch(() => {});
}
