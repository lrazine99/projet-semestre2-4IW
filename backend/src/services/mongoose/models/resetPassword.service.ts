import { Model } from "mongoose";
import { MongooseService } from "../mongoose.service";
import { ResetPasswordSchema } from "../schema";
import { IResetPassword, IUser } from "../../../types";

export class ResetPasswordService {
  readonly mongooseService: MongooseService;
  readonly model: Model<IResetPassword>;

  constructor(mongooseService: MongooseService) {
    this.mongooseService = mongooseService;

    const mongoose = this.mongooseService.mongoose;
    this.model = mongoose.model("ResetPassword", ResetPasswordSchema);
  }
}
