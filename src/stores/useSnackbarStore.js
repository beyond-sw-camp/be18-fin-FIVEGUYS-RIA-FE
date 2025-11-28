// src/stores/useSnackbarStore.js
import { defineStore } from "pinia";

export const useSnackbarStore = defineStore("snackbar", {
  state: () => ({
    visible: false,
    message: "",
    color: "success",
    timeout: 2500,
  }),
  actions: {
    show(message, color = "error", timeout = 2500) {
      this.message = message;
      this.color = color;
      this.timeout = timeout;
      this.visible = false;
      // 이미 떠있던 거 다시 띄우고 싶을 때 살짝 리셋
      requestAnimationFrame(() => {
        this.visible = true;
      });
    },
    close() {
      this.visible = false;
    },
  },
});
