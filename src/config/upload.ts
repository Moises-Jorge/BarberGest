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
    filename(_req, file, callback) {
        const fileHash = crypto.randomBytes(10).toString("hex");
        const fileName = `${fileHash}-${file.originalname.replace(/\s+/g, "_")}`;
        return callback(null, fileName);
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

    next();
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ error: "Erro ao validar o formato da imagem." });
  }
};