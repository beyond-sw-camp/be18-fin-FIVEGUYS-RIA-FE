// src/apis/debug.js
import api from "@/apis/http";

/* ----------------------
 * 매출 집계 디버그(SalesDebugController)
 * ---------------------- */

// 일별 매출 집계: /debug/sales/daily?year=2024&month=1&day=15
export const triggerDailySales = (year, month, day) => {
  return api.post("/debug/sales/daily", null, {
    params: { year, month, day },
  });
};

// 월별 매출 집계: /debug/sales/monthly?year=2024&month=1
export const triggerMonthlySales = (year, month) => {
  return api.post("/debug/sales/monthly", null, {
    params: { year, month },
  });
};

// 연별 매출 집계: /debug/sales/yearly?year=2024
export const triggerYearlySales = (year) => {
  return api.post("/debug/sales/yearly", null, {
    params: { year },
  });
};

/* ----------------------
 * 정산 집계 디버그(SettlementDebugController)
 * ---------------------- */

// 상설 매장 월 정산: /debug/settlement/monthly?year=2024&month=1
export const triggerMonthlySettlement = (year, month) => {
  return api.post("/debug/settlement/monthly", null, {
    params: { year, month },
  });
};

// 상설 매장 지난달 월 정산: /debug/settlement/last-month
export const triggerLastMonthSettlement = () => {
  return api.post("/debug/settlement/last-month");
};

// 임시 매장 일 정산(지정일): /debug/settlement/daily/temporary?date=2023-01-15
export const triggerDailyTemporarySettlement = (date) => {
  return api.post("/debug/settlement/daily/temporary", null, {
    params: { date },
  });
};

// 임시 매장 일 정산(어제): /debug/settlement/daily/temporary/yesterday
export const triggerYesterdayTemporarySettlement = () => {
  return api.post("/debug/settlement/daily/temporary/yesterday");
};
