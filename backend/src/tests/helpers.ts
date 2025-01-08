import mongoose from "mongoose";

export const clearDatabase = async () => {
    try {
      const collections = mongoose.connection.collections;
  
      for (const key in collections) {
        const collection = collections[key];
        // Supprimer d'abord tous les index sauf _id
        try {
          await collection.dropIndexes();
        } catch (error) {
          // Ignorer l'erreur si l'index n'existe pas
          console.log(`Index drop failed for ${key}, might not exist`);
        }
        // Puis supprimer les documents
        await collection.deleteMany({});
      }
    } catch (error) {
      console.error("Clear database error:", error);
      throw error;
    }
  };