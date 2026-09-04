import axios from "axios";

// In production set VITE_API_URL to your Render backend, e.g.
// https://printwala-api.onrender.com/api
// In dev we default to "/api" which Vite proxies to localhost:4000.
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sh_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.details?.[0]?.message ||
      err.message ||
      "Something went wrong";
    err.friendlyMessage = msg;
    return Promise.reject(err);
  }
);

// The origin of the API (without /api) — used for absolute upload URLs if needed.
export const apiOrigin = baseURL.replace(/\/api\/?$/, "");

export default api;
