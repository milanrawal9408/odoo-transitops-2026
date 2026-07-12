import API from "./api";

export const getFuelLogs = () =>
  API.get("/fuel");

export const getFuelLogById = (id) =>
  API.get(`/fuel/${id}`);

export const createFuelLog = (data) =>
  API.post("/fuel", data);

export const updateFuelLog = (id, data) =>
  API.put(`/fuel/${id}`, data);

export const deleteFuelLog = (id) =>
  API.delete(`/fuel/${id}`);
