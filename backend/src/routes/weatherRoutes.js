import express from "express";

import {
  getForecast,
  searchCities,
} from "../controllers/weatherController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All weather routes require the user to be logged in.
router.use(protect);

// Search for city coordinates.
router.get("/locations", searchCities);

// Get a weather forecast using coordinates.
router.get("/forecast", getForecast);

export default router;