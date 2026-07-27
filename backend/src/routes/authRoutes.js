import express from "express";
import { rateLimit } from "express-rate-limit";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const authenticationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

router.post("/register", authenticationLimiter, registerUser);
router.post("/login", authenticationLimiter, loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getCurrentUser);

export default router;