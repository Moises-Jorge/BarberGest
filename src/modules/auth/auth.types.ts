export interface LoginDTO {
    telefone: string;
    senha: string;
}

export interface RefresTokenDTO {
    refreshToken: string;
}

export interface AuthPayload {
    id: string;
    role: "CLIENTE" | "BARBEIRO";
    isAdmin: boolean;
}

export interface AuthResponse {
    user: {
        id: string;
        nome: string;
        telefone: string;
        imagemUrl?: string | null;
        role: "CLIENTE" | "BARBEIRO";
        isAdmin?: boolean;
    };
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}