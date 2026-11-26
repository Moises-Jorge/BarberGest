import { z } from 'zod';


export const telefoneSchema = z
    .string({ required_error: "O número de telefone é obrigatório"})
    .transform((val) => val.replace(/\s+/g, ""))
    .refine((val) => /^9\d{8}$/.test(val), {
        message:
            "O número de telefone deve começar por 9 e conter exatamente 9 dígitos numéricos (ex: 900000000).",
    });

export const senhaSchema = z 
    .string({ required_error: "A palavra-passe é obritatória." })
    .min(8, "A palavra-passe deve ter pelo menos 8 caracteres.")
    .max(64, "A palavra-passe não pode conter espaços em branco.")
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
    .string({ required_error: "O nome é obrigatório" })
    .transform((val) => val.trim().replace(/\s+/g, " "))
    .refine((val) => val.length >= 2, {
        message:
            "O nome deve ter pelo menos 2 caracteres.",
    })
    .refine((val) => val.length <= 40, {
        message:
            "O nome não pode ter mais de 40 caracteres.",
    })
    .refine((val) => /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s[A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(val), {
        message:
            "O nome deve conter apenas letras e espaços simples entre palavras.",
    });

    export const uuidParamSchema = z.object({
        id: z.string().uuid("O ID fornecido não é um UUID válido."),
    });