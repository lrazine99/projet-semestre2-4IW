import express, { Router, Request, Response } from "express";
import { UserService } from "../services/mongoose/models/user.service";
import { MongooseService } from "../services";
import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";
import base64 from "crypto-js/enc-base64";
import { randomBytes } from "crypto";
import { IUser } from "../types/user.interface";
import { ResetPasswordService } from "../services/mongoose/models/resetPassword.service";
import { Mailer } from "../helpers/mailer";

export class AuthController {
  private userService!: UserService;
  private resetPasswordService!: ResetPasswordService;

  constructor() {
    MongooseService.get().then((mongooseService) => {
      this.userService = mongooseService.userService;
      this.resetPasswordService = mongooseService.resetPasswordService;
    });
  }

  async userSignup(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password } = req.body;

      if (email && password) {
        const userFoundByEmail = await this.userService.model.findOne({
          email: email,
        });

        if (!userFoundByEmail) {
          const generatedToken = uid2(16);
          const generatedSalt = uid2(12);
          const generatedHash = SHA256(password + generatedSalt).toString(
            base64
          );

          const newUser = new this.userService.model({
            email,
            lastName,
            firstName,
            token: generatedToken,
            hash: generatedHash,
            salt: generatedSalt,
            birthDate: new Date(),
          });

          await this.userService.sendConfirmationEmail(newUser);

          res.status(201).end();
        } else {
          res.status(409).json({ message: "Cet email est déja pris" });
        }
      } else {
        res.status(400).json({ message: "Données manquante" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Erreur veuillez réessayer" });
    }
  }

  async userLogin(req: any, res: any) {
    try {
      const userFound = await this.userService.model.findOne({
        email: req.body?.email,
      });

      if (userFound) {
        if (!userFound.isVerified) {
          const emailStatus = await this.userService.sendConfirmationEmail(
            userFound
          );

          return res
            .status(402)
            .json({
              message: `compte non vérifié, ${
                emailStatus ? "un email a été envoyé" : "envoie d'émail echoué"
              }`,
            });
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
            role: userFound.role,
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
  }

  async requestResetPassword(req: any, res: any){
    const { email } = req.body;

    try {
      // Step 1: Find user
      const user = await this.userService.model.findOne({ email });
      if (!user) {
        // Avoid leaking user existence
        console.log(`Password reset requested for non-existent user: ${email}`);
        return res.status(200).json({ success: true });
      }

      // Step 2: Generate token
      const token = uid2(16);

      // Step 3: Find or create reset password entry
      let resetPasswordEntry = await this.resetPasswordService.model.findOne({
        user: user._id,
      });

      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      if (resetPasswordEntry) {
        resetPasswordEntry.resetPasswordToken = token;
        resetPasswordEntry.resetPasswordExpires = expiresAt;
      } else {
        resetPasswordEntry = new this.resetPasswordService.model({
          user: user._id,
          resetPasswordToken: token,
          resetPasswordExpires: expiresAt,
        });
      }

      await resetPasswordEntry.save();

      // Step 4: Send email
      const resetLink = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe/${token}`;
      const mailer = new Mailer();
      await mailer.sendEmail(
        [email],
        "Demande de réinitialisation de mot de passe",
        `Cliquez sur le lien suivant pour réinitialiser votre mot de passe: ${resetLink}`
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error during password reset request:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }


  async checkTokenReset(req: Request, res: Response) {
    const resetPassword = await this.resetPasswordService.model
      .findOne({
        resetPasswordToken: req.params?.token,
      })
      .populate<{ user: IUser }>("user");

    if (resetPassword !== null) {
      if (resetPassword.resetPasswordExpires < new Date()) {
        res.status(404).end();
      } else {
        res.status(200).send({ email: resetPassword.user.email });
      }
    } else {
      res.status(404).end();
    }
  }

  async userEditPassword(req: Request, res: Response) {
    const { email, password } = req.body;

    const userFound = await this.userService.model.findOne({ email });

    if (userFound !== null) {
      const resetPassword = await this.resetPasswordService.model.findOne({
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
  }

  async confirmEmail(req: any, res: any) {
    const { token } = req.params;

    try {
      const user = await this.userService.model.findOne({
        confirmationToken: token,
      });

      if (user === null) {
        return res.status(400).end();
      }

      if (user.isVerified) {
        res.status(200).send({ message: { token: user.token } });
      } else if (user.confirmationTokenExpires) {
        if (user.confirmationTokenExpires < new Date()) {
          await this.userService.sendConfirmationEmail(user);
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
  }

  async sendConfrmation(req: any, res: any) {
    const { email } = req.body;

    const user = await this.userService.model.findOne({ email });

    if (!user || user.isVerified) {
      return res.status(400).end();
    }

    await this.userService.sendConfirmationEmail(user);

    res.status(200).end();
  }

  async getUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = "", sortBy = "createdAt", order = "desc" } = req.query;

      const query = search
        ? { $or: [{ firstName: { $regex: search, $options: "i" } }, { lastName: { $regex: search, $options: "i" } }] }
        : {};

      const users = await this.userService.model.find(query)
        .sort({ [sortBy as string]: order === "asc" ? 1 : -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const totalUsers = await this.userService.model.countDocuments(query);

      res.status(200).json({
        users,
        totalPages: Math.ceil(totalUsers / Number(limit)),
        currentPage: Number(page),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs." });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      if (!firstName || !lastName || !email || !password || !role) {
        res.status(400).json({ message: "Tous les champs sont requis." });
        return;
      }

      const userExists = await this.userService.model.findOne({ email });

      if (userExists) {
        res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });
        return;
      }

      const generatedSalt = uid2(12);
      const generatedHash = SHA256(password + generatedSalt).toString(base64);

      const newUser = new this.userService.model({
        firstName,
        lastName,
        email,
        role,
        hash: generatedHash,
        salt: generatedSalt,
      });

      await newUser.save();

      res.status(201).json({ message: "Utilisateur créé avec succès." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la création de l'utilisateur." });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await this.userService.model.findById(id);

      if (!user) {
        res.status(404).json({ message: "Utilisateur introuvable." });
        return;
      }

      Object.assign(user, updates);

      await user.save();

      res.status(200).json({ message: "Utilisateur mis à jour avec succès." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur." });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await this.userService.model.findById(id);

      if (!user) {
        res.status(404).json({ message: "Utilisateur introuvable." });
        return;
      }

      await user.deleteOne();

      res.status(200).json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur." });
    }
  }

  async bulkDeleteUsers(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids)) {
        res.status(400).json({ message: "Un tableau d'IDs est requis." });
        return;
      }

      await this.userService.model.deleteMany({ _id: { $in: ids } });

      res.status(200).json({ message: "Utilisateurs supprimés avec succès." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la suppression des utilisateurs." });
    }
  }

  async addAdminUser(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, role = "user" } = req.body;
  
      if (!firstName || !lastName || !email) {
        res.status(400).json({ message: "Tous les champs requis sont obligatoires." });
        return;
      }
  
      const userExists = await this.userService.model.findOne({ email });
  
      if (userExists) {
        res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });
        return;
      }
  
      const password = randomBytes(8).toString("hex");
      const token = uid2(16);
      const salt = uid2(12);
      const hash = SHA256(password + salt).toString();
  
      const newUser = new this.userService.model({
        firstName,
        lastName,
        email,
        token,
        hash,
        salt,
        birthDate: new Date(),
        role,
      });
  
      await newUser.save();
  
      res.status(201).json({
        message: "Utilisateur ajouté avec succès.",
        user: { firstName, lastName, email, role },
        generatedPassword: password, // Renvoie le mot de passe généré
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de l'ajout de l'utilisateur." });
    }
  }
  

  buildRouter(): Router {
    const router = Router();

    router.post("/send-confirmation", this.sendConfrmation.bind(this));
    router.get("/confirm-email/:token", this.confirmEmail.bind(this));
    router.post("/edit-password", this.userEditPassword.bind(this));
    router.get("/reset-password/:token", this.checkTokenReset.bind(this));
    router.post("/reset-password", this.requestResetPassword.bind(this));
    router.post("/login", this.userLogin.bind(this));
    router.post("/signup", this.userSignup.bind(this));

    router.get("/", this.getUsers.bind(this));
    router.post("/", this.createUser.bind(this));
    router.put("/:id", this.updateUser.bind(this));
    router.delete("/:id", this.deleteUser.bind(this));
    router.delete("/", this.bulkDeleteUsers.bind(this));
    router.post("/admin/add", this.addAdminUser.bind(this));

    return router;
  }
}
