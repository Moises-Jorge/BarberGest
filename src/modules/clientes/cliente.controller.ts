import type { Request, Response } from "express";
import { clienteService, ClienteService } from "./cliente.service.js";

export class ClienteController {
    constructor(private readonly service: ClienteService = clienteService) {}

    public createCliente = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { nome, telefone, senha } = req.body;
            const cliente = await this.service.createCliente({ nome, telefone, senha });
            return res.status(201).json(cliente);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || "Erro ao criar cliente." });
        }
    };

    public getClientes = async (req: Request, res: Response): Promise<Response> => {
        try {
            const clientes = await this.service.getClientes();
            return res.status(200).json(clientes);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || "Erro ao buscar clientes." });
        }
    };

    public getClienteById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const cliente = await this.service.getClienteById(id);
            return res.status(200).json(cliente);
        } catch (error: any) {
            return res.status(404).json({ error: error.message || "Cliente não encontrado." });
        }
    };

    public updateCliente = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const updatedCliente = req.body;
            const cliente = await this.service.updateCliente(id, updatedCliente);
            return res.status(200).json(cliente);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || "Erro ao atualizar cliente." });
        }
    };

    public deleteCliente = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            await this.service.deleteCliente(id);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(404).json({ error: error.message || "Cliente não encontrado." });
        }
    };
}

export const clienteController = new ClienteController();