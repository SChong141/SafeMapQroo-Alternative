import axios from "axios";

const generalUrl = "http://localhost:5078/api/";

export const apiClient = axios.create({
  baseURL: generalUrl,
  timeout: 5000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});