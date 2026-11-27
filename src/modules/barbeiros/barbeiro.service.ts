import { AppError } from "../../shared/errors/AppError.js";
import { deleteUnusedImage } from "../../utils/deleteUnusedImage.js";
import { barbeiroRepository, BarbeiroRepository } from "./barbeiro.repository.js";
import type { Barbeiro, CreateBarbeiroDTO, UpdateBarbeiroDTO, BarbeiroResponseDTO } from "./barbeiro.types.js";
import bcrypt from "bcryptjs";

export class BarbeiroService {
   constructor(private readonly repository: BarbeiroRepository = barbeiroRepository) {}

   private sanitizeBarbeiro(barbeiro: Barbeiro): BarbeiroResponseDTO {
      const { senha, ...barbeiroResponse } = barbeiro;
      return barbeiroResponse;
   }

   private validateHour(h_entrada: string, h_saida: string): void {
      const regexHore = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!regexHore.test(h_entrada) || !regexHore.test(h_saida)) {
            throw new AppError("A hora de entrada e saída deve estar no formato HH:mm.", 400);
        }

        if (h_entrada >= h_saida) {
            throw new AppError("A hora de entrada deve ser menor que a hora de saída.", 400);
        }
   }

   // sem nenhum administrador deixava de ser possível gerir o sistema
   private async ensureNotLastAdmin(barbeiro: Barbeiro): Promise<void> {
      if (barbeiro.isAdmin && barbeiro.ativo && (await this.repository.countAdmins()) <= 1) {
         throw new AppError("Não é possível remover o último administrador.", 409);
      }
   }

   public async createBarbeiro(barbeiro: CreateBarbeiroDTO): Promise<BarbeiroResponseDTO> {
            const barbeiroExists = await this.repository.getByPhone(barbeiro.telefone);

            if (barbeiroExists) {
                throw new AppError("Já existe um barbeiro com este telefone.", 409);
            }

            this.validateHour(barbeiro.h_entrada, barbeiro.h_saida);

            const passHash = await bcrypt.hash(barbeiro.senha, 8);

            const newBarbeiro = await this.repository.create({ 
               ...barbeiro, 
               senha: passHash,
               isAdmin: barbeiro.isAdmin ?? false 
            });
            
            return this.sanitizeBarbeiro(newBarbeiro);
   }

   public async getBarbeiros(): Promise<BarbeiroResponseDTO[]> {
      const barbeiros = await this.repository.getAll();
      return barbeiros.map((barbeiro) => this.sanitizeBarbeiro(barbeiro));
   }

   public async getBarbeiroById(id: string): Promise<BarbeiroResponseDTO | undefined> {
      const barbeiro = await this.repository.getByID(id);

      if (!barbeiro) {
         return undefined;
      }

      return this.sanitizeBarbeiro(barbeiro);
   }

   public async updateBarbeiro(id: string, barbeiro: UpdateBarbeiroDTO): Promise<BarbeiroResponseDTO> {
      const existingBarbeiro = await this.repository.getByID(id);

      if (!existingBarbeiro) {
         throw new AppError("Barbeiro não encontrado.", 404);
      }

      if (barbeiro.telefone && barbeiro.telefone !== existingBarbeiro.telefone) {
         const barbeiroExists = await this.repository.getByPhone(barbeiro.telefone);

         if (barbeiroExists) {
            throw new AppError("Já existe um barbeiro com este telefone.", 409);
         }
      }

      if (barbeiro.isAdmin === false) {
         await this.ensureNotLastAdmin(existingBarbeiro);
      }

      const h_entrada = barbeiro.h_entrada ?? existingBarbeiro.h_entrada;
      const h_saida = barbeiro.h_saida ?? existingBarbeiro.h_saida;
      this.validateHour(h_entrada, h_saida);

      let updatedBarber = { ...barbeiro };

      if (barbeiro.senha) {
         const passHash = await bcrypt.hash(barbeiro.senha, 8);
         updatedBarber.senha = passHash;
      }

      const updatedBarbeiro = await this.repository.update(id, updatedBarber);
      
      if (!updatedBarbeiro) {
         throw new AppError("Erro ao atualizar dados do barbeiro.", 500);
      }

      if (barbeiro.imagemUrl) {
         await deleteUnusedImage(existingBarbeiro.imagemUrl);
      }

      return this.sanitizeBarbeiro(updatedBarbeiro);
    }

    public async deleteBarbeiro(id: string): Promise<void> {
        const existingBarbeiro = await this.repository.getByID(id);

        if (!existingBarbeiro) {
            throw new AppError("Barbeiro não encontrado.", 404);
        }

        await this.ensureNotLastAdmin(existingBarbeiro);
        await this.repository.remove(id);
        await deleteUnusedImage(existingBarbeiro.imagemUrl);
    }

    public async checkBarbeiroAvailability(id: string, dataHour: Date): Promise<boolean> {
        const existingBarbeiro = await this.repository.getByID(id);

        if (!existingBarbeiro) {
            throw new AppError("Barbeiro não encontrado.", 404);
        }

        const hours = String(dataHour.getHours()).padStart(2, '0');
        const minutes = String(dataHour.getMinutes()).padStart(2, '0');
        const hourString = `${hours}:${minutes}`;

        const isAvailable = await this.repository.checkHour(id, hourString);
        if (!isAvailable) {
            throw new AppError("Barbeiro não está disponível neste horário.", 409);
        }

        return isAvailable;
    }
}

export const barbeiroService = new BarbeiroService();
