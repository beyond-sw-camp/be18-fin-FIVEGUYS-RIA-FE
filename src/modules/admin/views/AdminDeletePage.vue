<template>
  <div class="danger-page">
    <section class="danger-section">
      <v-card class="danger-card" elevation="0">
        <!-- 상단 헤더 -->
        <div class="danger-card-header">
          <div class="danger-card-title-wrap">
            <div class="title-left">
              <h2 class="title">문서 목록</h2>
            </div>
          </div>
        </div>

        <!-- 검색/필터 영역 -->
        <div class="search-row glass-toolbar">
          <!-- 이름 검색 -->
          <v-text-field
            v-model="searchKeyword"
            placeholder="문서 검색"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            density="comfortable"
            class="search-input"
          />

          <!-- 사번 필터 -->
          <v-select
            v-model="selectedEmployee"
            :items="employeeOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            hide-details
            density="comfortable"
            class="search-select"
          />

          <!-- MIME 타입 필터 -->
          <v-select
            v-model="selectedMime"
            :items="mimeOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            hide-details
            density="comfortable"
            class="search-select"
          />
        </div>

        <v-divider class="divider-soft" />

        <!-- 테이블 헤더 -->
        <div class="table-header-row glass-header">
          <span class="th th-name">이름</span>
          <span class="th th-type hide-on-md">형식</span>
          <span class="th th-emp">업로더 사번</span>
          <span class="th th-size">크기</span>
          <span class="th th-date hide-on-md">생성일</span>
          <span class="th th-actions">관리</span>
        </div>

        <!-- 테이블 바디 -->
        <div class="table-body">
          <div v-for="file in pagedData" :key="file.fileId" class="table-row">
            <span class="td th-name">
              <div class="file-cell">
                <div class="file-icon">
                  <v-icon size="18">mdi-file-outline</v-icon>
                </div>
                <div class="file-text">
                  <span class="file-name">{{ file.originalName }}</span>
                  <span class="file-sub">
                    {{ file.mimeType || "알 수 없는 형식" }}
                  </span>
                </div>
              </div>
            </span>

            <span class="td th-type hide-on-md">{{ file.mimeType }}</span>
            <span class="td th-emp">{{ file.employeeNo || "-" }}</span>
            <span class="td th-size">{{ formatSize(file.size) }}</span>
            <span class="td th-date hide-on-md">
              {{ formatDate(file.createdAt) }}
            </span>

            <span class="td th-actions">
              <v-btn
                size="small"
                variant="text"
                class="delete-btn pill-btn-danger"
                :disabled="!file.canDelete"
                @click="askDelete(file.fileId)"
              >
                <v-icon start size="16">mdi-trash-can-outline</v-icon>
                삭제
              </v-btn>
            </span>
          </div>

          <div v-if="pagedData.length === 0" class="table-empty">
            검색된 파일이 없습니다.
          </div>
        </div>

        <v-divider class="divider-soft" />

        <!-- 페이지네이션 -->
        <div class="table-footer">
          <div class="footer-left">
            <span class="footer-count">총 {{ filteredFiles.length }}건</span>
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
      </v-card>
    </section>

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="user-delete-card" rounded="xl">
        <v-card-title class="dialog-title">파일 삭제</v-card-title>

        <v-card-text class="dialog-body">
          <p class="dialog-text">정말 이 파일을 삭제하시겠습니까?</p>
          <p class="dialog-subtext">삭제된 파일은 복구할 수 없습니다.</p>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">취소</v-btn>
          <v-btn color="error" @click="confirmDelete">삭제</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/apis/http";
import { useSnackbarStore } from "@/stores/useSnackbarStore";

const snackbar = useSnackbarStore();

// 검색 상태
const searchKeyword = ref("");

// MIME 필터 상태
const selectedMime = ref("ALL");

// 사번 필터 상태
const selectedEmployee = ref("ALL");

// MIME 옵션
const mimeOptions = [
  { label: "모든 문서", value: "ALL" },
  { label: "IMAGE", value: "IMAGE" },
  { label: "PDF", value: "PDF" },
  { label: "Word/Excel/PPT/HWP", value: "DOCS" },
  { label: "ZIP", value: "ZIP" },
];

// 사번 드롭다운 옵션
const employeeOptions = ref([{ label: "모든 사번", value: "ALL" }]);

// 데이터
const files = ref([]);

// 페이지네이션
const page = ref(1);
const size = ref(10);

// 삭제 다이얼로그 상태
const deleteDialog = ref(false);
const deleteTargetFileId = ref(null);

// 파일 조회
// 파일 조회
const fetchFiles = async () => {
  try {
    const res = await api.get("/api/storages", {
      params: { page: 0, size: 1000 },
    });
    const list = res.data.content ?? [];

    // 🔥 createdAt 기준 최신순 정렬
    files.value = [...list].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // 사번 옵션 채우기 (중복 제거)
    const empSet = new Set();
    files.value.forEach((f) => {
      if (f.employeeNo) {
        empSet.add(f.employeeNo);
      }
    });

    employeeOptions.value = [
      { label: "모든 사번", value: "ALL" },
      ...Array.from(empSet).map((empNo) => ({
        label: String(empNo),
        value: String(empNo),
      })),
    ];
  } catch (err) {
    console.error("파일 목록 조회 실패:", err);
    snackbar.show("파일 목록 조회에 실패했습니다.", "error");
    files.value = [];
  }
};

// MIME 카테고리 매칭
const matchesMimeCategory = (mime, category) => {
  if (!mime) return false;
  const m = mime.toLowerCase();

  switch (category) {
    case "IMAGE":
      return m.startsWith("image/");
    case "PDF":
      return m === "application/pdf";
    case "DOCS":
      return [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/x-hwp",
        "application/haansofthwp",
      ].includes(m);
    case "ZIP":
      return ["application/zip", "application/x-zip-compressed"].includes(m);
    default:
      return true;
  }
};

// 필터링
const filteredFiles = computed(() =>
  files.value.filter((f) => {
    // 1) 이름 검색
    if (
      searchKeyword.value &&
      !f.originalName?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    ) {
      return false;
    }

    // 2) 사번 필터
    if (selectedEmployee.value !== "ALL") {
      const emp = f.employeeNo ? String(f.employeeNo) : "";
      if (emp !== String(selectedEmployee.value)) {
        return false;
      }
    }

    // 3) MIME 필터
    if (selectedMime.value !== "ALL") {
      if (!matchesMimeCategory(f.mimeType, selectedMime.value)) return false;
    }

    return true;
  })
);

// 필터가 바뀌면 항상 1페이지로
watch([searchKeyword, selectedMime, selectedEmployee], () => {
  page.value = 1;
});

// 페이지네이션 계산
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredFiles.value.length / size.value))
);

// 현재 페이지 데이터
const pagedData = computed(() => {
  const start = (page.value - 1) * size.value;
  return filteredFiles.value.slice(start, start + size.value);
});

// 페이지 범위 보정
watch(
  () => filteredFiles.value.length,
  () => {
    if (page.value > totalPages.value) {
      page.value = totalPages.value;
    }
  }
);

// 페이지 블럭 이동 (-10 / +10)
const jumpPrevBlock = () => {
  page.value = Math.max(1, page.value - 10);
};

const jumpNextBlock = () => {
  page.value = Math.min(totalPages.value, page.value + 10);
};

const goFirst = () => {
  page.value = 1;
};

const goLast = () => {
  page.value = totalPages.value;
};

// 삭제 다이얼로그 오픈
const askDelete = (fileId) => {
  deleteTargetFileId.value = fileId;
  deleteDialog.value = true;
};

// 삭제 다이얼로그 닫기
const closeDeleteDialog = () => {
  deleteDialog.value = false;
  deleteTargetFileId.value = null;
};

// 실제 삭제 실행
const confirmDelete = async () => {
  if (!deleteTargetFileId.value) return;

  try {
    await api.delete(`/api/storages/${deleteTargetFileId.value}`);
    snackbar.show("파일이 삭제되었습니다.", "success");
    await fetchFiles();
  } catch (err) {
    console.error("파일 삭제 실패:", err);
    snackbar.show("파일 삭제에 실패했습니다.", "error");
  } finally {
    closeDeleteDialog();
  }
};

// 포맷
const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR");
};

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

onMounted(fetchFiles);
</script>

<style scoped>
/* === 전체 레이아웃 === */
.danger-page {
  padding: 32px 40px 40px;
  min-height: 100vh;
  box-sizing: border-box;
  background: radial-gradient(circle at top left, #e0f2fe 0, transparent 45%),
    radial-gradient(circle at bottom right, #e5e7eb 0, transparent 40%),
    linear-gradient(135deg, #f9fafb, #eef2ff);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.danger-section {
  display: flex;
  justify-content: center;
  width: 100%;
}

.danger-card {
  width: 100%;
  max-width: 1120px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.24);
  padding: 22px 24px 16px;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(18px);
}

/* === 제목 & 헤더 === */
.danger-card-header {
  margin-bottom: 12px;
}

.danger-card-title-wrap {
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

.title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.03em;
  margin: 0;
}

.subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.title-right {
  display: flex;
  align-items: center;
}

/* ▶︎ 위험 느낌은 뱃지 색으로만 */
.badge-pill {
  border-radius: 999px;
  background: #fef2f2;
  color: #dc2626;
  font-weight: 500;
  padding-inline: 12px;
}

/* === 검색 영역 === */
.search-row {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  margin-bottom: 10px;
  padding: 10px 12px;
  border-radius: 16px;
}

.glass-toolbar {
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.search-input {
  flex: 1 1 auto;
  min-width: 240px;
}

.search-select {
  flex: 0 0 160px;
}

/* 부드러운 divider */
.divider-soft {
  margin: 10px 0 10px;
  opacity: 0.8;
}

/* === 테이블 헤더 === */
.table-header-row {
  display: grid;
  grid-template-columns: 2.4fr 1.4fr 1.2fr 1fr 1.4fr 0.9fr;
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
    rgba(248, 250, 252, 0.96),
    rgba(239, 246, 255, 0.9)
  );
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.th {
  display: flex;
  align-items: center;
}

/* === 테이블 바디 === */
.table-body {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.9);
  background-color: rgba(249, 250, 251, 0.7);
}

.table-row {
  display: grid;
  grid-template-columns: 2.4fr 1.4fr 1.2fr 1fr 1.4fr 0.9fr;
  padding: 10px 12px;
  font-size: 0.9rem;
  background-color: #ffffff;
  border-bottom: 1px solid rgba(243, 244, 246, 0.9);
  transition: background-color 0.18s ease, transform 0.08s ease,
    box-shadow 0.16s ease;
}

/* zebra */
.table-row:nth-child(2n) {
  background-color: #fbfbff;
}

/* hover */
.table-row:hover {
  background-color: #eef2ff;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(129, 140, 248, 0.16);
}

.td {
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 파일 셀 */
.file-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.file-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: linear-gradient(135deg, #e5edff, #eff6ff);
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.9rem;
}

.file-sub {
  font-size: 0.78rem;
  color: #9ca3af;
}

/* === Empty message === */
.table-empty {
  padding: 26px 8px;
  text-align: center;
  color: #9ca3af;
  background-color: #ffffff;
}

/* === 삭제 버튼 === */
.delete-btn {
  text-transform: none;
  font-size: 0.8rem;
  color: #b91c1c;
}

.pill-btn-danger {
  border-radius: 999px;
  padding-inline: 10px;
}

/* === 페이지네이션 === */
.table-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 12px 0 4px;
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
  text-transform: none;
  font-size: 0.8rem;
  min-width: 40px;
}

.pill-btn {
  border-radius: 999px;
  padding-inline: 10px;
  background: transparent;
  color: #4b5563;
}

.pill-btn:hover:not(:disabled) {
  background: rgba(226, 232, 240, 0.9);
}

.page-info {
  color: #4b5563;
  font-size: 13px;
  padding-inline: 8px;
}

/* 다이얼로그 */
.user-delete-card {
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
}

.dialog-title {
  font-size: 1rem;
  font-weight: 700;
  padding: 14px 18px 4px;
}

.dialog-body {
  padding: 4px 18px 6px;
}

.dialog-text {
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 4px;
}

.dialog-subtext {
  font-size: 0.8rem;
  color: #9ca3af;
}

.dialog-actions {
  padding: 8px 16px 12px;
}

/* 반응형 */
@media (max-width: 1000px) {
  .danger-page {
    padding: 20px 16px 28px;
  }

  .danger-card {
    padding-inline: 18px;
  }

  .danger-card-title-wrap {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-row {
    flex-wrap: wrap;
  }

  .search-input {
    min-width: 100%;
  }

  .search-select {
    flex: 1 1 50%;
  }

  .table-header-row,
  .table-row {
    grid-template-columns: 2.8fr 1.4fr 1.4fr 1.2fr;
  }

  .hide-on-md {
    display: none;
  }
}
</style>
