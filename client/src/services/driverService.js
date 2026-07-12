import API from "./api";

export const getDrivers = () =>
  API.get("/drivers");

export const getDriverById = (id) =>
  API.get(`/drivers/${id}`);

export const createDriver = (data) =>
  API.post("/drivers", data);

export const updateDriver = (id, data) =>
  API.put(`/drivers/${id}`, data);

export const deleteDriver = (id) =>
  API.delete(`/drivers/${id}`);

// Fetch User-role users without an existing Driver profile (for form dropdown)
export const getDriverUsers = () =>
  API.get("/drivers/driver-users");
