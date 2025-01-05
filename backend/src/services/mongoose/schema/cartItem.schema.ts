import mongoose, { Schema, Document } from "mongoose";
import { ICartItem } from "../../../types";

export const CartItemSchema = new Schema<ICartItem>({
  sku: { type: String, required: true },
  quantity: { type: Number, required: true },
});
