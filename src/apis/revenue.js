// src/apis/revenue.js
import api from "@/apis/http";

/**
 * 매출(정산) 목록 조회
 */
export const fetchRevenueList = ({
  page = 0,
  size = 9,
  storeType,
  managerId, // ← 프론트에서 쓰는 이름
  keyword,
} = {}) => {
  const params = { page, size };

  // 매장 유형
  if (storeType) {
    params.storeType = storeType; // 백엔드 storeType
  }

  // 담당자
  if (managerId !== null && managerId !== undefined) {
    params.creatorId = managerId; // 백엔드 creatorId
  }

  // 키워드
  if (keyword && keyword.trim() !== "") {
    params.keyword = keyword.trim(); // 백엔드 keyword
  }

  return api.get("/api/revenues", { params });
};

/**
 * 매출(정산) 상세 조회
 * GET /api/revenues/{revenueId}?storeTenantMapId=...
 */
export const getRevenueDetail = (revenueId, storeTenantMapId) => {
  const params = {};

  if (storeTenantMapId) {
    params.storeTenantMapId = storeTenantMapId;
  }

  return api.get(`/api/revenues/${revenueId}`, { params });
};

export function getSettlementHistory(
  contractId,
  { startYear, startMonth, endYear, endMonth }
) {
  return api.get(`/api/revenues/contracts/${contractId}/settlements`, {
    params: {
      startYear,
      startMonth,
      endYear,
      endMonth,
    },
  });
}

/**
 * 일별 매출 히스토리
 * GET /api/revenues/stores/{storeTenantMapId}/sales/daily?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export function getDailySalesHistory(storeTenantMapId, { startDate, endDate }) {
  return api.get(`/api/revenues/stores/${storeTenantMapId}/sales/daily`, {
    params: {
      startDate,
      endDate,
    },
  });
}
