import type { Request, Response } from "express";
import { authService, AuthService } from "./auth.service.js";

export class AuthController {
    constructor(private readonly service: AuthService = authService) {}

    public loginCliente = async (req: Request, res: Response): Promise<Response> => {
        try {
            const result = await this.service.loginCliente(req.body);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(401).json({ error: error.message });
        }
    };

    public loginBarbeiro = async (req: Request, res: Response): Promise<Response> => {
        try {
            const result = await this.service.loginBarbeiro(req.body);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(401).json({ error: error.message });
        }
    };

    

    
}