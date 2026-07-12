import API from "./api";

// Fetch all driver profiles
export const getDrivers = () =>
  API.get("/drivers");

// Fetch single driver profile
export const getDriverById = (id) =>
  API.get(`/drivers/${id}`);

// Create driver profile
export const createDriver = (data) =>
  API.post("/drivers", data);

// Update driver profile
export const updateDriver = (id, data) =>
  API.put(`/drivers/${id}`, data);

// Delete driver profile
export const deleteDriver = (id) =>
  API.delete(`/drivers/${id}`);

// Fetch users with 'Driver' role who don't have a profile yet (for creation dropdown)
export const getDriverUsers = () =>
  API.get("/drivers/driver-users");

// Fetch all active driver users (for Trip dropdown)
export const getActiveDriverUsers = () =>
  API.get("/auth/drivers");

export default API;
