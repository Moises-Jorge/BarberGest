import { z } from "zod"
import { telefoneSchema } from "../../shared/validators/common.schemas.js"

export const loginSchema = z.object({
    body: z
        .object({
            telefone: telefoneSchema,
            senha: z
                .string({ error: "A palavra-passe é obrigatória." })
                .min(1, "A palavra-passe não pode ser vazia."),
        })
        .strict(), 
});

export const refreshTokenSchema = z.object({
    body: z
        .object({
            refreshToken: z
                .string({ error: "O refresh token é obrigatório."})
                .min(1, "O refresh token não pode ser vazio."),
        })
        .strict(),
})