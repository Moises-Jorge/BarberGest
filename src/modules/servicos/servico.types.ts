export interface Servico {
  id: number;
  nome: string;
  descricao?: string | null;
  preco: number;
  duracao: number;
  imagemUrl?: string | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServicoDTO {
  nome: string;
  descricao?: string | null;
  preco: number;
  duracao: number;
  imagemUrl?: string | null;
  ativo?: boolean;
}

export interface UpdateServicoDTO {
  nome?: string;
  descricao?: string | null;
  preco?: number;
  duracao?: number;
  imagemUrl?: string | null;
  ativo?: boolean;
}

export type ServicoResponse = Omit<Servico, 'ativo'>;