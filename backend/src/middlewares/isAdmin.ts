import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({ message: "Utilisateur non authentifié. Veuillez vous connecter." });
    return;
  }

  if (user.role !== 'admin') {
    res.status(403).json({
      message: "Accès interdit. Vous devez être administrateur pour accéder à cette ressource.",
    });
    return;
  }

  next();
};
