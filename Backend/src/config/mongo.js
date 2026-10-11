import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

let isMongoConnected = false;

export async function connectMongo() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.warn("MongoDB URI not provided in environment; MongoDB features will use fallback.");
    return false;
  }

  try {
    mongoose.set("bufferCommands", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log("MongoDB connected successfully.");
    return true;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`MongoDB connection failed: ${error.message}. Features will fall back gracefully.`);
    return false;
  }
}

export function getIsMongoConnected() {
  return isMongoConnected && mongoose.connection.readyState === 1;
}
