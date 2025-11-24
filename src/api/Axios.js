// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080", // ✅ 백엔드 포트
  withCredentials: true, // 쿠키(refresh_token) 쓰면 유지
});

export default api;
