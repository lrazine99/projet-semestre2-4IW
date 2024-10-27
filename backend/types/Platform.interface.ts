import { Schema, Document } from "mongoose";

export interface IPlatform extends Document {
  _id: typeof Schema.Types.ObjectId;
  name: string;
}
