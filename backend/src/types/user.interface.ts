import { Document } from "mongoose";
import { IAddress } from "./";

export enum UserRole {
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
