import type { Request, Response, NextFunction } from "express";
import { barbeiroService, BarbeiroService } from "./barbeiro.service.js";

export class BarbeiroController {
    constructor(private readonly service: BarbeiroService = barbeiroService) {}

    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { nome, senha, telefone, h_entrada, h_saida } = req.body;
            const barbeiro = await this.service.createBarbeiro({ nome, senha, telefone, h_entrada, h_saida });

            res.status(201).json(barbeiro);
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Erro ao criar barbeiro." }); 
        }
    };

    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const barbeiros = await this.service.getBarbeiros();
            res.status(200).json(barbeiros);
        } catch (error: any) {
            res.status(500).json({ error: error.message || "Erro ao buscar barbeiros." });
        }
    };

    public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const barbeiro = await this.service.getBarbeiroById(id);

            if (!barbeiro) {
                res.status(404).json({ error: "Barbeiro não encontrado." });
                return;
            }

            res.status(200).json(barbeiro);
        } catch (error: any) {
            res.status(500).json({ error: error.message || "Erro ao buscar barbeiro." });
        }
    };

    public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const updatedBarber = req.body;

            const updatedBarbeiro = await this.service.updateBarbeiro(id, updatedBarber);
            res.status(200).json(updatedBarbeiro);
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Erro ao atualizar barbeiro." });
        }
    };

    public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await this.service.deleteBarbeiro(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Erro ao remover barbeiro." });
        }
    };
}

export const barbeiroController = new BarbeiroController();