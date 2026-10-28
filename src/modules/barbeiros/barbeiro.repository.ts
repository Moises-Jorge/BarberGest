import { prisma } from '../../database/prisma.js';
import type { Barbeiro, CreateBarbeiroDTO, UpdateBarbeiroDTO } from './barbeiro.types.js';
import bcrypt from "bcryptjs";

export class BarbeiroRepository {

    public async create(barbeiro: CreateBarbeiroDTO): Promise<Barbeiro> {
        const newBarbeiro = await prisma.barbeiro.create({
            data: barbeiro
        });
        return newBarbeiro;
    }

    public async update(id: string, barbeiro: UpdateBarbeiroDTO): Promise<Barbeiro | undefined> {
       return await prisma.barbeiro.update({
        where: { id },
        data: barbeiro,
      });
    }

    public async getByID(id: string): Promise<Barbeiro | undefined> {
        return await prisma.barbeiro.findUnique({
            where: { id },
        });
    }

    public async getByName(nome: string): Promise<Barbeiro | undefined> {
        return await prisma.barbeiro.findUnique({
            where: { nome },
        });
    }

    public async getByPhone(telefone: string): Promise<Barbeiro | undefined> {
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