import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr || connStr.includes("YourPassword")) {
      console.warn("⚠️ MONGODB_URI is not configured with valid credentials in .env file.");
      console.warn("⚠️ Please update backend/.env with your real MongoDB Atlas connection string.");
      return false;
    }
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000, // Timeout fast after 5s instead of hanging
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.error("❌ MongoDB Connection Error:", error.message || error);
    console.error("----------------------------------------------------------------");
    console.error("💡 TROUBLESHOOTING MONGODB CONNECTION:");
    console.error(" 1. Ensure your IP address is whitelisted in MongoDB Atlas Network Access.");
    console.error("    Go to MongoDB Atlas -> Network Access -> Add IP Address -> '0.0.0.0/0' (Allow Anywhere).");
    console.error(" 2. Verify your database username and password in backend/.env MONGODB_URI.");
    console.error(" 3. If using standard connection, verify cluster hostname and port 27017 are accessible.");
    console.error("----------------------------------------------------------------");
    return false;
  }
};

export const isDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

