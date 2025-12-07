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
    newManagerId,
  });
};

export const getProjectDetail = (projectId) =>
  apiClient.get(`/api/projects/${projectId}`);

export const updateProject = (projectId, payload) => {
  return apiClient.patch(`/api/projects/${projectId}`, payload);
};

export const getProjectTitles = (keyword) => {
  return apiClient.get("/api/projects/titles", {
    params: {
      keyword: keyword || undefined,
    },
  });
};
export const getProjectMeta = (projectId) => {
  return apiClient.get(`/api/projects/${projectId}`);
};
export const deleteProject = (projectId) => {
  return apiClient.delete(`/api/projects/${projectId}`);
};
