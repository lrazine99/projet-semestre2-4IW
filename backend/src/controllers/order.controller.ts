import express, { Router, Request, Response } from "express";
import { CartService, OrderService } from "../services/mongoose/models";
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

export class OrderController {
  private OrderService!: OrderService;
  private cartService!: CartService;

  constructor() {
    MongooseService.get().then((mongooseService) => {
      this.OrderService = mongooseService.orderService;
      this.cartService = mongooseService.cartService;
    });
  }

  async createOrder(req: Request, res: Response) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const userId = req.body.userId;
    console.log('NEW CALL');

    const {
      token,
      amount,
      currency,
      billingAddress,
      shippingAddress,
      cartItems,
    } = req.body;

    try {
      const order = await this.OrderService.model.create({
        buyer: userId,
        total: amount,
        products: cartItems.map(
          (
            item: ICartItem &
              IProductVariant & {
                productImage: String;
                title: String;
                imageSrc: String;
              }
          ) => ({
            productName: item.title,
            productSku: item.sku,
            quantity: item.quantity,
            productImage: item.imageSrc,
            price: item.price,
          })
        ),
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        orderAt: new Date(),
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      });
      console.log({
        amount : Math.round(amount  * 100), // Amount in the smallest currency unit
        currency,
        source: token,
        description: `Order payment`,
      });

      const charge = await stripe.charges.create({
        amount : Math.round(amount  * 100), // Amount in the smallest currency unit
        currency,
        source: token,
        description: `Order payment`,
      });
      console.log(charge);
      
      await this.cartService.model.updateOne({ userId }, { items: [] });

      if (charge.status === "succeeded") {
        await this.OrderService.model.updateOne(
          { _id: order._id },
          { paymentStatus: PaymentStatus.PAID }
        );
      } else {
        res.status(400).send("Payment failed");
        return;
      }

      res.status(200).end();
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating payment");
    }
  }

  buildRouter(): Router {
    const router = Router();

    router.post("/create", isAuthenticated, this.createOrder.bind(this));

    return router;
  }
}
