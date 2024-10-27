import express from "express";
import User from "../models/User";
import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";
import base64 from "crypto-js/enc-base64";

const router = express.Router();

router.post("/user/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email && password) {
      const userFoundByEmail = await User.findOne({ email: email });

      if (!userFoundByEmail) {
        const generatedToken = uid2(16);
        const generatedSalt = uid2(12);
        const generatedHash = SHA256(password + generatedSalt).toString(base64);

        const newUser = new User({
          email,
          token: generatedToken,
          hash: generatedHash,
          salt: generatedSalt,
        });

        await newUser.save();

        res.status(201).json({
          _id: newUser._id,
          token: newUser.token,
        });
      } else {
        if (userFoundByEmail) {
          res.status(409).json({ message: "Cet email est déja pris" });
        }
      }
    } else {
      res.status(400).json({ message: "Données manquante" });
    }
  } catch (error) {
    res.status(400).json({ message: "Erreur veuillez réessayer" });
  }
});

/*
router.post("/user/login", async (req, res) => {
  try {
    const userFound = await User.findOne({ username: req?.body?.username });

    if (userFound) {
      const generatedHash = SHA256(
        req.body?.password + userFound.salt
      ).toString(base64);

      if (
        generatedHash === userFound.hash ||
        req.body?.token === userFound.token
      ) {
        res.status(200).json({
          _id: userFound._id,
          username: userFound.username,
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

*/

export default router;
