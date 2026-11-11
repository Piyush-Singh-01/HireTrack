import mongoose from "mongoose"
import dotenv from "dotenv";
dotenv.config();

  const connectDb = async () => {
  try {
    const uri = process.env.MONGODB_URI || "";
    const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
    console.log("Connecting to MongoDB:", maskedUri || "URI not set");
    const connect = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected on host ${connect.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed:`, error.message);
    process.exit(1);
  }
};
export default connectDb;