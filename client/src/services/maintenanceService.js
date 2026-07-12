import API from "./api";

export const getAllMaintenances = () =>
  API.get("/maintenance");

export const getMaintenanceById = (id) =>
  API.get(`/maintenance/${id}`);

export const createMaintenance = (data) =>
  API.post("/maintenance", data);

export const updateMaintenance = (id, data) =>
  API.put(`/maintenance/${id}`, data);

export const completeMaintenance = (id) =>
  API.patch(`/maintenance/${id}/complete`);

export const deleteMaintenance = (id) =>
  API.delete(`/maintenance/${id}`);
