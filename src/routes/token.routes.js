import express from "express";
import * as tokenController from "../controllers/token.controller.js"; // importa todos os métodos do controller

const router = express.Router();

router.get("/generate-token", tokenController.generateRefreshToken);

export default router;
