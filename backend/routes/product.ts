import express from "express";
import Product from "../models/Product";

const router = express.Router();

router.get("/product", async (req, res) => {
  try {
    const gamesFound = await Product.find().populate({
      path: "variants.platform",
      select: "name",
    });

    res.status(200).json({ message: gamesFound });
  } catch (error) {
    console.error("Error getting games:", error);

    res.status(400).json({ message: "error" });
  }
});

export default router;
