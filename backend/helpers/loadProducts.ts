import Product from "../models/Product";
import Platform from "../models/Platform";
import { IPlatform } from "../types/Platform.interface";

export async function loadPlatforms() {
  const platforms = [
    { name: "PlayStation 5" },
    { name: "Xbox Series X" },
    { name: "Nintendo Switch" },
    { name: "PC" },
  ];

  try {
    await Platform.insertMany(platforms);
    console.log("Platforms inserted successfully");
  } catch (error) {
    console.error("Error inserting platforms:", error);
  }
}

loadPlatforms;

export async function loadProducts() {
  const platforms: IPlatform[] = await Platform.find();
  const platformMap = platforms.reduce((map, platform: IPlatform) => {
    map[platform.name] = platform._id.toString();
    return map;
  }, {} as Record<string, string>);

  const games = [
    {
      name: "Game 1",
      description: "An action-packed adventure",
      genres: ["Action"],
      variants: platforms.map((platform, index) => {
        return {
          sku: `SKU001${index}`,
          platform: platform._id,
          name: "Standard Edition",
          edition: "Standard",
          price: 49.99,
          stock: 100,
          releaseDate: new Date("2023-01-01"),
          images: ["https://picsum.photos/seed/picsum/200/300"],
        };
      }),
    },
    {
      name: "Game 2",
      description: "An epic adventure game",
      genres: ["Adventure"],
      variants: platforms.map((platform, index) => {
        return {
          sku: `SKU002${index}`,
          platform: platform._id,
          name: "Standard Edition",
          edition: "Standard",
          price: 39.99,
          stock: 100,
          releaseDate: new Date("2023-01-01"),
          images: ["https://picsum.photos/seed/picsum/200/300"],
        };
      }),
    },
  ];

  try {
    await Product.insertMany(games);
    console.log("20 games inserted successfully");
  } catch (error) {
    console.error("Error inserting games:", error);
  }
}

loadProducts();
