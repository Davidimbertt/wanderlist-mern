import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { COOKIE_NAME } from "../utils/token.js";

export const protect = async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    res.status(401);
    throw new Error("Authentication is required");
  }

  if (!process.env.JWT_SECRET) {
    res.status(500);
    throw new Error(
      "JWT_SECRET is missing from the server configuration"
    );
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
  } catch {
    res.status(401);
    throw new Error(
      "Your session is invalid or has expired"
    );
  }

  const user = await User.findById(decodedToken.userId);

  if (!user) {
    res.status(401);
    throw new Error(
      "The user for this session no longer exists"
    );
  }

  req.user = user;
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error(
      "Administrator access is required"
    );
  }

  next();
};