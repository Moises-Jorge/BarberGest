import type { Request, Response, NextFunction } from "express";
import { parse } from "node:path";
import { type AnyZodObject, ZodError } from "zod/v3";

export const validateRequest = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });


            req.body = parsed.body ?? req.body;
            req.query = parsed.query ?? req.query;
            req.params = parsed.params ?? req.params;

            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.errors.map((err) => ({
                    campo: err.path.slice(1).join(".") || err.path.join("."),
                    mensagem: err.message,
                }));

                return res.status(400).json({
                    error: "Dados de entrada inválidos.",
                    detalhes: formattedErrors,
                })
            }

            return res.status(500).json({ error: "Erro na validação."});
        }
    };
};

