import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// AccessToken을 헤더에 포함
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 사용자 생성 API
export const createUser = (data) => {
  return api.post("/admin/create", data);
};
