import { Router } from "express";
import { ClienteController } from "./cliente.controller.js";

const router = Router();
const controller = new ClienteController();

router.post('/', controller.createCliente);
router.get('/', controller.getClientes);
router.get('/:id', controller.getClienteById);
router.put('/:id', controller.updateCliente);
router.delete('/:id', controller.deleteCliente);

export default router;