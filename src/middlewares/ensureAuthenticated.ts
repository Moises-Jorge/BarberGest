import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthPayload } from "../modules/auth/auth.types.js";

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        return res.status(401).json({ error: "Token de autenticação não fornecido" });

    const [, token] = authHeader.split(" ");

    try {
        const secret = process.env.JWT_SECRET;
        
        if (!secret)
            throw new Error("JWT_SECRET não foi definido");

        const decoded = jwt.verify(token, secret) as unknown as AuthPayload;

        req.user = {
            id: decoded.id,
            role: decoded.role,
            isAdmin: decoded.isAdmin,
        };

        return next();
    } catch {
        return res.status(401).json({ error: "Acess token inválido ou expirado" });
    }
};