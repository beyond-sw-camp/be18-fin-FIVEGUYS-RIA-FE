<template>
  <div class="login-wrapper">
    <!-- 왼쪽 이미지 -->
    <div class="left-section">
      <!-- 갤러리아 사진 첨부? -->
    </div>

    <!-- 오른쪽 로그인 -->
    <div class="right-section">
      <div class="login-box">
        <h2>로그인</h2>

        <div class="input-group">
          <input type="id" placeholder="아이디" />
        </div>

        <div class="input-group">
          <input type="password" placeholder="비밀번호" />
        </div>

        <div class="options">
          <label><input type="checkbox" /> 아이디 저장</label>
          <label><input type="checkbox" /> 자동 로그인</label>
        </div>

        <button class="login-btn">로그인</button>
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
  justify-content: center; /* 수평 중앙 */
  align-items: center;     /* 수직 중앙 */
  box-sizing: border-box;
  padding-right: 20vw;
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
</style>
