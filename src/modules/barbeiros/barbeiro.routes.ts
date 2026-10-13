import { Router } from "express";
import { BarbeiroController } from "./barbeiro.controller.js";
import { handleMulterError, uploadConfig, validateRealFileType } from "../../config/upload.js";

const router = Router();
const controller = new BarbeiroController();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateBarbeiroInput:
 *       type: object
 *       required:
 *         - nome
 *         - senha
 *         - telefone
 *         - h_entrada
 *         - h_saida
 *       properties:
 *         nome:
 *           type: string
 *           example: "Cesenio Filipe"
 *         senha:
 *           type: string
 *           example: "senha123"
 *         telefone:
 *           type: string
 *           example: "923456789"
 *         h_entrada:
 *           type: string
 *           example: "08:00"
 *         h_saida:
 *           type: string
 *           example: "18:00"
 *         isAdmin:
 *           type: boolean
 *           description: Define se o barbeiro tem privilégios de administrador
 *           example: false
 *         imagemUrl:
 *           type: string
 *           example: "http://localhost:3000/files/perfil.png"
 *     BarbeiroResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "d1a8f9c2-5b23-4c91-9e7f-8d2a1c0b3a4e"
 *         nome:
 *           type: string
 *           example: "Cesenio Filipe"
 *         telefone:
 *           type: string
 *           example: "923456789"
 *         h_entrada:
 *           type: string
 *           example: "08:00"
 *         h_saida:
 *           type: string
 *           example: "18:00"
 *         isAdmin:
 *           type: boolean
 *           example: false
 *         imagemUrl:
 *           type: string
 *           nullable: true
 *           example: "http://localhost:3000/files/perfil.png"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/barbeiros:
 *   post:
 *     summary: Cadastra um novo barbeiro
 *     tags: [Barbeiros]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - senha
 *               - telefone
 *               - h_entrada
 *               - h_saida
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Cesenio Filipe"
 *               senha:
 *                 type: string
 *                 example: "senha123"
 *               telefone:
 *                 type: string
 *                 example: "923456789"
 *               h_entrada:
 *                 type: string
 *                 example: "08:00"
 *               h_saida:
 *                 type: string
 *                 example: "18:00"
 *               isAdmin:
 *                 type: boolean
 *                 example: false
 *               imagem:
 *                 type: string
 *                 format: binary
 *                 description: Ficheiro de imagem opcional (JPG, PNG ou WEBP)
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBarbeiroInput'
 *     responses:
 *       201:
 *         description: Barbeiro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BarbeiroResponse'
 *       400:
 *         description: Erro na validação dos dados
 *   get:
 *     summary: Retorna a lista de todos os barbeiros
 *     tags: [Barbeiros]
 *     responses:
 *       200:
 *         description: Lista de barbeiros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BarbeiroResponse'
 */
router.post(
  "/",
  uploadConfig.single("imagem"),
  handleMulterError,
  validateRealFileType,
  controller.create
);

router.get("/", controller.getAll);

/**
 * @swagger
 * /api/barbeiros/{id}:
 *   get:
 *     summary: Busca um barbeiro pelo ID
 *     tags: [Barbeiros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do barbeiro
 *     responses:
 *       200:
 *         description: Detalhes do barbeiro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BarbeiroResponse'
 *       404:
 *         description: Barbeiro não encontrado
 *   put:
 *     summary: Atualiza os dados de um barbeiro
 *     tags: [Barbeiros]
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
 *               telefone:
 *                 type: string
 *               h_entrada:
 *                 type: string
 *               h_saida:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Barbeiro atualizado com sucesso
 *       400:
 *         description: Erro na atualização
 *   delete:
 *     summary: Remove um barbeiro
 *     tags: [Barbeiros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Barbeiro removido com sucesso
 *       400:
 *         description: Erro ao remover
 */
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

/**
 * @swagger
 * /api/barbeiros/{id}/imagem:
 *   patch:
 *     summary: Atualiza apenas a imagem de perfil
 *     description: Envia uma nova imagem para substituir ou adicionar a imagem de perfil do barbeiro.
 *     tags: [Barbeiros]
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
 *               $ref: '#/components/schemas/BarbeiroResponse'
 *       400:
 *         description: Nenhuma imagem enviada ou formato inválido
 *       404:
 *         description: Barbeiro não encontrado
 */
router.patch(
  "/:id/imagem",
  uploadConfig.single("imagem"),
  handleMulterError,
  validateRealFileType,
  controller.uploadImagem
);

export default router;