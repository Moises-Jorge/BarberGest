import { z } from "zod"
import { telefoneSchema } from "../../shared/validators/common.schemas.js"

export const loginSchema = z.object({
    body: z
        .object({
            telefone: telefoneSchema,
            senha: z
                .string({ required_error: "A palavra-passe é obrigatória." })
                .min(1, "A palavra-passe não pode ser vazia."),
        })
        .strict(), 
});

export const refreshToken