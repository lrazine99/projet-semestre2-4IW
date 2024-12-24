import mongoose from "mongoose";

let isConnected = false; // Track the connection status

const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    console.log("Connecting to MongoDB...", process.env.BDD_ENDPOINT);
    // @ts-ignore
    await mongoose.connect(process.env.BDD_ENDPOINT as string, {
      dbName: "gameShop",
    });

    isConnected = true;

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
    throw error;
  }
};

export default connectDB;
