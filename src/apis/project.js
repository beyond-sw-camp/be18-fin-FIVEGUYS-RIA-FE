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

// 프로젝트 제목/고객사 검색용 리스트
export const getProjectTitles = (keyword) => {
  return apiClient.get("/api/projects/titles", {
    params: {
      keyword: keyword || undefined,
    },
  });
};

// ★ 여기: /api/projects/titles/{id} 호출용
export const getProjectTitleMeta = (projectId) => {
  return apiClient.get(`/api/projects/titles/${projectId}`);
};

// 필요 없으면 나중에 정리
export const getProjectMeta = (projectId) => {
  return apiClient.get(`/api/projects/titles/${projectId}`);
};

export const deleteProject = (projectId) => {
  return apiClient.delete(`/api/projects/${projectId}`);
};
