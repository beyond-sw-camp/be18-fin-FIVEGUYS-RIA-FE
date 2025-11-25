// src/stores/auth.js
import { defineStore } from "pinia";
import { login as loginApi } from "@/apis/auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    accessToken: null,
    user: null,
  }),

  actions: {
    async login(employeeNo, password) {
      const res = await loginApi(employeeNo, password);

      console.log("response headers = ", res.headers); // 디버깅용

      const authHeader =
        res.headers["authorization"] || res.headers["Authorization"];

      if (!authHeader) {
        throw new Error("Authorization 헤더 없음");
      }

      this.accessToken = authHeader.replace("Bearer ", "");
      this.isAuthenticated = true;
    },

    setAccessToken(token) {
      this.accessToken = token;
      this.isAuthenticated = !!token;
    },

    forceLogout() {
      this.isAuthenticated = false;
      this.accessToken = null;
      this.user = null;
      window.location.href = "/login";
    },
  },
});
