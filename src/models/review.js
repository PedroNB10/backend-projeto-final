import { Movie } from "./movie.js";

export class Review {
  constructor(
    id,
    content,
    rating,
    userId,
    movieId,
    title,
    overview,
    release_date,
    poster_path
  ) {
    this.id = id;
    this.content = content;
    this.rating = rating;
    this.userId = userId;
    this.movie = new Movie(movieId, title, overview, release_date, poster_path);

    this.date = new Date();
  }
}
