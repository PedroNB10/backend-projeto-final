import express from "express";
import * as userController from "../controllers/user.controller.js"; // importa todos os métodos do controller
import { jwtAuthMiddlewareCookie } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/:userId", jwtAuthMiddlewareCookie, userController.getUser); // busca as informações do usuário como nome, email, filmes favoritos e avaliações
router.put(
  "/add/favorites",
  jwtAuthMiddlewareCookie,
  userController.addFavoriteMovie
);
router.delete(
  "/remove/favorites",
  jwtAuthMiddlewareCookie,
  userController.removeFavoriteMovie
);
router.put(
  "/update-password/:userId",
  jwtAuthMiddlewareCookie,
  userController.updatePassword
); // rota PUT para atualização de dados
router.put(
  "/update-email/:userId",
  jwtAuthMiddlewareCookie,
  userController.updateEmail
);
export default router;
