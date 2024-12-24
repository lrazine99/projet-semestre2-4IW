import express, { Router, Request, Response } from "express";
import { CartService } from "../services/mongoose/models";
import { MongooseService } from "../services";
import { ICartItem } from "../types";
import { isAuthenticated } from "src/middlewares/isAuthenticated";

export class CartController {
  private cartService!: CartService;

  constructor() {
    MongooseService.get().then((mongooseService) => {
      this.cartService = mongooseService.cartService;
    });
  }

  async cartAdd(req: Request, res: Response) {
    try {
      const {
        sku,
        title,
        imageSrc,
        price,
        quantity,
        stock,
        edition,
        platform,
      } = req.body;
      const userId = req.body.userId;

      let cart = await this.cartService.model.findOne({ userId });
      if (!cart) {
        cart = new this.cartService.model({
          userId,
          items: [],
        });
      }

      const existingItem = cart.items.find((item) => item.sku === sku);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          sku,
          title,
          imageSrc,
          price,
          quantity,
          stock,
          edition,
          platform,
        });
      }

      await cart.save();

      res.status(200).json({ message: "Produit ajouté au panier", cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de l’ajout au panier" });
    }
  }

  async cartSync(req: Request, res: Response) {
    try {
      const { items }: { items: ICartItem[] } = req.body;
      const userId = req.body.userId;

      let cart = await this.cartService.model.findOne({ userId });

      if (!cart) {
        cart = new this.cartService.model({
          userId,
          items: [],
        });
      }

      items.forEach((item: ICartItem) => {
        const existingItem = cart.items.find(
          (cartItem) => cartItem.sku === item.sku
        );

        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          cart.items.push(item);
        }
      });

      await cart.save();

      res.status(200).json({ message: "Panier synchronisé avec succès", cart });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Erreur lors de la synchronisation du panier" });
    }
  }

  async cartGet(req: Request, res: Response) {
    try {
      const userId = req.body.userId;
      let cart = await this.cartService.model.findOne({ userId });

      if (!cart) {
        cart = new this.cartService.model({
          userId,
          items: [],
        });
      }

      res.status(200).json(cart);
    } catch (error) {
      console.error("Erreur lors de la récupération du panier :", error);
      res
        .status(500)
        .json({ message: "Erreur interne lors de la récupération du panier" });
    }
  }

  async cartRemoveBySky(req: Request, res: Response) {
    try {
      const { sku } = req.params;
      const userId = req.body.userId;

      let cart = await this.cartService.model.findOne({ userId });

      if (!cart) {
        res.status(404).json({ message: "Panier non trouvé" });
        return;
      }

      const itemIndex = cart.items.findIndex((item) => item.sku === sku);

      if (itemIndex === -1) {
        res.status(404).json({ message: "Article non trouvé dans le panier" });
        return;
      }

      cart.items.splice(itemIndex, 1);
      await cart.save();

      res.status(200).json({ message: "Article supprimé du panier", cart });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'article" });
    }
  }

  async cartIncrease(req: Request, res: Response) {
    try {
      const { quantity } = req.body;
      const { sku } = req.params;
      const userId = req.body.userId;

      let cart = await this.cartService.model.findOne({ userId });

      if (!cart) {
        res.status(404).json({ message: "Panier non trouvé" });
        return;
      }

      const item = cart.items.find((item) => item.sku === sku);

      if (!item) {
        res.status(404).json({ message: "Article non trouvé dans le panier" });
        return;
      }

      if (quantity <= item.stock) {
        item.quantity = quantity;
        await cart.save();

        res.status(200).json({ message: "Quantité mise à jour", cart });
      } else {
        res.status(400).json({
          message: "La quantité demandée dépasse le stock disponible",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour de l'article" });
    }
  }

  async cartDecrease(req: Request, res: Response) {
    try {
      const { quantity } = req.body;
      const { sku } = req.params;
      const userId = req.body.userId;

      let cart = await this.cartService.model.findOne({ userId });

      if (!cart) {
        res.status(404).json({ message: "Panier non trouvé" });
        return;
      }

      const item = cart.items.find((item) => item.sku === sku);

      if (!item) {
        res.status(404).json({ message: "Article non trouvé dans le panier" });
        return;
      }

      if (quantity > 0) {
        item.quantity = quantity;
        await cart.save();

        res.status(200).json({ message: "Quantité mise à jour", cart });
      } else {
        res
          .status(400)
          .json({ message: "La quantité ne peut pas être inférieure à 1" });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour de l'article" });
    }
  }

  buildRouter(): Router {
    const router = Router();
    
    router.use(isAuthenticated);

    router.get("/", this.cartGet.bind(this));
    router.post("/add", this.cartAdd.bind(this));
    router.post("/sync", this.cartSync.bind(this));
    router.delete("/remove/:sku", this.cartRemoveBySky.bind(this));
    router.patch("/increase/:sku", this.cartIncrease.bind(this));
    router.patch("/decrease/:sku", this.cartDecrease.bind(this));
    
    return router;
  }
}
