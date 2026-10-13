export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  senha?: string;
  imagemUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClienteDTO {
  nome: string;
  telefone: string;
  senha: string;
  imagemUrl?: string;
}

export interface UpdateClienteDTO {
  nome?: string;
  telefone?: string;
  senha?: string;
  imagemUrl?: string;
}

export type ClienteResponseDTO = Omit<Cliente, 'senha'>;