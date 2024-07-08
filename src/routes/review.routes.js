import express from "express";
import * as reviewController from "../controllers/review.controller.js"; // importa todos os métodos do controller
import { jwtAuthMiddlewareCookie } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", jwtAuthMiddlewareCookie, reviewController.createReview);
router.delete(
  "/delete/:userId/:reviewId",
  jwtAuthMiddlewareCookie,
  reviewController.deleteReview
);
router.put(
  "/update-review/:userId/:reviewId",
  jwtAuthMiddlewareCookie,
  reviewController.updateReview
); // rota PUT para atualizar uma review

export default router;
