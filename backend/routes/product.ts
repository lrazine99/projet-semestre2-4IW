import express, { Request, Response, NextFunction } from "express";
import Product from "../models/Product";
import Platform from "../models/Platform";

const router = express.Router();

router.get("/product", async (req, res, next) => {
  try {
    const platforms = await Platform.find();

    const gamesFound = await Product.find().populate({
      path: "variants.platform",
      select: "name",
    });

    res.status(200).json({ products: gamesFound });
  } catch (error) {
    next(error);
  }
});

router.post("/product", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, genres, minAge, editor, variants } = req.body;

    if (!name || !description || !genres || !minAge || !editor) {
      res.status(400).json({ message: "Tous les champs principaux sont requis." });
      return;
    }

    if (!Array.isArray(genres) || genres.length === 0) {
      res.status(400).json({ message: "Les genres doivent être un tableau non vide." });
      return;
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      res.status(400).json({ message: "Au moins une variante est requise." });
      return;
    }

    for (const variant of variants) {
      variant.sku = generateRandomSKU();

      if (
        !variant.platform ||
        !variant.name ||
        !variant.edition ||
        variant.price == null ||
        variant.stock == null ||
        !variant.releaseDate ||
        !variant.barcode
      ) {
        res.status(400).json({
          message:
            "Chaque variante doit inclure une plateforme, un nom, une édition, un prix, un stock, une date de sortie et un code-barres.",
        });
        return;
      }
    }

    const newProduct = new Product({
      name,
      description,
      genres,
      minAge,
      editor,
      variants,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ message: "Produit créé avec succès", product: savedProduct });
  } catch (error) {
    console.error("Erreur lors de la création du produit :", error);
    next(error);
  }
});

function generateRandomSKU(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sku = '';
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    sku += characters[randomIndex];
  }
  return sku;
}


router.get("/platforms", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const platforms = await Platform.find();
    res.status(200).json(platforms);
  } catch (error) {
    console.error("Erreur lors de la récupération des plateformes :", error);
    next(error);
  }
});



router.get("/product/:id?", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (id) {
      const product = await Product.findById(id).populate({
        path: "variants.platform",
        select: "name",
      });

      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      res.status(200).json({ product });
    } else {
      const products = await Product.find().populate({
        path: "variants.platform",
        select: "name",
      });

      res.status(200).json({ products });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/product/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { genres, ...updateData } = req.body;

    if (genres) {
      updateData.genres = genres.split(',').map((genre: string) => genre.trim());
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    next(error);
  }
});

router.delete("/product/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ message: "Produit introuvable." });
      return;
    }

    await product.deleteOne();

    res.status(200).json({ message: "Produit supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression du produit :", error);
    res.status(500).json({ message: "Erreur lors de la suppression du produit." });
  }
});

export default router;
