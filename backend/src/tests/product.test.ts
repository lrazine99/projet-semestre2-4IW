import request from "supertest";
import { createServer, startServer } from "../index";
import { MongooseService } from "../services/mongoose/mongoose.service";
import { ProductService } from "../services/mongoose/models";
import { loadFixtures } from "../services/mongoose/fixtures.service";
import { app } from "./setup";
import { Schema } from "mongoose";

describe("Product API Tests", () => {
  let mongooseService: MongooseService;
  let productService: ProductService;

  beforeAll(async () => {
    // Get instance of MongooseService
    mongooseService = await MongooseService.get();

    await loadFixtures();
  });

  afterAll(async () => {
    // Clean up all data
    productService = mongooseService.productService;

    await productService.model.deleteMany({});
  });


  describe("GET /product", () => {
    it("should return products with platforms and pagination info", async () => {
      const response = await request(app).get("/product").expect(200);

      // Vérifier la structure de la réponse
      expect(response.body).toHaveProperty("platforms");
      expect(response.body).toHaveProperty("productsFound");
      expect(response.body).toHaveProperty("totalPages");

      // Vérifier les plateformes
      expect(response.body.platforms[0]).toHaveProperty("name");

      // Vérifier les produits
      expect(response.body.productsFound[0]).toHaveProperty("name");
      expect(response.body.productsFound[0]).toHaveProperty("variants");
    });

    it("should handle custom limit parameter", async () => {
      // Créer plus de produits pour tester la pagination
      const platforms = await mongooseService.platformService.model.find();

      const response = await request(app)
        .get("/product")
        .query({ limit: 2 })
        .expect(200);

      // Vérifier la pagination
      expect(response.body.totalPages).toBe(2);
    });

    it("should handle empty database", async () => {
      // Nettoyer la base de données
      await mongooseService.productService.model.deleteMany({});
      await mongooseService.platformService.model.deleteMany({});

      const response = await request(app).get("/product").expect(200);

      expect(response.body.platforms).toHaveLength(0);
      expect(response.body.productsFound).toHaveLength(0);
      expect(response.body.totalPages).toBe(0);
    });

    it("should handle database errors", async () => {
      // Simuler une erreur de base de données
      jest
        .spyOn(mongooseService.productService.model, "find")
        .mockRejectedValueOnce(new Error("Database error"));

      await request(app).get("/product").expect(500);
    });

    it("should populate platform information correctly", async () => {
      const response = await request(app).get("/product").expect(200);

      const product = response.body.productsFound[0];
      expect(product.variants[0].platform).toHaveProperty("name");
      expect(typeof product.variants[0].platform.name).toBe("string");
    });


  });
});
