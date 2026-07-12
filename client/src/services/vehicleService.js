import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/vehicles",
  withCredentials: true,
});

export const getVehicles = () => API.get("/");

export const getVehicleById = (id) => API.get(`/${id}`);

export default API;
