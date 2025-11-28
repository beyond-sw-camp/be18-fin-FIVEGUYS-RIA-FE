<template>
  <div class="danger-page">
    <section class="danger-section">
      <v-card class="danger-card" elevation="0">
        <!-- 제목 -->
        <h2 class="title">문서 목록</h2>

        <!-- 검색/필터 영역 -->
        <div class="search-row">
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

        <!-- 사용자 페이지랑 동일하게: 상단 구분선 -->
        <v-divider />

        <!-- 테이블 헤더 -->
        <div class="table-header-row">
          <span class="th th-name">이름</span>
          <span class="th th-type">형식</span>
          <span class="th th-emp">업로더 사번</span>
          <span class="th th-size">크기</span>
          <span class="th th-date">생성일</span>
          <span class="th th-actions">삭제</span>
        </div>

        <v-divider />

        <!-- 테이블 바디 -->
        <div class="table-body">
          <div v-for="file in pagedData" :key="file.fileId" class="table-row">
            <span class="td th-name">{{ file.originalName }}</span>
            <span class="td th-type">{{ file.mimeType }}</span>
            <span class="td th-emp">{{ file.employeeNo || "-" }}</span>
            <span class="td th-size">{{ formatSize(file.size) }}</span>
            <span class="td th-date">{{ formatDate(file.createdAt) }}</span>

            <span class="td th-actions">
              <v-btn
                size="small"
                color="error"
                variant="outlined"
                :disabled="!file.canDelete"
                @click="deleteFile(file.fileId)"
              >
                삭제
              </v-btn>
            </span>
          </div>

          <div v-if="pagedData.length === 0" class="table-empty">
            검색된 파일이 없습니다.
          </div>
        </div>

        <v-divider />

        <!-- 페이지네이션 (스타일도 사용자 페이지와 동일) -->
        <div class="table-footer">
          <v-btn
            variant="outlined"
            size="small"
            class="footer-btn"
            :disabled="page === 1"
            @click="page--"
          >
            이전
          </v-btn>

          <span class="page-info">페이지 {{ page }} / {{ totalPages }}</span>

          <v-btn
            variant="outlined"
            size="small"
            class="footer-btn"
            :disabled="page === totalPages"
            @click="page++"
          >
            다음
          </v-btn>
        </div>
      </v-card>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/apis/http";

// 검색 상태
const searchKeyword = ref("");

// MIME 필터 상태
const selectedMime = ref("ALL");

// 🔹 사번 필터 상태
const selectedEmployee = ref("ALL");

// MIME 옵션
const mimeOptions = [
  { label: "모든 문서", value: "ALL" },
  { label: "IMAGE", value: "IMAGE" },
  { label: "PDF", value: "PDF" },
  { label: "Word/Excel/PPT/HWP", value: "DOCS" },
  { label: "ZIP", value: "ZIP" },
];

// 🔹 사번 드롭다운 옵션
const employeeOptions = ref([{ label: "모든 사번", value: "ALL" }]);

// 데이터
const files = ref([]);

// 페이지네이션
const page = ref(1);
const size = ref(10);

// 파일 조회
const fetchFiles = async () => {
  const res = await api.get("/api/storages", {
    params: { page: 0, size: 1000 },
  });
  const list = res.data.content ?? [];
  files.value = list;

  // 🔹 사번 옵션 채우기 (중복 제거)
  const empSet = new Set();
  list.forEach((f) => {
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

// 페이지네이션 계산
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredFiles.value.length / size.value))
);

const pagedData = computed(() => {
  const start = (page.value - 1) * size.value;
  return filteredFiles.value.slice(start, start + size.value);
});

// 삭제
const deleteFile = async (fileId) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  try {
    await api.delete(`/api/storages/${fileId}`);
    alert("삭제되었습니다.");
    fetchFiles();
  } catch (err) {
    console.error(err);
    alert("삭제 실패");
  }
};

// 포맷
const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR");
};

const formatSize = (bytes) => {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

onMounted(fetchFiles);
</script>

<style scoped>
/* 페이지 뼈대 – 사용자 관리 페이지와 동일 */
.danger-page {
  padding: 24px 40px 32px;
  background: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
}

.danger-section {
  display: flex;
  justify-content: center;
}

.danger-card {
  width: 100%;
  max-width: 960px; /* users-card랑 동일 */
  border-radius: 16px;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  padding: 20px 24px 12px;
}

.title {
  font-size: 22px;
  font-weight: 700;
}

/* 검색 영역 */
.search-row {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.search-input {
  flex: 1 1 auto;
  min-width: 250px;
}

.search-select {
  flex: 0 0 160px;
}

/* 테이블 헤더/바디 – users 페이지와 동일 스타일 */
.table-header-row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1fr 1.2fr 0.8fr;
  padding: 10px 4px;
  font-size: 13px;
  font-weight: 600;
  color: #777;
}

.table-body {
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1fr 1.2fr 0.8fr;
  padding: 10px 4px;
  font-size: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.table-row:last-of-type {
  border-bottom: none;
}

.th,
.td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-empty {
  padding: 24px;
  text-align: center;
  color: #888;
}

/* 페이지네이션 – users 페이지와 동일 */
.table-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px 0 4px;
  align-items: center;
}

.footer-btn {
  min-width: 56px;
}

.page-info {
  font-size: 13px;
  color: #555;
}
</style>
