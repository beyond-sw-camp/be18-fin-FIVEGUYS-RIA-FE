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
