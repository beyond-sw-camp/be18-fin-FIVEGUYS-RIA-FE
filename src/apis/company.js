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
