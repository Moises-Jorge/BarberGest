import { z } from "zod"
import { uuidParamSchema, imagemUrlSchema, booleanSchema } from "../../shared/validators/common.schemas.js"

const nomeServicoSchema = z
    .string({ error: "O nome do serviço é obrigatório." })
    .trim()
    .min(2, "O nome do serviço deve ter pelo menos 2 caracteres.")
    .max(60, "O nome do serviço não pode ter mais de 60 caracteres.");

const descricaoSchema = z
    .string({ error: "A descrição deve ser um texto." })
    .trim()
    .max(255, "A descrição não pode ter mais de 255 caracteres.");

// Em multipart/form-data os números chegam como texto
const textoParaNumero = (val: unknown) =>
    typeof val === "string" && val.trim() !== "" ? Number(val) : val;

const precoSchema = z.preprocess(
    textoParaNumero,
    z
        .number({ error: "O preço é obrigatório e deve ser um número." })
        .positive("O preço do serviço deve ser positivo."),
);

const duracaoSchema = z.preprocess(
    textoParaNumero,
    z
        .number({ error: "A duração é obrigatória e deve ser um número." })
        .int("A duração deve ser um número inteiro de minutos.")
        .positive("A duração do serviço deve ser positiva."),
);

export const createServicoSchema = z.object({
    body: z
        .object({
            nome: nomeServicoSchema,
            descricao: descricaoSchema.optional(),
            preco: precoSchema,
            duracao: duracaoSchema,
            ativo: booleanSchema.optional(),
            imagemUrl: imagemUrlSchema.optional(),
        })
        .strict(),
});

export const updateServicoSchema = z.object({
    params: uuidParamSchema,
    body: z
        .object({
            nome: nomeServicoSchema.optional(),
            descricao: descricaoSchema.optional(),
            preco: precoSchema.optional(),
            duracao: duracaoSchema.optional(),
            ativo: booleanSchema.optional(),
        })
        .strict(),
});
