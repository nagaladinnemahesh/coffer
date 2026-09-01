import axios from "axios";

const api = axios.create({
  baseURL: window.__COFFER_CONFIG__.API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default api;
