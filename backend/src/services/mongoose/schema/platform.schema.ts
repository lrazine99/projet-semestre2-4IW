import { Schema, model, Document } from "mongoose";
import { IPlatform } from "../../../types";

export const PlatformSchema = new Schema<IPlatform>({
  name: { type: String, required: true, unique: true },
});

