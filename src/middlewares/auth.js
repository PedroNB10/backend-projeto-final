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
  const authH = req.headers["authorization"];
  const token = authH && authH.split(" ")[1];
  if (token === null) return res.status(401).send("Token não encontrado");

  //verificando o token
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next(); //Se token é válido, avança chamando next()
  } catch (error) {
    res.status(403).send("Token inválido");
  }
}
