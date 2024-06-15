import express from "express";

const app = express();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/ping", (req, res) => {
  res.send("pong");
});
