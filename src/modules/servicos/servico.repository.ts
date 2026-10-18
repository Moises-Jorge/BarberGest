import { prisma } from "../../database/prisma.js";
import type { Servico, CreateServicoDTO, UpdateServicoDTO } from "./servico.types.js"

export class ServicoRepository {
    public async create(servico: CreateServicoDTO): Promise<Servico> {
        return await prisma.servico.create({
            data: servico, 
        });
    }

    public async update(id: number, servico: UpdateServicoDTO): Promise<Servico | null> {
        return await prisma.servico.update({
            where: { id },
            data: servico,
        });
    }

    public async getAll(): Promise<Servico[]> {
        return await prisma.servico.findMany();
    }

    public async getById(id: number): Promise<Servico | null> {
        return await prisma.servico.findUnique({
            where: { id },
        });
    }

    public async remove(id: number): Promise<boolean> {
        await prisma.servico.delete({
            where: { id },
        });
        return true;
    }
}

export const servicoRepository = new ServicoRepository();
