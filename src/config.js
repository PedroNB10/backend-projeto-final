import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { __dirname } from "./connection.db.js";
dotenv.config();

export function getSwaggerDocs() {
  let swaggerDocs = {};

  try {
    const filePath = path.join(__dirname, ".", "swagger.json");
    const data = fs.readFileSync(filePath, "utf8");
    swaggerDocs = JSON.parse(data);
  } catch (err) {
    console.error("Error reading or parsing the JSON file:", err);
  }
  return swaggerDocs;
}
