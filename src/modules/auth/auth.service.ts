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
}