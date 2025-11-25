// src/apis/http.js
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

const pushToQueue = (cb) => {
  refreshQueue.push(cb);
};

const runQueue = () => {
  refreshQueue.forEach((cb) => cb());
  refreshQueue = [];
};

// 요청 인터셉터: 매 요청마다 Authorization 붙이기
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 뜨면 refresh 한 번 시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;
    const status = error.response?.status;

    // 이미 한 번 재시도한 요청이면 더 이상 안 돈다
    if (originalRequest._retry) {
      authStore.forceLogout();
      return Promise.reject(error);
    }

    // ✔ 401 이고, 로그인/리프레시 요청이 아닐 때만 refresh 시도
    const url = originalRequest.url || "";
    if (
      status === 401 &&
      !url.includes("/api/auth/login") &&
      !url.includes("/api/users/refresh")
    ) {
      if (isRefreshing) {
        // 다른 요청이 이미 refresh 중이면 큐에 넣고 기다렸다가 다시 시도
        return new Promise((resolve) => {
          pushToQueue(() => {
            originalRequest._retry = true;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // 🔥 여기서 refresh 호출
        const res = await api.post("/api/users/refresh");

        const newAuthHeader =
          res.headers["authorization"] || res.headers["Authorization"];

        if (newAuthHeader) {
          const newAccessToken = newAuthHeader.replace("Bearer ", "");
          authStore.setAccessToken(newAccessToken);
        }

        isRefreshing = false;
        runQueue();

        originalRequest._retry = true;
        return api(originalRequest);
      } catch (e) {
        isRefreshing = false;
        authStore.forceLogout();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
