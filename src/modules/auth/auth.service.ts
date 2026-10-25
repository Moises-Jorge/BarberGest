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
}