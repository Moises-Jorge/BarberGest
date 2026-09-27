export interface Barbeiro {
  id: string;
  nome: string;
  senha: string;
  telefone: string;
  h_entrada: string;
  h_saida: string;
}

export type CreateBarbeiro = Omit<Barbeiro, 'id'>;
export type UpdateBarbeiro = Partial<CreateBarbeiro>;
export type BarbeiroResponse = Omit<Barbeiro, 'senha'>;
