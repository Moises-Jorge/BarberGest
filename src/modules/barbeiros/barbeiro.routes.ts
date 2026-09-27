import { Router } from "express";
import { BarbeiroController } from "./barbeiro.controller.js";

const router = Router();
const controller = new BarbeiroController();

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;