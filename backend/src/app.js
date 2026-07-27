import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import {
  errorHandler,
  notFound,
} from "./middleware/errorMiddleware.js";

const app = express();

// Add secure HTTP headers.
app.use(helmet());

// Allow the React frontend to communicate with the backend.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Read JSON and form data from incoming requests.
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Read authentication cookies.
app.use(cookieParser());

// Prevent excessive API requests.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

// Error-handling middleware must remain last.
app.use(notFound);
app.use(errorHandler);

export default app;