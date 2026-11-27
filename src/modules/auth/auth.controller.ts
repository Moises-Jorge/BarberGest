import type { Request, Response } from "express";
import { authService, AuthService } from "./auth.service.js";

export class AuthController {
    constructor(private readonly service: AuthService = authService) {}

    public loginCliente = async (req: Request, res: Response): Promise<Response> => {
        const result = await this.service.loginCliente(req.body);
        return res.status(200).json(result);
    };

    public loginBarbeiro = async (req: Request, res: Response): Promise<Response> => {
        const result = await this.service.loginBarbeiro(req.body);
        return res.status(200).json(result);
    };

    public refreshToken = async (req: Request, res: Response): Promise<Response> => {
        const { refreshToken } = req.body;

        if (!refreshToken)
            return res.status(400).json({ error: "O refresh token é obrigatório." });

        const result = await this.service.refresh(refreshToken);
        return res.status(200).json(result);
    };

    public logout = async (req: Request, res: Response): Promise<Response> => {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await this.service.logout(refreshToken);
        }

        return res.status(204).send();
    };

    public getMe = async (req: Request, res: Response): Promise<Response> => {
        if (!req.user) {
            return res.status(401).json({ error: "Utilizador não autenticado." });
        }

        const userProfile = await this.service.getMe(req.user.id, req.user.role);
        return res.status(200).json(userProfile);
    };
}