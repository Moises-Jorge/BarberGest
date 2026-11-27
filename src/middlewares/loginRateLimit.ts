import { rateLimit, ipKeyGenerator } from "express-rate-limit";

// Máximo de 10 tentativas falhadas por IP e telefone em 15 minutos
export const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => `${ipKeyGenerator(req.ip ?? "")}:${req.path}:${req.body?.telefone}`,
    message: { error: "Demasiadas tentativas de login. Tente novamente dentro de 15 minutos." },
});
