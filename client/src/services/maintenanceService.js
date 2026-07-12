import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/maintenance",
  withCredentials: true,
});

export const getAllMaintenances = () => API.get("/");

export const getMaintenanceById = (id) => API.get(`/${id}`);

export const createMaintenance = (data) => API.post("/", data);

export const updateMaintenance = (id, data) => API.put(`/${id}`, data);

export const completeMaintenance = (id) => API.patch(`/${id}/complete`);

export const deleteMaintenance = (id) => API.delete(`/${id}`);

export default API;
