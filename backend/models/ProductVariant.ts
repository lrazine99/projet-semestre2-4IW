import { Schema, Document, Types } from "mongoose";

export interface ProductVariant extends Document {
  _id: Types.ObjectId; // Ajouter le type pour _id
  sku: string;
  platform: Schema.Types.ObjectId;
  name: string;
  edition: string;
  price: number;
  stock: number;
  releaseDate: Date;
  images: string[];
  barcode: string;
}

export const ProductVariantSchema = new Schema<ProductVariant>(
  {
    sku: { type: String, required: true, unique: true },
    platform: { type: Schema.Types.ObjectId, ref: "Platform", required: true },
    name: { type: String, required: true },
    edition: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    releaseDate: { type: Date, required: true },
    images: { type: [String], default: [] },
    barcode: { type: String, required: true },
  },
  { _id: true }
);
