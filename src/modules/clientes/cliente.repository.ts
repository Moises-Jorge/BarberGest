import { prisma } from "../../database/prisma.js";
import type { Cliente, CreateClienteDTO, UpdateClienteDTO } from "./cliente.types.js"

export class ClienteRepository {
    public async create(cliente: CreateClienteDTO): Promise<Cliente> {
        return await prisma.cliente.create({
            data: cliente, 
        });
    }

    public async getById(id: string): Promise<Cliente | null> {
        return await prisma.cliente.findUnique({
            where: { id },
        });
    }

    public async getByPhone(telefone: string): Promise<Cliente | null> {
        return await prisma.cliente.findUnique({
            where: { telefone },
        });
    }

    public async getAll(): Promise<Cliente[]> {
        return await prisma.cliente.findMany();
    }

    public async update(id: string, cliente: UpdateClienteDTO): Promise<Cliente | null> {
        return await prisma.cliente.update({
            where: { id },
            data: cliente,
        });
    }

    public async remove(id: string): Promise<boolean> {
        await prisma.cliente.delete({
            where: { id },
        });
        return true;
    }
}

export const clienteRepository = new ClienteRepository();