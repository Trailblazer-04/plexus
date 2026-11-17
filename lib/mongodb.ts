import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & { mongoClientPromise?: Promise<MongoClient> };

async function getMongoClient() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  if (!globalForMongo.mongoClientPromise) {
    globalForMongo.mongoClientPromise = new MongoClient(process.env.MONGODB_URI).connect();
  }
  return globalForMongo.mongoClientPromise;
}

export async function getDatabase() {
  return (await getMongoClient()).db(process.env.MONGODB_DB_NAME || "plexus");
}
