import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma.js";
import type { AuthPayload } from "../modules/auth/auth.types.js";

export const ensureAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token)
        return res.status(401).json({ error: "Token de autenticação não fornecido" });

    const secret = process.env.JWT_SECRET;

    if (!secret)
        throw new Error("JWT_SECRET não foi definido");

    let decoded: AuthPayload;

    try {
        decoded = jwt.verify(token, secret) as unknown as AuthPayload;
    } catch {
        return res.status(401).json({ error: "Acess token inválido ou expirado" });
    }

    // O token pode estar desactualizado: o utilizador pode ter sido apagado ou despromovido
    let isAdmin = false;

    if (decoded.role === "BARBEIRO") {
        const barbeiro = await prisma.barbeiro.findUnique({
            where: { id: decoded.id },
            select: { isAdmin: true },
        });

        if (!barbeiro)
            return res.status(401).json({ error: "Utilizador não encontrado" });

        isAdmin = barbeiro.isAdmin;
    } else {
        const cliente = await prisma.cliente.findUnique({
            where: { id: decoded.id },
            select: { id: true },
        });

        if (!cliente)
            return res.status(401).json({ error: "Utilizador não encontrado" });
    }

    req.user = {
        id: decoded.id,
        role: decoded.role,
        isAdmin,
    };

    return next();
};
