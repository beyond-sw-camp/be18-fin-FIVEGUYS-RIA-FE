// src/apis/vip.js
import api from "@/apis/http";

// VIP 목록 조회
export const getVipList = ({ page, size, grade, keyword }) => {
  return api.get("/api/vip", {
    params: { page, size, grade, keyword },
  });
};

// VIP 등급/인원 통계
export const getVipStats = () => {
  return api.get("/api/vip/stats");
};

// VIP 매출 통계 (비중, 금액 등)
export const getVipSalesStats = (params) =>
  api.get("/api/vip/sales/stats", params ? { params } : undefined);

// VIP 브랜드 TOP5 (VIP 매출 비율 기준)
export const getVipBrandTop5 = (params) =>
  api.get("/api/vip/sales/brand/rank", params ? { params } : undefined);

// VIP 매출 추이 (6개월 트렌드)
export const getVipSalesTrend = (params) =>
  api.get("/api/vip/sales/trend", params ? { params } : undefined);

// 매장별 VIP 매출 페이징 (/api/vip/sales/stores?page=0&size=5)
export const getVipStoreSalesPage = ({ year, month, page, size }) => {
  return api.get("/api/vip/sales/stores", {
    params: { year, month, page, size },
  });
};

// VIP AI 추천 리스트 조회
export const getVipRecommendations = (vipId) => {
  return api.get(`/api/ai/${vipId}/recommendations`);
};
