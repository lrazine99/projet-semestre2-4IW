import  { Router, Request, Response, NextFunction } from "express";
import {
  CartService,
  OrderService,
  ProductService,
  UserService,
} from "../services/mongoose/models";
import { MongooseService } from "../services";
import Stripe from "stripe";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { PaymentStatus } from "../types";
import { Mailer } from "../helpers/mailer";
import fs from "fs";
import multer from "multer";
import path from "path";
import { IOrderItems } from "../types";
import { isAdmin } from "../middlewares/isAdmin";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const filePath = path.resolve("tmp/uploads/");

    cb(null, filePath); // Directory for temporary storage
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({ storage });

export class OrderController {
  private orderService!: OrderService;
  private cartService!: CartService;
  private userService!: UserService;
  private productService!: ProductService;

  constructor() {
    MongooseService.get().then((mongooseService) => {
      this.orderService = mongooseService.orderService;
      this.cartService = mongooseService.cartService;
      this.productService = mongooseService.productService;
      this.userService = mongooseService.userService;
    });
  }

  async createOrder(req: Request, res: Response) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const userId = req.body.userId;

    const {
      token,
      amount,
      currency,
      billingAddress,
      shippingAddress,
      cartItems,
      addressAccount,
    } = req.body;

    try {
      const order = await this.orderService.createOrder(
        userId,
        amount,
        cartItems,
        shippingAddress,
        billingAddress
      );

      if (addressAccount) {
        await this.userService.model.updateOne(
          { _id: userId },
          {
            address: billingAddress,
          }
        );
      }

      const charge = await stripe.charges.create({
        amount: Math.round(amount * 100), // Amount in the smallest currency unit
        currency,
        source: token,
        description: `Order payment`,
      });

      await this.cartService.model.updateOne({ userId }, { items: [] });

      this.orderService.handleStock(cartItems, userId);

      if (charge.status === "succeeded") {
        await this.orderService.model.updateOne(
          { _id: order._id },
          { paymentStatus: PaymentStatus.PAID }
        );
      } else {
        res.status(400).send("Payment failed");
        return;
      }

      res.status(200).json({ invoiceNumber: order.invoiceNumber });
    } catch (error) {
      console.log("Error creating payment:", error);

      res.status(500).send("Error creating payment");
    }
  }

  async sendInvoice(req: Request, res: Response) {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const { email, fileName } = req.body; // Get the recipient email from the request body
    const filePath = req.file.path;

    // Ensure email is provided
    if (!email) {
      res.status(400).json({ message: "Email address is required" });
      return;
    }

    try {
      const attachment = {
        data: fs.createReadStream(req.file.path),
        contentType: "application/pdf",
        filename: `${fileName}.pdf`,
        knownLength: fs.statSync(filePath).size,
      };

      const mailer = new Mailer();

      // Send email with attachment
      await mailer.sendEmail(
        [email],
        "Facture pour votre commande",
        "Bonjour, veuillez trouver ci-joint votre facture",
        attachment
      );

      // Delete the uploaded file after sending the email
      fs.unlinkSync(req.file.path);

      res.status(200).json({ message: "Invoice sent successfully" });
      return;
    } catch (error) {
      console.log("Error sending invoice:", error);

      res.status(500).end();
      return;
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      const orders = await this.orderService.model.find({}).exec();
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("Error fetching orders");
    }
  }

  async getByUser(req: Request, res: Response) {
    const userId = req.body.userId;
    console.log("userId", userId);
    try {
      try {
        const orders = await this.orderService.model.find({ buyer: userId });

        res.status(200).json(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Error fetching orders");
      }
    } catch (error) {
      res.status(500).send("Error fetching orders");
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedOrder = await this.orderService.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!updatedOrder) {
        res.status(404).json({ message: "Commande introuvable." });
        return
      }

      res.status(200).json({
        message: "Commande mise à jour avec succès.",
        order: updatedOrder
      });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).send("Error updating order");
    }
  }

  async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deletedOrder = await this.orderService.model.findByIdAndDelete(id);

      if (!deletedOrder) {
        res.status(404).json({ message: "Commande introuvable." });
        return;
      }

      res.status(200).json({
        message: "Commande supprimée avec succès.",
        order: deletedOrder
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).send("Error deleting order");
    }
  }

  async getOrderDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { limit = 10, page = 1 } = req.query;

      const order = await this.orderService.model.findById(id).populate("products").exec();

      if (!order) {
        res.status(404).json({ message: "Commande introuvable" });
        return;
      }

      const totalProducts = order.products.length;
      const totalPages = Math.ceil(totalProducts / Number(limit));
      const startIndex = (Number(page) - 1) * Number(limit);
      const paginatedProducts = order.products.slice(startIndex, startIndex + Number(limit));

      res.status(200).json({
        order,
        products: paginatedProducts,
        totalPages,
        currentPage: Number(page),
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de la commande:", error);
      res.status(500).send("Erreur lors de la récupération des détails de la commande");
    }
  }


  async deleteProductFromOrder(req: Request, res: Response) {
    try {
      const { orderId, sku } = req.params;

      const order = await this.orderService.model.findById(orderId).exec();

      if (!order) {
        res.status(404).json({ message: "Commande introuvable." });
        return;
      }

      const updatedProducts = order.products.filter(
        (product: any) => product.productSku !== sku
      );

      if (updatedProducts.length === order.products.length) {
        res.status(404).json({ message: "Produit introuvable dans la commande." });
        return;
      }

      order.products = updatedProducts;
      await order.save();

      res.status(200).json({
        message: "Produit supprimé avec succès de la commande.",
        order
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      res.status(500).send("Erreur lors de la suppression du produit.");
    }
  }

  async updateOrderProduct(req: Request, res: Response) {
    try {
      const { id, productSku } = req.params;
      const { quantity } = req.body;

      const order = await this.orderService.model.findById(id);
      if (!order) {
        res.status(404).json({ message: "Commande introuvable." });
        return;
      }

      const productIndex = order.products.findIndex(p => p.productSku === productSku);
      if (productIndex === -1) {
        res.status(404).json({ message: "Produit introuvable dans la commande." });
        return;
      }

      order.products[productIndex].quantity = quantity;
      order.markModified('products');
      await order.save();

      res.status(200).json({
        message: "Quantité mise à jour avec succès",
        order
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Erreur lors de la mise à jour");
    }
  }

  async addProductToOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { productSku, quantity } = req.body;

      const order = await this.orderService.model.findById(id);
      if (!order) {
        res.status(404).json({ message: "Commande introuvable." });
        return;
      }

      const product = await this.productService.model.findOne({
        'variants.sku': productSku
      });

      if (!product) {
        res.status(404).json({ message: "Produit introuvable." });
        return;
      }

      const variant = product.variants.find(v => v.sku === productSku);
      if (!variant) {
        res.status(404).json({ message: "Variante introuvable." });
        return;
      }

      const newProduct: IOrderItems = {
        productName: product.name,
        productSku: variant.sku,
        quantity: quantity,
        productImage: variant.images?.[0] || '',
        price: variant.price
      } as IOrderItems;

      if (!order.products) {
        order.products = [];
      }

      order.products.push(newProduct);
      order.markModified('products');
      await order.save();

      res.status(201).json({
        message: "Produit ajouté avec succès",
        order,
        productId: newProduct._id
      });

    } catch (error) {
      next(error);
    }
   }


   async createOrderForUser(req: Request, res: Response) {
    try {
      const {
        buyer,
        total,
        products,
        orderStatus = "PENDING",
        paymentStatus = "PAID",
      } = req.body;

      const user = await this.userService.model.findById(buyer);
      if (!user) {
        res.status(404).json({ message: "Utilisateur introuvable." });
        return;
      }

      for (const product of products) {
        const productExists = await this.productService.model.findOne({
          "variants.sku": product.productSku,
        });
        if (!productExists) {
          res.status(404).json({ message: `Produit ${product.productSku} introuvable.` });
          return;
        }
      }

      const orderCount = await this.orderService.model.countDocuments();
      const invoiceNumber = `FR-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${(
        orderCount + 1
      )
        .toString()
        .padStart(6, "0")}`;

      const order = await this.orderService.model.create({
        buyer,
        total,
        products,
        orderAt: new Date(),
        orderStatus,
        paymentStatus,
        invoiceNumber,
      });

      res.status(201).json({
        message: "Commande créée avec succès.",
        order,
      });
      return;
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  }



  buildRouter(): Router {
    const router = Router();

    router.post("/create", isAuthenticated, this.createOrder.bind(this));
    router.post(
      "/send/invoice",
      isAuthenticated,
      upload.single("pdf"),
      this.sendInvoice.bind(this)
    );
    router.get("/getByUser", isAuthenticated, this.getByUser.bind(this));
    router.get("/all", isAuthenticated, this.getOrders.bind(this));
    router.get("/", isAuthenticated, isAdmin, this.getOrders.bind(this));
    router.get("/:id/details", isAuthenticated, isAdmin, this.getOrderDetails.bind(this));
    router.put("/:id", isAuthenticated, isAdmin, this.updateOrder.bind(this));
    router.delete("/:id", isAuthenticated, isAdmin, this.deleteOrder.bind(this));
    router.delete("/:orderId/product/:sku", isAuthenticated, isAdmin, this.deleteProductFromOrder.bind(this));
    router.put("/:id/product/:productSku", isAuthenticated, isAdmin, this.updateOrderProduct.bind(this));
    router.post("/:id/product", isAuthenticated, isAdmin, this.addProductToOrder.bind(this));
    router.post("/", isAuthenticated, isAdmin, this.createOrderForUser.bind(this));

    return router;
  }
}
