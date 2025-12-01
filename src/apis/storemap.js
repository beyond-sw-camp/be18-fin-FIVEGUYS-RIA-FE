import api from "@/apis/http";

// 단일 매장 상세 조회
export function fetchStoreDetailStats(storeId) {
  return api.get(`/api/stores/${storeId}/detailstats`);
}

//  전체 매장명 목록 조회 (도면용)
export function fetchStoreNames() {
  return api.get(`/api/stores/names`);
}
