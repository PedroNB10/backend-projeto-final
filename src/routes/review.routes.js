import express from "express";
import * as reviewController from "../controllers/review.controller.js"; // importa todos os métodos do controller
import {
  jwtAuthMiddlewareCookie,
  authenticateUser,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", authenticateUser, reviewController.createReview);
router.delete(
  "/delete/:userId/:reviewId",
  authenticateUser,
  reviewController.deleteReview
);
router.put(
  "/update-review/:userId/:reviewId",
  authenticateUser,
  reviewController.updateReview
); // rota PUT para atualizar uma review

export default router;
