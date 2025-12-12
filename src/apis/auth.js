import api from "@/apis/http";

export const login = (employeeNo, password) => {
  return api.post("/api/auth/login", { employeeNo, password });
};

export const logout = () => {
  return api.post("/api/users/logout");
};
