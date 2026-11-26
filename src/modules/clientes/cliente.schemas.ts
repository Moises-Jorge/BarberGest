import { z } from "zod"
import { nomeSchema, telefoneSchema, senhaSchema, uuidParamSchema } from "../../shared/validators/common.schemas.js"

export const CreateClienteSchema = z.object({
    body: z
        .object({
            nome: nomeSchema,
            telefone: telefoneSchema,
            senha: senhaSchema,
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