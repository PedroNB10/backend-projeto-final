import { fileURLToPath } from "url"; // lib para manipulação de caminhos de arquivos
import path from "node:path"; // lib para manipulação de caminhos de arquivos
import fs from "node:fs"; // lib para manipulação de arquivos json

// Define as variáveis __filename e __dirname para serem usadas em outros arquivos
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export function createUserDatabaseFolder() {
  const databasefolderPath = path.join(__dirname, "../db");
  const databasefilePath = path.join(databasefolderPath, "users.json");

  if (!fs.existsSync(databasefolderPath)) {
    fs.mkdirSync(databasefolderPath, { recursive: true });
    console.log("Directory created successfully.");
  }

  if (!fs.existsSync(databasefilePath)) {
    fs.writeFileSync(databasefilePath, "[]");
    console.log("File created successfully.");
  }
}

export function getUsersRegistered() {
  const databasefilePath = path.join(__dirname, "../db/users.json");

  if (!fs.existsSync(databasefilePath)) {
    fs.writeFileSync(databasefilePath, "[]");
    console.log("File created successfully.");
    return JSON.parse("[]");
  }

  const data = fs.readFileSync(databasefilePath, "utf8");
  return JSON.parse(data);
}
