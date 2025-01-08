import request from "supertest";
import { createServer, startServer } from "../index";
import { MongooseService } from "../services/mongoose/mongoose.service";
import { ProductService } from "../services/mongoose/models";
import { loadFixtures } from "../services/mongoose/fixtures.service";
import { app } from "./setup";
import mongoose, { MongooseError, Schema, Types } from "mongoose";
import { IPlatform, IProduct, IProductVariant, IUser } from "../types";
import { clearDatabase } from './helpers';


describe("Product API Tests", () => {
  let mongooseService: MongooseService;
  let productService: ProductService;
  let validProduct: IProduct;
  let platformId: Schema.Types.ObjectId;
  let tokenUser: string | undefined;
  let user: IUser | null;
  beforeAll(async () => {
    // Get instance of MongooseService
    mongooseService = await MongooseService.get();
    await clearDatabase();
    await loadFixtures();
    user = (await mongooseService.userService.model.findOne({})) as IUser;
    tokenUser = user?.token;

    const platform = await mongooseService.platformService.model.create({
      name: "PlayStation d5",
    });

    platformId = platform._id;

    validProduct = {
      _id: new Types.ObjectId(),
      // Add other missing properties as needed
      name: "The Last of Us Part I",
      description: "A post-apocalyptic game",
      genres: ["Action", "Adventure"],
      minAge: 18,
      editor: "Naughty Dog",
      variants: [
        {
          platform: platformId, // Sera défini dynamiquement
          sku: "TLOU1-PS5-STD",
          name: "Standard Edition",
          edition: "Standard",
          price: 69.99,
          stock: 50,
          releaseDate: new Date("2022-09-02"),
          barcode: "123456789",
          images: ["image1.jpg", "image2.jpg"],
        } as IProductVariant,
      ],
    } as IProduct;
  });

  afterAll(async () => {
    // Clean up all data
    productService = mongooseService.productService;

    await productService.model.deleteMany({});
    await mongooseService.platformService.model.deleteMany({});

    await clearDatabase();
    await mongoose.disconnect();
  });

  describe("GET /product", () => {
    it("should return products with platforms and pagination info", async () => {
      const response = await request(app)
        .get("/product")
        .set("Authorization", `Bearer ${tokenUser}`)
        .expect(200);

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

      const response = await request(app)
        .get("/product")
        .set("Authorization", `Bearer ${tokenUser}`)
        .expect(200);

      expect(response.body.platforms).toHaveLength(0);
      expect(response.body.productsFound).toHaveLength(0);
      expect(response.body.totalPages).toBe(0);
    });
  });

  describe("Validation Tests", () => {
    it("should create a valid product", async () => {
      const response = await request(app)
        .post("/product")
        .set("Authorization", `Bearer ${tokenUser}`)
        .send(validProduct)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "Produit créé avec succès"
      );
      expect(response.body.product).toHaveProperty("_id");
      expect(response.body.product.name).toBe(validProduct.name);
    });

    it("should reject when required fields are missing", async () => {
      const invalidProduct = { ...validProduct };
      delete (invalidProduct as any).name;

      await request(app)
        .post("/product")
        .send(invalidProduct)
        .set("Authorization", `Bearer ${tokenUser}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(
            "Tous les champs principaux sont requis."
          );
        });
    });

    it("should reject empty genres array", async () => {
      const invalidProduct = {
        ...validProduct,
        genres: [],
      };

      await request(app)
        .post("/product")
        .send(invalidProduct)
        .set("Authorization", `Bearer ${tokenUser}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(
            "Les genres doivent être un tableau non vide."
          );
        });
    });

    it("should reject empty variants array", async () => {
      const invalidProduct = {
        ...validProduct,
        variants: [],
      };

      await request(app)
        .post("/product")
        .send(invalidProduct)
        .set("Authorization", `Bearer ${tokenUser}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe("Au moins une variante est requise.");
        });
    });

    it("should reject incomplete variant", async () => {
      const invalidProduct = {
        ...validProduct,
        variants: [
          {
            platform: platformId,
            name: "Standard Edition",
            // Manque d'autres champs requis
          },
        ],
      };

      await request(app)
        .post("/product")
        .send(invalidProduct)
        .set("Authorization", `Bearer ${tokenUser}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain("Chaque variante doit inclure");
        });
    });
  });

  describe("Business Logic Tests", () => {
    it("should generate unique SKUs for each variant", async () => {
      const response = await request(app)
        .post("/product")
        .send(validProduct)
        .set("Authorization", `Bearer ${tokenUser}`)
        .expect(201);

      expect(response.body.product.variants[0]).toHaveProperty("sku");
      expect(typeof response.body.product.variants[0].sku).toBe("string");
    });

    it("should handle multiple variants", async () => {
      const multiVariantProduct = {
        ...validProduct,
        variants: [
          ...validProduct.variants,
          {
            platform: platformId,
            name: "Deluxe Edition",
            edition: "Deluxe",
            price: 89.99,
            stock: 25,
            releaseDate: "2022-09-02",
            barcode: "987654321",
            images: ["deluxe1.jpg", "deluxe2.jpg"],
          },
        ],
      };

      const response = await request(app)
        .post("/product")
        .set("Authorization", `Bearer ${tokenUser}`)
        .send(multiVariantProduct)
        .expect(201);

      expect(response.body.product.variants).toHaveLength(2);
      expect(response.body.product.variants[0].sku).not.toBe(
        response.body.product.variants[1].sku
      );
    });
  });

  describe("Error Handling Tests", () => {
    it("should handle invalid platform ID", async () => {
      const invalidProduct = {
        ...validProduct,
        variants: [
          {
            ...validProduct.variants[0],
            platform: "invalid-id",
          },
        ],
      };

      await request(app)
        .post("/product")
        .set("Authorization", `Bearer ${tokenUser}`)
        .send(invalidProduct)
        .expect(500);
    });
  });
});
