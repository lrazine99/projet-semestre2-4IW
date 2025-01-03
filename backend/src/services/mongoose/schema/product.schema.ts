import { Schema, model } from "mongoose";
import {  ProductVariantSchema } from "./";
import { IProduct } from "../../../types";

export const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: false },
  genres: { type: [String], required: true },
  variants: { type: [ProductVariantSchema], _id: true, auto: true},
  minAge: { type: Number, required: true },
  editor: { type: String, required: true },
});

