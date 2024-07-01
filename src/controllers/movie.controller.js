import fs from "node:fs";
import path from "node:path";
import "../config.js"; // importando as variáveis de ambiente
import { getMovies, __dirname } from "../connection.db.js";
import { Movie } from "../models/movie.js";
const moviesDatabasePath = path.join(__dirname, "..", "db", "movies.json");

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
