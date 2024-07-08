import fs from "node:fs";
import path from "node:path";
import "../config.js"; // importando as variáveis de ambiente
import { getMovies, __dirname } from "../connection.db.js";
import { Movie } from "../models/movie.js";
const moviesDatabasePath = path.join(__dirname, "..", "db", "movies.json");
import "../config.js"; // importando as variáveis de ambiente
import axios from "axios";

export async function getMoviesApi(req, res) {
  const { page } = req.params;

  const options = {
    method: "GET",
    url: `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=pt-BR&page=${page}&sort_by=popularity.desc`,
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + process.env.API_TOKEN,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      res.status(200).json(response.data);
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar filmes" });
    });
}

export async function getMoviesBySearch(req, res) {
  const { query } = req.query;
  const { searchPage } = req.params;

  const options = {
    method: "GET",
    url: `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&page=${searchPage}&query=${query}&language=pt-BR`,
  };

  axios
    .request(options)
    .then(function (response) {
      res.status(200).json(response.data);
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar filmes search" });
    });
}

export async function createMovie(movie) {
  const movies = getMovies();
  const { id, title, overview, release_date, poster_path } = movie;

  const movieAlreadyExists = movies.find((movie) => movie.id === id);
  if (movieAlreadyExists) {
    return;
  }

  const newMovie = new Movie(id, title, overview, release_date, poster_path);
  movies.push(newMovie);
  fs.writeFileSync(moviesDatabasePath, JSON.stringify(movies, null, 2));
}

export async function getMovieById(movieId) {
  const movies = getMovies();
  return movies.find((movie) => movie.id === movieId);
}
