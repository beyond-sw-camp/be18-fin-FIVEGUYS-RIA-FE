import api from "./http";

// ------------------------------------------------------
// (1) 층 목록 조회
// GET /api/floors?zone_id=1
// ------------------------------------------------------
export const getFloors = async (zoneId) => {
  return api.get(`/api/floors`, {
    params: { zone_id: zoneId }
  });
};

// ------------------------------------------------------
// (2) 공간(매장) 목록 조회
// GET /api/floors/{floorId}/spaces?type=EXHIBITION
// ------------------------------------------------------
export const getSpaces = async (floorId) => {
  return api.get(`/api/floors/${floorId}/spaces`);
};