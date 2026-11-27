import type { Request, Response, NextFunction } from "express";

// Impede que um barbeiro sem privilégios altere o campo isAdmin, mesmo no próprio registo
export const ensureAdminForIsAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.body?.isAdmin === undefined)
        return next();

    if (req.user?.role === "BARBEIRO" && req.user.isAdmin)
        return next();

    return res.status(403).json({
        error: "Acesso negado. Apenas Administradores podem alterar o campo isAdmin.",
    });
};
