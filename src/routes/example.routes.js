import express from "express";
import * as exampleController from "../controllers/example.controller.js"; // importa todos os métodos do controller

const router = express.Router();

router.get("/", exampleController.methodExampleController);

export default router;
