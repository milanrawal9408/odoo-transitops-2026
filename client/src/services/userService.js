import API from "./api";

export const getUsers = () => API.get("/users");

export const getUserById = (id) => API.get(`/users/${id}`);

export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role });

export const updateUserStatus = (id, status) => API.put(`/users/${id}/status`, { status });

export const deleteUser = (id) => API.delete(`/users/${id}`);
