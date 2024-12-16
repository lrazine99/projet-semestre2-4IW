import express, { Request, Response } from "express";
import Cart from "../models/Cart";
import { isAuthenticated } from "../middlewares/isAuthenticated";

const router = express.Router();

interface CartItem {
  sku: string;
  title: string;
  imageSrc: string;
  price: number;
  quantity: number;
  stock: number;
  edition: string;
  platform: string;
}

router.post(
  "/cart/add",
  isAuthenticated,
  async (req: Request, res: Response) => {
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

      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({
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
);

router.post(
  "/cart/sync",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { items }: { items: CartItem[] } = req.body;
      const userId = req.body.userId;

      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
        });
      }

      items.forEach((item: CartItem) => {
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
);

router.get(
  "/cart", 
  isAuthenticated, 
  async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({
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
);

router.delete(
  "/cart/remove/:sku",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { sku } = req.params;
      const userId = req.body.userId;

      let cart = await Cart.findOne({ userId });

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
);

router.patch(
  "/cart/increase/:sku",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { quantity } = req.body;
      const { sku } = req.params;
      const userId = req.body.userId;

      let cart = await Cart.findOne({ userId });

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
        res
          .status(400)
          .json({
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
);

router.patch("/cart/decrease/:sku",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { quantity } = req.body;
      const { sku } = req.params;
      const userId = req.body.userId;

      let cart = await Cart.findOne({ userId });

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
);

export default router;
