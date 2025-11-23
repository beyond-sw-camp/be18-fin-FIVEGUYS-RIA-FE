// src/apis/user.js
import api from "@/apis/http";

// 내 프로필 조회
export const getMyProfile = () => {
  return api.get("/api/users/profile");
};

export const getUserList = () => {
  return api.get("/api/users/list");
};
