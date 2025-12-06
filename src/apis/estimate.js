// src/apis/estimate.js
// import api from "./http";
import api from "@/apis/http";
export const getEstimates = ({
  projectId,
  clientCompanyId,
  keyword,
  status,
  page = 1,
  size = 12,
} = {}) => {
  return api.get("/api/estimates", {
    params: {
      projectId,
      clientCompanyId,
      keyword,
      status,
      page,
      size,
    },
  });
};

export const createEstimate = (payload) => {
  return api.post("/api/estimates", payload);
};

export const getEstimateDetail = (estimateId) => {
  return api.get(`/api/estimates/${estimateId}`);
};

export const updateEstimate = (estimateId, payload) => {
  return api.patch(`/api/estimates/${estimateId}`, payload);
};

export const deleteEstimate = (id) => {
  return api.delete(`/api/estimates/${id}`);
};
