import api from "@/apis/http";

export const updatePipelineStage = (pipelineId, payload) => {
  return api.patch(`/api/pipelines/${pipelineId}/stages`, payload);
};
