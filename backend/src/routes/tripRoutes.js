import express from "express";

import {
  createTrip,
  deleteTrip,
  getTrip,
  getTrips,
  getTripStats,
  updateTrip,
} from "../controllers/tripController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Every Trip route requires authentication.
router.use(protect);

router
  .route("/")
  .get(getTrips)
  .post(createTrip);

// This must appear before the /:id route.
router.get("/stats", getTripStats);

router
  .route("/:id")
  .get(getTrip)
  .patch(updateTrip)
  .delete(deleteTrip);

export default router;