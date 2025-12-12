// src/apis/dashboard.js
import api from "@/apis/http";

// 내가 담당한 매장별 월매출
export const fetchMonthlyStoreSales = (params) =>
  api.get("api/dashboard/sales/monthly", {
    params, // { year, month } 둘 다 없으면 최신월로 백엔드 처리
  });

export const fetchMonthlyPerformance = (params) =>
  api.get("api/dashboard/sales/performance", {
    params, // { year, month }
  });

// 내가 담당한 브랜드별 매출 점유율
export const fetchBrandMonthlyShare = (params) =>
  api.get("api/dashboard/sales/brand", {
    params, // { year, month }
  });

// 내가 담당한 팝업/전시회 일별 매출
export const fetchPopupDailySales = (params) =>
  api.get("api/dashboard/sales/temporary", { params });

// 팀장용 – 브랜드별 월매출 랭킹
export const fetchBrandMonthlyRanking = (params) =>
  api.get("api/dashboard/brand/rank", { params });

// 팀장용 – 월 정산 금액 추이 (연 단위)
export const fetchMonthlySettlementTrend = (params) =>
  api.get("api/dashboard/sales/trend", { params });

// 팀장용 – 매장 면적 대비 효율 랭킹 (TOP5 / 하위5)
export const fetchStoreAreaEfficiencyRanking = (params) =>
  api.get("api/dashboard/sales/efficiency/rank", { params });

// 팀장용 – 층별 매출
export const fetchMonthlyFloorSales = (params) =>
  api.get("api/dashboard/sales/floors", { params });
