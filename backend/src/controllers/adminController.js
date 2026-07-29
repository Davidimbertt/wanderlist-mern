import mongoose from "mongoose";

import Trip from "../models/Trip.js";
import User from "../models/User.js";

const throwError = (res, statusCode, message) => {
  res.status(statusCode);
  throw new Error(message);
};

const escapeRegularExpression = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  const [userResult, tripResult] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: null,

          totalUsers: {
            $sum: 1,
          },

          totalAdmins: {
            $sum: {
              $cond: [
                {
                  $eq: ["$role", "admin"],
                },
                1,
                0,
              ],
            },
          },

          newUsersThisMonth: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    "$createdAt",
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1
                    ),
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    Trip.aggregate([
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,

                totalTrips: {
                  $sum: 1,
                },

                totalActivities: {
                  $sum: {
                    $size: {
                      $ifNull: ["$activities", []],
                    },
                  },
                },

                upcomingTrips: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          {
                            $gte: [
                              "$startDate",
                              new Date(),
                            ],
                          },
                          {
                            $ne: [
                              "$status",
                              "cancelled",
                            ],
                          },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],

          byStatus: [
            {
              $group: {
                _id: "$status",
                total: {
                  $sum: 1,
                },
              },
            },
            {
              $sort: {
                total: -1,
              },
            },
          ],

          byCategory: [
            {
              $group: {
                _id: "$category",
                total: {
                  $sum: 1,
                },
              },
            },
            {
              $sort: {
                total: -1,
              },
            },
          ],
        },
      },
    ]),
  ]);

  const userSummary = userResult[0] || {
    totalUsers: 0,
    totalAdmins: 0,
    newUsersThisMonth: 0,
  };

  const tripSummary = tripResult[0]?.summary?.[0] || {
    totalTrips: 0,
    totalActivities: 0,
    upcomingTrips: 0,
  };

  res.status(200).json({
    success: true,

    stats: {
      users: userSummary,
      trips: tripSummary,
      byStatus: tripResult[0]?.byStatus || [],
      byCategory: tripResult[0]?.byCategory || [],
    },
  });
};

// GET /api/admin/users
export const getAdminUsers = async (req, res) => {
  const page = Math.max(
    Number.parseInt(req.query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    Math.max(
      Number.parseInt(req.query.limit, 10) || 10,
      1
    ),
    50
  );

  const query = {};

  if (
    req.query.role === "user" ||
    req.query.role === "admin"
  ) {
    query.role = req.query.role;
  }

  if (req.query.search?.trim()) {
    const safeSearch = escapeRegularExpression(
      req.query.search.trim()
    );

    const searchExpression = new RegExp(
      safeSearch,
      "i"
    );

    query.$or = [
      {
        name: searchExpression,
      },
      {
        email: searchExpression,
      },
    ];
  }

  const [users, totalUsers] = await Promise.all([
    User.find(query)
      .select("name email role createdAt updatedAt")
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit),

    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    users,

    pagination: {
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
  });
};

// PATCH /api/admin/users/:userId/role
export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    throwError(res, 400, "Invalid user ID");
  }

  if (!["user", "admin"].includes(role)) {
    throwError(
      res,
      400,
      "Role must be user or admin"
    );
  }

  if (
    req.user._id.toString() === userId &&
    role !== "admin"
  ) {
    throwError(
      res,
      400,
      "You cannot remove your own administrator role"
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throwError(res, 404, "User not found");
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User role updated successfully",

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

// DELETE /api/admin/users/:userId
export const deleteAdminUser = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    throwError(res, 400, "Invalid user ID");
  }

  if (req.user._id.toString() === userId) {
    throwError(
      res,
      400,
      "You cannot delete your own administrator account"
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throwError(res, 404, "User not found");
  }

  const tripResult = await Trip.deleteMany({
    user: user._id,
  });

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User and associated trips deleted successfully",
    deletedTrips: tripResult.deletedCount,
  });
};

// GET /api/admin/trips
export const getAdminTrips = async (req, res) => {
  const page = Math.max(
    Number.parseInt(req.query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    Math.max(
      Number.parseInt(req.query.limit, 10) || 10,
      1
    ),
    50
  );

  const query = {};

  if (req.query.status?.trim()) {
    query.status = req.query.status.trim();
  }

  if (req.query.category?.trim()) {
    query.category = req.query.category.trim();
  }

  if (req.query.search?.trim()) {
    const safeSearch = escapeRegularExpression(
      req.query.search.trim()
    );

    const searchExpression = new RegExp(
      safeSearch,
      "i"
    );

    query.$or = [
      {
        title: searchExpression,
      },
      {
        destinationCity: searchExpression,
      },
      {
        country: searchExpression,
      },
    ];
  }

  const [trips, totalTrips] = await Promise.all([
    Trip.find(query)
      .populate("user", "name email role")
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit),

    Trip.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: trips.length,
    trips,

    pagination: {
      page,
      limit,
      totalTrips,
      totalPages: Math.ceil(totalTrips / limit),
    },
  });
};

// DELETE /api/admin/trips/:tripId
export const deleteAdminTrip = async (req, res) => {
  const { tripId } = req.params;

  if (!mongoose.isValidObjectId(tripId)) {
    throwError(res, 400, "Invalid trip ID");
  }

  const trip = await Trip.findById(tripId);

  if (!trip) {
    throwError(res, 404, "Trip not found");
  }

  await trip.deleteOne();

  res.status(200).json({
    success: true,
    message: "Trip deleted successfully by administrator",
  });
};