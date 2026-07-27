import api from "./api";

export const getTrips = async (params = {}) => {
  const response = await api.get("/trips", { params });
  return response.data;
};

export const getTripStats = async () => {
  const response = await api.get("/trips/stats");
  return response.data.stats;
};

export const getTripById = async (tripId) => {
  const response = await api.get(`/trips/${tripId}`);
  return response.data.trip;
};

export const createTrip = async (tripData) => {
  const response = await api.post("/trips", tripData);
  return response.data.trip;
};

export const updateTrip = async (
  tripId,
  tripData
) => {
  const response = await api.patch(
    `/trips/${tripId}`,
    tripData
  );

  return response.data.trip;
};

export const deleteTrip = async (tripId) => {
  const response = await api.delete(`/trips/${tripId}`);
  return response.data;
};