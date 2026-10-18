export interface Barbeiro {
  id: string;
  nome: string;
  telefone: string;
  h_entrada: string;
  h_saida: string;
  senha?: string;
  imagemUrl?: string | null;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBarbeiroDTO {
  nome: string;
  telefone: string;
  senha: string;
  h_entrada: string;
  h_saida: string;
  imagemUrl?: string;
  isAdmin?: boolean;
}

export interface UpdateBarbeiroDTO {
  nome?: string;
  telefone?: string;
  senha?: string;
  h_entrada?: string;
  h_saida?: string;
  imagemUrl?: string;
  isAdmin?: boolean;
}

export type BarbeiroResponseDTO = Omit<Barbeiro, 'senha'>;
