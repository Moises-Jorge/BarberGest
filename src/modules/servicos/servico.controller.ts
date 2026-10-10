import type { Request, Response } from "express";
import { servicoService, ServicoService } from "./servico.service.js";

export class ServicoController {
    constructor(private readonly service: ServicoService = servicoService) {}

    public createServico = async (req: Request, res: Response): Promise<Response> => {
        try {
            let imagemUrl: string | undefined = undefined;

            if (req.file) {
                imagemUrl =  `${req.protocol}://${req.get("host")}/files/${req.file.filename}`;
            }

            let ativo: boolean | undefined = undefined;
            if (req.body.ativo !== undefined) {
                ativo = req.body.ativo === 'true' || req.body.ativo === true;
            }

            const servicoData = {
                nome: req.body.nome,
                descricao: req.body.descricao,
                preco: Number(req.body.preco),
                duracao: Number(req.body.duracao),
                ativo,
                imagemUrl: imagemUrl || req.body.imagemUrl,
            };

            const servico = await this.service.create(servicoData);
            return res.status(201).json(servico);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || "Erro ao criar serviço." });
        }
    };

    public updateServico = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const updatedData = req.body;

            if (req.body.preco !== undefined) {
                updatedData.preco = Number(req.body.preco);
            }

            if (req.body.duracao !== undefined) {
                updatedData.duracao = Number(req.body.duracao);
            }

            const updatedServico = await this.service.update(id, updatedData);
            return res.status(200).json(updatedServico);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || "Erro ao atualizar serviço." });
        }
    };

    public uploadImage = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;

            if (!req.file) {
                return res.status(400).json({ error: "Nenhum arquivo enviado." });
            }

            const imagemUrl = `${req.protocol}://${req.get("host")}/files/${req.file.filename}`;

            const updatedServico = await this.service.update(id, { imagemUrl });

            return res.status(200).json(updatedServico);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || "Erro ao enviar imagem." });
        }
    };

    public getAllServicos = async (req: Request, res: Response): Promise<Response> => {
        try {
            const servicos = await this.service.getAll();
            return res.status(200).json(servicos);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || "Erro ao buscar serviços." });
        }
    };

    public getServicoById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const servico = await this.service.getById(id);
            return res.status(200).json(servico);
        } catch (error: any) {
            return res.status(404).json({ error: error.message || "Serviço não encontrado." });
        }
    };

    public deleteServico = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            await this.service.remove(id);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(404).json({ error: error.message || "Serviço não encontrado." });
        }
    };
}

export const servicoController = new ServicoController(servicoService);