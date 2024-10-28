import { Schema, model, Document } from "mongoose";
import { ProductVariant, ProductVariantSchema } from "./ProductVariant";

interface IProduct extends Document {
  name: string;
  description: string;
  genres: string[];
  variants?: ProductVariant[];
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: false },
  genres: { type: [String], required: true },
  variants: { type: [ProductVariantSchema] },
});

const Product = model<IProduct>("Product", ProductSchema);

export default Product;
