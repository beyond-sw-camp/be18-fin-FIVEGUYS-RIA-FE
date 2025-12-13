import { defineStore } from "pinia";
import { login as loginApi } from "@/apis/auth";

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", {
  //  새로고침 시 localStorage에서 복구
  state: () => {
    const savedToken = localStorage.getItem("accessToken"); // 스샷 기준 키 이름
    const payload = savedToken ? parseJwt(savedToken) : null;

    return {
      isAuthenticated: !!savedToken,
      accessToken: savedToken,
      user: payload,
      role: payload?.role ?? null, // 예: "ROLE_ADMIN"
    };
  },

  actions: {
    async login(employeeNo, password) {
      const res = await loginApi(employeeNo, password);

      const authHeader =
        res.headers["authorization"] || res.headers["Authorization"];
      if (!authHeader) throw new Error("Authorization 헤더 없음");

      const token = authHeader.replace("Bearer ", "");

      // Pinia + localStorage 둘 다 저장
      this.accessToken = token;
      this.isAuthenticated = true;
      localStorage.setItem("accessToken", token);

      const payload = parseJwt(token);
      this.user = payload;
      this.role = payload?.role ?? null; // "ROLE_ADMIN"

      return this.role;
    },

    setAccessToken(token) {
      this.accessToken = token;
      this.isAuthenticated = !!token;
      if (token) localStorage.setItem("accessToken", token);
      else localStorage.removeItem("accessToken");
    },

    forceLogout() {
      this.isAuthenticated = false;
      this.accessToken = null;
      this.user = null;
      this.role = null;
      localStorage.removeItem("accessToken");
      
      localStorage.removeItem('lastEventId');
    },
  },
});
