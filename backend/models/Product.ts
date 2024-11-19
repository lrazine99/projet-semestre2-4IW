import { Schema, model, Document } from "mongoose";
import { ProductVariant, ProductVariantSchema } from "./ProductVariant";

interface IProduct extends Document {
  name: string;
  description: string;
  genres: string[];
  variants?: ProductVariant[];
  minAge: number;
  editor: string;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: false },
  genres: { type: [String], required: true },
  variants: { type: [ProductVariantSchema] },
  minAge: {type: Number, required: true},
  editor: {type: String, required: true},
});

const Product = model<IProduct>("Product", ProductSchema);

export default Product;
