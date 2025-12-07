// src/apis/storemap.js
import api from "@/apis/http";

// ------------------------------------------------------
// (1) 층 목록 조회
// GET /api/floors?zone_id=1
// ------------------------------------------------------
export const getFloors = async (zoneId) => {
  return api.get(`/api/floors`, {
    params: { zone_id: zoneId },
  });
};

// ------------------------------------------------------
// (2) 공간(매장) 목록 조회
// GET /api/floors/{floorId}/spaces
// ------------------------------------------------------
export const getSpaces = async (floorId) => {
  return api.get(`/api/floors/${floorId}/spaces`);
};

// ------------------------------------------------------
// (3) 단일 매장 상세 조회
// GET /api/stores/{storeId}/detailstats
// ------------------------------------------------------
export function fetchStoreDetailStats(storeId) {
  return api.get(`/api/stores/${storeId}/detailstats`);
}

// ------------------------------------------------------
// (4) 전체 매장명 목록 조회 (도면용)
// GET /api/stores/names
// ------------------------------------------------------
export function fetchStoreNames() {
  return api.get(`/api/stores/names`);
}
