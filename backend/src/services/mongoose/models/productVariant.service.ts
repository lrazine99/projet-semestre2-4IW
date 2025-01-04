import { Model } from "mongoose";
import { MongooseService } from "../mongoose.service";
import { ProductVariantSchema } from "../schema/productVariant.schema";
import { IProductVariant } from "../../../types";

export class ProductVariantService {
  readonly mongooseService: MongooseService;
  readonly model: Model<IProductVariant>;

  constructor(mongooseService: MongooseService) {
    this.mongooseService = mongooseService;

    const mongoose = this.mongooseService.mongoose;
    this.model = mongoose.model("ProductVariant", ProductVariantSchema);
  }
}
