// src/apis/vip.js
import api from "@/apis/http";

// VIP 목록 조회
export const getVipList = ({ page, size, grade, keyword }) => {
  return api.get("/api/vip", {
    params: {
      page, // 절대 -1 하지 말 것
      size,
      grade,
      // keyword 있으면 같이 보낼 거면 이렇게
      keyword,
    },
  });
};

export const getVipStats = () => {
  return api.get("/api/vip/stats");
};
