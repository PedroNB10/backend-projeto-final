import fs from "node:fs";

import { getUsersRegistered, getReviews, __dirname } from "../connection.db.js";
import { Movie } from "../models/movie.js";
import { Review } from "../models/review.js";
import * as userController from "../controllers/user.controller.js"; // importa todos os métodos do controller
import * as movieController from "../controllers/movie.controller.js"; // importa todos os métodos do controller
import path from "node:path";

const reviewsDatabasePath = path.join(__dirname, "..", "db", "reviews.json");
const usersDatabasePath = path.join(__dirname, "..", "db", "users.json");

export async function createReview(req, res) {
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

  if (
    !content ||
    !rating ||
    !userId ||
    !movieId ||
    !title ||
    !overview ||
    !release_date ||
    !poster_path
  ) {
    return res.status(400).send("Preencha todos os campos obrigatórios.");
  }

  try {
    const reviews = getReviews();
    const users = getUsersRegistered();

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

    const movie = new Movie(
      movieId,
      title,
      overview,
      release_date,
      poster_path
    );
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
              fs.writeFileSync(
                usersDatabasePath,
                JSON.stringify(users, null, 2)
              );
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
  } catch (error) {
    console.error("Erro ao criar review:", error);
    return res.status(500).json({ message: "Erro ao criar review" });
  }
}

export async function deleteReview(req, res) {
  let { userId, reviewId } = req.params; // Obtém os IDs do usuário e da review dos parâmetros da URL

  // Verifica se ambos os parâmetros foram fornecidos
  if (!userId || !reviewId) {
    return res.status(400).send("Preencha todos os campos obrigatórios.");
  }

  try {
    reviewId = parseInt(reviewId); // Converte reviewId para um número inteiro

    // Obtém a lista de reviews do arquivo JSON
    const reviews = getReviews();

    // Obtém a lista de usuários do arquivo JSON
    const users = getUsersRegistered();

    // Encontra o índice da review na lista de reviews pelo ID da review
    const reviewIndex = reviews.findIndex((review) => review.id === reviewId);

    if (reviewIndex === -1) {
      return res.status(404).send("Review não encontrada.");
    }

    // Encontra o índice do usuário na lista de usuários pelo ID do usuário
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).send("Usuário não encontrado.");
    }

    // Remove a review do usuário no arquivo users.json
    users[userIndex].reviews = users[userIndex].reviews.filter(
      (userReview) => userReview.id !== reviewId
    );

    // Remove a review do array de reviews geral
    reviews.splice(reviewIndex, 1);

    // Salva as reviews e os usuários de volta nos arquivos de banco de dados
    fs.writeFileSync(reviewsDatabasePath, JSON.stringify(reviews, null, 2));
    fs.writeFileSync(usersDatabasePath, JSON.stringify(users, null, 2));

    return res.status(200).send("Review removida com sucesso.");
  } catch (error) {
    console.error("Erro ao deletar review:", error);
    return res.status(500).json({ message: "Erro ao deletar review" });
  }
}

export async function updateReview(req, res) {
  // Obtém o ID do usuário e da review pelos parâmetros da URL
  const userId = req.params.userId;
  const reviewId = parseInt(req.params.reviewId); // Converte para número
  const { content, rating } = req.body; // Obtém o novo conteúdo e avaliação da review

  if (!content || !rating || !userId || !reviewId) {
    return res
      .status(400)
      .json({ message: "Preencha todos os campos obrigatórios." });
  }

  try {
    // Obtém todas as reviews do banco
    const reviews = getReviews();
    const users = getUsersRegistered();

    // Encontra a review com base no reviewId e userId
    const reviewIndex = reviews.findIndex(
      (review) => review.id === reviewId && review.userId === userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review não encontrada" });
    }

    // Atualiza os campos da review (conteúdo, avaliação e data)
    reviews[reviewIndex].content = content;
    reviews[reviewIndex].rating = rating;
    reviews[reviewIndex].date = new Date();

    // Salva as reviews de volta no banco (arquivo)
    fs.writeFileSync(reviewsDatabasePath, JSON.stringify(reviews, null, 2));

    // Atualiza a review correspondente no users.json
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      const userReviewIndex = users[userIndex].reviews.findIndex(
        (review) => review.id === reviewId
      );

      if (userReviewIndex !== -1) {
        // Atualiza a review no objeto do usuário
        users[userIndex].reviews[userReviewIndex] = reviews[reviewIndex];
      }
    }

    // Salva os usuários atualizados de volta no banco 
    fs.writeFileSync(usersDatabasePath, JSON.stringify(users, null, 2));

    // Retorna uma resposta de sucesso
    return res.status(200).json({
      message: "Review atualizada com sucesso",
      review: reviews[reviewIndex],
    });
  } catch (error) {
    console.error("Erro ao atualizar review:", error);
    return res.status(500).json({ message: "Erro ao atualizar review" });
  }
}
