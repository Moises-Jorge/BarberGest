import { barbeiroRepository, BarbeiroRepository } from "./barbeiro.repository.js";
import type { Barbeiro, CreateBarbeiro, UpdateBarbeiro, BarbeiroResponse } from "./barbeiro.types.js";
import bcrypt from "node:crypto";

export class BarbeiroService {
   constructor(private readonly repository: BarbeiroRepository = barbeiroRepository) {}

   private sanitizeBarbeiro(barbeiro: Barbeiro): BarbeiroResponse {
      const { senha, ...barbeiroResponse } = barbeiro;
      return barbeiroResponse;
   }

   private validateHour(h_entrada: string, h_saida: string): void {
      const regexHore = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!regexHore.test(h_entrada) || !regexHore.test(h_saida)) {
            throw new Error("A hora de entrada e saída deve estar no formato HH:mm.");
        }

        if (h_entrada >= h_saida) {
            throw new Error("A hora de entrada deve ser menor que a hora de saída.");
        }
   }

   public async createBarbeiro(barbeiro: CreateBarbeiro): Promise<BarbeiroResponse> {
            const barbeiroExists = this.repository.getByPhone(barbeiro.telefone);

            if (barbeiroExists) {
                throw new Error("Já existe um barbeiro com este telefone.");
            }

            this.validateHour(barbeiro.h_entrada, barbeiro.h_saida);

            const passHash = await bcrypt.hash(barbeiro.senha, 8);

            const newBarbeiro = this.repository.create({ ...barbeiro, senha: passHash });
            return this.sanitizeBarbeiro(newBarbeiro);
   }

   public async getBarbeiros(): Promise<BarbeiroResponse[]> {
      const barbeiros = this.repository.getAll();
      return barbeiros.map((barbeiro) => this.sanitizeBarbeiro(barbeiro));
   }

   public async getBarbeiroById(id: string): Promise<BarbeiroResponse | undefined> {
      const barbeiro = this.repository.getByID(id);

      if (!barbeiro) {
         throw new Error("Barbeiro não encontrado.");
      }

      return this.sanitizeBarbeiro(barbeiro);
   }

   public async updateBarbeiro(id: string, barbeiro: UpdateBarbeiro): Promise<BarbeiroResponse> {
      const existingBarbeiro = this.repository.getByID(id);

      if (!existingBarbeiro) {
         throw new Error("Barbeiro não encontrado.");
      }

      if (barbeiro.telefone && barbeiro.telefone !== existingBarbeiro.telefone) {
         const barbeiroExists = this.repository.getByPhone(barbeiro.telefone);

         if (barbeiroExists) {
            throw new Error("Já existe um barbeiro com este telefone.");
         }
      }

      const h_entrada = barbeiro.h_entrada ?? existingBarbeiro.h_entrada;
      const h_saida = barbeiro.h_saida ?? existingBarbeiro.h_saida;
      this.validateHour(h_entrada, h_saida);

      let updatedBarber = { ...barbeiro };

      if (barbeiro.senha) {
         const passHash = await bcrypt.hash(barbeiro.senha, 8);
         updatedBarber.senha = passHash;
      }

      const updatedBarbeiro = this.repository.update(id, updatedBarber);
      
      if (!updatedBarbeiro) {
         throw new Error("Erro ao atualizar dados do barbeiro.");
      }

      return this.sanitizeBarbeiro(updatedBarbeiro);
    }

    public async deleteBarbeiro(id: string): Promise<void> {
        const existingBarbeiro = this.repository.remove(id);

        if (!existingBarbeiro) {
            throw new Error("Barbeiro não encontrado.");
        }
    }

    public async checkBarbeiroAvailability(id: string, dataHour: string): Promise<boolean> {
        const existingBarbeiro = this.repository.getByID(id);

        if (!existingBarbeiro) {
            throw new Error("Barbeiro não encontrado.");
        }

        const hours = String(dataHour.getHours()).padStart(2, '0');
        const minutes = String(dataHour.getMinutes()).padStart(2, '0');
        const hourString = `${hours}:${minutes}`;

        const isAvailable = this.repository.checkHour(id, hourString);
        if (!isAvailable) {
            throw new Error("Barbeiro não está disponível neste horário.");
        }

        return isAvailable;
    }
}

export const barbeiroService = new BarbeiroService();
