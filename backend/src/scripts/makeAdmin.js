import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../models/User.js";

const email = process.argv[2]
  ?.trim()
  .toLowerCase();

const makeAdmin = async () => {
  try {
    if (!email) {
      throw new Error(
        "Provide the email address of the account to promote"
      );
    }

    await connectDB();

    const user = await User.findOne({
      email,
    });

    if (!user) {
      throw new Error(
        "No user was found with that email address"
      );
    }

    user.role = "admin";
    await user.save();

    console.log(
      `${user.name} (${user.email}) is now an administrator`
    );
  } catch (error) {
    console.error(
      `Administrator promotion failed: ${error.message}`
    );

    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

makeAdmin();