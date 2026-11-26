import { z } from "zod"
import { nomeSchema, telefoneSchema, senhaSchema, uuidParamSchema } from "../../shared/validators/common.schemas.js"
import strict from "node:assert/strict";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createBarbeiroSchema = z.object({
    body: z
        .object({
            nome: nomeSchema,
            telefone: telefoneSchema,
            senha: senhaSchema,
            h_entrada: z
                .string()
                .regex(timeRegex, "Hora de entrada inválida. Use o formato HH:mm."),
            h_saida: z
                .string()
                .regex(timeRegex, "Hora de saída inválida. Use o formato HH:mm."),
            isAdmin: z.boolean().optional(),
        })
        .strict()
        .refine((data) => data.h_saida > data.h_entrada, {
            message: "A hora de saída deve ser posterior à hora de entrada.",
            path: ["h_saída"],
        }),
});

