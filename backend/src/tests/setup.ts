import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createServer } from "../index";
import { App } from "supertest/types";

let mongoServer: MongoMemoryServer;
let app: App;

beforeAll(async () => {
  // Create MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  process.env = {
    ...process.env,
    NODE_ENV: 'test',
    MONGODB_URI: mongoUri,
    MONGODB_USERNAME: '',
    MONGODB_PASSWORD: '',
    DATABASE_NAME: 'test'
  };

  app = await createServer();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


// Exportez app pour l'utiliser dans les tests
export { app };