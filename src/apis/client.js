// src/apis/client.js
import api from "@/apis/http";

// 고객사 등록
export const registerCustomer = (data) => {
  return api.post("/api/companies/clients", data);
};

// 고객사 목록 조회
export const getCustomerCompanies = (params) => {
  return api.get("/api/companies/clients", { params });
};

// 고객사 상세 조회
export const getClientCompanyDetail = (id) => {
  return api.get(`/api/companies/${id}`);
};

// 고객사 임대/계약 요약 조회
export const getClientCompanyLeaseSummary = (clientCompanyId) => {
  return api.get(`/api/companies/clients/${clientCompanyId}/summary`);
};

// 특정 고객사의 담당자 목록 조회
export const getClientsByCompany = (clientCompanyId, params) => {
  return api.get(`/api/companies/${clientCompanyId}/clients`, { params });
};

// 잠재 고객사 등록
export const registerLeadCompany = (data) => {
  return api.post("/api/companies/leads", data);
};

// 잠재 고객사 목록 조회
export const getLeadCompanies = (params) =>
  api.get("/api/companies/leads", { params });

// 고객 담당자 등록
export const registerClient = (clientCompanyId, payload) => {
  return api.post(`/api/companies/${clientCompanyId}/clients`, payload);
};

// 심플 고객사 목록
export const getSimpleClientCompanies = (params = {}) => {
  return api.get("/api/companies/simple", { params });
};

// 특정 고객사의 심플 담당자 목록
export const getSimpleClientsByCompany = (clientCompanyId, params = {}) => {
  return api.get(`/api/companies/${clientCompanyId}/clients/simple`, {
    params,
  });
};

// 특정 고객 담당자의 프로젝트 히스토리
export const getClientProjectHistory = (clientId) => {
  return api.get(`/api/companies/${clientId}/history/projects`);
};
