import { z } from 'zod';


export const telefoneSchema = z
    .string({ error: "O número de telefone é obrigatório"})
    .transform((val) => val.replace(/\s+/g, ""))
    .refine((val) => /^9\d{8}$/.test(val), {
        message:
            "O número de telefone deve começar por 9 e conter exatamente 9 dígitos numéricos (ex: 900000000).",
    });

export const senhaSchema = z 
    .string({ error: "A palavra-passe é obrigatória." })
    .min(8, "A palavra-passe deve ter pelo menos 8 caracteres.")
    .max(64, "A palavra-passe não pode ter mais de 64 caracteres.")
    .refine((val) => !/\s/.test(val), {
        message: 
            "A palavra-passe não pode conter espaços em branco.",
    })
    .refine((val) => /[A-Z]/.test(val), {
        message:
            "A palavra-passe deve conter pelo menos uma letra maiúscula.",
    })
    .refine((val) => /[a-z]/.test(val), {
        message:
            "A palavra-passe deve conter pelo menos uma letra minúscula.",
    })
    .refine((val) => /\d/.test(val), {
        message:
            "A palavra-passe deve conter pelo menos um número.",
    });

export const nomeSchema = z
    .string({ error: "O nome é obrigatório" })
    .transform((val) => val.trim().replace(/\s+/g, " "))
    .refine((val) => val.length >= 2, {
        message:
            "O nome deve ter pelo menos 2 caracteres.",
    })
    .refine((val) => val.length <= 40, {
        message:
            "O nome não pode ter mais de 40 caracteres.",
    })
    .refine((val) => /^\p{L}+(?:[ '’-]\p{L}+)*$/u.test(val), {
        message:
            "O nome deve conter apenas letras, separadas por um espaço, hífen ou apóstrofo.",
    });

    export const uuidParamSchema = z.object({
        id: z.string().uuid("O ID fornecido não é um UUID válido."),
    });

export const imagemUrlSchema = z.url({
    protocol: /^https?$/,
    error: "O URL da imagem é inválido.",
});

// Em multipart/form-data todos os campos chegam como texto
export const booleanSchema = z.union(
    [z.boolean(), z.stringbool({ truthy: ["true"], falsy: ["false"] })],
    { error: "O valor deve ser true ou false." },
);

// Para rotas que só recebem o ID no caminho
export const idParamSchema = z.object({
    params: uuidParamSchema,
});
