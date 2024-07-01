import express from "express"; // lib para criar o servidor
import swaggerUI from "swagger-ui-express"; // lib para documentação das rotas

import exampleRouter from "./routes/example.routes.js";
import userRouter from "./routes/user.routes.js";
import movieRouter from "./routes/movie.routes.js";
import reviewRouter from "./routes/review.routes.js";
import { createUserDatabaseFolder } from "./connection.db.js";
import { getSwaggerDocs } from "./config.js";

createUserDatabaseFolder();

const app = express();
const port = 8080;

// Lê o arquivo swagger.json e armazena em swaggerDocs
let swaggerDocs = getSwaggerDocs();

app.listen(port, () => {
  console.log("Server is running on port localhost:" + port);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use("/example", exampleRouter); // usa todas as rotas do arquivo example.routes.js

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use("/user", userRouter);
app.use("/movie", movieRouter);
app.use("/review", reviewRouter);
