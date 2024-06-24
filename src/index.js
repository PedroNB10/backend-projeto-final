import express, { json } from "express"; // lib para criar o servidor
import swaggerUI from "swagger-ui-express"; // lib para documentação das rotas
import fs from "node:fs"; // lib para manipulação de arquivos json

import exampleRouter from "./routes/example.routes.js";

const app = express();
const port = 8080;

// Lê o arquivo swagger.json e armazena em swaggerDocs
let swaggerDocs = {};

try {
  const filePath = "src/swagger.json";
  const data = fs.readFileSync(filePath, "utf8");
  swaggerDocs = JSON.parse(data);
} catch (err) {
  console.error("Error reading or parsing the JSON file:", err);
}

app.listen(8080, () => {
  console.log("Server is running on port localhost:" + port);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use("/example", exampleRouter); // usa todas as rotas do arquivo example.routes.js

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
