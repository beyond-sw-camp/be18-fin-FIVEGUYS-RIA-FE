// src/apis/project.js
import apiClient from "@/apis/http";

export const getProjectsWithPipelines = (params) => {
  return apiClient.get("/api/projects/pipelines", { params });
};

export const createProject = (payload) => {
  return apiClient.post("/api/projects", payload);
};

export const updateProjectManager = (projectId, newManagerId) => {
  return apiClient.patch(`/api/projects/${projectId}/salesManager`, {
    newManagerId, // 백엔드 DTO 필드명에 맞춰라
  });
};
