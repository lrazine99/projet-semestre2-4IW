import express from "express";
import Product from "../models/Product";
import Platform from "../models/Platform";

const router = express.Router();

router.get("/product", async (req, res, next) => {
  try {
    const platfroms = await Platform.find();

    const gamesFound = await Product.find().populate({
      path: "variants.platform",
      select: "name",
    });

    res.status(200).json({ message: gamesFound });
  } catch (error) {
    next(error);
  }
});

export default router;
