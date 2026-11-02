import type { Request, Response, NextFunction } from "express";

export const ensureOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user)
        return res.status(401).json({ error: "Utilizador não autenticado" });

    const { id } = req.params
    const loggedUserId = req.user.id;
    const isAdmin  = req.user.role === "BARBEIRO" && req.user.isAdmin;

    if (loggedUserId === id || isAdmin)
        return next();

    return res.status(403).json({
        error: "Acesso negado. Não tem permissão para realizar está acção.",
    });
};