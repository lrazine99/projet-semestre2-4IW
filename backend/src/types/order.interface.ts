import { Document } from "mongoose";
import { IOrderItems } from "./orderItems.interface";
import { IAddress } from "./address.interface";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

export interface IOrder extends Document {
  buyer: string;
  total: number;
  products: IOrderItems[];
  shippingAddress: IAddress;
  billingAddress: IAddress;
  orderAt: Date;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
}
