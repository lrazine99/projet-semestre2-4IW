import express, { Router, Request, Response } from "express";
import {
  CartService,
  OrderService,
  ProductService,
  UserService,
} from "../services/mongoose/models";
import { MongooseService } from "../services";
import Stripe from "stripe";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import {
  ICartItem,
  IOrderItems,
  IProductVariant,
  OrderStatus,
  PaymentStatus,
} from "../types";
import { Mailer } from "../helpers/mailer";
import fs from "fs";
import formData from "form-data";
import multer from "multer";
import path from "path";

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

      for (let item of cartItems) {
        await this.productService.model.updateOne(
          {
            "variants.sku": item.sku,
            $expr: { $gte: ["$variants.quantity", item.quantity] }, // Ensure stock is sufficient
          },
          {
            $inc: { "variants.$.stock": -item.quantity },
          }
        );
      }

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
      console.error(error);
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

  buildRouter(): Router {
    const router = Router();

    router.post("/create", isAuthenticated, this.createOrder.bind(this));
    router.post(
      "/send/invoice",
      isAuthenticated,
      upload.single("pdf"),
      this.sendInvoice.bind(this)
    );
    router.get("/", isAuthenticated, this.getOrders.bind(this));
    return router;
  }
}
