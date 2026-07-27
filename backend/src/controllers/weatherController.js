import {
  getWeatherForecast,
  searchLocations,
} from "../services/weatherService.js";

// GET /api/weather/locations?q=Boston
export const searchCities = async (req, res) => {
  const searchTerm = req.query.q?.trim();

  if (!searchTerm || searchTerm.length < 2) {
    res.status(400);
    throw new Error(
      "Enter at least 2 characters when searching for a city"
    );
  }

  try {
    const locations = await searchLocations(searchTerm);

    res.status(200).json({
      success: true,
      count: locations.length,
      locations,
    });
  } catch {
    res.status(502);
    throw new Error(
      "The location service is temporarily unavailable"
    );
  }
};

// GET /api/weather/forecast?latitude=42.36&longitude=-71.05
export const getForecast = async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);

  const coordinatesAreValid =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  if (!coordinatesAreValid) {
    res.status(400);
    throw new Error("Valid latitude and longitude are required");
  }

  try {
    const forecast = await getWeatherForecast(
      latitude,
      longitude
    );

    res.status(200).json({
      success: true,
      forecast,
    });
  } catch {
    res.status(502);
    throw new Error(
      "The weather forecast service is temporarily unavailable"
    );
  }
};