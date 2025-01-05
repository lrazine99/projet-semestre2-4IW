import express, { Router, Request, Response } from "express";
import { CartService, PlatformService, ProductService } from "../services/mongoose/models";
import { MongooseService } from "../services";
import { ICartItem, IProduct, IProductVariant } from "../types";
import { isAuthenticated } from "../middlewares/isAuthenticated";

export class CartController {
  private cartService!: CartService;
  private productService!: ProductService;
  private platformService!: PlatformService;

  constructor() {
    MongooseService.get().then((mongooseService) => {
      this.cartService = mongooseService.cartService;
      this.productService = mongooseService.productService;
      this.platformService = mongooseService.platformService;
    });
  }

  async cartAdd(req: Request, res: Response) {
    try {
      const { sku, quantity } = req.body;

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
          quantity,
        } as ICartItem);
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
      console.log(items);

      const userId = req.body.userId;

      let cart = await this.cartService.model.findOne({ userId });
      console.log("cart", cart);

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
          existingItem.quantity = item.quantity;
        } else {
          cart.items.push({ sku: item.sku, quantity: item.quantity });
        }
      });

      await cart.save();

      res.status(200).json({ message: "Panier synchronisé avec succès", cart });
    } catch (error) {
      console.error("Error sync", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la synchronisation du panier" });
    }
  }

  async cartGet(req: Request, res: Response) {
    type CartItemWithVariant = { platform: string } & Partial<Omit<IProductVariant, 'platform'>> &  ICartItem;
    
    try {
      const userId = req.body.userId;
      let cart = await this.cartService.model.findOne({ userId });

      if (!cart) {
        cart = new this.cartService.model({
          userId,
          items: [],
        });
      }

      const updatedItems = await Promise.all(
        cart.items.map(async (item) => {
          const product = await this.productService.model.findOne({
            "variants.sku": item.sku,
          });

          if (!product) {
            return null;
          }

          const variant = product.variants.find(
            (variant) => variant.sku === item.sku
          );

          if (!variant) {
            return null;
          }

          const platform = await this.platformService.model.findOne({ _id: variant.platform });

          if (!platform) {
            return null;
          }
          
          return {
            sku: item.sku,
            quantity: item.quantity,
            title: variant.name,
            imageSrc: variant.images[0],
            price: variant.price,
            stock: variant.stock,
            edition: variant.edition,
            platform: platform.name ,
          } as CartItemWithVariant;
        })
      );

      updatedItems.filter((item): item is CartItemWithVariant => item !== null);

      res.status(200).json({ cart: cart.userId, items: updatedItems });
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
      const product = await this.productService.model.findOne({
        "variants.sku": sku,
      });

      if (!product || !item) {
        res.status(404).json({ message: "Article non trouvé dans le panier" });
        return;
      }

      const variant = product.variants.find((variant) => variant.sku === sku);

      if (!variant) {
        res.status(404).json({ message: "Variante non trouvée" });
        return;
      }

      if (quantity > variant.stock) {
        res.status(400).json({
          message: "La quantité demandée dépasse le stock disponible",
        });
        return;
      }

      try {
        item.quantity = quantity;
        await cart.save();
        res.status(200).json({ message: "Quantité mise à jour", cart });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Erreur lors de la mise à jour du panier", error });
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
