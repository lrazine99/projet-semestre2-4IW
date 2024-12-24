import { Model } from "mongoose";
import { MongooseService } from "../mongoose.service";
import { ProductSchema } from "../schema";
import { IProduct, IUser } from "../../../types";

export class ProductService {
  readonly mongooseService: MongooseService;
  readonly model: Model<IProduct>;

  constructor(mongooseService: MongooseService) {
    this.mongooseService = mongooseService;
    
    
    const mongoose = this.mongooseService.mongoose;
    this.model = mongoose.model("Product", ProductSchema);
  }
}
