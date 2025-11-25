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
                {{ log.logName || "-" }}
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
const totalPages = ref(1);
const totalElements = ref(0);

/* ---------- 셀렉트 옵션 ---------- */
const userOptions = ref([{ label: "모든 사용자", value: "ALL" }]);

const actionOptions = [
  { label: "모든 작업", value: "ALL" },
  { label: "사용자 정보 변경", value: "USER_UPDATE" },
  { label: "상품 재고 조회", value: "PRODUCT_VIEW" },
  { label: "로그인", value: "LOGIN" },
  { label: "보고서 다운로드", value: "REPORT_DOWNLOAD" },
  { label: "권한 설정 변경", value: "ROLE_CHANGE" },
];

/* 임시 토큰 */
const TEST_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIwMTljNWVmZS1iYTI2LTQ3NTYtYjQ0Yy0zZTA0YjU3ZjhmNGYiLCJjYXRlZ29yeSI6ImFjY2VzcyIsImVtcGxveWVlTm8iOiJBMDAxIiwicm9sZSI6IlJPTEVfQURNSU4iLCJkZXBhcnRtZW50IjoiQURNSU4iLCJpYXQiOjE3NjM5Njc5ODksImV4cCI6MTc2Mzk2OTc4OX0.EM8IYJm-cpvT02LNGb1FML_s3YjuKn2WMrlokgF_spw";

/* ---------- 상태 표시 ---------- */
const getLogStatus = (log) => {
  // 백엔드 필드명이 바뀌어도 여기만 맞춰주면 됨
  return log.status ?? log.state ?? log.result ?? null;
};

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

/* ---------- 포맷터 ---------- */
const formatDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("ko-KR");
};

const formatResource = (resource) => {
  if (!resource) return "-";
  // 줄바꿈/여러 공백을 한 칸으로
  return resource.replace(/\s+/g, " ");
};

/* ---------- API ---------- */
const fetchLogs = async () => {
  try {
    const res = await api.get("/api/admin/logs", {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      params: {
        page: page.value - 1,
        size: size.value,
        // TODO: 날짜/사용자/작업/키워드 filter 백엔드 연동 시 여기 params에 추가
      },
    });

    const data = res.data;
    logs.value = data.content ?? [];
    totalPages.value = data.totalPages ?? 1;
    totalElements.value = data.totalElements ?? logs.value.length;
  } catch (err) {
    console.error("로그 조회 실패:", err);
  }
};

const fetchUsersForFilter = async () => {
  try {
    const res = await api.get("/api/admin/users", {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      params: { page: 0, size: 1000 },
    });

    const list = res.data.content ?? [];
    userOptions.value = [
      { label: "모든 사용자", value: "ALL" },
      ...list.map((u) => ({
        label: `${u.name} (${u.employeeNo})`,
        value: u.id,
      })),
    ];
  } catch (err) {
    console.error("필터용 사용자 목록 조회 실패:", err);
  }
};

/* ---------- computed ---------- */
const pagedLogs = computed(() => logs.value);

/* ---------- 필터/페이지 이벤트 ---------- */
const applyFilter = async () => {
  page.value = 1;
  await fetchLogs();
};

const resetFilter = async () => {
  startDate.value = "";
  endDate.value = "";
  selectedUser.value = "ALL";
  selectedAction.value = "ALL";
  keyword.value = "";
  page.value = 1;
  await fetchLogs();
};

const goFirst = () => {
  page.value = 1;
};

const goLast = () => {
  page.value = totalPages.value;
};

/* ---------- 라이프사이클 ---------- */
watch(page, () => {
  fetchLogs();
});

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
  /* 타임스탬프/이름/사번/작업명/리소스/상태 */
  grid-template-columns: 1.6fr 1.1fr 0.8fr 1.6fr 2.4fr 0.8fr;
  padding: 10px 8px;
  font-size: 14px;
  align-items: center;
}

.th,
.td {
  padding: 0 8px;
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

/* 상태 칼럼 칩 가운데 */
.th-status,
.td.th-status {
  display: flex;
  align-items: center;
}

/* 작업명: 2줄 고정 + 줄바꿈 허용 */
.td.th-action {
  white-space: normal !important;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 최대 2줄 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  height: calc(1.4em * 2); /* 2줄 높이 고정 */
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
