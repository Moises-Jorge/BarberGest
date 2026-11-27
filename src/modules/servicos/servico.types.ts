export interface Servico {
  id: string;
  nome: string;
  descricao?: string | null;
  preco: number;
  duracao: number;
  imagemUrl?: string | null;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
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