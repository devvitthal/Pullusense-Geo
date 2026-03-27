import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Profile incomplete — backend returned 403 with a specific code
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "PROFILE_INCOMPLETE"
    ) {
      window.location.href = "/complete-profile";
      return new Promise(() => {}); // swallow — redirect is underway
    }
    if (error.response && error.response.status === 401) {
      // In a real app we might want to refresh tokens or log out
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
