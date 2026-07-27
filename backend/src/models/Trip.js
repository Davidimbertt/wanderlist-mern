import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, "Activity date is required"],
  },

  time: {
    type: String,
    trim: true,
    match: [
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Activity time must use the HH:MM format",
    ],
  },

  title: {
    type: String,
    required: [true, "Activity title is required"],
    trim: true,
    maxlength: [100, "Activity title cannot exceed 100 characters"],
  },

  notes: {
    type: String,
    trim: true,
    maxlength: [500, "Activity notes cannot exceed 500 characters"],
    default: "",
  },
});

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Trip title is required"],
      trim: true,
      minlength: [2, "Trip title must contain at least 2 characters"],
      maxlength: [80, "Trip title cannot exceed 80 characters"],
    },

    destinationCity: {
      type: String,
      required: [true, "Destination city is required"],
      trim: true,
      maxlength: [100, "Destination city cannot exceed 100 characters"],
    },

    country: {
      type: String,
      trim: true,
      maxlength: [100, "Country cannot exceed 100 characters"],
      default: "",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },

      coordinates: {
        type: [Number],
        required: [true, "Longitude and latitude are required"],
        validate: {
          validator: (coordinates) => {
            if (!Array.isArray(coordinates) || coordinates.length !== 2) {
              return false;
            }

            const [longitude, latitude] = coordinates;

            return (
              longitude >= -180 &&
              longitude <= 180 &&
              latitude >= -90 &&
              latitude <= 90
            );
          },
          message:
            "Coordinates must contain a valid longitude and latitude",
        },
      },
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (endDate) {
          return !this.startDate || endDate >= this.startDate;
        },
        message: "End date cannot be before the start date",
      },
    },

    category: {
      type: String,
      enum: [
        "leisure",
        "business",
        "family",
        "adventure",
        "other",
      ],
      default: "leisure",
    },

    status: {
      type: String,
      enum: ["planning", "upcoming", "completed", "cancelled"],
      default: "planning",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Trip notes cannot exceed 1000 characters"],
      default: "",
    },

    activities: {
      type: [activitySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Speed up common dashboard and filtering queries.
tripSchema.index({ user: 1, startDate: 1 });
tripSchema.index({ user: 1, status: 1 });

// Support destination searching and MongoDB geospatial queries.
tripSchema.index({ title: "text", destinationCity: "text" });
tripSchema.index({ location: "2dsphere" });

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;