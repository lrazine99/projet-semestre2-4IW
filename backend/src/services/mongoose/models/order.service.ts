import { Model } from "mongoose";
import { MongooseService } from "../mongoose.service";
import { OrderSchema } from "../schema";
import { IAddress, IOrder } from "../../../types";
import { OrderStatus, PaymentStatus } from "../../../types";
import { ICartItem, IProductVariant } from "../../../types";
export class OrderService {
  readonly mongooseService: MongooseService;
  readonly model: Model<IOrder>;

  constructor(mongooseService: MongooseService) {
    this.mongooseService = mongooseService;

    const mongoose = this.mongooseService.mongoose;
    this.model = mongoose.model("Order", OrderSchema);
  }

  async createOrder(
    userId: string,
    amount: number,
    cartItems: (ICartItem &
      IProductVariant & {
        productImage: String;
        title: String;
        imageSrc: String;
      })[],
    shippingAddress: IAddress,
    billingAddress: IAddress
  ): Promise<IOrder> {
    const orderCount = await this.model.countDocuments();

    // Generate a unique invoice number
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 12); // YYYYMMDDHHMM
    const formattedIndex = String(orderCount + 1).padStart(6, "0");
    const invoiceNumber = `FR-${timestamp}-${formattedIndex}`;

    const order = await this.model.create({
      buyer: userId,
      total: amount,
      products: cartItems.map((item) => ({
        productName: item.title,
        productSku: item.sku,
        quantity: item.quantity,
        productImage: item.imageSrc,
        price: item.price,
      })),
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      orderAt: new Date(),
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      invoiceNumber,
    });

    return order;
  }

  async handleStock(cartItems: ICartItem[], userId: string): Promise<void> {
    for (let item of cartItems) {
      const product = await this.mongooseService.productService.model.findOne(
        { "variants.sku": item.sku },
        { "variants.$": 1 }
      );

      const variant = product?.variants[0];

      if (product && variant && variant?.stock > 0) {
        const quantityToSubtract = Math.min(variant.stock, item.quantity);

        await this.mongooseService.productService.model.updateOne(
          { "variants.sku": item.sku },
          { $inc: { "variants.$.stock": -quantityToSubtract } }
        );

        await this.model.updateOne(
          { "products.productSku": item.sku },
          { $set: { "products.$.quantity": quantityToSubtract } }
        );
      } else if (product && variant && variant?.stock === 0) {
        await this.model.updateOne(
          { "products.productSku": item.sku },
          { $pull: { products: { productSku: item.sku } } }
        );
      }
    }
  }
}
