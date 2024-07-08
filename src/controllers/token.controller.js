import "../config.js";
import jwt from "jsonwebtoken";

export const generateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.cookies;

  try {
    if (!refreshToken) {
      throw {
        status: 403,
        message: "Erro na verificação do token de atualização",
      };
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
      if (err) throw { status: 403, message: "Falha na verificação" };
      const accessToken = jwt.sign(
        { user },
        process.env.JWT_SECRET, // JWT SECRET
        { expiresIn: process.env.EXPIRATION_TIME_ACCESS_TOKEN }
      );
      res.cookie(process.env.ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure: true,
        path: "/",
      });
      res.status(200).json({ message: "Token atualizado com sucesso" });
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
