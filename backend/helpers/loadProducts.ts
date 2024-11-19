import Product from "../models/Product";
import Platform from "../models/Platform";
import { IPlatform } from "../types/Platform.interface";
import mongoose from "mongoose";
import connectDB from "./database";

async function loadProducts() {
  await connectDB();

  await Product.deleteMany({});

  const platforms: IPlatform[] = await Platform.find();

  const games = [
    {
      name: "Game 1",
      description: "An action-packed adventure",
      genres: ["Action"],
      minAge: 16,
      editor: "EpicGames",
      variants: platforms.map((platform, index) => {
        const generateEAN = () => {
          return Math.floor(Math.random() * 10000000000000); 
        };
        return {
          sku: `SKU001${index}`,
          platform: platform._id,
          name: "Standard Edition",
          edition: "Standard",
          price: 49.99,
          stock: 100,
          releaseDate: new Date("2023-01-01"),
          images: ["https://www.micromania.fr/dw/image/v2/BCRB_PRD/on/demandware.static/-/Sites-masterCatalog_Micromania/default/dw5e1dfb6c/images/high-res/2024_Gaming/PS5/Jeux/PS5_HZDR_PKSHT_FT_RGB_FR_240918.jpg"],
          eanRef: generateEAN(),
        };
      }),
    },
    {
      name: "Game 2",
      description: "An epic adventure game",
      genres: ["Adventure", "Voiture"],
      minAge: 7,
      editor: "Ubisoft",
      variants: platforms.map((platform, index) => {
        const generateEAN = () => {
          return Math.floor(Math.random() * 10000000000000); 
        };
        return {
          sku: `SKU002${index}`,
          platform: platform._id,
          name: "Standard Edition",
          edition: "Standard",
          price: 39.99,
          stock: 100,
          releaseDate: new Date("2023-01-01"),
          images: ["https://www.micromania.fr/dw/image/v2/BCRB_PRD/on/demandware.static/-/Sites-masterCatalog_Micromania/default/dw7fcd69b3/images/high-res/2024_Gaming/PS5/Jeux/241354.jpg"],
          eanRef: generateEAN(),
        };
      }),
    },
    {
      name: "Game 3",
      description: "A thrilling horror experience for strong boys with a big mind",
      genres: ["Horror"],
      minAge: 18,
      editor: "2k",
      variants: platforms.map((platform, index) => {
        const generateEAN = () => {
          return Math.floor(Math.random() * 10000000000000); 
        };
        return {
          sku: `SKU003${index}`,
          platform: platform._id,
          name: "Deluxe Edition",
          edition: "Deluxe",
          price: 59.99,
          stock: 50,
          releaseDate: new Date("2023-06-01"),
          images: ["https://www.micromania.fr/dw/image/v2/BCRB_PRD/on/demandware.static/-/Sites-masterCatalog_Micromania/default/dwdda88e49/images/high-res/2024_Gaming/PS5/Jeux/BO6/0196388432127.jpg"],
          eanRef: generateEAN(),
        };
      }),
    },
    {
      name: "Game 4",
      description: "A fun multiplayer racing game",
      genres: ["Racing", "Multiplayer"],
      minAge: 16,
      editor: "Voodoo",
      variants: platforms.map((platform, index) => {
        const generateEAN = () => {
          return Math.floor(Math.random() * 10000000000000); 
        };
        return {
          sku: `SKU004${index}`,
          platform: platform._id,
          name: "Collector's Edition",
          edition: "Collector's",
          price: 69.99,
          stock: 25,
          releaseDate: new Date("2023-09-01"),
          images: ["https://www.micromania.fr/dw/image/v2/BCRB_PRD/on/demandware.static/-/Sites-masterCatalog_Micromania/default/dw967b4634/images/high-res/142715.jpg"],
          eanRef: generateEAN(),
        };
      }),
    },
  ];

  try {
    await Product.insertMany(games);
    await mongoose.disconnect();

    console.log("Games inserted successfully");
  } catch (error) {
    console.error("Error inserting games:", error);
  }
}

loadProducts();
