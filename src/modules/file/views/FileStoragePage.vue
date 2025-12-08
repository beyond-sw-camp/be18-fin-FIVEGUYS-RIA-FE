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
            v-for="file in pagedDocs"
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

          <div v-if="!loading && pagedDocs.length === 0" class="table-empty">
            조건에 맞는 문서가 없습니다.
          </div>
        </div>
      </div>

      <!-- ⭐ 페이지네이션 -->
      <div class="d-flex justify-center mt-4" v-if="totalPages > 1">
        <v-pagination v-model="page" :length="totalPages" :total-visible="5" />
      </div>
    </section>

    <!-- 🧨 파일 삭제 확인 모달 -->
    <v-dialog v-model="deleteDialog" max-width="480">
      <v-card class="del-card" rounded="xl">
        <v-card-title
          class="d-flex align-center justify-space-between del-header"
        >
          <div>
            <div class="del-title">파일 삭제</div>
            <div class="del-subtitle">
              선택한 파일을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            @click="closeDeleteDialog"
            :disabled="deleting"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-4">
          <div class="del-body">
            <div class="del-warning">
              <v-icon size="20" class="mr-2">mdi-alert-outline</v-icon>
              <div class="del-warning-text">정말 삭제하시겠습니까?</div>
            </div>

            <div v-if="deleteTargetFile" class="del-file-box">
              <div class="del-file-name">
                {{ deleteTargetFile.originalName }}
              </div>
              <div class="del-file-meta">
                <span>크기: {{ formatSize(deleteTargetFile.size) }}</span>
                <span>
                  업로드: {{ formatDate(deleteTargetFile.createdAt) }}
                </span>
                <span>사번: {{ deleteTargetFile.employeeNo || "-" }}</span>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="del-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog" :disabled="deleting">
            취소
          </v-btn>
          <v-btn
            color="red"
            variant="flat"
            @click="confirmDeleteFile"
            :loading="deleting"
          >
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/apis/http";
import { useSnackbarStore } from "@/stores/useSnackbarStore";

/** 전역 스낵바 */
const snackbar = useSnackbarStore();

/** 업로드 타입 */
const activeUploadType = ref("CONTRACT");

/** 데이터 */
const docs = ref([]);
const loading = ref(false);

/* 페이지네이션 상태 (프론트 전용) */
const page = ref(1); // 1-based
const size = ref(10);

/* 필터 */
const searchKeyword = ref("");
const selectedMime = ref("ALL");
const uploaderFilter = ref("ALL");

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

/* 삭제 모달 상태 */
const deleteDialog = ref(false);
const deleteTargetFile = ref(null);
const deleting = ref(false);

/* 문서 조회 */
const fetchDocs = async () => {
  loading.value = true;
  try {
    const endpoint =
      uploaderFilter.value === "MY" ? "/api/storages/my" : "/api/storages";

    // 백엔드: 최대 100개 가져오기
    const res = await api.get(endpoint, {
      params: { page: 0, size: 100 },
    });

    docs.value = res.data.content ?? [];
  } catch (e) {
    docs.value = [];
    snackbar.show("문서 목록 조회 실패", "error");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDocs);

/* 업로더 필터 바뀔 때 */
watch(uploaderFilter, () => {
  page.value = 1;
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

/* 필터링 적용 (전체 리스트 기준) */
const filteredDocs = computed(() => {
  return docs.value.filter((d) => {
    if (
      searchKeyword.value &&
      !d.originalName?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    ) {
      return false;
    }

    if (!matchesMimeCategory(d.mimeType, selectedMime.value)) {
      return false;
    }

    return true;
  });
});

/* 🔥 10개씩 잘라서 보여줄 리스트 */
const pagedDocs = computed(() => {
  const start = (page.value - 1) * size.value;
  const end = start + size.value;
  return filteredDocs.value.slice(start, end);
});

/* 총 페이지 수 */
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredDocs.value.length / size.value));
});

/* 업로드 Input Open */
const openFilePicker = () => {
  fileInputRef.value?.click();
};

const onFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  uploadFile(file);
  e.target.value = "";
};

const onDragOver = () => (isDragOver.value = true);
const onDragLeave = () => (isDragOver.value = false);

const onDrop = (event) => {
  isDragOver.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) uploadFile(file);
};

/* 파일 업로드 */
const uploadFile = async (file) => {
  try {
    uploading.value = true;

    const { data } = await api.post("/api/storages/upload", {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      type: activeUploadType.value,
    });

    const uploadUrl = data.uploadUrl;
    if (!uploadUrl) {
      snackbar.show("업로드 URL 생성 실패", "error");
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
    snackbar.show("파일 업로드 완료", "success");
  } catch (e) {
    snackbar.show("문서 업로드 실패", "error");
  } finally {
    uploading.value = false;
  }
};

/* 다운로드 */
const downloadFile = async (file) => {
  try {
    const { data } = await api.get(`/api/storages/${file.fileId}/download`);
    const url = data.downloadUrl;
    if (!url) {
      snackbar.show("다운로드 URL 생성 실패", "error");
      return;
    }

    window.open(url, "_blank");
  } catch (e) {
    snackbar.show("파일 다운로드 실패", "error");
  }
};

/* 삭제: 모달 열기 */
const deleteFile = (file) => {
  if (!file.canDelete) return;
  deleteTargetFile.value = file;
  deleteDialog.value = true;
};

/* 삭제 모달 닫기 */
const closeDeleteDialog = () => {
  if (deleting.value) return;
  deleteDialog.value = false;
  deleteTargetFile.value = null;
};

/* 삭제 확정 */
const confirmDeleteFile = async () => {
  if (!deleteTargetFile.value) return;

  try {
    deleting.value = true;
    await api.delete(`/api/storages/${deleteTargetFile.value.fileId}`);
    await fetchDocs();
    snackbar.show("파일 삭제 완료", "success");
  } catch (e) {
    snackbar.show("파일 삭제 실패", "error");
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
    deleteTargetFile.value = null;
  }
};

/* formatting 함수들 */
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

/* 필터 row */
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

/* 🔥 삭제 모달 스타일 */
.del-card {
  background: linear-gradient(135deg, #f9fafb, #ffffff);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.16);
}

.del-header {
  padding: 16px 20px;
}

.del-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
}

.del-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 2px;
}

.del-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.del-warning {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: #fef2f2;
  color: #b91c1c;
  font-size: 0.85rem;
}

.del-file-box {
  padding: 10px 12px;
  border-radius: 10px;
  background-color: #f3f4f6;
}

.del-file-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.del-file-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  font-size: 0.78rem;
  color: #6b7280;
}

.del-actions {
  padding: 8px 20px 14px;
}
</style>
