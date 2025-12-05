// src/apis/revenue.js
import api from "@/apis/http";

/**
 * 매출(정산) 목록 조회
 */
export const fetchRevenueList = ({
  page = 0,
  size = 9,
  storeType,
  creatorId,
} = {}) => {
  const params = { page, size };

  if (storeType) {
    params.storeType = storeType;
  }
  if (creatorId) {
    params.creatorId = creatorId;
  }

  return api.get("/api/revenues", { params });
};

/**
 * 매출(정산) 상세 조회
 * GET /api/revenue/{revenueId}?storeTenantMapId=...
 */
export const getRevenueDetail = (revenueId, storeTenantMapId) => {
  const params = {};

  if (storeTenantMapId) {
    params.storeTenantMapId = storeTenantMapId;
  }

  return api.get(`/api/revenues/${revenueId}`, { params });
};
