import multer from "multer";
import path from "path";
import crypto from "crypto"
import { fileURLToPath } from "url";
import type { Request, Response, NextFunction } from "express";
import { fileTypeFromFile } from "file-type";
import fs from "fs";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOADS_FOLDER = path.resolve(__dirname, "..", "..", "uploads");

export const storage = multer.diskStorage({
    destination: UPLOADS_FOLDER,
    filename(_req, _file, callback) {
        const fileHash = crypto.randomBytes(10).toString("hex");
        // o nome original é ignorado; a extensão definitiva vem do conteúdo (validateRealFileType)
        return callback(null, `${fileHash}.tmp`);
    },
});

export const uploadConfig = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter(_req, file, callback) {
        const allowedMimes = ["image/jpeg", "image/pjpeg", "image/png", "image/webp"];

        if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error("Formato de ficheiro inválido. Envie apenas JPG, PNG ou WEBP."));
        }
    },
});


export const handleMulterError = (
    err: any,
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                error: "O tamanho da imagem excede o limite máximo permitido de 5MB.",
            });
        }
        return res.status(400).json({ error: `Erro no upload da imagem: ${err.message}` });
    }

    if (err) {
        return res.status(400).json({ error: err.message });
    }
    
    return next();
};

export const validateRealFileType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const type = await fileTypeFromFile(filePath);

    const allowedExtensions = ["jpg", "png", "webp"];

    if (!type || !allowedExtensions.includes(type.ext)) {

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        error: "O conteúdo real do ficheiro não corresponde a uma imagem válida (JPG, PNG ou WEBP).",
      });
    }

    const finalName = `${path.parse(filePath).name}.${type.ext}`;
    const finalPath = path.join(path.dirname(filePath), finalName);
    fs.renameSync(filePath, finalPath);
    req.file.filename = finalName;
    req.file.path = finalPath;

    next();
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ error: "Erro ao validar o formato da imagem." });
  }
};

// Apaga o ficheiro gravado pelo multer quando o pedido termina com erro
export const removeUploadOnError = (req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    // em erros do multer o req.file pode existir sem path
    if (req.file?.path && res.statusCode >= 400) {
      // o ficheiro pode já ter sido apagado por outro middleware
      fs.unlink(req.file.path, () => {});
    }
  });
  return next();
};

// O Swagger e outros clientes enviam "imagem" como texto vazio quando não se escolhe ficheiro
export const ignoreEmptyImageField = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body?.imagem === "") {
    delete req.body.imagem;
  }
  return next();
};
