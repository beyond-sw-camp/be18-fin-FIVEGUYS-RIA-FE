<template>
  <div class="admin-log-page">
    <section class="logs-section">
      <v-card class="logs-card" elevation="0">
        <!-- 🔹 상단 헤더 -->
        <div class="logs-card-header">
          <div class="logs-card-title-wrap">
            <div class="title-left">
              <h2 class="logs-main-title">활동 로그</h2>
            </div>
          </div>
        </div>

        <!-- 🔹 필터 영역 -->
        <div class="filter-section glass-filter">
          <div class="filter-header">
            <h3 class="logs-card-title">로그 필터</h3>
            <div class="filter-actions">
              <v-btn
                variant="flat"
                size="small"
                class="pill-btn pill-btn-reset"
                @click="resetFilter"
              >
                <v-icon start size="18">mdi-restore</v-icon>
                필터 초기화
              </v-btn>
            </div>
          </div>

          <div class="filter-row">
            <!-- 시작 날짜 -->
            <div class="filter-item">
              <div class="filter-label">시작 날짜</div>
              <v-text-field
                v-model="startDate"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </div>

            <!-- 종료 날짜 -->
            <div class="filter-item">
              <div class="filter-label">종료 날짜</div>
              <v-text-field
                v-model="endDate"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </div>

            <!-- 사용자 -->
            <div class="filter-item">
              <div class="filter-label">사용자</div>
              <v-select
                v-model="selectedUser"
                :items="userOptions"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </div>

            <!-- 작업 유형 -->
            <div class="filter-item">
              <div class="filter-label">작업 유형</div>
              <v-select
                v-model="selectedAction"
                :items="actionOptions"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </div>

            <!-- 검색 -->
            <div class="filter-item filter-search">
              <div class="filter-label">검색</div>
              <v-text-field
                v-model="keyword"
                placeholder="키워드 검색..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </div>
          </div>
        </div>

        <v-divider class="divider-soft" />

        <!-- 🔹 활동 로그 영역 -->
        <div class="logs-section-body">
          <div class="logs-header">
            <div class="logs-title-group">
              <h2 class="logs-card-subtitle-main">로그 목록</h2>
              <span class="logs-count">
                총 {{ totalElements }}개의 로그를 찾았습니다.
              </span>
            </div>
          </div>

          <!-- 테이블 헤더 -->
          <div class="table-header-row glass-header">
            <span class="th th-time">타임스탬프</span>
            <span class="th th-name">이름</span>
            <span class="th th-emp hide-on-md">사번</span>
            <span class="th th-action">작업명</span>
            <span class="th th-resource hide-on-md">영향받은 리소스</span>
            <span class="th th-status">상태</span>
          </div>

          <!-- 테이블 바디 -->
          <div class="table-body">
            <div
              v-for="log in pagedLogs"
              :key="log.logId || log.id"
              class="table-row"
            >
              <!-- 타임스탬프 -->
              <span class="td th-time">
                <div class="time-cell">
                  <span class="time-date">{{ formatDate(log.createdAt) }}</span>
                  <span class="time-clock">{{
                    formatTime(log.createdAt)
                  }}</span>
                </div>
              </span>

              <!-- 이름 -->
              <span class="td th-name">
                <div class="user-cell">
                  <div class="user-avatar">
                    {{ (log.userName || "-")?.charAt(0) || "?" }}
                  </div>
                  <div class="user-text">
                    <span class="user-name">{{ log.userName || "-" }}</span>
                    <span class="user-email-sub">
                      {{ log.employeeNo || "-" }}
                    </span>
                  </div>
                </div>
              </span>

              <!-- 사번 -->
              <span class="td th-emp hide-on-md">
                {{ log.employeeNo || "-" }}
              </span>

              <!-- 작업명 -->
              <span class="td th-action">
                <span class="action-text">
                  {{ log.logName || "-" }}
                </span>
              </span>

              <!-- 영향받은 리소스 -->
              <span class="td th-resource hide-on-md">
                {{ formatResource(log.resource) }}
              </span>

              <!-- 상태 -->
              <span class="td th-status">
                <v-chip
                  size="small"
                  variant="flat"
                  class="status-chip"
                  :class="getStatusClass(getLogStatus(log))"
                >
                  <span class="dot" />
                  {{ getStatusLabel(getLogStatus(log)) }}
                </v-chip>
              </span>
            </div>

            <div v-if="pagedLogs.length === 0" class="table-empty">
              조회된 로그가 없습니다.
            </div>
          </div>

          <!-- 🔹 페이지네이션 -->
          <div class="table-footer">
            <div class="footer-left">
              <span class="footer-count">총 {{ totalElements }}개</span>
            </div>

            <div class="footer-center">
              <!-- 첫 페이지 -->
              <v-btn
                variant="text"
                size="small"
                class="footer-btn pill-btn"
                :disabled="page === 1"
                @click="goFirst"
              >
                «
              </v-btn>

              <!-- -10 페이지 -->
              <v-btn
                variant="text"
                size="small"
                class="footer-btn pill-btn"
                :disabled="page === 1"
                @click="jumpPrevBlock"
              >
                -10
              </v-btn>

              <!-- 이전 1페이지 -->
              <v-btn
                variant="text"
                size="small"
                class="footer-btn pill-btn"
                :disabled="page === 1"
                @click="page--"
              >
                이전
              </v-btn>

              <span class="page-info">
                페이지 <strong>{{ page }}</strong> / {{ totalPages }}
              </span>

              <!-- 다음 1페이지 -->
              <v-btn
                variant="text"
                size="small"
                class="footer-btn pill-btn"
                :disabled="page === totalPages"
                @click="page++"
              >
                다음
              </v-btn>

              <!-- +10 페이지 -->
              <v-btn
                variant="text"
                size="small"
                class="footer-btn pill-btn"
                :disabled="page === totalPages"
                @click="jumpNextBlock"
              >
                +10
              </v-btn>

              <!-- 마지막 페이지 -->
              <v-btn
                variant="text"
                size="small"
                class="footer-btn pill-btn"
                :disabled="page === totalPages"
                @click="goLast"
              >
                »
              </v-btn>
            </div>

            <div class="footer-right" />
          </div>
        </div>
      </v-card>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/apis/http";
import { useSnackbarStore } from "@/stores/useSnackbarStore";

const snackbar = useSnackbarStore();

/* ---------- 필터 상태 ---------- */
const startDate = ref("");
const endDate = ref("");
const selectedUser = ref("ALL");
const selectedAction = ref("ALL");
const keyword = ref("");

/* ---------- 로그 & 페이지네이션 ---------- */
const logs = ref([]);
const page = ref(1);
const size = ref(10);

/* ---------- 사용자 옵션 ---------- */
const userOptions = ref([{ label: "모든 사용자", value: "ALL" }]);

/* ---------- 작업 유형 옵션 ---------- */
const actionOptions = [
  { label: "모든 작업", value: "ALL" },
  { label: "관리자 (admin)", value: "admin" },
  { label: "인증 (auth)", value: "auth" },
  { label: "캘린더 (calendar)", value: "calendar" },
  { label: "프로젝트 (campaign)", value: "campaign" },
  { label: "고객/고객사 (client)", value: "client" },
  { label: "시설 (facility)", value: "facility" },
  { label: "문서 (storage)", value: "storage" },
  { label: "사용자 (user)", value: "user" },
];

/* ---------- 상태 표시 ---------- */
const getLogStatus = (log) => log.status ?? log.state ?? log.result ?? null;

const getStatusLabel = (status) => {
  if (status === "SUCCESS") return "성공";
  if (status === "FAILED" || status === "FAIL") return "실패";
  return "-";
};

const getStatusClass = (status) => {
  if (status === "SUCCESS") return "status-success";
  if (status === "FAILED" || status === "FAIL") return "status-fail";
  return "status-unknown";
};

/* ---------- 날짜/리소스 포맷 ---------- */
const formatDateTime = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR");
};

const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR");
};

const formatTime = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("ko-KR");
};

const formatResource = (resource) => resource?.replace(/\s+/g, " ") ?? "-";

/* ---------- API 호출 ---------- */
const fetchLogs = async () => {
  try {
    const res = await api.get("/api/admin/logs", {
      params: { page: 0, size: 1000 },
    });

    logs.value = Array.isArray(res.data.content) ? res.data.content : [];
  } catch (err) {
    console.error("로그 조회 실패:", err);
    logs.value = [];
    snackbar.show("로그 목록 조회에 실패했습니다.", "error");
  }
};

const fetchUsersForFilter = async () => {
  try {
    const res = await api.get("/api/admin/users", {
      params: { page: 0, size: 1000 },
    });

    const list = res.data.content ?? [];
    userOptions.value = [
      { label: "모든 사용자", value: "ALL" },
      ...list.map((u) => ({
        label: `${u.name} (${u.employeeNo})`,
        value: u.employeeNo,
      })),
    ];
  } catch (err) {
    console.error("필터용 사용자 목록 조회 실패:", err);
    snackbar.show("필터용 사용자 목록 조회에 실패했습니다.", "error");
  }
};

/* ---------- 필터링 ---------- */
const filteredLogs = computed(() =>
  (logs.value ?? []).filter((log) => {
    const createdDate = log.createdAt ? log.createdAt.slice(0, 10) : null;

    if (startDate.value && createdDate < startDate.value) return false;
    if (endDate.value && createdDate > endDate.value) return false;

    const empNo = log.employeeNo ?? null;
    if (
      selectedUser.value !== "ALL" &&
      String(empNo) !== String(selectedUser.value)
    ) {
      return false;
    }

    if (selectedAction.value !== "ALL") {
      const path = (log.resource ?? "").toLowerCase();
      const key = String(selectedAction.value).toLowerCase();
      if (!path.includes(`/${key}`)) return false;
    }

    const kw = keyword.value.trim();
    if (kw) {
      const target = `${log.logName ?? ""} ${log.resource ?? ""} ${
        log.userName ?? ""
      } ${log.employeeNo ?? ""}`;
      if (!target.includes(kw)) return false;
    }

    return true;
  })
);

/* ---------- 페이지 계산 ---------- */
const totalPages = computed(() => {
  const count = filteredLogs.value.length;
  return count === 0 ? 1 : Math.ceil(count / size.value);
});

const pagedLogs = computed(() => {
  const list = filteredLogs.value;
  const start = (page.value - 1) * size.value;
  return list.slice(start, start + size.value);
});

const totalElements = computed(() => filteredLogs.value.length);

/* ---------- 페이지 블럭 이동 (-10 / +10) ---------- */
const jumpPrevBlock = () => {
  page.value = Math.max(1, page.value - 10);
};

const jumpNextBlock = () => {
  page.value = Math.min(totalPages.value, page.value + 10);
};

/* ---------- 필터/페이지 제어 ---------- */
const resetFilter = () => {
  startDate.value = "";
  endDate.value = "";
  selectedUser.value = "ALL";
  selectedAction.value = "ALL";
  keyword.value = "";
  page.value = 1;
};

const goFirst = () => (page.value = 1);
const goLast = () => (page.value = totalPages.value);

/* ---------- 초기 로딩 ---------- */
onMounted(async () => {
  await Promise.all([fetchUsersForFilter(), fetchLogs()]);
});
</script>

<style scoped>
.admin-log-page {
  padding: 32px 40px 40px;
  background: radial-gradient(circle at top left, #e0f2fe 0, transparent 45%),
    radial-gradient(circle at bottom right, #e5e7eb 0, transparent 40%),
    linear-gradient(135deg, #f9fafb, #eef2ff);
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

/* 가운데 카드 정렬 */
.logs-section {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* 카드 스타일 */
.logs-card {
  width: 100%;
  max-width: 1120px;
  padding: 22px 24px 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.24);
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(18px);
}

/* 상단 헤더 */
.logs-card-header {
  margin-bottom: 10px;
}

.logs-card-title-wrap {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.title-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logs-main-title {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #0f172a;
  margin: 0;
}

.logs-main-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.title-right {
  display: flex;
  align-items: center;
}

.badge-pill {
  border-radius: 999px;
  background: #f3f4ff;
  color: #4f46e5;
  font-weight: 500;
  padding-inline: 12px;
}

/* 필터 영역 */
.filter-section {
  margin-bottom: 12px;
  border-radius: 18px;
  padding: 14px 14px 12px;
}

.glass-filter {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.logs-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 12px;
  color: #666;
}

.filter-search {
  grid-column: span 2;
}

/* 필터 버튼 */
.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pill-btn {
  border-radius: 999px;
  padding-inline: 10px;
  text-transform: none;
  font-size: 0.8rem;
  color: #4b5563;
}

.pill-btn:hover:not(:disabled) {
  background: rgba(226, 232, 240, 0.9);
}

/* 부드러운 divider */
.divider-soft {
  margin: 12px 0 10px;
  opacity: 0.75;
}

/* 로그 헤더 */
.logs-section-body {
  margin-top: 4px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.logs-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logs-card-subtitle-main {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.logs-count {
  font-size: 12px;
  color: #6b7280;
}

/* 테이블 헤더 */
.table-header-row {
  display: grid;
  grid-template-columns: 1.6fr 1.6fr 0.9fr 1.6fr 2.4fr 0.9fr;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  border-radius: 14px;
  margin-bottom: 4px;
}

.glass-header {
  background: linear-gradient(
    135deg,
    rgba(248, 250, 252, 0.9),
    rgba(239, 246, 255, 0.9)
  );
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.th {
  display: flex;
  align-items: center;
}

/* 바디 */
.table-body {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.9);
  background-color: rgba(249, 250, 251, 0.7);
}

.table-row {
  display: grid;
  grid-template-columns: 1.6fr 1.6fr 0.9fr 1.6fr 2.4fr 0.9fr;
  padding: 10px 12px;
  font-size: 0.9rem;
  background-color: #ffffff;
  border-bottom: 1px solid rgba(243, 244, 246, 0.9);
  transition: background-color 0.18s ease, transform 0.08s ease,
    box-shadow 0.16s ease;
}

.table-row:nth-child(2n) {
  background-color: #fbfbff;
}

.table-row:hover {
  background-color: #eef2ff;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(129, 140, 248, 0.16);
}

/* 셀 공통 */
.td {
  padding: 4px 8px;
  display: flex;
  align-items: flex-start;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 숫자 타임스탬프 예쁘게 */
.th-time {
  font-variant-numeric: tabular-nums;
}

/* 사용자 셀 */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #22c55e);
  color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 6px 14px rgba(79, 70, 229, 0.4);
}

.user-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.9rem;
}

.user-email-sub {
  font-size: 0.78rem;
  color: #9ca3af;
}

/* 작업명 여러 줄 허용 */
.td.th-action {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}

.td.th-action .action-text {
  white-space: normal;
  word-break: break-all;
}

/* 빈 데이터 */
.table-empty {
  padding: 26px 8px;
  text-align: center;
  color: #888;
  background-color: #ffffff;
  font-size: 14px;
}

/* 상태 칩 */
.status-chip {
  color: #f9fafb !important;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.18);
}

.status-success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.status-fail {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
}

.status-unknown {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background-color: rgba(248, 250, 252, 0.9);
}

/* 하단 페이지네이션 */
.table-footer {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  font-size: 0.85rem;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.footer-right {
  /* 오른쪽 여백용 */
}

.footer-count {
  color: #6b7280;
}

.footer-btn {
  min-width: 40px;
  text-transform: none;
  font-size: 0.8rem;
}

.page-info {
  font-size: 13px;
  color: #555;
  padding-inline: 8px;
}

/* 반응형 */
@media (max-width: 1000px) {
  .admin-log-page {
    padding: 20px 16px 28px;
  }

  .logs-card {
    padding-inline: 18px;
  }

  .logs-card-title-wrap {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-search {
    grid-column: span 2;
  }

  .table-header-row,
  .table-row {
    grid-template-columns: 1.8fr 1.8fr 1.8fr 1.4fr;
  }

  .hide-on-md {
    display: none;
  }
}

.time-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.3;
}

.time-date {
  font-size: 0.85rem;
  color: #111827;
}

.time-clock {
  font-size: 0.78rem;
  color: #6b7280;
}
/* 공통 pill 버튼은 그대로 */
.pill-btn {
  border-radius: 999px;
  padding-inline: 10px;
  text-transform: none;
  font-size: 0.8rem;
  color: #4b5563;
}

/* 🔹 필터 초기화 전용 강조 스타일 */
.pill-btn-reset {
  background: rgba(239, 246, 255, 0.95);
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.18);
  font-weight: 500;
}

.pill-btn-reset:hover:not(:disabled) {
  background: #eff6ff;
  border-color: #93c5fd;
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.26);
}
</style>
