export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  senha?: string;
}

export interface CreateClienteDTO {
    nome: string;
    telefone: string;
    senha: string;
}

export interface UpdateClienteDTO {
    nome?: string;
    telefone?: string;
    senha?: string;
}

export type ClienteResponse = Omit<Cliente, 'senha'>;