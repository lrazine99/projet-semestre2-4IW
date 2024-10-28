import mongoose from "mongoose";
import Platform from "../models/Platform";
import connectDB from "./database";

async function loadPlatforms() {
  await connectDB();

  const platforms = [
    { name: "PlayStation 5" },
    { name: "Xbox Series X" },
    { name: "Nintendo Switch" },
    { name: "PC" },
  ];

  try {
    await Platform.insertMany(platforms);
    await mongoose.disconnect();

    console.log("Platforms inserted successfully");
  } catch (error) {
    console.error("Error inserting platforms:", error);
  }
}

loadPlatforms();
