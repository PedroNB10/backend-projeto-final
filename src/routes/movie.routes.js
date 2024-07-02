import express from "express";
import * as movieController from "../controllers/movie.controller.js"; // importa todos os métodos do controller
const router = express.Router();

import { jwtAuthMiddlewareCookie } from "../middlewares/auth.js";

router.get(
  "/page/:page",
  jwtAuthMiddlewareCookie,
  movieController.getMoviesApi
);
router.get(
  "/search/page/:searchPage",
  jwtAuthMiddlewareCookie,
  movieController.getMoviesBySearch
);

export default router;
