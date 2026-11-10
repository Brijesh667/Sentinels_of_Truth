import "./env.js";
import mongoose from "mongoose";

let isMongoConnected = false;

// Event listeners to keep status synced
mongoose.connection.on("connected", () => {
  isMongoConnected = true;
  console.log("MongoDB connection established.");
});

mongoose.connection.on("error", (err) => {
  isMongoConnected = false;
  console.warn("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  isMongoConnected = false;
  console.warn("MongoDB disconnected.");
});

export async function connectMongo(retries = 3) {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.warn("MongoDB URI not provided in environment; MongoDB features will use fallback.");
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
      });
      isMongoConnected = true;
      console.log("MongoDB connected successfully.");
      return true;
    } catch (error) {
      console.warn(
        `MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`
      );
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  isMongoConnected = false;
  console.warn("All MongoDB connection attempts failed. Continuing in degraded mode.");
  return false;
}

export function getIsMongoConnected() {
  return mongoose.connection.readyState === 1;
}
