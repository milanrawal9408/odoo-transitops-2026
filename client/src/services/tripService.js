import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/trips",
  withCredentials: true,
});

export const getTrips = () => API.get("/");

export const getTripById = (id) => API.get(`/${id}`);

export const createTrip = (data) => API.post("/", data);

export const updateTrip = (id, data) => API.put(`/${id}`, data);

export const deleteTrip = (id) => API.delete(`/${id}`);

export default API;
