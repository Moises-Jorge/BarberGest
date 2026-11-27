import { buildImageUrl } from "../../config/imageUrl.js";
import type { Request, Response, NextFunction } from "express";
import { barbeiroService, BarbeiroService } from "./barbeiro.service.js";

export class BarbeiroController {
    constructor(private readonly service: BarbeiroService = barbeiroService) {}

    public create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        let imagemUrl: string | undefined = undefined;

        if (req.file) {
            imagemUrl = buildImageUrl(req.file.filename);
        } else if (req.body.imagemUrl) {
            imagemUrl = req.body.imagemUrl;
        }

        let isAdmin: boolean | undefined = undefined;
        if (req.body.isAdmin !== undefined) {
            isAdmin = String(req.body.isAdmin).toLowerCase() === "true" || req.body.isAdmin === true;
        }

        const barbeiro = await this.service.createBarbeiro({
            nome: req.body.nome,
            telefone: req.body.telefone,
            senha: req.body.senha,
            h_entrada: req.body.h_entrada,
            h_saida: req.body.h_saida,
            ...(imagemUrl !== undefined && { imagemUrl }),
            ...(isAdmin !== undefined && { isAdmin }),
        });

        return res.status(201).json(barbeiro);
    };

    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const barbeiros = await this.service.getBarbeiros();
        res.status(200).json(barbeiros);
    };

    public getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ error: "ID do barbeiro não fornecido." });
            return;
        }

        const barbeiro = await this.service.getBarbeiroById(id);
        if (!barbeiro) {
            res.status(404).json({ error: "Barbeiro não encontrado." });
            return;
        }

        res.status(200).json(barbeiro);
    };

    public update = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<Response> => {
        const { id } = req.params;
        const updatedBarber = { ...req.body };

        if (req.body.isAdmin !== undefined) {
            updatedBarber.isAdmin = String(req.body.isAdmin).toLowerCase() === "true" || req.body.isAdmin === true;
        }

        const updatedBarbeiro = await this.service.updateBarbeiro(id, updatedBarber);
        return res.status(200).json(updatedBarbeiro);
    };

    public uploadImagem = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum ficheiro de imagem foi enviado." });
        }

        const imagemUrl = buildImageUrl(req.file.filename);
        const barbeiro = await this.service.updateBarbeiro(id, { imagemUrl });

        return res.status(200).json(barbeiro);
    };

    public delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        await this.service.deleteBarbeiro(id);
        res.status(204).send();
    };
}

export const barbeiroController = new BarbeiroController();