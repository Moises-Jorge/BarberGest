import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodType } from "zod";

type RequestSchema = ZodType<{ body?: unknown; params?: unknown }>;

export const validateRequest = (schema: RequestSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            req.body = parsed.body ?? req.body;
            if (parsed.params) req.params = parsed.params as Request["params"];

            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((err) => ({
                    campo: err.path.slice(1).join(".") || err.path.join("."),
                    mensagem: err.message,
                }));

                return res.status(400).json({
                    error: "Dados de entrada inválidos.",
                    detalhes: formattedErrors,
                });
            }

            return res.status(500).json({ error: "Erro na validação." });
        }
    };
};
