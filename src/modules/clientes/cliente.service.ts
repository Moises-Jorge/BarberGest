import bcrypt from "bcryptjs";
import { clienteRepository, ClienteRepository } from "./cliente.repository.js";
import type { Cliente, CreateClienteDTO, UpdateClienteDTO, ClienteResponse } from "./cliente.types.js";

export class ClienteService {
    constructor(private readonly repository: ClienteRepository = clienteRepository) {}

    private sanitizeCliente(cliente: Cliente): ClienteResponse {
        const { senha, ...clienteResponse } = cliente;
        return clienteResponse;
    }

    public async createCliente(cliente: CreateClienteDTO): Promise<ClienteResponse> {
        const clienteExists = await this.repository.getByPhone(cliente.telefone);

        if (clienteExists) {
            throw new Error("Já existe um cliente com este telefone.");
        }

        const passHash = await bcrypt.hash(cliente.senha, 8);

        const newCliente = await this.repository.create({ ...cliente, senha: passHash });
        return this.sanitizeCliente(newCliente);
    }

    public async getClientes(): Promise<ClienteResponse[]> {
        const clientes = await this.repository.getAll();
        return clientes.map((cliente) => this.sanitizeCliente(cliente));
    }

    public async getClienteById(id: string): Promise<ClienteResponse | undefined> {
        const cliente = await this.repository.getById(id);

        if (!cliente) {
            throw new Error("Cliente não encontrado.");
        }

        return this.sanitizeCliente(cliente);
    }

    public async updateCliente(id: string, cliente: UpdateClienteDTO): Promise<ClienteResponse> {
        const existingCliente = await this.repository.getById(id);

        if (!existingCliente) {
            throw new Error("Cliente não encontrado.");
        }

        if (cliente.telefone && cliente.telefone !== existingCliente.telefone) {
            const clienteExists = await this.repository.getByPhone(cliente.telefone);

            if (clienteExists) {
                throw new Error("O numero informado já está em uso por outro cliente.");
            }
        }

        let updatedCliente = { ...cliente };
        if (cliente.senha) {
            const passHash = await bcrypt.hash(cliente.senha, 8);
            updatedCliente.senha = passHash;
        }

        const updatedClienteData = await this.repository.update(id, updatedCliente);

        if (!updatedClienteData) {
            throw new Error("Erro ao atualizar dados do cliente.");
        }

        return this.sanitizeCliente(updatedClienteData);
    }

    public async deleteCliente(id: string): Promise<void> {
        const existingCliente = await this.repository.getById(id);

        if (!existingCliente) {
            throw new Error("Cliente não encontrado.");
        }

        await this.repository.remove(id);
    }
}

export const clienteService = new ClienteService();

