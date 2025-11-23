import api from "@/apis/http";

// 고객사 등록
export const registerCustomer = (data) => {
  return api.post("/api/companies/clients", data);
};

// 고객사 목록 조회
// params: { keyword, category, page, size }
export const getCustomerCompanies = (params) => {
  return api.get("/api/companies/clients", { params });
};

export const getClientCompanyDetail = (id) => {
  return api.get(`/api/companies/${id}`);
};

export const getClientsByCompany = (clientCompanyId, params) => {
  return api.get(`/api/companies/${clientCompanyId}/clients`, { params });
};

export const registerLeadCompany = (data) => {
  return api.post("/api/companies/leads", data);
};

export const getLeadCompanies = (params) =>
  api.get("/api/companies/leads", { params });

export const registerClient = (clientCompanyId, payload) => {
  return api.post(`/api/companies/${clientCompanyId}/clients`, payload);
};
