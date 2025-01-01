import mongoose, { Schema, Document } from "mongoose";
import { ICartItem } from "../../../types";

export const CartItemSchema = new Schema<ICartItem>({
  sku: { type: String, required: true },
  title: { type: String, required: true },
  imageSrc: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  stock: { type: Number, required: true },
  edition: { type: String, required: true },
  platform: { type: String, required: true },
});
