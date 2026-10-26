import type { Request, Response, NextFunction } from "express";
import { error } from "node:console";

export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
    }

    if (req.user.role !== "BARBEIRO" || !req.user.isAdmin) {
        return res.status(403).json({
            error: "Acesso negado. Apenas Administradores podem realizar está accão.",
        });
    }

    return next();
}