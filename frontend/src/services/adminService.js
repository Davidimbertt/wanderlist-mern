import api from "./api";

export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data.stats;
};

export const getAdminUsers = async (
  params = {}
) => {
  const response = await api.get("/admin/users", {
    params,
  });

  return response.data;
};

export const updateUserRole = async (
  userId,
  role
) => {
  const response = await api.patch(
    `/admin/users/${userId}/role`,
    { role }
  );

  return response.data.user;
};

export const deleteAdminUser = async (
  userId
) => {
  const response = await api.delete(
    `/admin/users/${userId}`
  );

  return response.data;
};

export const getAdminTrips = async (
  params = {}
) => {
  const response = await api.get("/admin/trips", {
    params,
  });

  return response.data;
};

export const deleteAdminTrip = async (
  tripId
) => {
  const response = await api.delete(
    `/admin/trips/${tripId}`
  );

  return response.data;
};