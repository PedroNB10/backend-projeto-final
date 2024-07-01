import fs from "node:fs";

import {
  getUsersRegistered,
  getMovies,
  getReviews,
  __dirname,
} from "../connection.db.js";
import { User } from "../models/user.js";
import { Movie } from "../models/movie.js";
import { Review } from "../models/review.js";
import * as userController from "../controllers/user.controller.js"; // importa todos os métodos do controller
import * as movieController from "../controllers/movie.controller.js"; // importa todos os métodos do controller
import path from "node:path";

const reviewsDatabasePath = path.join(__dirname, "..", "db", "reviews.json");

export async function createReview(req, res) {
  const reviews = getReviews();
  const {
    content,
    rating,
    userId,
    movieId,
    title,
    overview,
    release_date,
    poster_path,
  } = req.body;

  const user = getUsersRegistered().find((user) => user.id === userId);

  if (!user) {
    return res.status(400).send("User not found");
  }

  const id = reviews.length + 1;

  const review = new Review(
    id,
    content,
    rating,
    userId,
    movieId,
    title,
    overview,
    release_date,
    poster_path
  );

  const movie = new Movie(movieId, title, overview, release_date, poster_path);
  // cria o filme no banco de dados de filmes avaliados
  movieController.createMovie(movie);

  // adiciona a avaliação ao banco de dados de avaliações
  reviews.push(review);
  userController.addLastReview(review);

  fs.writeFileSync(reviewsDatabasePath, JSON.stringify(reviews, null, 2));

  res.status(201).send({ id: review.id, message: "Review created" });
}

export async function getReviewsByMovieId(req, res) {
  const { movie_id } = req.params;
  const reviews = getReviews();
  const reviewsByMovieId = reviews.filter(
    (review) => review.movie_id === movie_id
  );

  res.send(reviewsByMovieId);
}

export async function getReviewsByUserId(req, res) {
  const { userId } = req.params;
  const reviews = getReviews();
  const reviewsByUserId = reviews.filter((review) => review.userId === userId);

  res.send(reviewsByUserId);
}
