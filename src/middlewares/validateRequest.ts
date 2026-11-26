import type { Request, Response, NextFunction } from "express";
import { type AnyZodObject, ZodError } from "zod/v3";

export const validateRequest = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: )
}

