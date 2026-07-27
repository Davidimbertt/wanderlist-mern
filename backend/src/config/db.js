import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from the environment variables");
  }

  const connection = await mongoose.connect(process.env.MONGO_URI);

  console.log(`MongoDB connected: ${connection.connection.name}`);
};

export default connectDB;