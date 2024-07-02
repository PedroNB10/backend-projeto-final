import express from "express";
import * as movieController from "../controllers/movie.controller.js"; // importa todos os métodos do controller
const router = express.Router();

router.get("/page/:page", movieController.getMoviesApi);
router.get("/search/page/:searchPage", movieController.getMoviesBySearch);

export default router;
