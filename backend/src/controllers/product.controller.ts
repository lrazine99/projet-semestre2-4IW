import express, { Router, Request, Response, NextFunction } from "express";
import { ProductService, PlatformService,ProductVariantService } from "../services/mongoose/models";
import { MongooseService } from "../services";
/* import ProductVariant from "../services/mongoose/schema/productVariant.schema"; */
import { Types } from 'mongoose';

export class ProductController {
  private productService!: ProductService;
  private productVariantService!: ProductVariantService;
  private platformService!: PlatformService;

  constructor() {
    MongooseService.get().then((mongooseService) => {
      this.productService = mongooseService.productService;
      this.productVariantService = mongooseService.productVariantService;
      this.platformService = mongooseService.platformService;
    });
  }

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 10 } = req.query;
      const platforms = await this.platformService.model.find();

      const productsFound = await this.productService.model.find().populate({
        path: "variants.platform",
        select: "name",
      });
  
      const totalProducts = await this.productService.model.countDocuments();
      const totalPages = Math.ceil(totalProducts / Number(limit));
  
      res.status(200).json({ platforms, productsFound, totalPages });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
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
        variant.sku = this.generateRandomSKU();

        if (
          !variant.platform ||
          !variant.name ||
          !variant.edition ||
          variant.price == null ||
          variant.stock == null ||
          !variant.releaseDate ||
          !variant.barcode ||
          !variant.images
        ) {
          res.status(400).json({
            message:
              "Chaque variante doit inclure une plateforme, un nom, une édition, un prix, un stock, une date de sortie et un code-barres.",
          });
          return;
        }
        variant.platform = Types.ObjectId.createFromHexString(variant.platform);
      }

      const newProduct = new this.productService.model({
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
      next(error);
    }
  }

  async getPlatforms(req: Request, res: Response, next: NextFunction) {
    try {
      const platforms = await this.platformService.model.find();
      res.status(200).json(platforms);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await this.productService.model.findById(id).populate({
        path: "variants.platform",
        select: "name",
      });

      if (!product) {
        res.status(404).json({ message: "Produit introuvable." });
        return;
      }

      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { genres, ...updateData } = req.body;

      if (typeof genres === "string") {
        updateData.genres = genres.split(",").map((genre: string) => genre.trim());
      } else if (Array.isArray(genres)) {
        updateData.genres = genres;
      }

      const updatedProduct = await this.productService.model.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedProduct) {
        res.status(404).json({ message: "Produit introuvable." });
        return;
      }

      res.status(200).json({ message: "Produit mis à jour avec succès.", product: updatedProduct });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await this.productService.model.findByIdAndDelete(id);

      if (!product) {
        res.status(404).json({ message: "Produit introuvable." });
        return;
      }

      res.status(200).json({ message: "Produit supprimé avec succès." });
    } catch (error) {
      next(error);
    }
  }

  async deleteVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, variantId } = req.params;

      const product = await this.productService.model.findById(id);

      if (!product || !product.variants) {
        res.status(404).json({ message: "Produit ou variante introuvable." });
        return;
      }

      product.variants = product.variants.filter(
        (variant: any) => variant._id.toString() !== variantId
      );

      await product.save();

      res.status(200).json({ message: "Variante supprimée avec succès.", product });
    } catch (error) {
      next(error);
    }
  }

  async updateVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, variantId } = req.params;
      const { platform, name, edition, price, stock, images, barcode } = req.body;

      const product = await this.productService.model.findById(id);

      if (!product || !product.variants) {
        res.status(404).json({ message: "Produit ou variantes introuvables." });
        return;
      }

      const variantIndex = product.variants.findIndex((v) => String(v._id) === variantId);

      if (variantIndex === -1) {
        res.status(404).json({ message: "Variante introuvable." });
        return;
      }

      product.variants[variantIndex] = {
        ...product.variants[variantIndex],
        ...req.body, 
        _id: product.variants[variantIndex]._id 
      };

      product.markModified('variants');
      
      await product.save();

      res.status(200).json({ 
        message: "Variante mise à jour avec succès.", 
        variant: product.variants[variantIndex] 
      });
    } catch (error) {
      next(error);
    }
  }

  async addVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { platform, name, edition, images, releaseDate, price, stock, barcode } = req.body;
  
      const product = await this.productService.model.findById(id);
  
      if (!product) {
        res.status(404).json({ message: "Produit introuvable." });
        return;
      }
  
      if (!product.variants) {
        product.variants = [];
      }
  
      const newVariant = {
        sku: this.generateRandomSKU(),
        platform,
        name,
        edition,
        images,
        releaseDate,
        price,
        stock,
        barcode,
      };
  
      const variantInstance = await this.productVariantService.model.create(newVariant);
      product.variants.push(variantInstance);
      await product.save();
  
      res.status(201).json({ message: "Variante ajoutée avec succès.", variant: variantInstance });
    } catch (error) {
      next(error);
    }
  }
  

  generateRandomSKU(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let sku = "";
    for (let i = 0; i < 8; i++) {
      sku += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return sku;
  }

  buildRouter(): Router {
    const router = Router();

    router.get("/", this.getProducts.bind(this));
    router.post("/", this.createProduct.bind(this));
    router.get("/platforms", this.getPlatforms.bind(this));
    router.get("/:id?", this.getProductById.bind(this));
    router.put("/:id", this.updateProduct.bind(this));
    router.delete("/:id", this.deleteProduct.bind(this));
    router.delete("/:id/variant/:variantId", this.deleteVariant.bind(this));
    router.put("/:id/variant/:variantId", this.updateVariant.bind(this));
    router.post("/:id/variant", this.addVariant.bind(this));

    return router;
  }
}
