import jwt from "jsonwebtoken";

export function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Token é obrigatório para acessar esse recurso" });
  }

  const tokenArray = authHeader.split(" ");

  if (tokenArray.length !== 2) {
    return res.status(401).json({ message: "Token inválido" });
  }

  const token = tokenArray[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        return res.status(401).json({
          message: "Você precisa estar logado para acessar esse recurso",
        });
      }

      next(); // se o token for válido, chama o próximo middleware
    });
  } else {
    return res.status(401).json({
      message: "Você precisa estar logado para acessar esse recurso",
    });
  }
}
