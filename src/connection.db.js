import { fileURLToPath } from "url"; // lib para manipulação de caminhos de arquivos
import path from "node:path"; // lib para manipulação de caminhos de arquivos
import fs from "node:fs"; // lib para manipulação de arquivos json

// Define as variáveis __filename e __dirname para serem usadas em outros arquivos
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export function createUserDatabaseFolder() {
  const databasefolderPath = path.join(__dirname, "../db");
  const usersDatabasePath = path.join(databasefolderPath, "users.json");
  const reviewsDatabasePath = path.join(databasefolderPath, "reviews.json");
  const moviesDatabasePath = path.join(databasefolderPath, "movies.json");

  if (!fs.existsSync(databasefolderPath)) {
    fs.mkdirSync(databasefolderPath, { recursive: true });
    console.log("Directory created successfully.");
  }

  if (!fs.existsSync(usersDatabasePath)) {
    fs.writeFileSync(usersDatabasePath, "[]");
    console.log("File created successfully.");
  }

  if (!fs.existsSync(reviewsDatabasePath)) {
    fs.writeFileSync(reviewsDatabasePath, "[]");
    console.log("File created successfully.");
  }

  if (!fs.existsSync(moviesDatabasePath)) {
    fs.writeFileSync(moviesDatabasePath, "[]");
    console.log("File created successfully.");
  }
}

export function getUsersRegistered() {
  const usersDatabasePath = path.join(__dirname, "../db/users.json");

  if (!fs.existsSync(usersDatabasePath)) {
    fs.writeFileSync(usersDatabasePath, "[]");
    console.log("File created successfully.");
    return JSON.parse("[]");
  }

  const data = fs.readFileSync(usersDatabasePath, "utf8");
  return JSON.parse(data);
}

export function getReviews() {
  const databasefilePath = path.join(__dirname, "../db/reviews.json");

  if (!fs.existsSync(databasefilePath)) {
    fs.writeFileSync(databasefilePath, "[]");
    console.log("File created successfully.");
    return JSON.parse("[]");
  }

  const data = fs.readFileSync(databasefilePath, "utf8");
  return JSON.parse(data);
}

export function getMovies() {
  const databasefilePath = path.join(__dirname, "../db/movies.json");

  if (!fs.existsSync(databasefilePath)) {
    fs.writeFileSync(databasefilePath, "[]");
    console.log("File created successfully.");
    return JSON.parse("[]");
  }

  const data = fs.readFileSync(databasefilePath, "utf8");
  return JSON.parse(data);
}
