import { Schema, model, Document } from "mongoose";
import { AddressSchema } from "./Address";
import { IAddress } from "../types/Address.interface";

enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  address?: IAddress;
  token: string;
  hash: string;
  salt: string;
  role?: UserRole;
  birthDate: Date;
  isVerified: boolean;
  confirmationToken?: string | null;
  confirmationTokenExpires?: Date | null;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/,
    unique: true,
  },
  address: {
    type: AddressSchema,
    required: false,
  },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  birthDate: { type: Date, required: true },
  token: { type: String, required: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  confirmationToken: { type: String, required: false },
  confirmationTokenExpires: { type: Date, required: false },
});

export const User = model<IUser>("User", UserSchema);
