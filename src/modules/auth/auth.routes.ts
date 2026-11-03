import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated.js";

const router = Router();
const controller = new AuthController();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required:
 *         - telefone
 *         - senha
 *       properties:
 *         telefone:
 *           type: string
 *           example: "923456789"
 *         senha:
 *           type: string
 *           example: "senha123"
 *     RefreshTokenInput:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             nome:
 *               type: string
 *             telefone:
 *               type: string
 *             role:
 *               type: string
 *               example: "BARBEIRO"
 *             isAdmin:
 *               type: boolean
 *               example: true
 *         accessToken:
 *           type: string
 *           description: Token JWT de curta duração (15m)
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken:
 *           type: string
 *           description: Token JWT de longa duração (7d)
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

/**
 * @swagger
 * /api/auth/login/cliente:
 *   post:
 *     summary: Autenticação de Clientes
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login/cliente", controller.loginCliente);

/**
 * @swagger
 * /api/auth/login/barbeiro:
 *   post:
 *     summary: Autenticação de Barbeiros / Admins
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login/barbeiro", controller.loginBarbeiro);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renova o Access Token (Aplica Rotação de Tokens)
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *     responses:
 *       200:
 *         description: Novo par de tokens gerado com sucesso
 *       401:
 *         description: Refresh token inválido ou expirado
 */
router.post("/refresh", controller.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Revoga a sessão e o Refresh Token do utilizador
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *     responses:
 *       204:
 *         description: Sessão encerrada com sucesso
 */
router.post("/logout", controller.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Retorna o perfil do utilizador logado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do utilizador retornado com sucesso
 *       401:
 *         description: Não autenticado ou token inválido
 */
router.get("/me", ensureAuthenticated, controller.getMe);

export default router;