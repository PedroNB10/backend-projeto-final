import express from "express";
import * as reviewController from "../controllers/review.controller.js"; // importa todos os métodos do controller
const router = express.Router();

router.post("/create", reviewController.createReview);
router.delete("/delete/:reviewId", reviewController.deleteReview);

export default router;
