import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/vehicles",
  withCredentials: true,
});

export const getAllVehicles = () => API.get("/");

export default API;
