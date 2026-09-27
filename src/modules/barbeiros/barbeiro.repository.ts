import { type Barbeiro, type CreateBarbeiro, type UpdateBarbeiro } from './barbeiro.types.js';
import crypto from 'node:crypto';

export class BarbeiroRepository {
    private barbeiros: Barbeiro[] = [];

    public create(barbeiro: CreateBarbeiro): Barbeiro {
        const newBarbeiro: Barbeiro = {
            id: crypto.randomUUID(),
            ...barbeiro,
        };
        this.barbeiros.push(newBarbeiro);
        return newBarbeiro;
    }

    public update(id: string, barbeiro: UpdateBarbeiro): Barbeiro | undefined {
        const index = this.barbeiros.findIndex((b) => b.id === id);
        if (index === -1) {
            return undefined;
        }
        const updatedBarbeiro = { ...this.barbeiros[index], ...barbeiro };
        this.barbeiros[index] = updatedBarbeiro;
        return updatedBarbeiro;
    }

    public getByID(id: string): Barbeiro | undefined {
        return this.barbeiros.find((b) => b.id === id);
    }

    public getByName(nome: string): Barbeiro | undefined {
        return this.barbeiros.find((b) => b.nome === nome);
    }

    public getAll(): Barbeiro[] {
        return [...this.barbeiros];
    }

    public remove(id: string): boolean {
        const index = this.barbeiros.findIndex((b) => b.id === id);
        if (index === -1) {
            return false;
        }
        this.barbeiros.splice(index, 1);
        return true;
    }

    public checkHour(id: string, hour: string): boolean {
        const barbeiro = this.getByID(id);
        if (!barbeiro) {
            return false;
        }
        return hour >= barbeiro.h_entrada && hour <= barbeiro.h_saida;
    }
}

export const barbeiroRepository = new BarbeiroRepository();