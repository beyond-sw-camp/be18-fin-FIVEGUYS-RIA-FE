<template>
  <div class="admin-log-page">
    <section class="logs-section">
      <v-card class="logs-card" elevation="0">
        <!-- 🔹 필터 영역 -->
        <div class="filter-section">
          <h2 class="logs-card-title">로그 필터</h2>

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

          <div class="filter-actions">
            <v-btn variant="outlined" @click="resetFilter">필터 초기화</v-btn>
          </div>
        </div>

        <v-divider class="mt-4 mb-2" />

        <!-- 🔹 활동 로그 영역 -->
        <div class="logs-section-body">
          <div class="logs-header">
            <div class="logs-title-group">
              <h2 class="logs-card-title">활동 로그</h2>
              <span class="logs-count">
                총 {{ totalElements }}개의 로그를 찾았습니다.
              </span>
            </div>
          </div>

          <!-- 테이블 헤더 -->
          <div class="table-header-row">
            <span class="th th-time">타임스탬프</span>
            <span class="th th-name">이름</span>
            <span class="th th-emp">사번</span>
            <span class="th th-action">작업명</span>
            <span class="th th-resource">영향받은 리소스</span>
            <span class="th th-status">상태</span>
          </div>

          <v-divider />

          <!-- 테이블 바디 -->
          <div class="table-body">
            <div
              v-for="log in pagedLogs"
              :key="log.logId || log.id"
              class="table-row"
            >
              <!-- 타임스탬프 -->
              <span class="td th-time">
                {{ formatDateTime(log.createdAt) }}
              </span>

              <!-- 이름 -->
              <span class="td th-name">
                <span class="user-name">{{ log.userName || "-" }}</span>
              </span>

              <!-- 사번 -->
              <span class="td th-emp">
                {{ log.employeeNo || "-" }}
              </span>

              <!-- 작업명 -->
              <span class="td th-action">
                <span class="action-text">
                  {{ log.logName || "-" }}
                </span>
              </span>

              <!-- 영향받은 리소스 -->
              <span class="td th-resource">
                {{ formatResource(log.resource) }}
              </span>

              <!-- 상태 -->
              <span class="td th-status">
                <v-chip
                  :color="getStatusColor(getLogStatus(log))"
                  size="small"
                  variant="flat"
                >
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
                variant="outlined"
                size="small"
                class="footer-btn"
                :disabled="page === 1"
                @click="goFirst"
              >
                «
              </v-btn>

              <!-- -10 페이지 -->
              <v-btn
                variant="outlined"
                size="small"
                class="footer-btn"
                :disabled="page === 1"
                @click="jumpPrevBlock"
              >
                -10
              </v-btn>

              <!-- 이전 1페이지 -->
              <v-btn
                variant="outlined"
                size="small"
                class="footer-btn"
                :disabled="page === 1"
                @click="page--"
              >
                이전
              </v-btn>

              <span class="page-info">
                페이지 {{ page }} / {{ totalPages }}
              </span>

              <!-- 다음 1페이지 -->
              <v-btn
                variant="outlined"
                size="small"
                class="footer-btn"
                :disabled="page === totalPages"
                @click="page++"
              >
                다음
              </v-btn>

              <!-- +10 페이지 -->
              <v-btn
                variant="outlined"
                size="small"
                class="footer-btn"
                :disabled="page === totalPages"
                @click="jumpNextBlock"
              >
                +10
              </v-btn>

              <!-- 마지막 페이지 -->
              <v-btn
                variant="outlined"
                size="small"
                class="footer-btn"
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
import { ref, computed, onMounted, watch } from "vue";
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
const logs = ref([]); // ✅ 기본값 배열
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

const getStatusColor = (status) => {
  if (status === "SUCCESS") return "success";
  if (status === "FAILED" || status === "FAIL") return "error";
  return "grey";
};

/* ---------- 날짜/리소스 포맷 ---------- */
const formatDateTime = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR");
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

watch(filteredLogs, () => {
  if (page.value > totalPages.value) page.value = totalPages.value;
});

/* ---------- 페이지네이션 ---------- */
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
  padding: 24px 40px 32px;
  background: #f5f5f5;
  min-height: 100%;
  box-sizing: border-box;
}

/* 가운데 카드 정렬 */
.logs-section {
  display: flex;
  justify-content: center;
}

/* 카드 스타일 (users-card와 맞춤) */
.logs-card {
  width: 100%;
  max-width: 1080px;
  padding: 20px 24px 16px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
}

/* 사용자 목록이랑 동일한 타이틀 */
.logs-card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

/* 필터 영역 */
.filter-section {
  margin-bottom: 12px;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 16px;
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

.filter-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
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

.logs-count {
  font-size: 12px;
  color: #777;
}

/* 테이블 */
.table-header-row {
  display: grid;
  grid-template-columns: 1.6fr 1.1fr 0.8fr 1.6fr 2.4fr 0.8fr;
  padding: 10px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.th {
  display: flex;
  align-items: center;
}

/* 바디 */
.table-body {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f3f4f6;
  background-color: #f9fafb;
}

.table-row {
  display: grid;
  grid-template-columns: 1.6fr 1.1fr 0.8fr 1.6fr 2.4fr 0.8fr;
  padding: 10px 8px;
  font-size: 0.9rem;
  background-color: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s ease, transform 0.08s ease;
}

.table-row:nth-child(2n) {
  background-color: #fdfdfd;
}

.table-row:hover {
  background-color: #f3f4ff;
  transform: translateY(-1px);
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

/* 이름 강조 */
.user-name {
  font-weight: 600;
  color: #111827;
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
  padding: 24px;
  text-align: center;
  color: #888;
  background-color: #ffffff;
}

/* 하단 페이지네이션 (users 스타일) */
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
  gap: 8px;
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
}
</style>
