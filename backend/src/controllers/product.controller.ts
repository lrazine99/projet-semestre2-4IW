import express, { Router, Request, Response } from "express";
import { ProductService, PlatformService } from "../services/mongoose/models";
import { MongooseService } from "../services";

export class ProductController {
  private productService!: ProductService;
  private platformService!: PlatformService;

  constructor() {
    MongooseService.get().then((mongooseService) => {
      this.productService = mongooseService.productService;
      this.platformService = mongooseService.platformService;
    });
  }

  async productGet(req: Request, res: Response) {
    try {
      const platfroms = await this.platformService.model.find();

      const gamesFound = await this.productService.model.find().populate({
        path: "variants.platform",
        select: "name",
      });

      res.status(200).json({ message: gamesFound });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des produits" });
    }
  }

  buildRouter(): Router {
    const router = Router();

    router.get("/", this.productGet.bind(this));

    return router;
  }
}
//
//   async cartSync(req: Request, res: Response) {
