import { prisma } from '../../database/prisma.js';
import type { Barbeiro, CreateBarbeiroDTO, UpdateBarbeiroDTO } from './barbeiro.types.js';

export class BarbeiroRepository {

    public async create(barbeiro: CreateBarbeiroDTO): Promise<Barbeiro> {
        const newBarbeiro = await prisma.barbeiro.create({
            data: barbeiro
        });
        return newBarbeiro;
    }

    public async update(id: string, barbeiro: UpdateBarbeiroDTO): Promise<Barbeiro | null> {
       return await prisma.barbeiro.update({
        where: { id },
        data: barbeiro,
      });
    }

    public async getByID(id: string): Promise<Barbeiro | null> {
        return await prisma.barbeiro.findUnique({
            where: { id },
        });
    }

    public async getByName(nome: string): Promise<Barbeiro | null> {
        return await prisma.barbeiro.findFirst({
            where: { nome },
        });
    }

    public async getByPhone(telefone: string): Promise<Barbeiro | null> {
        return await prisma.barbeiro.findUnique({
            where: { telefone },
        });
    }

    public async getAll(): Promise<Barbeiro[]> {
        return await prisma.barbeiro.findMany({
            orderBy: [
                {
                    isAdmin: "desc",
                },
                {
                    created_at: "desc",
                },
            ]
        });
    }

    public async countAdmins(): Promise<number> {
        return await prisma.barbeiro.count({ where: { isAdmin: true, ativo: true } });
    }

    public async remove(id: string): Promise<boolean> {
        await prisma.barbeiro.delete({
            where: { id },
        });
        return true;
    }

    public async checkHour(barbeiroId: string,  hour: String): Promise<boolean> {
        const barbeiro = await this.getByID(barbeiroId);
        if (!barbeiro)
            return false;
        return hour >= barbeiro.h_entrada && hour <= barbeiro.h_saida;
    }
}

export const barbeiroRepository = new BarbeiroRepository();