import { AppError } from "../../shared/errors/AppError.js";
import { randomUUID } from "node:crypto";
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
            { expiresIn: accessExpires as NonNullable<jwt.SignOptions["expiresIn"]>, jwtid: randomUUID() }
        );

        const refreshToken = jwt.sign(
            { id: userId, role },
            refreshSecret,
            { expiresIn: refreshExpires as NonNullable<jwt.SignOptions["expiresIn"]>, jwtid: randomUUID() }
        );

        return { accessToken, refreshToken }
    }

    private async saveRefreshToken(userId: string, role: "CLIENTE" | "BARBEIRO", token: string) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const tokenHash = hashToken(token);

        const owner = role === "CLIENTE" ? { clienteId: userId } : { barbeiroId: userId };

        await prisma.$transaction(async (tx) => {
            // bloqueia o utilizador: logins simultâneos são tratados um de cada vez
            if (role === "CLIENTE") {
                await tx.$queryRaw`SELECT id FROM clientes WHERE id = ${userId} FOR UPDATE`;
            } else {
                await tx.$queryRaw`SELECT id FROM barbeiros WHERE id = ${userId} FOR UPDATE`;
            }

            await tx.refreshToken.deleteMany({ where: owner });
            await tx.refreshToken.create({
                data: { token: tokenHash, expiresAt, ...owner },
            });
        });
    }

    // Gera o par de tokens e guarda o refresh token (substitui a sessão anterior)
    public async createSession(userId: string, role: "CLIENTE" | "BARBEIRO", isAdmin: boolean): Promise<RefreshTokenResponse> {
        const tokens = this.generateTokens(userId, role, isAdmin);
        await this.saveRefreshToken(userId, role, tokens.refreshToken);
        return tokens;
    }

    public async loginCliente(data: LoginDTO): Promise<AuthResponse> {
        const cliente = await prisma.cliente.findUnique({
            where: { telefone: data.telefone },
        });

        if (!cliente)
            throw new AppError("Credenciais inválidas.", 401);

        const senhaVal = await bcrypt.compare(data.senha, cliente.senha);
        if (!senhaVal)
            throw new AppError("Credenciais inválidas.", 401);

        const { accessToken, refreshToken } = await this.createSession(cliente.id, "CLIENTE", false);

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
            throw new AppError("Credenciais inválidas.", 401);

        const senhaVal = await bcrypt.compare(data.senha, barbeiro.senha);
        if (!senhaVal)
            throw new AppError("Credenciais inválidas.", 401);

        if (!barbeiro.ativo)
            throw new AppError("Conta inactiva. Contacte o administrador.", 403);

        const { accessToken, refreshToken } = await this.createSession(barbeiro.id, "BARBEIRO", barbeiro.isAdmin);

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
            throw new AppError("Refresh token inválido ou expirado.", 401);

        if (new Date() > storedToken.expiresAt) {
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new AppError("Sessão expirada. Faça login novamente.", 401);
        }

        const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
        if (!refreshSecret)
            throw new Error("REFRESH_TOKEN_SECRET não foi definido.");

        try {
            jwt.verify(tokenEnviado, refreshSecret);
        } catch {
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new AppError("Refresh token inválido ou expirado.", 401);
        }

        if (storedToken.barbeiro && !storedToken.barbeiro.ativo) {
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new AppError("Conta inactiva. Contacte o administrador.", 403);
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

        return this.createSession(userId, role, isAdmin);
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
                throw new AppError("Cliente não encontrado.", 404);

            return { ...cliente, role: "CLIENTE" };
        } else {
            const barbeiro = await prisma.barbeiro.findUnique({
            where: { id: userId },
            select: { id: true, nome: true, telefone: true, imagemUrl: true, isAdmin: true, h_entrada: true, h_saida: true, created_at: true },
            });

            if (!barbeiro) 
                throw new AppError("Barbeiro não encontrado.", 404);

            return { ...barbeiro, role: "BARBEIRO" };
        }
    }
}

export const authService = new AuthService();