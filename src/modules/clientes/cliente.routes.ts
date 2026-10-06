import { Router } from "express";
import { ClienteController } from "./cliente.controller.js";

const router = Router();
const controller = new ClienteController();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateClienteInput:
 *       type: object
 *       required:
 *         - nome
 *         - senha
 *         - telefone
 *       properties:
 *         nome:
 *           type: string
 *           example: "João Silva"
 *         senha:
 *           type: string
 *           example: "senha123"
 *         telefone:
 *           type: string
 *           example: "923123456"
 *     ClienteResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         nome:
 *           type: string
 *           example: "João Silva"
 *         telefone:
 *           type: string
 *           example: "923123456"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Cadastra um novo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClienteInput'
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClienteResponse'
 *       400:
 *         description: Erro na validação dos dados ou telefone em uso
 *   get:
 *     summary: Retorna a lista de todos os clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClienteResponse'
 */
router.post('/', controller.createCliente);
router.get('/', controller.getClientes);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Busca um cliente pelo ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Detalhes do cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClienteResponse'
 *       404:
 *         description: Cliente não encontrado
 *   put:
 *     summary: Atualiza os dados de um cliente
 *     tags: [Clientes]
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
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *       400:
 *         description: Erro na atualização
 *   delete:
 *     summary: Remove um cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Cliente removido com sucesso
 *       400:
 *         description: Erro ao remover
 */
router.get('/:id', controller.getClienteById);
router.put('/:id', controller.updateCliente);
router.delete('/:id', controller.deleteCliente);

export default router;