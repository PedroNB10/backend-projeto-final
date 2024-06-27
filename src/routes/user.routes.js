import express from "express";
import * as userController from "../controllers/user.controller.js"; // importa todos os métodos do controller
const router = express.Router();

router.post("/create", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/:userId", userController.getUser); // busca as informações do usuário como nome, email, filmes favoritos e filmes avaliados

export default router;
