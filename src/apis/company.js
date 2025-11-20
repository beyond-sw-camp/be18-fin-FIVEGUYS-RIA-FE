import api from "@/apis/http";

export const registerCustomer = (data) => {
  return api.post("/api/companies/clients", data);
};
