// src/apis/user.js
import api from "@/apis/http";

// 내 프로필 조회
export const getMyProfile = () => {
  return api.get("/api/users/profile");
};

export const getUserList = () => {
  return api.get("/api/users/list");
};
// 진행 중 프로젝트 조회
export const getActiveProjects = (page = 1, size = 10) => {
  return api.get("/api/users/projects/active", {
    params: { page, size },
  });
};

// 비밀번호 변경
export const changePassword = (payload) => {
  return api.patch("/api/users/password", payload);
};
