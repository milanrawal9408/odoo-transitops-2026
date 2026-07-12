import API from "./api";

// Fetch all trips
export const getTrips = () =>
  API.get("/trips");

// Fetch single trip
export const getTripById = (id) =>
  API.get(`/trips/${id}`);

// Create trip
export const createTrip = (data) =>
  API.post("/trips", data);

// Update trip
export const updateTrip = (id, data) =>
  API.put(`/trips/${id}`, data);

// Delete trip
export const deleteTrip = (id) =>
  API.delete(`/trips/${id}`);
