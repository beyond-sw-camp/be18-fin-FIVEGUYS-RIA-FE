<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import bg from '@/assets/galleria.jpg'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const id = ref('')
const pw = ref('')
const errorMsg = ref('')

const doLogin = async () => {
  errorMsg.value = ''

  try {
    await authStore.login(id.value, pw.value)
    router.push('/home')
  } catch (e) {
    const msg = e?.response?.data?.message || '로그인 실패'
    errorMsg.value = msg
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="left-section">
      <img :src="bg" />
    </div>

    <div class="right-section">
      <div class="login-box">
        <h2>로그인</h2>

        <div class="input-group">
          <input v-model="id" type="text" placeholder="아이디" />
        </div>

        <div class="input-group">
          <input v-model="pw" type="password" placeholder="비밀번호" />
        </div>

        <div class="options">
          <label><input type="checkbox" /> 아이디 저장</label>
          <label><input type="checkbox" /> 자동 로그인</label>
        </div>

        <button class="login-btn" @click="doLogin">로그인</button>
        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
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
  padding: 0;      /* 기존 20vw 삭제 */
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

.login-btn:hover {
  background-color: #e96c00;
}
.error-text {
  margin-top: 12px;
  font-size: 14px;
  color: #e53935;
}
</style>
