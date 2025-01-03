import { Model } from "mongoose";
import { MongooseService } from "../mongoose.service";
import { OrderSchema } from "../schema";
import { IOrder } from "../../../types";

export class OrderService {
  readonly mongooseService: MongooseService;
  readonly model: Model<IOrder>;

  constructor(mongooseService: MongooseService) {
    this.mongooseService = mongooseService;
    
    
    const mongoose = this.mongooseService.mongoose;
    this.model = mongoose.model("Order", OrderSchema);
  }
}
