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
  //extraindo os dados do formulário para criacao do usuario
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("Preencha todos os campos obrigatórios.");
  }

  try {
    const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados
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

    const id = uuidv4(); //gerar um id unico para o usuario

    //gerar uma senha cryptografada
    const salt = await bcrypt.genSalt(10);
    const passwordCrypt = await bcrypt.hash(password, salt);

    //Criação da instância do usuário
    const user = new User(id, username, email, passwordCrypt);

    //Salva user no "banco"
    usuariosCadastrados.push(user);
    fs.writeFileSync(
      usersDatabasePath,
      JSON.stringify(usuariosCadastrados, null, 2)
    );
    res.status(201).send(`Usuario ${username} criado com sucesso!`);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({ message: "Erro ao criar usuário" });
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Preencha todos os campos obrigatórios.");
  }

  try {
    const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados
    //extraindo os dados do formulário para criacao do usuario

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
          const tokenAcesso = jwt.sign(
            { user },
            process.env.JWT_SECRET // JWT SECRET
          );

          return res.status(200).send({
            message: "Usuário Logado com sucesso!",
            acessToken: tokenAcesso,
            userId: user.id,
          });
        } else return res.status(401).send(`Usuario ou senhas incorretas.`);
      }
    }
    //Nesse ponto não existe usuario com email informado.
    return res
      .status(404)
      .send(
        `Usuario com email ${email} não existe. Considere criar uma conta!`
      );
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    return res.status(500).json({ message: "Erro ao autenticar usuário" });
  }
}

export async function getUser(req, res) {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send("ID do usuário não informado.");
  }

  try {
    const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados

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
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ message: "Erro ao buscar usuário" });
  }
}

export async function addFavoriteMovie(req, res) {
  const { userId, movieId, title, overview, release_date, poster_path } =
    req.body;

  if (
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
    const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados

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

    return res.status(201).send("Filme adicionado aos favoritos com sucesso.");
  } catch (error) {
    console.error("Erro ao adicionar filme aos favoritos:", error);
    return res
      .status(500)
      .json({ message: "Erro ao adicionar filme aos favoritos" });
  }
}

export async function removeFavoriteMovie(req, res) {
  const { userId, movieId } = req.body;

  if (!userId || !movieId) {
    return res.status(400).send("Preencha todos os campos obrigatórios.");
  }

  try {
    const usuariosCadastrados = getUsersRegistered(); // array de usuários cadastrados

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
  } catch {
    console.error("Erro ao remover filme dos favoritos:", error);
    return res
      .status(500)
      .json({ message: "Erro ao remover filme dos favoritos" });
  }
}

export async function updatePassword(req, res) {
  const userId = req.params.userId;
  // Extrai as informações de senha atual e nova senha do corpo da requisição
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Preencha todos os campos obrigatórios" });
  }

  try {
    // Obtém usuários registrados do banco
    const usuariosCadastrados = getUsersRegistered();

    // Encontra o usuário com base no ID
    const userIndex = usuariosCadastrados.findIndex(
      (user) => user.id === userId
    );

    if (userIndex === -1) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Obtém o usuário específico
    const user = usuariosCadastrados[userIndex];

    // Verifica se a senha atual fornecida corresponde à senha armazenada
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Senha atual incorreta" });
    }

    // Criptografa a nova senha
    const salt = await bcrypt.genSalt(10);
    const passwordCrypt = await bcrypt.hash(newPassword, salt);

    // Atualiza a senha no objeto do usuário
    user.password = passwordCrypt;

    // Atualiza o usuário no banco
    usuariosCadastrados[userIndex] = user;
    fs.writeFileSync(
      usersDatabasePath,
      JSON.stringify(usuariosCadastrados, null, 2)
    );

    // Gera novo token de acesso
    const tokenAcesso = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: "3600s",
    });

    // Gera novo token de refresh
    const refreshToken = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Define cookie com o token de acesso
    res.cookie(process.env.ACCESS_TOKEN, tokenAcesso, {
      httpOnly: true,
      secure: true,
      path: "/",
    });

    // Define cookie com o token de refresh
    res.cookie(process.env.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: true,
      path: "/",
    });

    // Retorna resposta de sucesso
    return res.status(200).json({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return res.status(500).json({ message: "Erro ao atualizar senha" });
  }
}

export async function updateEmail(req, res) {
  const userId = req.params.userId;
  const { newEmail } = req.body;

  if (!newEmail) {
    return res
      .status(400)
      .json({ message: "Preencha todos os campos obrigatórios" });
  }

  try {
    // Obtém usuários registrados do banco
    const usuariosCadastrados = getUsersRegistered();

    // Encontra o usuário com base no ID
    const userIndex = usuariosCadastrados.findIndex(
      (user) => user.id === userId
    );

    if (userIndex === -1) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Obtém o usuário específico
    const user = usuariosCadastrados[userIndex];

    // Verifica se o novo email é diferente do email atual
    if (user.email === newEmail) {
      return res.status(400).json({
        message: "O novo email deve ser diferente do email cadastrado",
      });
    }

    // Verifica se o novo email já está em uso por outro usuário
    const emailAlreadyInUse = usuariosCadastrados.some(
      (user) => user.email === newEmail
    );
    if (emailAlreadyInUse) {
      return res.status(409).json({ message: "O email já está em uso" });
    }

    // Atualiza o email do usuário
    user.email = newEmail;

    // Atualiza o usuário no banco
    usuariosCadastrados[userIndex] = user;
    fs.writeFileSync(
      usersDatabasePath,
      JSON.stringify(usuariosCadastrados, null, 2)
    );

    // Gera novo token de acesso
    const tokenAcesso = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: "3600s",
    });

    const refreshToken = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Define cookie com o token de acesso
    res.cookie(process.env.ACCESS_TOKEN, tokenAcesso, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    // Define cookie com o token de refresh
    res.cookie(process.env.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    // Retorna uma resposta de sucesso
    return res.status(200).json({ message: "Email atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar email:", error);
    return res.status(500).json({ message: "Erro ao atualizar email" });
  }
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
