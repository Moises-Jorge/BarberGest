import { AppError } from "../../shared/errors/AppError.js";
import { deleteUnusedImage } from "../../utils/deleteUnusedImage.js";
import bcrypt from "bcryptjs";
import { clienteRepository, ClienteRepository } from "./cliente.repository.js";
import type { Cliente, CreateClienteDTO, UpdateClienteDTO, ClienteResponseDTO } from "./cliente.types.js";

export class ClienteService {
    constructor(private readonly repository: ClienteRepository = clienteRepository) {}

    private sanitizeCliente(cliente: Cliente): ClienteResponseDTO {
        const { senha, ...clienteResponse } = cliente;
        return clienteResponse;
    }

    public async createCliente(cliente: CreateClienteDTO): Promise<ClienteResponseDTO> {
        const clienteExists = await this.repository.getByPhone(cliente.telefone);

        if (clienteExists) {
            throw new AppError("Já existe um cliente com este telefone.", 409);
        }

        const passHash = await bcrypt.hash(cliente.senha, 8);

        const newCliente = await this.repository.create({ ...cliente, senha: passHash });
        return this.sanitizeCliente(newCliente);
    }

    public async getClientes(): Promise<ClienteResponseDTO[]> {
        const clientes = await this.repository.getAll();
        return clientes.map((cliente) => this.sanitizeCliente(cliente));
    }

    public async getClienteById(id: string): Promise<ClienteResponseDTO | undefined> {
        const cliente = await this.repository.getById(id);

        if (!cliente) {
            throw new AppError("Cliente não encontrado.", 404);
        }

        return this.sanitizeCliente(cliente);
    }

    public async updateCliente(id: string, cliente: UpdateClienteDTO): Promise<ClienteResponseDTO> {
        const existingCliente = await this.repository.getById(id);

        if (!existingCliente) {
            throw new AppError("Cliente não encontrado.", 404);
        }

        if (cliente.telefone && cliente.telefone !== existingCliente.telefone) {
            const clienteExists = await this.repository.getByPhone(cliente.telefone);

            if (clienteExists) {
                throw new AppError("O numero informado já está em uso por outro cliente.", 409);
            }
        }

        let updatedCliente = { ...cliente };
        if (cliente.senha) {
            const passHash = await bcrypt.hash(cliente.senha, 8);
            updatedCliente.senha = passHash;
        }

        const updatedClienteData = await this.repository.update(id, updatedCliente);

        if (!updatedClienteData) {
            throw new AppError("Erro ao atualizar dados do cliente.", 500);
        }

        if (cliente.imagemUrl) {
            await deleteUnusedImage(existingCliente.imagemUrl);
        }

        return this.sanitizeCliente(updatedClienteData);
    }

    public async deleteCliente(id: string): Promise<void> {
        const existingCliente = await this.repository.getById(id);

        if (!existingCliente) {
            throw new AppError("Cliente não encontrado.", 404);
        }

        await this.repository.remove(id);
        await deleteUnusedImage(existingCliente.imagemUrl);
    }
}

export const clienteService = new ClienteService();

