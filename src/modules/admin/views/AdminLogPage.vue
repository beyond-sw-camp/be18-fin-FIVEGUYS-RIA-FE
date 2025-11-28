<template>
  <div class="admin-log-page">
    <section class="logs-section">
      <v-card class="logs-card" elevation="0">
        <!-- 🔷 필터 영역 -->
        <div class="filter-section">
          <h2 class="section-title">로그 필터</h2>

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

            <!-- 키워드 -->
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
            <v-btn color="primary" @click="applyFilter">필터 적용</v-btn>
            <v-btn variant="outlined" @click="resetFilter">필터 초기화</v-btn>
          </div>
        </div>

        <v-divider class="mt-4 mb-2" />

        <!-- 🔷 활동 로그 -->
        <div class="logs-section-body">
          <div class="logs-header">
            <div class="logs-title-group">
              <h2 class="section-title">활동 로그</h2>
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
                {{ log.userName || "-" }}
              </span>

              <!-- 사번 -->
              <span class="td th-emp">
                {{ log.employeeNo || "-" }}
              </span>

              <!-- 작업명 (2줄 고정) -->
              <span class="td th-action">
                <span class="action-text">
                  {{ log.logName || "-" }}
                </span>
              </span>

              <!-- 영향받은 리소스 (한 줄, 말줄임) -->
              <span class="td th-resource">
                {{ formatResource(log.resource) }}
              </span>

              <!-- 상태 (SUCCESS/FAILED → 성공/실패) -->
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

          <!-- 페이지네이션 -->
          <div class="table-footer">
            <div class="pagination-wrapper">
              <v-btn
                variant="outlined"
                size="small"
                class="footer-btn"
                :disabled="page === 1"
                @click="goFirst"
              >
                «
              </v-btn>

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

              <v-btn
                variant="outlined"
                size="small"
                class="footer-btn"
                :disabled="page === totalPages"
                @click="page++"
              >
                다음
              </v-btn>

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
          </div>
        </div>
      </v-card>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/apis/http";

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

const actionOptions = [
  { label: "모든 작업", value: "ALL" },
  { label: "사용자 정보 변경", value: "USER_UPDATE" },
  { label: "상품 재고 조회", value: "PRODUCT_VIEW" },
  { label: "로그인", value: "LOGIN" },
  { label: "보고서 다운로드", value: "REPORT_DOWNLOAD" },
  { label: "권한 설정 변경", value: "ROLE_CHANGE" },
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
// ✔ 인터셉터가 자동으로 JWT 붙여줌 → headers 필요 없음
const fetchLogs = async () => {
  try {
    const res = await api.get("/api/admin/logs", {
      params: { page: 0, size: 1000 },
    });

    logs.value = Array.isArray(res.data.content) ? res.data.content : [];
  } catch (err) {
    console.error("로그 조회 실패:", err);
    logs.value = [];
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
  }
};

/* ---------- 필터링 로직 ---------- */
const filteredLogs = computed(() =>
  logs.value.filter((log) => {
    const createdDate = log.createdAt ? log.createdAt.slice(0, 10) : null;

    // 날짜 필터
    if (startDate.value && createdDate < startDate.value) return false;
    if (endDate.value && createdDate > endDate.value) return false;

    // 사용자 필터
    const empNo = log.employeeNo ?? null;
    if (
      selectedUser.value !== "ALL" &&
      String(empNo) !== String(selectedUser.value)
    )
      return false;

    // 키워드 필터
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

/* ---------- 페이지 보정 ---------- */
const totalPages = computed(() => {
  const count = filteredLogs.value.length;
  return count === 0 ? 1 : Math.ceil(count / size.value);
});

watch(filteredLogs, () => {
  if (page.value > totalPages.value) page.value = totalPages.value;
});

/* ---------- 페이지네이션 ---------- */
const pagedLogs = computed(() => {
  const start = (page.value - 1) * size.value;
  return filteredLogs.value.slice(start, start + size.value);
});

const totalElements = computed(() => filteredLogs.value.length);

/* ---------- 필터 이벤트 ---------- */
const applyFilter = () => (page.value = 1);

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
  min-height: 100vh;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
}

.page-desc {
  margin-top: 4px;
  font-size: 13px;
  color: #777;
}

.logs-section {
  display: flex;
  justify-content: center;
}

.logs-card {
  width: 100%;
  max-width: 1080px;
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e5e5e5;
}

/* 필터 */
.filter-section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
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

/* 로그 영역 */
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

/* 테이블 공통 */
.table-header-row,
.table-row {
  display: grid;
  grid-template-columns: 1.6fr 1.1fr 0.8fr 1.6fr 2.4fr 0.8fr;
  padding: 10px 8px;
  font-size: 14px;
  align-items: flex-start; /* ← 행 안의 셀들을 위로 정렬 */
}

/* 모든 셀 공통: 위쪽 정렬 + 기본 줄 간격 */
.th,
.td {
  padding: 4px 8px;
  display: flex;
  align-items: flex-start; /* ← 가운데(X), 위쪽(O) */
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 숫자 타임스탬프 예쁘게 */
.th-time {
  font-variant-numeric: tabular-nums;
}

/* 헤더 스타일 */
.table-header-row .th {
  font-size: 13px;
  font-weight: 600;
  color: #777;
}

/* 상태 칼럼 – 위에서 이미 flex라서 따로 안 해도 됨 */
.th-status,
.td.th-status {
  /* 이 부분은 지워도 됨. 남겨두고 싶으면 아래만 두기 */
  align-items: center;
}

/* 작업명 셀: 행 안에서 세로 가운데 정렬 */
.td.th-action {
  /* display:flex, align-items:center는 위에서 이미 공통으로 들어감 */
}

/* 작업명 셀만 살짝 아래로 내리기 */
/* 작업명 셀: 여러 줄 허용 + 전체 보이기 */
.td.th-action {
  white-space: normal; /* 줄바꿈 허용 */
  overflow: visible; /* 잘라내지 말고 다 보여줘 */
  text-overflow: unset; /* … 없애기 */
}

/* 작업명 텍스트: camelCase도 줄바꿈 되도록 */
.td.th-action .action-text {
  white-space: normal;
  word-break: break-all; /* AdminUserController.changeUserRole 같은 것도 줄바꿈 */
}

/* 빈 데이터 */
.table-empty {
  padding: 24px;
  text-align: center;
  color: #888;
}

/* 페이지네이션 */
.table-footer {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.pagination-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.footer-btn {
  min-width: 40px;
}

.page-info {
  font-size: 13px;
  color: #555;
}
</style>
