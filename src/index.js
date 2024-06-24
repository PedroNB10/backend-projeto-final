import express from "express";
import exampleRouter from "./routes/example.routes.js";

const app = express();
const port = 8080;

app.listen(8080, () => {
  console.log("Server is running on port localhost:" + port);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use("/example", exampleRouter); // usa todas as rotas do arquivo example.routes.js
