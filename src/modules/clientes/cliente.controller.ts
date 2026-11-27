import { buildImageUrl } from "../../config/imageUrl.js";
import type { Request, Response } from "express";
import { clienteService, ClienteService } from "./cliente.service.js";

export class ClienteController {
    constructor(private readonly service: ClienteService = clienteService) {}

    public createCliente = async (req: Request, res: Response): Promise<Response> => {
        let imagemUrl: string | undefined = undefined;

        if (req.file) {
            imagemUrl = buildImageUrl(req.file.filename);
        } else if (req.body.imagemUrl) {
            imagemUrl = req.body.imagemUrl;
        }

        const cliente = await this.service.createCliente({
            nome: req.body.nome,
            telefone: req.body.telefone,
            senha: req.body.senha,
            ...(imagemUrl !== undefined && { imagemUrl }),
        });

        return res.status(201).json(cliente);
    };

    public getClientes = async (req: Request, res: Response): Promise<Response> => {
        const clientes = await this.service.getClientes();
        return res.status(200).json(clientes);
    };

    public getClienteById = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
        const { id } = req.params;
        const cliente = await this.service.getClienteById(id);
        return res.status(200).json(cliente);
    };

    public updateCliente = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
        const { id } = req.params;
        const updatedCliente = req.body;
        const cliente = await this.service.updateCliente(id, updatedCliente);
        return res.status(200).json(cliente);
    };

    public uploadImagem = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum ficheiro de imagem foi enviado." });
        }

        const imagemUrl = buildImageUrl(req.file.filename);
        const cliente = await this.service.updateCliente(id, { imagemUrl });

        return res.status(200).json(cliente);
    };

    public deleteCliente = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
        const { id } = req.params;
        await this.service.deleteCliente(id);
        return res.status(204).send();
    };
}

export const clienteController = new ClienteController();