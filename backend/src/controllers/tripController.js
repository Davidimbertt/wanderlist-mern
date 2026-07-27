import mongoose from "mongoose";

import Trip from "../models/Trip.js";

const throwError = (res, statusCode, message) => {
  res.status(statusCode);
  throw new Error(message);
};

const parseCoordinates = (longitude, latitude, res) => {
  const parsedLongitude = Number(longitude);
  const parsedLatitude = Number(latitude);

  const coordinatesAreValid =
    Number.isFinite(parsedLongitude) &&
    Number.isFinite(parsedLatitude) &&
    parsedLongitude >= -180 &&
    parsedLongitude <= 180 &&
    parsedLatitude >= -90 &&
    parsedLatitude <= 90;

  if (!coordinatesAreValid) {
    throwError(
      res,
      400,
      "Valid longitude and latitude values are required"
    );
  }

  return [parsedLongitude, parsedLatitude];
};

const parseTripDates = (startDate, endDate, res) => {
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  if (
    Number.isNaN(parsedStartDate.getTime()) ||
    Number.isNaN(parsedEndDate.getTime())
  ) {
    throwError(res, 400, "Valid start and end dates are required");
  }

  if (parsedEndDate < parsedStartDate) {
    throwError(res, 400, "End date cannot be before the start date");
  }

  return {
    parsedStartDate,
    parsedEndDate,
  };
};

const findOwnedTrip = async (tripId, userId, res) => {
  if (!mongoose.isValidObjectId(tripId)) {
    throwError(res, 400, "Invalid trip ID");
  }

  const trip = await Trip.findOne({
    _id: tripId,
    user: userId,
  });

  if (!trip) {
    throwError(res, 404, "Trip not found");
  }

  return trip;
};

// POST /api/trips
export const createTrip = async (req, res) => {
  const {
    title,
    destinationCity,
    country,
    longitude,
    latitude,
    startDate,
    endDate,
    category,
    status,
    notes,
    activities,
  } = req.body;

  if (!title?.trim() || !destinationCity?.trim()) {
    throwError(res, 400, "Trip title and destination city are required");
  }

  if (activities !== undefined && !Array.isArray(activities)) {
    throwError(res, 400, "Activities must be an array");
  }

  const coordinates = parseCoordinates(longitude, latitude, res);

  const { parsedStartDate, parsedEndDate } = parseTripDates(
    startDate,
    endDate,
    res
  );

  const trip = await Trip.create({
    user: req.user._id,
    title: title.trim(),
    destinationCity: destinationCity.trim(),
    country: country?.trim() || "",
    location: {
      type: "Point",
      coordinates,
    },
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    category,
    status,
    notes: notes?.trim() || "",
    activities: activities || [],
  });

  res.status(201).json({
    success: true,
    message: "Trip created successfully",
    trip,
  });
};

// GET /api/trips
export const getTrips = async (req, res) => {
  const {
    status,
    category,
    search,
    sort = "startDate",
  } = req.query;

  const page = Math.max(
    Number.parseInt(req.query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
    50
  );

  const query = {
    user: req.user._id,
  };

  if (status) {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  if (search?.trim()) {
    query.$text = {
      $search: search.trim(),
    };
  }

  const allowedSortOptions = new Set([
    "startDate",
    "-startDate",
    "createdAt",
    "-createdAt",
    "title",
    "-title",
  ]);

  const selectedSort = allowedSortOptions.has(sort)
    ? sort
    : "startDate";

  const [trips, totalTrips] = await Promise.all([
    Trip.find(query)
      .sort(selectedSort)
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

// GET /api/trips/stats
export const getTripStats = async (req, res) => {
  const [result] = await Trip.aggregate([
    {
      $match: {
        user: req.user._id,
      },
    },
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
                  $size: "$activities",
                },
              },
              upcomingTrips: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        {
                          $gte: ["$startDate", new Date()],
                        },
                        {
                          $ne: ["$status", "cancelled"],
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
              _id: 1,
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
  ]);

  const summary = result?.summary?.[0] || {
    totalTrips: 0,
    totalActivities: 0,
    upcomingTrips: 0,
  };

  res.status(200).json({
    success: true,
    stats: {
      summary,
      byStatus: result?.byStatus || [],
      byCategory: result?.byCategory || [],
    },
  });
};

// GET /api/trips/:id
export const getTrip = async (req, res) => {
  const trip = await findOwnedTrip(
    req.params.id,
    req.user._id,
    res
  );

  res.status(200).json({
    success: true,
    trip,
  });
};

// PATCH /api/trips/:id
export const updateTrip = async (req, res) => {
  const trip = await findOwnedTrip(
    req.params.id,
    req.user._id,
    res
  );

  const {
    title,
    destinationCity,
    country,
    longitude,
    latitude,
    startDate,
    endDate,
    category,
    status,
    notes,
    activities,
  } = req.body;

  if (title !== undefined) {
    if (!title.trim()) {
      throwError(res, 400, "Trip title cannot be empty");
    }

    trip.title = title.trim();
  }

  if (destinationCity !== undefined) {
    if (!destinationCity.trim()) {
      throwError(res, 400, "Destination city cannot be empty");
    }

    trip.destinationCity = destinationCity.trim();
  }

  if (country !== undefined) {
    trip.country = country.trim();
  }

  const coordinatesAreBeingUpdated =
    longitude !== undefined || latitude !== undefined;

  if (coordinatesAreBeingUpdated) {
    if (longitude === undefined || latitude === undefined) {
      throwError(
        res,
        400,
        "Both longitude and latitude are required when updating coordinates"
      );
    }

    trip.location.coordinates = parseCoordinates(
      longitude,
      latitude,
      res
    );
  }

  const nextStartDate =
    startDate !== undefined ? startDate : trip.startDate;

  const nextEndDate =
    endDate !== undefined ? endDate : trip.endDate;

  const { parsedStartDate, parsedEndDate } = parseTripDates(
    nextStartDate,
    nextEndDate,
    res
  );

  trip.startDate = parsedStartDate;
  trip.endDate = parsedEndDate;

  if (category !== undefined) {
    trip.category = category;
  }

  if (status !== undefined) {
    trip.status = status;
  }

  if (notes !== undefined) {
    trip.notes = notes.trim();
  }

  if (activities !== undefined) {
    if (!Array.isArray(activities)) {
      throwError(res, 400, "Activities must be an array");
    }

    trip.activities = activities;
  }

  await trip.save();

  res.status(200).json({
    success: true,
    message: "Trip updated successfully",
    trip,
  });
};

// DELETE /api/trips/:id
export const deleteTrip = async (req, res) => {
  const trip = await findOwnedTrip(
    req.params.id,
    req.user._id,
    res
  );

  await trip.deleteOne();

  res.status(200).json({
    success: true,
    message: "Trip deleted successfully",
  });
};