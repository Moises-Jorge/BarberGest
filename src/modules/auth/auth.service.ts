import bcrypt from "bcryptjs";
import jwt  from "jsonwebtoken";
import { prisma } from "../../database/prisma.js"
import { hashToken } from "../../utils/hashToken.js";
import type { LoginDTO, AuthResponse, RefreshTokenResponse } from "./auth.types.js";

export class AuthService {
    private generateTokens(userId: string, role: "CLIENTE" | "BARBEIRO", isAdmin: boolean) {
        const accessSecret = process.env.JWT_SECRET
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

        if (!accessSecret || !refreshSecret)
            throw new Error("JWT_SECRET e REFRESH_TOKEN_SECRET não foram definidos");

        const accessExpires = process.env.JWT_EXPIRES_IN || "12m";
        const refreshExpires = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

        const accessToken = jwt.sign(
            { id: userId, role, isAdmin },
            accessSecret,
            { expiresIn: accessExpires }
        );

        const refreshToken = jwt.sign(
            { id: userId, role },
            refreshSecret,
            { expiresIn: refreshExpires }
        );

        return { accessToken, refreshToken }
    }

    private async saveRefreshToken(userId: string, role: "CLIENTE" | "BARBEIRO", token: string) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const tokenHash = hashToken(token);

        if (role === "CLIENTE") {
            await prisma.refreshToken.deleteMany({ where: { clienteId: userId } });
            await prisma.refreshToken.create({
                data: { token: tokenHash, clienteId: userId, expiresAt },
            });
        } else {
            await prisma.refreshToken.deleteMany({ where: { barbeiroId: userId } });
            await prisma.refreshToken.create({
                data: { token: tokenHash, barbeiroId: userId, expiresAt },
            });
        }
    }

    public async loginCliente(data: LoginDTO): Promise<AuthResponse> {
        const cliente = await prisma.cliente.findUnique({
            where: { telefone: data.telefone },
        });

        if (!cliente)
            throw new Error("Credencias Inválidas.");

        const senhaVal = await bcrypt.compare(data.senha, cliente.senha);
        if (!senhaVal)
            throw new Error("Credencias Inválidas");

        const { accessToken, refreshToken } = this.generateTokens(cliente.id, "CLIENTE", false);
        await this.saveRefreshToken(cliente.id, "CLIENTE", refreshToken);

        return {
            user: {
                id: cliente.id,
                nome: cliente.nome,
                telefone: cliente.telefone,
                imagemUrl: cliente.imagemUrl,
                role: "CLIENTE",
            },
            accessToken,
            refreshToken,
        };
    }

    public async loginBarbeiro(data: LoginDTO): Promise<AuthResponse> {
        const barbeiro = await prisma.barbeiro.findUnique({
            where: { telefone: data.telefone },
        });

        if (!barbeiro) 
            throw new Error("Credencias Inválidas");

        const senhaVal = await bcrypt.compare(data.senha, barbeiro.senha);
        if (!senhaVal)
            throw new Error("Credencias Inválidas");

        const { accessToken, refreshToken } = this.generateTokens(barbeiro.id, "BARBEIRO", barbeiro.isAdmin);
        await this.saveRefreshToken(barbeiro.id, "BARBEIRO", refreshToken);

        return {
            user: {
                id: barbeiro.id,
                nome: barbeiro.nome,
                telefone: barbeiro.telefone,
                imagemUrl: barbeiro.imagemUrl,
                role: "BARBEIRO",
                isAdmin: barbeiro.isAdmin,
            },
            accessToken,
            refreshToken,
        };
    }

    public async refresh(tokenEnviado: string): Promise<RefreshTokenResponse> {
        const tokenHash = hashToken(tokenEnviado);

        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: tokenHash },
            include: { cliente: true, barbeiro: true },
        });

        if (!storedToken)
            throw new Error("Refresh Token inválido ou revogado.");

        if (new Date() > storedToken.expiresAt) {
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new Error("Sessão expirada. Faça login novamente.");
        }

        const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
        if (!refreshSecret)
            throw new Error("REFRESH_TOKEN_SECRET não foi definido.");

        try {
            jwt.verify(tokenEnviado, refreshSecret);
        } catch {
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new Error("Refresh Token inválido.");
        }

        let userId = "";
        let role: "CLIENTE" | "BARBEIRO" = "CLIENTE";
        let isAdmin = false;

        if (storedToken.cliente) {
            userId = storedToken.cliente.id;
            role = "CLIENTE";
        } else if (storedToken.barbeiro) {
            userId = storedToken.barbeiro.id;
            role = "BARBEIRO";
            isAdmin = storedToken.barbeiro.isAdmin;
        }

        const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(userId, role, isAdmin);
        await this.saveRefreshToken(userId, role, newRefreshToken);

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }

    public async logout(tokenEnviado: string): Promise<void> {
        const tokenHash = hashToken(tokenEnviado);
        await prisma.refreshToken.deleteMany({
            where: { token: tokenHash },
        });
    }

    public async getMe(userId: string, role: "CLIENTE" | "BARBEIRO") {
        if (role === "CLIENTE") {
            const cliente = await prisma.cliente.findUnique({
            where: { id: userId },
            select: { id: true, nome: true, telefone: true, imagemUrl: true, created_at: true },
            });

            if (!cliente) 
                throw new Error("Cliente não encontrado.");

            return { ...cliente, role: "CLIENTE" };
        } else {
            const barbeiro = await prisma.barbeiro.findUnique({
            where: { id: userId },
            select: { id: true, nome: true, telefone: true, imagemUrl: true, isAdmin: true, h_entrada: true, h_saida: true, created_at: true },
            });

            if (!barbeiro) 
                throw new Error("Barbeiro não encontrado.");

            return { ...barbeiro, role: "BARBEIRO" };
        }
    }
}

export const authService = new AuthService();