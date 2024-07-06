import express from "express";
import * as movieController from "../controllers/movie.controller.js"; // importa todos os métodos do controller
import {
  jwtAuthMiddlewareCookie,
  authenticateUser,
} from "../middlewares/auth.js";

const router = express.Router();

router.get("/page/:page", authenticateUser, movieController.getMoviesApi);
router.get(
  "/search/page/:searchPage",
  authenticateUser,
  movieController.getMoviesBySearch
);

export default router;
