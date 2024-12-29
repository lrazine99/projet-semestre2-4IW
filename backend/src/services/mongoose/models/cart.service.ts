import { Model } from "mongoose";
import { MongooseService } from "../mongoose.service";
import { CartSchema } from "../schema";
import { ICart } from "../../../types";

export class CartService {
  readonly mongooseService: MongooseService;
  readonly model: Model<ICart>;

  constructor(mongooseService: MongooseService) {
    this.mongooseService = mongooseService;

    const mongoose = this.mongooseService.mongoose;
    this.model = mongoose.model("Cart", CartSchema);
  }
}
