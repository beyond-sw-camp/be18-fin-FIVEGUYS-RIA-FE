<template>
  <div class="calendar-container">
    <!-- 왼쪽: 검색 + 초대/삭제 버튼 -->
    <div class="sidebar">
      <!-- 가로 정렬로 버튼 + 검색창 -->
      <div class="search-header">
        <!-- 사용자 관리 버튼 -->
        <button class="invite-open-btn" @click="showUserPopup = true">
          사용자 관리
        </button>

        <!-- 검색창 -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="태그나 내용으로 검색"
          class="search-input"
        />
      </div>

      <!-- 검색 결과 -->
      <div v-if="searchQuery.trim()" class="search-results">
        <div
          v-for="memo in filteredMemos"
          :key="memo.id"
          class="search-item"
          @click="goToMemoDate(memo)"
        >
          <div class="search-title">
            {{
              memo.summary ||
              (memo.description ? memo.description.slice(0, 5) + "..." : "메모")
            }}
          </div>
          <div class="search-date">{{ formatDate(memo.startDateTime) }}</div>
        </div>
        <div v-if="!filteredMemos.length" class="no-results">
          검색 결과 없음
        </div>
      </div>
    </div>

    <!-- 달력 -->
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

          <!-- 여러 메모 표시 (⭐ 여기 필터 적용됨) -->
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

    <!-- ⭐ 우측: 사용자 리스트 드래그 패널 -->
    <div
      class="user-drawer"
      :style="{ right: userDrawerOpen ? '0px' : '-220px' }"
    >
      <div
        class="drawer-handle"
        @mousedown.stop.prevent="startDrag"
        @click.stop="userDrawerOpen = !userDrawerOpen"
      >
        👥
      </div>

      <div class="drawer-content">
        <button class="all-memos-btn" @click="activeUserEmail = null">
          전체 메모 보기
        </button>
        <h3>사용자 목록</h3>

        <!-- 🔥 여기: users → visibleUsers 로 변경 -->
        <div
          v-for="u in visibleUsers"
          :key="u.email"
          class="user-list-item"
          @click="highlightUser(u.email)"
        >
          <div class="user-name">{{ u.name }}</div>
          <div class="user-email">{{ u.email }}</div>
        </div>
      </div>
    </div>

    <!-- 🗒️ 메모 팝업 -->
    <div v-if="showPopup" class="memo-popup">
      <div class="popup-content">
        <h3>{{ selectedMemo.id ? "메모 수정" : "새 메모 추가" }}</h3>

        <input v-model="selectedMemo.summary" placeholder="제목" />

        <textarea
          v-model="selectedMemo.description"
          placeholder="내용"
        ></textarea>

        <input v-model="selectedMemo.tags" placeholder="태그 (쉼표로 구분)" />

        <!-- 색상 선택 -->
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
          <button v-if="selectedMemo.id" @click="deleteMemo(selectedMemo.id)">
            삭제
          </button>
          <button @click="closePopup">닫기</button>
        </div>
      </div>
    </div>

    <!-- 👥 사용자 초대 & 삭제 팝업 (그대로 유지) -->
    <div v-if="showUserPopup" class="invite-popup">
      <div class="popup-content">
        <h3>사용자 관리</h3>

        <div class="popup-section-title">사용자 초대</div>
        <input
          v-model="inviteEmail"
          placeholder="초대할 이메일"
          class="invite-input"
        />
        <select v-model="inviteRole" class="invite-role">
          <option value="reader">읽기</option>
          <option value="writer">편집</option>
          <option value="owner">소유자</option>
        </select>
        <button class="action-btn" @click="inviteUser">초대하기</button>

        <hr />

        <div class="popup-section-title">사용자 삭제</div>
        <input
          v-model="removeEmail"
          placeholder="삭제할 사용자 이메일"
          class="invite-input"
        />
        <button class="delete-btn" @click="removeUser">삭제하기</button>

        <button class="close-btn" @click="showUserPopup = false">닫기</button>
      </div>
    </div>
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

// 🔥 하드코딩으로 안 보이게 할 ID 목록
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

      /* 사용자 관리 */
      showUserPopup: false,
      inviteEmail: "",
      inviteRole: "writer",
      removeEmail: "",

      /* 사용자 목록 + 메모 필터링 */
      users: [],
      activeUserEmail: null,

      /* 드래그 패널 */
      userDrawerOpen: false,
    };
  },

  computed: {
    currentYear() {
      return this.currentDate.getFullYear();
    },
    currentMonth() {
      return this.currentDate.getMonth();
    },
    daysInMonth() {
      const year = this.currentYear;
      const month = this.currentMonth;
      const days = [];
      const lastDay = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= lastDay; i++)
        days.push({ day: i, date: new Date(year, month, i) });
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

    // 🔥 여기서 최종적으로 화면에 보여줄 사용자만 필터링
    visibleUsers() {
      return this.users.filter((u) => {
        if (!u) return false;
        const email = u.email || "";
        const name = u.name || "";

        // 하드코딩으로 특정 ID 제거
        if (BLOCKED_IDS.includes(email) || BLOCKED_IDS.includes(name)) {
          return false;
        }
        return true;
      });
    },
  },

  async mounted() {
    this.memos = await CalendarAPI.getEvents();

    // users는 그대로 가져오되, 1차 필터는 유지해도 됨 (있어도 되고 없어도 됨)
    this.users = (await CalendarAPI.getUsers()).filter(
      (u) =>
        typeof u.email === "string" &&
        u.email.includes("@") &&
        u.email.includes(".") &&
        !u.email.includes("gserviceaccount")
    );
  },

  methods: {
    /* 날짜 포맷 */
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

    /* ⭐ 사용자 필터링 적용 */
    filteredByUser(memoList) {
      if (!this.activeUserEmail) return memoList;
      return memoList.filter((m) => m.creatorEmail === this.activeUserEmail);
    },

    highlightUser(userEmail) {
      if (this.activeUserEmail === userEmail) this.activeUserEmail = null;
      else this.activeUserEmail = userEmail;
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
      this.showPopup = true;
    },

    editMemo(memo) {
      this.selectedMemo = { ...memo };
      this.selectedDate = new Date(memo.startDateTime);
      this.showPopup = true;
    },

    closePopup() {
      this.showPopup = false;
      this.selectedMemo = {};
    },

    async saveMemo() {
      if (!this.selectedMemo.summary && !this.selectedMemo.description)
        return alert("내용을 입력해주세요!");

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

      if (this.selectedMemo.id) {
        const updated = await CalendarAPI.updateMemo(
          this.selectedMemo.id,
          memo
        );
        const idx = this.memos.findIndex((m) => m.id === this.selectedMemo.id);
        if (idx !== -1) this.memos.splice(idx, 1, updated);
      } else {
        const created = await CalendarAPI.createMemo(memo);
        this.memos.push(created);
      }
      this.closePopup();
    },

    async deleteMemo(id) {
      await CalendarAPI.deleteEvent(id);
      this.memos = this.memos.filter((m) => m.id !== id);
      this.closePopup();
    },

    /* ⭐ 드래그 핸들 */
    startDrag(e) {
      const startX = e.clientX;

      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        if (dx < -40) this.userDrawerOpen = true;
        else if (dx > 40) this.userDrawerOpen = false;
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },

    async inviteUser() {
      if (!this.inviteEmail.trim()) return alert("이메일 입력하세요!");
      const res = await CalendarAPI.addUser(this.inviteEmail, this.inviteRole);
      alert("초대 완료: " + res);
      this.inviteEmail = "";
    },

    async removeUser() {
      if (!this.removeEmail.trim()) return alert("삭제할 이메일 입력!");
      const res = await CalendarAPI.removeUser(this.removeEmail);
      alert("사용자 삭제 완료: " + res);
      this.removeEmail = "";
    },
  },
};
</script>

<style scoped>
.calendar-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
  background: #ffffff;
  width: 100%;
}

/* 검색창 영역 */
.sidebar {
  width: 250px;
}

/* 버튼 + 검색창 가로 정렬 */
.search-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px; /* 버튼과 검색창 사이 간격 */
  margin-bottom: 10px;
}

/* 사용자 관리 버튼 */
.invite-open-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap; /* 버튼 글자 줄바꿈 방지 */
}

.invite-open-btn:hover {
  background: #0056b3;
}

/* 검색창 */
.search-input {
  flex: 0 0 140px; /* 🔥 flex 비율 제거 + 기본폭 140px 고정 */
  max-width: 150px; /* 🔥 최대 폭 제한 */
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.invite-open-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 0px;
  border-radius: 6px;
  width: 500px;
  height: 36px;
  cursor: pointer;
}
.invite-open-btn:hover {
  background: #0056b3;
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

/* ⭐ 월 이동 버튼 스타일 */
.nav-btn {
  background: #e7f1ff;
  border: 1px solid #bcd0f7;
  color: #0d47a1;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.nav-btn:hover {
  background: #d0e4ff;
  border-color: #90b7f7;
  transform: translateY(-1px);
}
.nav-btn:active {
  transform: scale(0.96);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-top: 10px;
}
.day {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  height: 100px;
  padding: 5px;
  overflow: hidden;
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

/* 🗒️ 메모 팝업 */
.memo-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.memo-popup .popup-content {
  background: #fff;
  padding: 24px;
  border-radius: 20px;
  width: 320px;
  height: 480px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.memo-popup input,
.memo-popup textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid #ccc;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.memo-popup textarea {
  height: 200px;
  resize: vertical;
  line-height: 1.6;
}

/* 🎨 색상 선택 */
.color-select {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
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
  transition: transform 0.15s ease, border-color 0.2s ease;
}
.color-circle:hover {
  transform: scale(1.15);
}
.color-circle.selected {
  border-color: #333;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
}

/* 버튼 */
.memo-popup .popup-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}
.memo-popup .popup-buttons button {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.memo-popup .popup-buttons button:first-child {
  background: #1976d2;
  color: white;
}
.memo-popup .popup-buttons button:nth-child(2) {
  background: #f44336;
  color: white;
}
.memo-popup .popup-buttons button:last-child {
  background: #9e9e9e;
  color: white;
}

/* 👥 초대 팝업 */
.invite-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}
.invite-popup .popup-content {
  background: #f8f9ff;
  padding: 28px;
  border-radius: 18px;
  width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
}
.invite-input,
.invite-role {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.5px solid #ccc;
  margin-bottom: 10px;
}

/* 검색 결과 스타일 */
.search-item {
  padding: 8px 10px;
  margin-bottom: 6px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-item:hover {
  background: #e8f0fe;
  border-color: #90caf9;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.search-title {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
}

.search-date {
  font-size: 12px;
  margin-top: 2px;
  color: #555;
}

.day {
  overflow-y: auto;
  max-height: 100px;
}

.invite-popup .popup-buttons button:first-child {
  background: linear-gradient(135deg, #4a8cff, #2764ff);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 8px rgba(50, 110, 255, 0.25);
}

.invite-popup .popup-buttons button:first-child:hover {
  background: linear-gradient(135deg, #5b99ff, #3b7bff);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(50, 110, 255, 0.35);
}

.invite-popup .popup-buttons button:first-child:active {
  transform: scale(0.97);
}

.invite-popup .popup-buttons button:last-child {
  background: #f1f3f5;
  color: #333;
  border: 1px solid #d0d7de;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.invite-popup .popup-buttons button:last-child:hover {
  background: #e9ecef;
  border-color: #c0c8d0;
  transform: translateY(-2px);
}

.invite-popup .popup-buttons button:last-child:active {
  transform: scale(0.97);
}

.action-btn {
  width: 100%;
  background: linear-gradient(135deg, #4a8cff, #2764ff);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: linear-gradient(135deg, #5b99ff, #3b7bff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 123, 255, 0.25);
}

.action-btn:active {
  transform: scale(0.96);
}

.delete-btn {
  width: 100%;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #ff4747;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 100, 100, 0.25);
}

.delete-btn:active {
  transform: scale(0.96);
}

.close-btn {
  width: 100%;
  background: #f1f3f5;
  color: #333;
  border: 1px solid #d0d7de;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s ease;
}

/* ⭐ 우측 사용자 드래그 패널 */
.user-drawer {
  position: fixed;
  top: 0;
  right: -220px;
  width: 220px;
  height: 100%;
  background: #ffffff;
  border-left: 1px solid #ddd;
  transition: right 0.25s ease;
  z-index: 1005;
}

.drawer-handle {
  position: absolute;
  left: -32px;
  top: 40%;
  width: 32px;
  height: 80px;
  background: #4a8cff;
  color: #fff;
  border-radius: 8px 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ew-resize;
  user-select: none;
  font-size: 18px;
}

.drawer-content {
  padding: 16px;
}

.user-list-item {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #eee;
  margin-bottom: 8px;
  cursor: pointer;
}
.user-list-item:hover {
  background: #e8f0fe;
}
.user-name {
  font-weight: 600;
}
.user-email {
  font-size: 12px;
  color: #555;
}
.all-memos-btn {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.all-memos-btn:hover {
  background: #155a9c;
}
</style>
