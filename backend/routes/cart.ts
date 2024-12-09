import express, { Request, Response } from 'express';
import Cart from '../models/Cart';

const router = express.Router();

router.post('/cart/add', async (req: Request, res: Response) => {
  try {
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

router.get('/cart', async (req: Request, res: Response) => {
    try {
      const authToken = req.query.authToken as string;
  
      const userId = authToken;
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
        });
      }
  
      res.status(200).json(cart);
    } catch (error) {
      console.error('Erreur lors de la récupération du panier :', error);
      res.status(500).json({ message: 'Erreur interne lors de la récupération du panier' });
    }
  });
  
  router.delete('/cart/remove/:sku', async (req: Request, res: Response) => {
    try {
      const { authToken } = req.body;
      const { sku } = req.params;
  
      const userId = authToken;
  
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
        });
      }
  
      const itemIndex = cart.items.findIndex((item) => item.sku === sku);
  
      cart.items.splice(itemIndex, 1);
      await cart.save();
      
      res.status(200).json({ message: 'Article supprimé du panier', cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'article' });
    }
  });
  

router.patch('/cart/increase/:sku', async (req: Request, res: Response) => {
    try {
      const { authToken, quantity } = req.body;
      const { sku } = req.params; 
  
      const userId = authToken;
  
      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
        });
      }
  
      const itemIndex = cart.items.findIndex(item => item.sku === sku);
  
      if (quantity <= cart.items[itemIndex].stock) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
  
        res.status(200).json({ message: 'Quantité mise à jour', cart });
      } else {
        res.status(400).json({ message: 'La quantité demandée dépasse le stock disponible' });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'article'});
    }
  });

router.patch('/cart/decrease/:sku', async (req: Request, res: Response) => {
    try {
      const { authToken, quantity } = req.body;
      const { sku } = req.params;
  
      const userId = authToken;
  
      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
        });
      }
  
      const itemIndex = cart.items.findIndex(item => item.sku === sku);
  
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity;
  
        await cart.save();
  
        res.status(200).json({ message: 'Quantité mise à jour', cart });
      } else {
        res.status(400).json({ message: 'La quantité ne peut pas être inférieure à 1' });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'article'});
    }
  });


export default router;
