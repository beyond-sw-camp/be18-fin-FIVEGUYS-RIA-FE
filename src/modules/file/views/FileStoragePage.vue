<template>
  <div class="storage-page">
    <!-- 업로드 영역 -->
    <section class="upload-section">
      <h2 class="section-title">문서 업로드</h2>

      <div
        class="upload-dropzone"
        :class="{ 'is-dragover': isDragOver }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        @click="openFilePicker"
      >
        <div class="upload-inner">
          <v-icon size="40" class="upload-icon">
            mdi-cloud-upload-outline
          </v-icon>
          <p class="upload-text">
            여기에 파일을 드래그하거나 클릭하여 선택하세요.
          </p>
          <v-btn
            variant="outlined"
            size="small"
            :loading="uploading"
            @click.stop="openFilePicker"
          >
            파일 선택
          </v-btn>
        </div>

        <!-- 숨겨진 input -->
        <input
          ref="fileInputRef"
          type="file"
          class="file-input-hidden"
          @change="onFileChange"
        />
      </div>
    </section>

    <!-- 문서 목록 영역 -->
    <section class="docs-section">
      <div class="docs-header">
        <h2 class="section-title">전체 문서</h2>
      </div>

      <!-- 🔽 검색/필터 영역 -->
      <div class="filter-row">
        <!-- 파일명 검색 -->
        <v-text-field
          v-model="searchKeyword"
          variant="outlined"
          density="comfortable"
          hide-details
          prepend-inner-icon="mdi-magnify"
          placeholder="파일명 검색"
          class="filter-search"
        />

        <!-- 문서 유형 필터 -->
        <v-select
          v-model="selectedMime"
          :items="mimeOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          hide-details
          class="filter-select"
          label="문서 유형"
        />

        <!-- 사번 필터 (전체 / 내 문서만) -->
        <v-select
          v-model="uploaderFilter"
          :items="uploaderOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          hide-details
          class="filter-select"
          label="업로더"
        />
      </div>

      <!-- 테이블 -->
      <div class="table-wrapper">
        <div class="docs-table-header">
          <span class="th th-name">파일명</span>
          <span class="th th-type">유형</span>
          <span class="th th-size">크기</span>
          <span class="th th-date">업로드 날짜</span>
          <span class="th th-emp">업로더 사번</span>
          <span class="th th-permission">삭제/다운로드 권한</span>
          <span class="th th-actions">액션</span>
        </div>

        <v-divider />

        <div class="docs-table-body">
          <div v-if="loading" class="table-empty">
            문서를 불러오는 중입니다…
          </div>

          <div
            v-for="file in filteredDocs"
            :key="file.fileId"
            class="docs-table-row"
          >
            <!-- 파일명 -->
            <span class="td th-name file-cell">
              <v-icon size="18" class="file-icon">mdi-file-outline</v-icon>
              <span class="file-name">{{ file.originalName }}</span>
            </span>

            <span class="td th-type">
              {{ simplifyMime(file.mimeType) }}
            </span>

            <span class="td th-size">
              {{ formatSize(file.size) }}
            </span>

            <span class="td th-date">
              {{ formatDate(file.createdAt) }}
            </span>

            <!-- 업로더 사번 -->
            <span class="td th-emp">
              {{ file.employeeNo || "-" }}
            </span>

            <!-- 삭제 권한 -->
            <span class="td th-permission">
              <v-chip
                size="small"
                :color="file.canEdit || file.canDelete ? 'success' : 'grey'"
                variant="flat"
              >
                {{ file.canEdit || file.canDelete ? "있음" : "없음" }}
              </v-chip>
            </span>

            <!-- 액션: 다운로드 + 삭제 -->
            <span class="td th-actions">
              <!-- 다운로드 -->
              <v-btn
                icon
                variant="text"
                size="small"
                @click="downloadFile(file)"
              >
                <v-icon>mdi-download</v-icon>
              </v-btn>

              <!-- 삭제: canDelete 없으면 disabled -->
              <v-btn
                icon
                variant="text"
                size="small"
                :disabled="!file.canDelete"
                @click="deleteFile(file)"
              >
                <v-icon :color="file.canDelete ? 'red' : ''">
                  mdi-trash-can-outline
                </v-icon>
              </v-btn>
            </span>
          </div>

          <div v-if="!loading && filteredDocs.length === 0" class="table-empty">
            조건에 맞는 문서가 없습니다.
          </div>
        </div>
      </div>
    </section>

    <!--  공통 스낵바 -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="2500"
      location="top center"
      class="toast-snackbar"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/apis/http";

/** 업로드 타입은 일단 기본 CONTRACT 로 세팅 (백엔드 enum 맞추기 용) */
const activeUploadType = ref("CONTRACT");

const docs = ref([]);
const loading = ref(false);

/* 필터 상태 */
const searchKeyword = ref("");
const selectedMime = ref("ALL"); // 문서 유형
const uploaderFilter = ref("ALL"); // 'ALL' | 'MY'

const mimeOptions = [
  { label: "모든 문서", value: "ALL" },
  { label: "IMAGE", value: "IMAGE" },
  { label: "PDF", value: "PDF" },
  { label: "Word/Excel/PPT/HWP", value: "DOCS" },
  { label: "ZIP", value: "ZIP" },
];

const uploaderOptions = [
  { label: "모든 사번", value: "ALL" },
  { label: "내 문서만", value: "MY" },
];

/* 업로드 상태 */
const isDragOver = ref(false);
const uploading = ref(false);
const fileInputRef = ref(null);

/*  스낵바 상태 */
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

/*  스낵바 헬퍼 */
const showSnackbar = (message, color = "error") => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};

/* 문서 조회: ALL / MY 에 따라 엔드포인트 변경 */
const fetchDocs = async () => {
  loading.value = true;
  try {
    const endpoint =
      uploaderFilter.value === "MY" ? "/api/storages/my" : "/api/storages";

    const res = await api.get(endpoint, {
      params: { page: 0, size: 100 },
    });

    docs.value = res.data.content ?? [];
  } catch (e) {
    docs.value = [];
    showSnackbar("문서 목록 조회에 실패했습니다.", "error");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDocs);

/* 업로더 필터 바뀌면 다시 조회 */
watch(uploaderFilter, () => {
  fetchDocs();
});

/* MIME 카테고리 매칭 */
const matchesMimeCategory = (mime, category) => {
  if (!mime || category === "ALL") return true;
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

/* 검색 + MIME 필터 적용된 목록 */
const filteredDocs = computed(() => {
  return docs.value.filter((d) => {
    // 파일명 검색
    if (
      searchKeyword.value &&
      !d.originalName?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    ) {
      return false;
    }

    // MIME 필터
    if (!matchesMimeCategory(d.mimeType, selectedMime.value)) {
      return false;
    }

    return true;
  });
});

/* 업로드 input 열기 */
const openFilePicker = () => {
  fileInputRef.value?.click();
};

const onFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  uploadFile(file);
  e.target.value = "";
};

const onDragOver = () => {
  isDragOver.value = true;
};
const onDragLeave = () => {
  isDragOver.value = false;
};
const onDrop = (event) => {
  isDragOver.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  uploadFile(file);
};

/* 파일 업로드 */
const uploadFile = async (file) => {
  try {
    uploading.value = true;

    const { data } = await api.post("/api/storages/upload", {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      // 타입 enum이 필수라면 일단 기본값만 사용
      type: activeUploadType.value,
    });

    const uploadUrl = data.uploadUrl;
    if (!uploadUrl) {
      showSnackbar("업로드 URL 생성에 실패했습니다.", "error");
      return;
    }

    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    await fetchDocs();
    showSnackbar("파일이 업로드되었습니다.", "success");
  } catch (e) {
    showSnackbar("문서 업로드에 실패했습니다.", "error");
  } finally {
    uploading.value = false;
  }
};

/* 파일 다운로드 */
const downloadFile = async (file) => {
  try {
    const { data } = await api.get(`/api/storages/${file.fileId}/download`);
    const url = data.downloadUrl;
    if (!url) {
      showSnackbar("다운로드 URL을 가져오지 못했습니다.", "error");
      return;
    }
    window.open(url, "_blank");
  } catch (e) {
    showSnackbar("파일 다운로드에 실패했습니다.", "error");
  }
};

/* 삭제 */
const deleteFile = async (file) => {
  if (!file.canDelete) return;
  if (!confirm("정말 삭제하시겠습니까?")) return;

  try {
    await api.delete(`/api/storages/${file.fileId}`);
    await fetchDocs();
    showSnackbar("파일이 삭제되었습니다.", "success");
  } catch (e) {
    showSnackbar("파일 삭제에 실패했습니다.", "error");
  }
};

/* 포맷 함수 */
const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR");
};

const formatSize = (bytes) => {
  if (bytes === null || bytes === undefined) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const simplifyMime = (mime) => {
  if (!mime) return "-";
  const m = mime.toLowerCase();
  if (m.startsWith("image/")) return "IMAGE";
  if (m === "application/pdf") return "PDF";
  if (
    [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/x-hwp",
      "application/haansofthwp",
    ].includes(m)
  )
    return "문서";
  if (m === "application/zip" || m === "application/x-zip-compressed")
    return "ZIP";
  return mime;
};
</script>

<style scoped>
.storage-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 업로드 영역 */
.upload-section {
  padding: 24px 32px;
  border-radius: 16px;
  border: 1px dashed #e2e2e2;
  background-color: #fbfbfb;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.upload-dropzone {
  border-radius: 12px;
  border: 1px dashed #d6d6d6;
  padding: 32px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.upload-dropzone.is-dragover {
  border-color: #1a73e8;
  background-color: #f5f9ff;
}

.upload-inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.upload-icon {
  color: #9e9e9e;
}

.upload-text {
  font-size: 14px;
  color: #666;
}

.file-input-hidden {
  display: none;
}

/* 문서 영역 */
.docs-section {
  padding: 24px 32px;
  border-radius: 16px;
  border: 1px solid #ededed;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.docs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 필터 행 */
.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.filter-search {
  flex: 1 1 auto;
  min-width: 240px;
}

.filter-select {
  flex: 0 0 180px;
}

.table-wrapper {
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

/* 테이블 */
.docs-table-header {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1.2fr 1.2fr 1fr 0.8fr;
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 600;
  color: #777;
  background-color: #fafafa;
}

.docs-table-body {
  background-color: #ffffff;
}

.docs-table-row {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1.2fr 1.2fr 1fr 0.8fr;
  padding: 12px 20px;
  font-size: 14px;
  border-top: 1px solid #f5f5f5;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  flex-shrink: 0;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.th,
.td {
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-empty {
  padding: 24px;
  text-align: center;
  color: #888;
}

/* 액션 컬럼 정렬 */
.docs-table-header .th-actions {
  display: flex;
  justify-content: center;
  align-items: center;
}

.docs-table-row .th-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.docs-table-row .th-actions .v-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  padding: 0;
}

/*  스낵바 스타일 */
.toast-snackbar {
  font-weight: 600;
}

.toast-snackbar .v-snackbar__wrapper {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}
</style>
