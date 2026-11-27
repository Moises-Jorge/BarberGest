import { z } from "zod"
import { nomeSchema, telefoneSchema, senhaSchema, uuidParamSchema, imagemUrlSchema } from "../../shared/validators/common.schemas.js"

export const createClienteSchema = z.object({
    body: z
        .object({
            nome: nomeSchema,
            telefone: telefoneSchema,
            senha: senhaSchema,
            imagemUrl: imagemUrlSchema.optional(),
        })
        .strict()
});

export const updateClienteSchema = z.object({
    params: uuidParamSchema,
    body: z
        .object({
            nome: nomeSchema.optional(),
            telefone: telefoneSchema.optional(),
            senha: senhaSchema.optional(),
        })
        .strict(),
});