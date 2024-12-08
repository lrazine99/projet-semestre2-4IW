import express, { Request, Response } from 'express';
import Cart from '../models/Cart';

const router = express.Router();

router.post('/cart/add', async (req: Request, res: Response) => {
  try {
    console.log("ici")
    const { authToken, sku, title, imageSrc, price, quantity, stock, edition, platform } = req.body;

    const userId = authToken;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(item => item.sku === sku);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ sku, title, imageSrc, price, quantity, stock, edition, platform });
    }

    await cart.save();

    res.status(200).json({ message: 'Produit ajouté au panier', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l’ajout au panier' });
  }
});

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

router.post('/cart/sync', async (req: Request, res: Response) => {
  try {
    const { authToken, items }: { authToken: string, items: CartItem[] } = req.body;

    const userId = authToken;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    items.forEach((item: CartItem) => { 
      const existingItem = cart.items.find(cartItem => cartItem.sku === item.sku);

      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        cart.items.push(item);
      }
    });

    await cart.save();

    res.status(200).json({ message: 'Panier synchronisé avec succès', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la synchronisation du panier' });
  }
});

export default router;
