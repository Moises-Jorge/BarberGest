export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  senha?: string;
  imagemUrl?: string | null;
  created_at: Date;
  updated_at: Date;
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