import { Schema, Document } from "mongoose";

export interface IPlatform extends Document {
  _id: Schema.Types.ObjectId; 
  name: string;
}
