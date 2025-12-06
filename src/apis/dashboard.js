// src/apis/dashboard.js
import api from "@/apis/http";

// 내가 담당한 매장별 월매출
export const fetchMonthlyStoreSales = (params) =>
  api.get("api/dashboard/sales/monthly", {
    params, // { year, month } 둘 다 없으면 최신월로 내려오게 백엔드에서 처리
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
