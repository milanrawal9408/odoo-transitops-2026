import API from "./api";

export const getUsers = (params) =>
  API.get("/users", { params });

export const getUserById = (id) =>
  API.get(`/users/${id}`);

export const createUser = (data) =>
  API.post("/users", data);

export const updateUser = (id, data) =>
  API.put(`/users/${id}`, data);

export const updateUserRole = (id, role) =>
  API.patch(`/users/${id}/role`, { role });

export const updateUserStatus = (id, status) =>
  API.patch(`/users/${id}/status`, { status });

export const deleteUser = (id) =>
  API.delete(`/users/${id}`);

export const getUserActivities = () =>
  API.get("/users/activities/log");
