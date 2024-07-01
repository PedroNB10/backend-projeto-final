import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from "node:fs";

import "../config.js"; // importando as variáveis de ambiente

import { getUsersRegistered, __dirname } from "../connection.db.js";
import { User } from "../models/user.js";
import { v4 as uuidv4 } from "uuid";
import path from "node:path";

import * as movieController from "../controllers/movie.controller.js";
import { Movie } from "../models/movie.js";

const usersDatabasePath = path.join(__dirname, "..", "db", "users.json");

export async function createUser(req, res) {
  const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados
  //extraindo os dados do formulário para criacao do usuario
  const { username, email, password } = req.body;
  //Para facilitar já estamos considerando as validações feitas no front
  //agora vamos verificar se já existe usuário com esse e-mail

  //verifica se já existe usuario com o email informado
  for (let users of usuariosCadastrados) {
    if (users.email === email) {
      //usuario já existe. Impossivel criar outro
      //Retornando o erro 409 para indicar conflito
      return res.status(409).send(`Usuario com email ${email} já existe.`);
    }
  }
  //Deu certo. Vamos colocar o usuário no "banco"
  //gerar um id unico para o usuario
  const id = uuidv4();

  //gerar uma senha cryptografada
  const salt = await bcrypt.genSalt(10);
  const passwordCrypt = await bcrypt.hash(password, salt);

  //Criacao do user
  const user = new User(id, username, email, passwordCrypt);

  //Salva user no "banco"
  usuariosCadastrados.push(user);
  fs.writeFileSync(
    usersDatabasePath,
    JSON.stringify(usuariosCadastrados, null, 2)
  );
  res.send(`Tudo certo usuario criado com sucesso. id=${id}`);
}

export async function loginUser(req, res) {
  const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados
  //extraindo os dados do formulário para criacao do usuario
  const { email, password } = req.body;

  //verifica se existe usuario com email
  for (let user of usuariosCadastrados) {
    if (user.email === email) {
      //usuario existe.  Agora é verificar a senha
      const passwordValidado = await bcrypt.compare(password, user.password);
      if (passwordValidado === true) {
        //Usuario foi autenticado.
        //Agora vamos retornar um token de acesso
        //para isso usamos jwt
        //O primeiro parametro é o que queremos serializar (o proprio user)
        //O segundo parametro é a chave secreta do token. Está no arquivo .env
        //La coloquei as instruções de como gerar
        const tokenAcesso = jwt.sign({ user }, process.env.TOKEN);
        return res.status(200).json(tokenAcesso);
      } else return res.status(422).send(`Usuario ou senhas incorretas.`);
    }
  }
  //Nesse ponto não existe usuario com email informado.
  return res
    .status(409)
    .send(`Usuario com email ${email} não existe. Considere criar uma conta!`);
}

export async function getUser(req, res) {
  const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados
  const { userId } = req.params;

  for (let user of usuariosCadastrados) {
    if (user.id === userId) {
      const userInfo = {
        username: user.username,
        email: user.email,
        favoriteMovies: user.favoriteMovies,
        reviews: user.reviews,
      };
      return res.status(200).json(userInfo);
    }
  }

  return res.status(404).send(`Usuario com id ${userId} não encontrado.`);
}

export async function addFavoriteMovie(req, res) {
  const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados
  const { userId, movieId, title, overview, release_date, poster_path } =
    req.body;

  const user = await getUserById(userId);

  if (!user) {
    return res.status(404).send("Usuário não encontrado.");
  }

  let movie = await movieController.getMovieById(movieId);

  if (!movie) {
    movie = new Movie(movieId, title, overview, release_date, poster_path);
    movieController.createMovie(movie);
  }

  for (let user of usuariosCadastrados) {
    if (user.id === userId) {
      for (let favoriteMovie of user.favoriteMovies) {
        if (favoriteMovie.id === movieId) {
          return res.status(409).send("Filme já está nos favoritos.");
        }
      }
      user.favoriteMovies.push(movie);
    }
  }

  fs.writeFileSync(
    usersDatabasePath,
    JSON.stringify(usuariosCadastrados, null, 2)
  );

  res.status(201).send("Filme adicionado aos favoritos com sucesso.");
}

export async function removeFavoriteMovie(req, res) {
  const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados
  const { userId, movieId } = req.body;

  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).send("Usuário não encontrado.");
  }

  for (let user of usuariosCadastrados) {
    if (user.id === userId) {
      for (let favoriteMovie of user.favoriteMovies) {
        if (favoriteMovie.id === movieId) {
          user.favoriteMovies = user.favoriteMovies.filter(
            (movie) => movie.id !== movieId
          );
          fs.writeFileSync(
            usersDatabasePath,
            JSON.stringify(usuariosCadastrados, null, 2)
          );
          return res
            .status(200)
            .send("Filme removido dos favoritos com sucesso.");
        }
      }
    }
  }

  return res.status(404).send("Filme não encontrado nos favoritos.");
}

// funções auxiliares

export async function getUserById(userId) {
  const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados

  for (let user of usuariosCadastrados) {
    if (user.id === userId) {
      return user;
    }
  }

  return null;
}

export async function addLastReview(review) {
  const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados

  for (let user of usuariosCadastrados) {
    if (user.id === review.userId) {
      user.reviews.push(review);
    }
  }

  fs.writeFileSync(
    usersDatabasePath,
    JSON.stringify(usuariosCadastrados, null, 2)
  );
}

export async function removeReview(reviewId) {
  const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados

  for (let user of usuariosCadastrados) {
    user.reviews = user.reviews.filter((review) => review.id !== reviewId);
  }

  fs.writeFileSync(
    usersDatabasePath,
    JSON.stringify(usuariosCadastrados, null, 2)
  );
}
