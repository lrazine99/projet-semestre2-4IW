import express, { Router, Request, Response } from "express";
import { UserService } from "../services/mongoose/models/user.service";
import { MongooseService } from "../services";
import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";
import base64 from "crypto-js/enc-base64";
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

  buildRouter(): Router {
    const router = Router();

    router.post("/send-confirmation", this.sendConfrmation.bind(this));
    router.get("/confirm-email/:token", this.confirmEmail.bind(this));
    router.post("/edit-password", this.userEditPassword.bind(this));
    router.get("/reset-password/:token", this.checkTokenReset.bind(this));
    router.post("/reset-password", this.requestResetPassword.bind(this));
    router.post("/login", this.userLogin.bind(this));
    router.post("/signup", this.userSignup.bind(this));

    return router;
  }
}
