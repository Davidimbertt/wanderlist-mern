import api from "./api";

export const searchCities = async (searchTerm) => {
  const response = await api.get(
    "/weather/locations",
    {
      params: {
        q: searchTerm,
      },
    }
  );

  return response.data.locations;
};

export const getForecast = async (
  latitude,
  longitude
) => {
  const response = await api.get(
    "/weather/forecast",
    {
      params: {
        latitude,
        longitude,
      },
    }
  );

  return response.data.forecast;
};