import express from "express";
import * as userController from "../controllers/user.controller.js"; // importa todos os métodos do controller
import {
  jwtAuthMiddlewareCookie,
  authenticateUser,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/:userId", authenticateUser, userController.getUser); // busca as informações do usuário como nome, email, filmes favoritos e avaliações
router.put("/add/favorites", authenticateUser, userController.addFavoriteMovie);
router.delete(
  "/remove/favorites",
  authenticateUser,
  userController.removeFavoriteMovie
);
router.put(
  "/update-password/:userId",
  authenticateUser,
  userController.updatePassword
); // rota PUT para atualização de dados
router.put(
  "/update-email/:userId",
  authenticateUser,
  userController.updateEmail
);
export default router;
