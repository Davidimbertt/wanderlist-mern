const GEOCODING_URL =
  "https://geocoding-api.open-meteo.com/v1/search";

const FORECAST_URL =
  "https://api.open-meteo.com/v1/forecast";

const weatherDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Heavy drizzle",
  56: "Light freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Light snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Light rain showers",
  81: "Moderate rain showers",
  82: "Heavy rain showers",
  85: "Light snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with light hail",
  99: "Thunderstorm with heavy hail",
};

const getWeatherDescription = (weatherCode) =>
  weatherDescriptions[weatherCode] || "Unknown conditions";

const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `External weather service returned status ${response.status}`
    );
  }

  return response.json();
};

export const searchLocations = async (searchTerm) => {
  const parameters = new URLSearchParams({
    name: searchTerm,
    count: "5",
    language: "en",
    format: "json",
  });

  const data = await fetchJson(
    `${GEOCODING_URL}?${parameters.toString()}`
  );

  return (data.results || []).map((location) => ({
    id: location.id,
    name: location.name,
    state: location.admin1 || "",
    country: location.country || "",
    countryCode: location.country_code || "",
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone,
  }));
};

export const getWeatherForecast = async (
  latitude,
  longitude
) => {
  const parameters = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "sunrise",
      "sunset",
      "wind_speed_10m_max",
    ].join(","),
    timezone: "auto",
    forecast_days: "16",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
  });

  const data = await fetchJson(
    `${FORECAST_URL}?${parameters.toString()}`
  );

  const dailyForecast = data.daily.time.map(
    (date, index) => ({
      date,
      weatherCode: data.daily.weather_code[index],
      description: getWeatherDescription(
        data.daily.weather_code[index]
      ),
      maximumTemperature:
        data.daily.temperature_2m_max[index],
      minimumTemperature:
        data.daily.temperature_2m_min[index],
      precipitationProbability:
        data.daily.precipitation_probability_max[index],
      maximumWindSpeed:
        data.daily.wind_speed_10m_max[index],
      sunrise: data.daily.sunrise[index],
      sunset: data.daily.sunset[index],
    })
  );

  return {
    location: {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      elevation: data.elevation,
    },
    units: {
      temperature: data.current_units.temperature_2m,
      windSpeed: data.current_units.wind_speed_10m,
      precipitationProbability: "%",
    },
    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      apparentTemperature:
        data.current.apparent_temperature,
      weatherCode: data.current.weather_code,
      description: getWeatherDescription(
        data.current.weather_code
      ),
      windSpeed: data.current.wind_speed_10m,
    },
    daily: dailyForecast,
  };
};