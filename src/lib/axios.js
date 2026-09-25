import axios from "axios";

/**
 * ONE shared Axios instance for the whole app (the assignment asks for this).
 * Every API call file imports `api` from here instead of calling axios
 * directly, so the token + error handling logic lives in exactly one place.
 */
const api = axios.create({
  baseURL: "https://dummyjson.com",
});

// REQUEST interceptor: runs before every request leaves the browser.
// It reads the login token from localStorage and attaches it as a
// Bearer header, so individual components never have to think about it.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// RESPONSE interceptor: runs on every response/error, in one place.
// If the token is invalid/expired, DummyJSON returns 401 on /auth/me
// and similar routes -> we log the user out and send them to /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
