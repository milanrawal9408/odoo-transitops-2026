
import API from "./api";

export const getVehicles = () =>
  API.get("/vehicles");

export const getVehicleById = (id) =>
  API.get(`/vehicles/${id}`);

export const createVehicle = (data) =>
  API.post("/vehicles", data);

export const updateVehicle = (id, data) =>
  API.put(`/vehicles/${id}`, data);

export const deleteVehicle = (id) =>
  API.delete(`/vehicles/${id}`);
