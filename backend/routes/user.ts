import express, { Request, Response } from "express";
import { IUser, User } from "../models/User";
import ResetPassword from "../models/ResetPassword";
import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";
import base64 from "crypto-js/enc-base64";
import { randomBytes } from "crypto";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { isAdmin } from "../middlewares/isAdmin";



import { Mailer } from "../helpers/mailer";

const router = express.Router();

const sendConfirmationEmail = async (user: IUser) => {
  const confirmationToken = uid2(16);

  user.confirmationToken = confirmationToken;
  user.confirmationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await user.save();

  const newMailer = new Mailer();
  const confirmationLink = `http://localhost/confirmer-votre-compte/${confirmationToken}`;

  newMailer.sendEmail(
    [user.email],
    "Confirmez votre compte",
    `Vous avez 24 heures pour confirmer votre compte en cliquant sur le lien suivant: ${confirmationLink}`
  );
};

router.post("/user/signup", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (email && password) {
      const userFoundByEmail = await User.findOne({ email: email });

      if (!userFoundByEmail) {
        const generatedToken = uid2(16);
        const generatedSalt = uid2(12);
        const generatedHash = SHA256(password + generatedSalt).toString(base64);

        const newUser = new User({
          email,
          lastName,
          firstName,
          token: generatedToken,
          hash: generatedHash,
          salt: generatedSalt,
          birthDate: new Date(),
        });

        await sendConfirmationEmail(newUser);

        res.status(201).end();
      } else {
        if (userFoundByEmail) {
          res.status(409).json({ message: "Cet email est déja pris" });
        }
      }
    } else {
      res.status(400).json({ message: "Données manquante" });
    }
  } catch (error) {
    console.log(error);

    res.status(400).json({ message: "Erreur veuillez réessayer" });
  }
});

router.post("/user/login", async (req: any, res: any) => {
  try {
    const userFound = await User.findOne({ email: req.body?.email });

    if (userFound) {
      if (!userFound.isVerified) {
        await sendConfirmationEmail(userFound);

        res
          .status(402)
          .json({ message: "compte non vérifié, un email a été envoyé" });
          return;
      }

      const generatedHash = SHA256(
        req.body?.password + userFound.salt
      ).toString(base64);

      if (
        generatedHash === userFound.hash ||
        req.body?.token === userFound.token
      ) {
        res.status(200).json({
          _id: userFound._id,
          email: userFound.email,
          token: userFound.token,
        });
      } else {
        res
          .status(401)
          .json({ message: "email et/ou mot de passe incorrect(s)" });
      }
    } else {
      res
        .status(401)
        .json({ message: "email et/ou mot de passe incorrect(s)" });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "error lors de la connexion veuillez réessayer" });
  }
});

router.post("/request-reset-password", async (req: any, res: any) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).end();
  }

  const token = uid2(16);

  const resetPasswordFound = await ResetPassword.findOne({ user: user._id });

  if (resetPasswordFound) {
    resetPasswordFound.resetPasswordToken = token;
    resetPasswordFound.resetPasswordExpires = new Date(Date.now() + 3600000);

    await resetPasswordFound.save();
  } else {
    const newResetPassword = new ResetPassword({
      user: user._id,
      resetPasswordToken: token,
      resetPasswordExpires: new Date(Date.now() + 3600000),
    });

    await newResetPassword.save();
  }

  const resetLink = `http://localhost/reinitialiser-mot-de-passe/${token}`;

  const newMailer = new Mailer();

  await newMailer.sendEmail(
    [email],
    "Demande de réinitialisation de mot de passe",
    `Cliquez sur le lien suivant pour réinitialiser votre mot de passe: ${resetLink}`
  );

  res.status(200).end();
});

router.get("/check-token-reset/:token", async (req: Request, res: Response) => {
  const resetPassword = await ResetPassword.findOne({
    resetPasswordToken: req.params?.token,
  }).populate<{ user: IUser }>("user");

  if (resetPassword !== null) {
    if (resetPassword.resetPasswordExpires < new Date()) {
      res.status(404).end();
    } else {
      res.status(200).send({ email: resetPassword.user.email });
    }
  } else {
    res.status(404).end();
  }
});

router.post("/user/edit-password", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const userFound = await User.findOne({ email });

  if (userFound !== null) {
    const resetPassword = await ResetPassword.findOne({
      user: userFound._id,
    });

    if (resetPassword !== null) {
      if (resetPassword.resetPasswordExpires < new Date()) {
        res.status(404).end();
      } else {
        userFound.hash = SHA256(password + userFound.salt).toString(base64);

        await userFound.save();

        await resetPassword.deleteOne();

        res.status(200).end();
      }
    } else {
      res.status(404).end();
    }
  }
});

router.get("/confirm-email/:token", async (req: any, res: any) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      confirmationToken: token
    });

    if (user === null) {
      return res.status(400).end();
    }

    if (user.isVerified) {
      res.status(200).send({ message: { token: user.token } });
    } else if (user.confirmationTokenExpires) {
      if (user.confirmationTokenExpires < new Date()) {
        await sendConfirmationEmail(user);
        return res.status(400).end();
      }
    }

    user.isVerified = true;

    user.confirmationToken = null;
    user.confirmationTokenExpires = null;

    await user.save();

    res.status(200).send({ message: { token: user.token } });
  } catch (error) {
    res.status(400).end();
    console.log(error);
  }
});

router.post("/send-confirmation", async (req: any, res: any) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.isVerified) {
    return res.status(400).end();
  }

  await sendConfirmationEmail(user);

  res.status(200).end();
});

router.get("/users", async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = "", sortBy = "createdAt", order = "desc" } = req.query;

    const query = search
      ? { $or: [{ firstName: { $regex: search, $options: "i" } }, { lastName: { $regex: search, $options: "i" } }] }
      : {};

    const users = await User.find(query)
      .sort({ [sortBy as string]: order === "asc" ? 1 : -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalPages: Math.ceil(totalUsers / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs." });
    return;
  }
});

router.post("/users", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      res.status(400).json({ message: "Tous les champs sont requis." });
      return;
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });
      return;
    }

    const generatedSalt = uid2(12);
    const generatedHash = SHA256(password + generatedSalt).toString(base64);

    const newUser = new User({
      firstName,
      lastName,
      email,
      role,
      hash: generatedHash,
      salt: generatedSalt,
    });

    await newUser.save();

    res.status(201).json({ message: "Utilisateur créé avec succès." });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur." });
    return;
  }
});

router.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: "Utilisateur introuvable." });
      return;
    }

    Object.assign(user, updates);

    await user.save();

    res.status(200).json({ message: "Utilisateur mis à jour avec succès." });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur." });
    return;
  }
});

router.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: "Utilisateur introuvable." });
      return;
    }

    await user.deleteOne();

    res.status(200).json({ message: "Utilisateur supprimé avec succès." });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur." });
    return;
  }
});

router.delete("/users", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      res.status(400).json({ message: "Un tableau d'IDs est requis." });
      return;
    }

    await User.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: "Utilisateurs supprimés avec succès." });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression des utilisateurs." });
    return;
  }
});

router.post("/users/admin/add", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, role = "user" } = req.body;

    if (firstName && lastName && email) {
      const userFoundByEmail = await User.findOne({ email });

      if (!userFoundByEmail) {
        const password = randomBytes(8).toString('hex');
        const generatedToken = uid2(16);
        const generatedSalt = uid2(12);
        const generatedHash = SHA256(password + generatedSalt).toString();

        const newUser = new User({
          firstName,
          lastName,
          email,
          token: generatedToken,
          hash: generatedHash,
          salt: generatedSalt,
          birthDate: new Date(),
          role,
        });

        await newUser.save();

        res.status(201).json({ message: "Utilisateur ajouté avec succès", user: newUser });
        return;
      } else {
        res.status(409).json({ message: "Cet email est déjà pris" });
        return;
      }
    } else {
      res.status(400).json({ message: "Données manquantes" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur, veuillez réessayer" });
    return;
  }
});

export default router;
