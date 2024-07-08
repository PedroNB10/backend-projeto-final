import jwt from "jsonwebtoken";
import "../config.js"; // importando as variáveis de ambiente

export function jwtAuthMiddlewareCookie(req, res, next) {
  const token = req.cookies.accessToken;

  try {
    if (!token) {
      return res.status(403).json({ message: "Usuário não autorizado" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Usuário não autorizado" });
      }

      req.user = user;
      next();
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ message: "Usuário não autorizado" });
  }
}

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
