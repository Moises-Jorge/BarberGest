import { Router } from "express";
import { ServicoController } from "./servico.controller.js";
import { uploadConfig, handleMulterError, validateRealFileType } from "../../config/upload.js";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated.js";
import { ensureAdmin } from "../../middlewares/ensureAdmin.js";

const router = Router();
const controller = new ServicoController();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateServicoInput:
 *       type: object
 *       required:
 *         - nome
 *         - preco
 *         - duracao
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome descritivo do serviço oferecido
 *           example: "Corte de Cabelo Degradê"
 *         descricao:
 *           type: string
 *           description: Detalhes do serviço (opcional)
 *           example: "Inclui lavagem, corte estilizado e acabamento com pomada"
 *         preco:
 *           type: number
 *           description: Valor cobrado pelo serviço
 *           example: 2500
 *         duracao:
 *           type: integer
 *           description: Duração estimada em minutos
 *           example: 30
 *         ativo:
 *           type: boolean
 *           description: Define se o serviço está ativo (padrão true)
 *           example: true
 *         imagemUrl:
 *           type: string
 *           description: URL externa direta da imagem (opcional)
 *           example: "http://localhost:3000/files/exemplo.jpg"
 *     ServicoResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID único do serviço
 *           example: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
 *         nome:
 *           type: string
 *           example: "Corte de Cabelo Degradê"
 *         descricao:
 *           type: string
 *           nullable: true
 *           example: "Inclui lavagem, corte estilizado e acabamento"
 *         preco:
 *           type: number
 *           example: 2500
 *         duracao:
 *           type: integer
 *           example: 30
 *         ativo:
 *           type: boolean
 *           example: true
 *         imagemUrl:
 *           type: string
 *           nullable: true
 *           description: URL da imagem do serviço
 *           example: "http://localhost:3000/files/7a8b9c-degrade.png"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/servicos:
 *   post:
 *     summary: Cadastra um novo serviço
 *     description: Cria um serviço com campos obrigatórios e aceita imagem e estado ativo opcionais.
 *     tags: [Serviços]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - preco
 *               - duracao
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Corte Degradê"
 *               descricao:
 *                 type: string
 *                 example: "Corte moderno com lavagem"
 *               preco:
 *                 type: number
 *                 example: 2500
 *               duracao:
 *                 type: integer
 *                 example: 30
 *               ativo:
 *                 type: boolean
 *                 example: true
 *               imagem:
 *                 type: string
 *                 format: binary
 *                 description: Ficheiro de imagem opcional (JPG, PNG ou WEBP)
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServicoInput'
 *     responses:
 *       201:
 *         description: Serviço cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicoResponse'
 *       400:
 *         description: Erro nos dados enviados
 *   get:
 *     summary: Retorna a lista de todos os serviços
 *     tags: [Serviços]
 *     responses:
 *       200:
 *         description: Lista de serviços cadastrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServicoResponse'
 */
router.post(
  "/",
  ensureAuthenticated,
  ensureAdmin,
  uploadConfig.single("imagem"),
  handleMulterError,
  validateRealFileType,
  controller.createServico
);

router.get("/", ensureAuthenticated, controller.getAllServicos);

/**
 * @swagger
 * /api/servicos/{id}:
 *   get:
 *     summary: Busca um serviço pelo ID
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes do serviço
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicoResponse'
 *       404:
 *         description: Serviço não encontrado
 *   put:
 *     summary: Atualiza os dados de um serviço
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               duracao:
 *                 type: integer
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Serviço atualizado com sucesso
 *       400:
 *         description: Erro na atualização
 *   delete:
 *     summary: Remove um serviço
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Serviço removido com sucesso
 *       400:
 *         description: Erro na remoção
 */
router.get("/:id", ensureAuthenticated, controller.getServicoById);
router.put("/:id", ensureAuthenticated, ensureAdmin, controller.updateServico);
router.delete("/:id", ensureAuthenticated, ensureAdmin, controller.deleteServico);

/**
 * @swagger
 * /api/servicos/{id}/imagem:
 *   patch:
 *     summary: Atualiza apenas a imagem do serviço
 *     description: Envia uma nova imagem para substituir ou adicionar a imagem do serviço.
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - imagem
 *             properties:
 *               imagem:
 *                 type: string
 *                 format: binary
 *                 description: Ficheiro de imagem (JPG, PNG ou WEBP)
 *     responses:
 *       200:
 *         description: Imagem atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicoResponse'
 *       400:
 *         description: Nenhuma imagem enviada ou formato inválido
 *       404:
 *         description: Serviço não encontrado
 */
router.patch(
  "/:id/imagem",
  ensureAuthenticated,
  ensureAdmin,
  uploadConfig.single("imagem"),
  handleMulterError,
  validateRealFileType,
  controller.uploadImage
);

export default router;