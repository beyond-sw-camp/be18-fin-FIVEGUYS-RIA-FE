// src/apis/auth.js
import api from "@/apis/http";

export const login = (employeeNo, password) => {
  // 🔴 절대 .then(res => res.data) 로 바꾸지 마라
  return api.post("/api/auth/login", {
    employeeNo,
    password,
  });
};
