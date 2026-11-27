import { AppError } from "../../shared/errors/AppError.js";
import { deleteUnusedImage } from "../../utils/deleteUnusedImage.js";
import { servicoRepository, ServicoRepository } from "./servico.repository.js";
import type { Servico, CreateServicoDTO, UpdateServicoDTO } from "./servico.types.js";

export class ServicoService {
    constructor(private readonly repository: ServicoRepository) {}

    public async create(servico: CreateServicoDTO): Promise<Servico> {

        if (servico.preco <= 0) {
            throw new AppError("O preço do serviço deve ser positivo.", 400);
        }

        if (servico.duracao <= 0) {
            throw new AppError("A duração do serviço deve ser positiva.", 400);
        }
        return await this.repository.create({
            ...servico,
            ativo: servico.ativo ?? true,
        });
    }

    public async update(id: string, servico: UpdateServicoDTO): Promise<Servico | null> {
        const existingServico = await this.repository.getById(id);
        if (!existingServico) {
            throw new AppError("Serviço não encontrado.", 404);
        }

        if (servico.preco !== undefined && servico.preco <= 0) {
            throw new AppError("O preço do serviço deve ser positivo.", 400);
        }

        if (servico.duracao !== undefined && servico.duracao <= 0) {
            throw new AppError("A duração do serviço deve ser positiva.", 400);
        }

        const updatedServico = await this.repository.update(id, servico);

        if (servico.imagemUrl) {
            await deleteUnusedImage(existingServico.imagemUrl);
        }

        return updatedServico;
    }

    public async getAll(): Promise<Servico[]> {
        return await this.repository.getAll();
    }

    public async getById(id: string): Promise<Servico | null> {
        const servico = await this.repository.getById(id);
        if (!servico) {
            throw new AppError("Serviço não encontrado.", 404);
        }
        return servico;
    }

    public async remove(id: string): Promise<void> {
        const existingServico = await this.repository.getById(id);
        if (!existingServico) {
            throw new AppError("Serviço não encontrado.", 404);
        }
        await this.repository.remove(id);
        await deleteUnusedImage(existingServico.imagemUrl);
    }
}

export const servicoService = new ServicoService(servicoRepository);