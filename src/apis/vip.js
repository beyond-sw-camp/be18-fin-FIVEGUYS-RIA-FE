// src/apis/vip.js

import api from "@/apis/http";

// VIP 목록 조회
export const getVipList = ({ page, size, grade, keyword }) => {
  return api.get("/api/vip", {
    params: { page, size, grade, keyword },
  });
};

export const getVipStats = () => {
  return api.get("/api/vip/stats");
};

//  VIP AI 추천 리스트 조회
export const getVipRecommendations = (vipId) => {
  return api.get(`/api/ai/${vipId}/recommendations`);
};
