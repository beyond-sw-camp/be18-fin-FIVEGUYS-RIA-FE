<template>

  <!--  오류 스낵바 -->
  <div v-if="errorMessage" class="toast-error">
    {{ errorMessage }}
  </div>

  <!--  성공 스낵바 -->
  <div v-if="successMessage" class="toast-success">
    {{ successMessage }}
  </div>

  <div class="calendar-container">
    

    <!-- ====================== -->
    <!--   왼쪽: 검색 + 사용자   -->
    <!-- ====================== -->
    <div class="left-sidebar">
      <div class="card left-card">

        <h3 class="card-title">검색</h3>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="태그나 내용 검색"
          class="search-input"
        />

        <div v-if="searchQuery.trim()" class="search-results">
          <div
            v-for="memo in filteredMemos"
            :key="memo.id"
            class="search-item"
            @click="goToMemoDate(memo)"
          >
            <div class="search-title">
              {{ memo.summary || (memo.description ? memo.description.slice(0, 5) + "..." : "메모") }}
            </div>
            <div class="search-date">{{ formatDate(memo.startDateTime) }}</div>
          </div>
          <div v-if="!filteredMemos.length" class="no-results">
            검색 결과 없음
          </div>
        </div>

        <!-- 사용자 목록 -->
        <h3 class="card-section-title">사용자 목록</h3>
        <div
          v-for="u in visibleUsers"
          :key="u.email"
          class="user-list-item"
          @click="highlightUser(u.email)"
        >
          <div class="user-name">{{ u.name }}</div>
          <div class="user-email">{{ u.email }}</div>
        </div>

        <!-- 초대 -->
        <h3 class="card-section-title">사용자 초대</h3>
        <input v-model="inviteEmail" placeholder="초대할 이메일" class="invite-input" />
        <select v-model="inviteRole" class="invite-role">
          <option value="reader">읽기</option>
          <option value="writer">편집</option>
          <option value="owner">소유자</option>
        </select>
        <button class="action-btn" @click="inviteUser">초대하기</button>

        <!-- 삭제 -->
        <h3 class="card-section-title">사용자 삭제</h3>
        <input v-model="removeEmail" placeholder="삭제할 이메일" class="invite-input" />
        <button class="delete-btn" @click="removeUser">삭제하기</button>

      </div>
    </div>

    <!-- ====================== -->
    <!--        달력 영역        -->
    <!-- ====================== -->
    <div class="calendar">
      <div class="calendar-header">
        <button class="nav-btn" @click.stop="prevMonth">◀</button>
        <h2>{{ currentYear }}년 {{ currentMonth + 1 }}월</h2>
        <button class="nav-btn" @click.stop="nextMonth">▶</button>
      </div>

      <div class="calendar-grid">
        <div
          v-for="date in daysInMonth"
          :key="date.date"
          class="day"
          :class="{ today: isToday(date.date) }"
          @click="openMemoPopup(date.date)"
        >
          <div class="date-number">{{ date.day }}</div>

          <div
            v-for="memo in filteredByUser(getMemosByDate(date.date))"
            :key="memo.id"
            class="memo-item"
            :style="{ backgroundColor: memo.color || '#b3e5fc' }"
            @click.stop="editMemo(memo)"
          >
            {{ memo.summary || memo.description.slice(0, 5) + "..." }}
          </div>
        </div>
      </div>
    </div>

    <!-- ====================== -->
    <!--   오른쪽: 메모 패널     -->
    <!-- ====================== -->
    <transition name="slide-panel">
      <div v-if="showPopup" class="memo-side-panel" :key="panelRefreshKey">
        <div class="popup-content panel-popup-content">
          <h3 class="memo-title">
            {{ selectedMemo.id ? "메모 수정" : "새 메모" }}
          </h3>

          <input v-model="selectedMemo.summary" placeholder="제목" />

          <textarea
            v-model="selectedMemo.description"
            placeholder="내용"
          ></textarea>

          <input
            v-model="selectedMemo.tags"
            placeholder="태그 (쉼표로 구분)"
          />

          <div class="color-select">
            <span>색상:</span>
            <div class="color-options">
              <div
                v-for="color in presetColors"
                :key="color"
                class="color-circle"
                :class="{ selected: selectedMemo.color === color }"
                :style="{ backgroundColor: color }"
                @click="selectedMemo.color = color"
              ></div>
            </div>
          </div>

          <div class="popup-buttons">
            <button @click="saveMemo">저장</button>
            <button v-if="selectedMemo.id" @click="deleteMemo(selectedMemo.id)">삭제</button>
            <button @click="closePopup">닫기</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { CalendarAPI } from "@/apis/calendar.js";

function toLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const BLOCKED_IDS = [
  "928924a55a86b48bc19f2c175a0642bffe2666393048c3c93ae81b190e1ad39a",
  "928924a55a86b48bc19f2c175a0642",
];

export default {
  data() {
    return {
      presetColors: ["#FFD966", "#A4C2F4", "#D9EAD3", "#F4CCCC", "#EAD1DC"],
      memos: [],
      currentDate: new Date(),
      showPopup: false,
      selectedDate: null,
      selectedMemo: {},
      searchQuery: "",
      inviteEmail: "",
      inviteRole: "writer",
      removeEmail: "",
      users: [],
      activeUserEmail: null,

      /*  기존 오류 스낵바 */
      errorMessage: null,
      errorTimer: null,

      /*  새로 추가된 성공 스낵바 */
      successMessage: null,
      successTimer: null,

      panelRefreshKey: 0,
    };
  },

  async mounted() {
    try {
      this.memos = await CalendarAPI.getEvents();
      this.users = (await CalendarAPI.getUsers()).filter(
        (u) =>
          typeof u.email === "string" &&
          u.email.includes("@") &&
          !u.email.includes("gserviceaccount")
      );
    } catch (e) {
      this.showError(e.response?.data?.message || e.message);
    }
  },

  computed: {
    currentYear() { return this.currentDate.getFullYear(); },
    currentMonth() { return this.currentDate.getMonth(); },

    daysInMonth() {
      const year = this.currentYear;
      const month = this.currentMonth;
      const days = [];
      const last = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= last; i++) {
        days.push({ day: i, date: new Date(year, month, i) });
      }
      return days;
    },

    filteredMemos() {
      const q = this.searchQuery.toLowerCase();
      if (!q.trim()) return [];
      return this.memos.filter(
        (m) =>
          m.description?.toLowerCase().includes(q) ||
          m.summary?.toLowerCase().includes(q) ||
          m.tags?.toLowerCase().includes(q)
      );
    },

    visibleUsers() {
      return this.users.filter((u) => {
        if (!u) return false;
        const email = u.email || "";
        const name = u.name || "";
        if (BLOCKED_IDS.includes(email) || BLOCKED_IDS.includes(name)) return false;
        return true;
      });
    },
  },

  methods: {
    /*  오류 스낵바 */
    showError(msg) {
      this.errorMessage = msg;
      if (this.errorTimer) clearTimeout(this.errorTimer);

      this.errorTimer = setTimeout(() => {
        this.errorMessage = null;
      }, 3000);
    },

    /*  성공 스낵바 */
    showSuccess(msg) {
      this.successMessage = msg;
      if (this.successTimer) clearTimeout(this.successTimer);

      this.successTimer = setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    },

    formatDate(d) {
      const date = new Date(d);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },

    isToday(date) {
      const t = new Date();
      return (
        date.getFullYear() === t.getFullYear() &&
        date.getMonth() === t.getMonth() &&
        date.getDate() === t.getDate()
      );
    },

    getMemosByDate(date) {
      const key = toLocalDateKey(date);
      return this.memos.filter((m) => {
        if (!m.startDateTime) return false;
        return toLocalDateKey(new Date(m.startDateTime)) === key;
      });
    },

    filteredByUser(list) {
      if (!this.activeUserEmail) return list;
      return list.filter((m) => m.creatorEmail === this.activeUserEmail);
    },

    highlightUser(email) {
      this.activeUserEmail = this.activeUserEmail === email ? null : email;
    },

    goToMemoDate(memo) {
      const d = new Date(memo.startDateTime);
      this.currentDate = d;
      this.editMemo(memo);
      this.searchQuery = "";
    },

    prevMonth() {
      this.currentDate = new Date(this.currentYear, this.currentMonth - 1, 1);
    },

    nextMonth() {
      this.currentDate = new Date(this.currentYear, this.currentMonth + 1, 1);
    },

    openMemoPopup(date) {
      this.selectedDate = date;
      this.selectedMemo = { date, color: "#b3e5fc" };
      this.panelRefreshKey++;
      this.showPopup = true;
    },

    editMemo(memo) {
      this.selectedMemo = { ...memo };
      this.selectedDate = new Date(memo.startDateTime);
      this.panelRefreshKey++;
      this.showPopup = true;
    },

    closePopup() {
      this.selectedMemo = {};
      this.showPopup = false;
    },

    async saveMemo() {
      if (!this.selectedMemo.summary && !this.selectedMemo.description)
        return this.showError("내용을 입력해주세요!");

      const summary =
        this.selectedMemo.summary ||
        this.selectedMemo.description.slice(0, 5) + "...";

      const memo = {
        summary,
        description: this.selectedMemo.description,
        startDateTime: this.selectedDate.toISOString(),
        endDateTime: this.selectedDate.toISOString(),
        color: this.selectedMemo.color,
      };

      try {
        if (this.selectedMemo.id) {
          const updated = await CalendarAPI.updateMemo(this.selectedMemo.id, memo);
          const idx = this.memos.findIndex((m) => m.id === this.selectedMemo.id);
          if (idx !== -1) this.memos.splice(idx, 1, updated);
        } else {
          const created = await CalendarAPI.createMemo(memo);
          this.memos.push(created);
        }

        this.closePopup();
      } catch (e) {
        this.showError(e.response?.data?.message || e.message);
      }
    },

    async deleteMemo(id) {
      try {
        await CalendarAPI.deleteEvent(id);
        this.memos = this.memos.filter((m) => m.id !== id);
        this.closePopup();
      } catch (e) {
        this.showError(e.response?.data?.message || e.message);
      }
    },

    async inviteUser() {
      if (!this.inviteEmail.trim()) return this.showError("이메일 입력!");

      try {
        await CalendarAPI.addUser(this.inviteEmail, this.inviteRole);

        /* 🔵 alert → 스낵바 */
        this.showSuccess("초대 완료");

        this.inviteEmail = "";
      } catch (e) {
        this.showError(e.response?.data?.message || e.message);
      }
    },

    async removeUser() {
      if (!this.removeEmail.trim()) return this.showError("삭제할 이메일 입력!");

      try {
        await CalendarAPI.removeUser(this.removeEmail);

        /* 🔵 alert → 스낵바 */
        this.showSuccess("사용자 삭제 완료");

        this.removeEmail = "";
      } catch (e) {
        this.showError(e.response?.data?.message || e.message);
      }
    },
  },
};
</script>

<style scoped>
/* ===========================  
   전체 레이아웃
=========================== */
.calendar-container {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 40px;
  gap: 80px;
  background: white;
  width: 100%;
  box-sizing: border-box;
}

/* ===========================  
   좌측 / 우측 사이드바
=========================== */
.left-sidebar {
  width: 220px;
  flex-shrink: 0;
}

.right-sidebar {
  width: 260px;
  flex-shrink: 0;
}

/* 카드 스타일 */
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
}

/* 검색 */
.search-input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  font-size: 14px;
}

.search-item {
  padding: 8px 10px;
  margin-bottom: 6px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
}

.search-item:hover {
  background: #e8f0fe;
  border-color: #90caf9;
}

.search-title {
  font-size: 13px;
  font-weight: 600;
}

.search-date {
  font-size: 12px;
  color: #666;
}

/* 사용자 목록 */
.user-list-item {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #eee;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.user-list-item:hover {
  background: #e8f0fe;
}

.user-name {
  font-weight: 600;
  font-size: 13px;
}

.user-email {
  font-size: 11px;
  color: #555;
}

/* 섹션 제목 */
.card-section-title {
  margin: 16px 0 8px;
  font-weight: 700;
  font-size: 14px;
}
.card-section-title:first-child {
  margin-top: 0;
}

/* 초대/삭제 입력 */
.invite-input,
.invite-role {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 8px;
  font-size: 13px;
}

/* 버튼 */
.action-btn,
.delete-btn {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.action-btn {
  background: #4a8cff;
  color: white;
}

.delete-btn {
  background: #ff6b6b;
  color: white;
}

/* 달력 */
.calendar {
  width: 700px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.nav-btn {
  background: #e7f1ff;
  border: 1px solid #bcd0f7;
  color: #0d47a1;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  height: 100px;
  padding: 5px;
  overflow-y: auto;
  cursor: pointer;
}

.today {
  border: 2px solid #1976d2;
}

.memo-item {
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 6px;
  margin-top: 2px;
}

/* 메모 패널 */
.memo-side-panel {
  position: fixed;
  top: 50px;
  right: 20px;
  width: 360px;
  height: calc(100vh - 70px);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.12);
  padding: 20px;
  z-index: 2000;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity;
  transform: translateX(0);
  animation: reopen 0.25s ease;
}

.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.slide-panel-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.slide-panel-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

/* 패널 내부 */
.panel-popup-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-popup-content input,
.panel-popup-content textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid #d1d5db;
  font-size: 14px;
  background: #fafafa;
}

.panel-popup-content textarea {
  height: 340px;
  resize: vertical;
}

/* 색상 선택 */
.color-select {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-options {
  display: flex;
  gap: 8px;
}

.color-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
}

.color-circle.selected {
  border-color: #333;
}

/* 버튼 */
.popup-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.popup-buttons button {
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: white;
}

.popup-buttons button:first-child {
  background: #1976d2;
}

.popup-buttons button:nth-child(2) {
  background: #ef4444;
}

.popup-buttons button:last-child {
  background: #9ca3af;
}

/* =======================
    오류 스낵바
======================= */
.toast-error {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);  
  background: #ff5252;
  color: white;
  padding: 12px 18px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 9999;
  font-weight: 600;
  animation: fadein 0.3s ease;
}

/* =======================
    성공 스낵바 (추가됨)
======================= */
.toast-success {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);  
  background: #4a8cff;
  color: white;
  padding: 12px 18px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 9999;
  font-weight: 600;
  animation: fadein 0.3s ease;
}

@keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>
