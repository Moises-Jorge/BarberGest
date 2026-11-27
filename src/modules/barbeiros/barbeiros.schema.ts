import { z } from "zod"
import { nomeSchema, telefoneSchema, senhaSchema, uuidParamSchema, imagemUrlSchema, booleanSchema } from "../../shared/validators/common.schemas.js"

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createBarbeiroSchema = z.object({
    body: z
        .object({
            nome: nomeSchema,
            telefone: telefoneSchema,
            senha: senhaSchema,
            h_entrada: z
                .string({ error: "A hora de entrada é obrigatória." })
                .regex(timeRegex, "Hora de entrada inválida. Use o formato HH:mm."),
            h_saida: z
                .string({ error: "A hora de saída é obrigatória." })
                .regex(timeRegex, "Hora de saída inválida. Use o formato HH:mm."),
            isAdmin: booleanSchema.optional(),
            imagemUrl: imagemUrlSchema.optional(),
        })
        .strict()
        .refine((data) => data.h_saida > data.h_entrada, {
            message: "A hora de saída deve ser posterior à hora de entrada.",
            path: ["h_saida"],
        }),
});

export const updateBarbeiroSchema = z.object({
    params: uuidParamSchema,
    body: z
        .object({
            nome: nomeSchema.optional(),
            telefone: telefoneSchema.optional(),
            senha: senhaSchema.optional(),
            h_entrada: z.string().regex(timeRegex, "Formato HH:mm inválido").optional(),
            h_saida: z.string().regex(timeRegex, "Formato HH:mm inválido").optional(),
            isAdmin: booleanSchema.optional(),
        })
        .strict()
        // Se vier só uma das horas, o service compara com a que está guardada
        .refine((data) => !data.h_entrada || !data.h_saida || data.h_saida > data.h_entrada, {
            message: "A hora de saída deve ser posterior à hora de entrada.",
            path: ["h_saida"],
        }),
});