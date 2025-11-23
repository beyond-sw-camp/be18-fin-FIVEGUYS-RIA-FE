// src/apis/project.js
import apiClient from "@/apis/http";

export const getProjectsWithPipelines = (params) => {
  return apiClient.get("/api/projects/pipelines", { params });
};

export const createProject = (payload) => {
  return apiClient.post("/api/projects", payload);
};
