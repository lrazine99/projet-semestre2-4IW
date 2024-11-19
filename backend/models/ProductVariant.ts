import { Schema, Document } from "mongoose";

export interface ProductVariant extends Document {
  sku: string;
  platform: Schema.Types.ObjectId;
  name: string;
  edition: string;
  price: number;
  stock: number;
  releaseDate: Date;
  images: string[];
  eanRef: number;
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
    eanRef: { type: Number, required: true},
  },
  { _id: false }
);
