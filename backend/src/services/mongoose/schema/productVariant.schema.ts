import { Schema } from "mongoose";
import { IProductVariant } from "../../../types";

export const ProductVariantSchema = new Schema<IProductVariant>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
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
