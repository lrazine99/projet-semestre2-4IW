import { Request, Response, NextFunction } from "express";
import { MongooseService } from "../services/mongoose/mongoose.service";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  const mongooseService = await MongooseService.get();
  const userService = mongooseService.userService;
  const userId = req.body?.userId;
  const user = await userService.model.findById(userId);
 
  if (!user) {
    res.status(401).json({
      message: "Utilisateur non authentifié. Veuillez vous connecter.",
    });
    return;
  }

  if (user.role !== "admin") {
    res.status(403).json({
      message:
        "Accès interdit. Vous devez être administrateur pour accéder à cette ressource.",
    });
    return;
  }

  next();
};
