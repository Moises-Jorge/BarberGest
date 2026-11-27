import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../shared/errors/AppError.js";

export const errorHandler = (error: any, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent)
        return next(error);

    if (error instanceof AppError)
        return res.status(error.status).json({ error: error.message });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002")
            return res.status(409).json({ error: "Já existe um registo com estes dados." });

        if (error.code === "P2025")
            return res.status(404).json({ error: "Registo não encontrado." });
    }

    // erros do express.json()
    if (error?.type === "entity.parse.failed")
        return res.status(400).json({ error: "O JSON enviado é inválido." });

    if (error?.type === "entity.too.large")
        return res.status(413).json({ error: "O corpo do pedido é demasiado grande." });

    if (error?.status >= 400 && error?.status < 500)
        return res.status(error.status).json({ error: "Pedido inválido." });

    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor." });
};
