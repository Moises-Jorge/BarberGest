// Erro esperado, cuja mensagem pode ser mostrada ao cliente da API
export class AppError extends Error {
    constructor(message: string, public readonly status: number = 400) {
        super(message);
        this.name = "AppError";
    }
}
