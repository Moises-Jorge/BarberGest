import { servicoRepository, ServicoRepository } from "./servico.repository.js";
import type { Servico, CreateServicoDTO, UpdateServicoDTO } from "./servico.types.js";

export class ServicoService {
    constructor(private readonly repository: ServicoRepository) {}

    public async create(servico: CreateServicoDTO): Promise<Servico> {

        if (servico.preco <= 0) {
            throw new Error("O preço do serviço deve ser positivo.");
        }

        if (servico.duracao <= 0) {
            throw new Error("A duração do serviço deve ser positiva.");
        }
        return await this.repository.create({
            ...servico,
            ativo: servico.ativo ?? true,
        });
    }

    public async update(id: number, servico: UpdateServicoDTO): Promise<Servico | null> {
        const existingServico = await this.repository.getById(id);
        if (!existingServico) {
            throw new Error("Serviço não encontrado.");
        }

        if (servico.preco !== undefined && servico.preco <= 0) {
            throw new Error("O preço do serviço deve ser positivo.");
        }

        if (servico.duracao !== undefined && servico.duracao <= 0) {
            throw new Error("A duração do serviço deve ser positiva.");
        }

        return await this.repository.update(id, servico);
    }

    public async getAll(): Promise<Servico[]> {
        return await this.repository.getAll();
    }

    public async getById(id: number): Promise<Servico | null> {
        const servico = await this.repository.getById(id);
        if (!servico) {
            throw new Error("Serviço não encontrado.");
        }
        return servico;
    }

    public async remove(id: number): Promise<void> {
        const existingServico = await this.repository.getById(id);
        if (!existingServico) {
            throw new Error("Serviço não encontrado.");
        }
        await this.repository.remove(id);
    }
}

export const servicoService = new ServicoService(servicoRepository);