// src/apis/revenue.js
import api from "@/apis/http";

/**
 * 매출(정산) 목록 조회
 *
 * @param {Object} options
 * @param {number} [options.page=0]      0-base 페이지 번호
 * @param {number} [options.size=9]      페이지당 카드 수
 * @param {string} [options.storeType]   매장 유형 (예: 'RENTAL', 'POPUP', 'EXHIBITION')
 * @param {number} [options.creatorId]   담당자 ID
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
