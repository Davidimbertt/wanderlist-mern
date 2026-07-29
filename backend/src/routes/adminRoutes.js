import express from "express";

import {
  deleteAdminTrip,
  deleteAdminUser,
  getAdminStats,
  getAdminTrips,
  getAdminUsers,
  updateUserRole,
} from "../controllers/adminController.js";

import {
  protect,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Every route below requires a logged-in administrator.
router.use(protect);
router.use(requireAdmin);

// Dashboard statistics
router.get("/stats", getAdminStats);

// User management
router.get("/users", getAdminUsers);
router.patch(
  "/users/:userId/role",
  updateUserRole
);
router.delete(
  "/users/:userId",
  deleteAdminUser
);

// Trip oversight
router.get("/trips", getAdminTrips);
router.delete(
  "/trips/:tripId",
  deleteAdminTrip
);

export default router;