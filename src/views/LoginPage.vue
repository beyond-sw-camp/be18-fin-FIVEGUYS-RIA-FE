<script setup>
// LoginPage.vue script setup 부분
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import bg from "@/assets/galleria.jpg";

const employeeNo = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  errorMessage.value = "";
  loading.value = true;

  try {
    const role = await authStore.login(employeeNo.value, password.value);

    console.log("role from store =", role);

    if (role === "ROLE_ADMIN") {
      // 관리자
      router.push({ name: "AdminUsers" });
    } else {
      // 일반 사용자 기본 페이지
      router.push({ name: "Home" });
    }
  } catch (err) {
    console.error("로그인 실패:", err);
    errorMessage.value = "사번 또는 비밀번호를 확인해주세요.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-wrapper">
    <div class="left-section">
      <img :src="bg" alt="login background" />
    </div>

    <div class="right-section">
      <div class="login-box">
        <h2>로그인</h2>

        <div class="input-group">
          <input
            v-model="employeeNo"
            type="text"
            placeholder="사번"
            autocomplete="username"
          />
        </div>

        <div class="input-group">
          <input
            v-model="password"
            type="password"
            placeholder="비밀번호"
            autocomplete="current-password"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="options">
          <label><input type="checkbox" /> 아이디 저장</label>
          <label><input type="checkbox" /> 자동 로그인</label>
        </div>

        <button class="login-btn" :disabled="loading" @click="handleLogin">
          {{ loading ? "로그인 중..." : "로그인" }}
        </button>

        <p v-if="errorMessage" class="error-text">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  width: 100vw;
  height: 100vh;
}

/* 왼쪽 절반 이미지 */
.left-section {
  width: 50%;
  height: 100%;
}

.left-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 오른쪽 절반 */
.right-section {
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 0;
}

/* 로그인 폼 */
.login-box {
  width: 380px;
  padding: 40px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-box h2 {
  font-size: 24px;
  font-weight: bold;
  color: #222;
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 18px;
}

.input-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
}

.input-group input:focus {
  border-color: #ff7f00;
}

.options {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #555;
  margin: 15px 0 25px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #ff7f00;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.login-btn[disabled] {
  opacity: 0.7;
  cursor: default;
}

.login-btn:hover:not([disabled]) {
  background-color: #e96c00;
}

.error-text {
  margin-top: 12px;
  font-size: 14px;
  color: #e53935;
}
</style>
