import { Request, Response, NextFunction } from 'express';
import { User } from '../services/mongoose/schema/user.schema';

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Utilisateur non authentifié : Token manquant ou incorrect.' });
    return;
  }

  const authToken = authHeader.split(' ')[1];

  if (!authToken) {
    res.status(401).json({ message: 'Utilisateur non authentifié : Token non valide.' });
    return;
  }

  try {
    const user = await User.findOne({ token: authToken });

    if (!user) {
      res.status(401).json({ message: 'Utilisateur non trouvé' });
      return;
    }

    req.body.userId = user._id;
    next();

  } catch (error) {
    console.error('Erreur lors de l\'authentification', error);
    res.status(500).json({ message: 'Erreur d\'authentification' });
    return;
  }
};
