import { Request, Response, NextFunction } from "express";
import { MongooseService } from "../services";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const mongooseService = await MongooseService.get();
  const userService = mongooseService.userService;

  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({
        message: "Utilisateur non authentifié : Token manquant ou incorrect.",
      });
    return;
  }

  const authToken = authHeader.split(" ")[1];

  if (!authToken) {
    res
      .status(401)
      .json({ message: "Utilisateur non authentifié : Token non valide." });
    return;
  }

  try {
    const user = await userService.model.findOne({ token: authToken, isVerified: true });

    if (!user) {
      res.status(401).json({ message: "Utilisateur non trouvé" });
      return;
    }

    req.body.userId = user._id;
    next();
  } catch (error) {
    console.error("Erreur lors de l'authentification", error);
    res.status(500).json({ message: "Erreur d'authentification" });
    return;
  }
};
