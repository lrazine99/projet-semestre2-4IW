import { Schema, model, Document } from "mongoose";
import { IOrder } from "../../../types";
import { AddressSchema } from "./address.schema";
import {  OrderItemSchema } from "./";

export const OrderSchema = new Schema<IOrder>({
  buyer: { type: String, required: true },
  total: { type: Number, required: true },
  products: { 
    type: [OrderItemSchema], 
    validate: {
      validator: function(v: any) {
        return Array.isArray(v) && v.length > 0;
      },
      message: "There must be at least one product in the order."
    }
  },
  shippingAddress: { type: AddressSchema, required: true },
  billingAddress: { type: AddressSchema, required: true },
  orderAt: { type: Date, required: true },
  orderStatus: { type: String, required: true },
  paymentStatus: { type: String, required: true },
});
