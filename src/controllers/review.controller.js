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
const usersDatabasePath = path.join(__dirname, "..", "db", "users.json");

export async function createReview(req, res) {
  const reviews = getReviews();
  const users = getUsersRegistered();
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
    return res.status(400).send("Usuário não encontrado.");
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

  // console.log(user.reviews);

  const userReviews = user.reviews;
  const isThereAReview = userReviews.find(
    (review) => Number(review.movie.id) === Number(movieId)
  );

  if (isThereAReview) {
    isThereAReview.content = content;
    isThereAReview.rating = rating;
    isThereAReview.date = new Date();
    for (let i = 0; i < reviews.length; i++) {
      if (reviews[i].id === isThereAReview.id) {
        reviews[i] = isThereAReview;

        for (let i = 0; i < user.reviews.length; i++) {
          if (user.reviews[i].id === isThereAReview.id) {
            user.reviews[i] = isThereAReview;

            const userIndex = users.findIndex((user) => user.id === userId);

            if (userIndex === -1) {
              return res.status(404).send("Usuário não encontrado.");
            }

            users[userIndex] = user;
            fs.writeFileSync(
              reviewsDatabasePath,
              JSON.stringify(reviews, null, 2)
            );
            fs.writeFileSync(usersDatabasePath, JSON.stringify(users, null, 2));
          }
        }

        res
          .status(200)
          .send({ id: isThereAReview.id, message: "Avaliação atualizada!" });
      }
    }
  } else {
    reviews.push(review);
    userController.addLastReview(review);
    fs.writeFileSync(reviewsDatabasePath, JSON.stringify(reviews, null, 2));

    res
      .status(201)
      .send({ id: review.id, message: "Avaliação criada com sucesso!" });
  }
}

export async function deleteReview(req, res) {
  const reviews = getReviews();
  let { reviewId } = req.params;

  reviewId = parseInt(reviewId);

  const reviewIndex = reviews.findIndex((review) => review.id === reviewId);

  if (reviewIndex === -1) {
    return res.status(404).send("Review não encontrada.");
  }

  const review = reviews[reviewIndex];
  const user = getUsersRegistered().find((user) => user.id === review.userId);

  if (!user) {
    return res.status(404).send("Usuário não encontrado.");
  }

  userController.removeReview(review);

  reviews.splice(reviewIndex, 1);

  fs.writeFileSync(reviewsDatabasePath, JSON.stringify(reviews, null, 2));

  res.status(200).send("Review removida com sucesso.");
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

// atualizar review - usar id do usuário e id da avaliação
// atualizar todos os valores da review (content, rating e date)

export async function updateReview(req, res) {
  // Obtém o ID do usuário e da review pelos parâmetros da URL
  const userId = req.params.userId; 
  const reviewId = parseInt(req.params.reviewId); // Converte para número
  const { content, rating } = req.body  ;// Obtém o novo conteúdo e avaliação da review

  try {
    // Obtém todas as reviews do banco
    const reviews = getReviews();

    // Encontra a review com base no reviewId e userId
    const reviewIndex = reviews.findIndex(review => review.id === reviewId && review.userId === userId);

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review não encontrada' });
    }

    // Atualiza os campos da review (conteúdo, avaliação e data)
    reviews[reviewIndex].content = content; 
    reviews[reviewIndex].rating = rating; 
    reviews[reviewIndex].date = new Date();

    // Salva as reviews de volta no banco (arquivo)
    fs.writeFileSync(reviewsDatabasePath, JSON.stringify(reviews, null, 2));

    // Retorna uma resposta de sucesso
    return res.status(200).json({ message: 'Review atualizada com sucesso', review: reviews[reviewIndex] });
  } catch (error) {
    console.error('Erro ao atualizar review:', error);
    return res.status(500).json({ message: 'Erro ao atualizar review' });
  }
}