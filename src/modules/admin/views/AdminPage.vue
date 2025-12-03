<template>
  <div class="admin-users-page">
    <section class="users-section">
      <v-card class="users-card" elevation="0">
        <!-- 상단 -->
        <div class="users-card-header">
          <div class="users-card-title-wrap">
            <div class="title-left">
              <h2 class="users-card-title">사용자 관리</h2>
            </div>
          </div>

          <div class="users-toolbar glass-toolbar">
            <v-text-field
              v-model="searchText"
              density="comfortable"
              variant="outlined"
              placeholder="이름 또는 이메일 검색"
              hide-details
              prepend-inner-icon="mdi-magnify"
              class="toolbar-search"
            />

            <v-select
              v-model="selectedTeam"
              :items="teamOptions"
              item-title="label"
              item-value="value"
              density="comfortable"
              variant="outlined"
              hide-details
              class="toolbar-select"
              label="모든 팀"
            />

            <v-select
              v-model="selectedRole"
              :items="roleFilterOptions"
              item-title="label"
              item-value="value"
              density="comfortable"
              variant="outlined"
              hide-details
              class="toolbar-select"
              label="모든 역할"
            />

            <v-select
              v-model="selectedStatus"
              :items="statusFilterOptions"
              item-title="label"
              item-value="value"
              density="comfortable"
              variant="outlined"
              hide-details
              class="toolbar-select"
              label="모든 상태"
            />

            <v-btn
              class="toolbar-add-btn"
              rounded="xl"
              color="primary"
              @click="openDialog"
            >
              <v-icon start>mdi-account-plus-outline</v-icon>
              사용자 추가
            </v-btn>
          </div>
        </div>

        <v-divider class="divider-soft" />

        <!-- 테이블 헤더 -->
        <div class="table-header-row glass-header">
          <span class="th th-name">사용자</span>
          <span class="th th-emp hide-on-md">사번</span>
          <span class="th th-dept">부서</span>
          <span class="th th-position">직책</span>
          <span class="th th-email hide-on-md">이메일</span>
          <span class="th th-status">상태</span>
          <span class="th th-actions">관리</span>
        </div>

        <!-- 테이블 바디 -->
        <div class="table-body">
          <div v-for="user in pagedUsers" :key="user.id" class="table-row">
            <!-- 이름 + 서브 정보 -->
            <span class="td th-name">
              <div class="user-cell">
                <div class="user-avatar">
                  {{ user.name?.charAt(0) || "?" }}
                </div>
                <div class="user-text">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-email-sub">
                    {{ user.email }}
                  </span>
                </div>
              </div>
            </span>

            <span class="td th-emp hide-on-md">{{ user.employeeNo }}</span>
            <span class="td th-dept">{{ user.department }}</span>
            <span class="td th-position">{{ user.position }}</span>
            <span class="td th-email hide-on-md">{{ user.email }}</span>

            <span class="td th-status">
              <v-chip
                size="small"
                variant="flat"
                class="status-chip"
                :class="getStatusClass(user.state)"
              >
                <span class="dot" />
                {{ getStatusLabel(user.state) }}
              </v-chip>
            </span>

            <span class="td th-actions">
              <v-btn
                size="small"
                variant="text"
                class="delete-btn pill-btn-danger"
                @click="openDeleteDialog(user)"
              >
                <v-icon start size="16">mdi-trash-can-outline</v-icon>
                삭제
              </v-btn>
            </span>
          </div>

          <div v-if="pagedUsers.length === 0" class="table-empty">
            등록된 사용자가 없습니다.
          </div>
        </div>

        <v-divider class="divider-soft" />

        <!-- 페이지네이션 -->
        <div class="table-footer">
          <div class="footer-left">
            <span class="footer-count"> 총 {{ filteredUsers.length }}명 </span>
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

    <!-- 추가 모달 -->
    <v-dialog v-model="showDialog" max-width="640">
      <v-card class="user-add-card" rounded="xl">
        <!-- 상단 헤더 -->
        <v-card-title
          class="d-flex align-center justify-space-between user-add-header"
        >
          <div>
            <div class="user-add-title">사용자 추가</div>
            <div class="user-add-subtitle">
              조직에 새 계정을 추가하고 기본 정보를 설정합니다.
            </div>
          </div>

          <v-btn icon variant="text" @click="closeDialog" :disabled="saving">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <!-- 폼 영역 -->
        <v-card-text class="user-add-body">
          <!-- 섹션: 기본 정보 -->
          <div class="user-add-section">
            <div class="user-add-section-title">기본 정보</div>

            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.employeeNo"
                  label="사번"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.name"
                  label="이름"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
            </v-row>

            <v-row dense class="mt-1">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.password"
                  type="password"
                  label="비밀번호"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.roleId"
                  :items="roleSelectOptions"
                  item-title="label"
                  item-value="value"
                  label="권한"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </div>

          <!-- 섹션: 조직 정보 -->
          <div class="user-add-section mt-4">
            <div class="user-add-section-title">조직 정보</div>

            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="form.email"
                  label="이메일"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
            </v-row>

            <v-row dense class="mt-1">
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.department"
                  :items="departmentOptions"
                  item-title="label"
                  item-value="value"
                  label="부서"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.position"
                  :items="positionOptions"
                  item-title="label"
                  item-value="value"
                  label="직책"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <!-- 하단 버튼 -->
        <v-card-actions class="user-add-actions">
          <v-spacer />
          <v-btn
            variant="text"
            class="user-add-cancel"
            @click="closeDialog"
            :disabled="saving"
          >
            취소
          </v-btn>
          <v-btn
            class="user-add-save"
            color="primary"
            :loading="saving"
            @click="createUser"
          >
            저장
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 모달 -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="user-delete-card" rounded="xl">
        <v-card-title class="dialog-title"> 사용자 삭제 </v-card-title>

        <v-card-text class="dialog-body">
          <p class="dialog-text">
            <span class="dialog-user-name">
              {{ deleteTargetUser?.name }}
            </span>
            사용자를 삭제하시겠습니까?
          </p>
          <p class="dialog-subtext">삭제된 사용자는 복구할 수 없습니다.</p>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">취소</v-btn>
          <v-btn color="error" @click="confirmDeleteUser">삭제</v-btn>
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

/* 필터 상태 */
const searchText = ref("");
const selectedTeam = ref("ALL");
const selectedRole = ref("ALL");
const selectedStatus = ref("ALL");

const teamOptions = [
  { label: "모든 팀", value: "ALL" },
  { label: "관리자", value: "ADMIN" },
  { label: "영업팀", value: "SALES" },
];

const roleFilterOptions = [
  { label: "모든 역할", value: "ALL" },
  { label: "어드민", value: 1 },
  { label: "팀장", value: 2 },
  { label: "팀원", value: 3 },
];
const roleSelectOptions = [...roleFilterOptions.slice(1)];

const statusFilterOptions = [
  { label: "전체", value: "ALL" },
  { label: "활성", value: "ACTIVE" },
  { label: "비활성", value: "INACTIVE" },
  { label: "미변경", value: "TEMP_PASSWORD" },
];

const getStatusLabel = (status) => {
  switch (status) {
    case "ACTIVE":
      return "활성";
    case "INACTIVE":
      return "비활성";
    case "TEMP_PASSWORD":
      return "미변경";
    default:
      return "-";
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "ACTIVE":
      return "status-active";
    case "INACTIVE":
      return "status-inactive";
    case "TEMP_PASSWORD":
      return "status-temp";
    default:
      return "status-inactive";
  }
};

/* 부서 / 직책 옵션 */
const departmentOptions = [
  { label: "관리자", value: "ADMIN" },
  { label: "영업팀", value: "SALES" },
];

const positionOptions = [
  { label: "시스템 관리자", value: "시스템 관리자" },
  { label: "영업팀장", value: "영업팀장" },
  { label: "영업팀원", value: "영업팀원" },
];

/* 데이터 & 페이지네이션 */
const users = ref([]);
const page = ref(1);
const pageSize = 10;

const fetchUsers = async () => {
  try {
    const res = await api.get("/api/admin/users", {
      params: { page: 0, size: 1000 },
    });

    const data = res.data;
    users.value = Array.isArray(data.content) ? data.content : [];
  } catch (e) {
    console.error("사용자 목록 조회 실패:", e);
    users.value = [];
    snackbar.show("사용자 목록 조회에 실패했습니다.", "error");
  }
};

const filteredUsers = computed(() => {
  const list = Array.isArray(users.value) ? users.value : [];

  return list.filter((user) => {
    const search =
      !searchText.value ||
      user.name?.includes(searchText.value) ||
      user.email?.includes(searchText.value);

    const team =
      selectedTeam.value === "ALL" || user.department === selectedTeam.value;

    const roleId = user.roleId ?? user.role_id ?? user.role?.id ?? null;
    const role =
      selectedRole.value === "ALL" ||
      String(roleId) === String(selectedRole.value);

    const status =
      selectedStatus.value === "ALL" || user.state === selectedStatus.value;

    return search && team && role && status;
  });
});

const pagedUsers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredUsers.value.slice(start, start + pageSize);
});

const totalPages = computed(() => {
  const len = filteredUsers.value.length;
  return len === 0 ? 1 : Math.ceil(len / pageSize);
});

/* 필터 변경 시 1페이지로 */
watch([searchText, selectedTeam, selectedRole, selectedStatus], () => {
  page.value = 1;
});

/* 페이지 블럭 이동 (-10 / +10) */
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

onMounted(fetchUsers);

/* 삭제 모달 */
const deleteDialog = ref(false);
const deleteTargetUser = ref(null);

const openDeleteDialog = (user) => {
  deleteTargetUser.value = user;
  deleteDialog.value = true;
};

const closeDeleteDialog = () => {
  deleteDialog.value = false;
  deleteTargetUser.value = null;
};

const confirmDeleteUser = async () => {
  if (!deleteTargetUser.value) return;
  try {
    await api.delete(`/api/admin/users/${deleteTargetUser.value.id}`);
    await fetchUsers();
    snackbar.show("사용자를 삭제했습니다.", "success");
  } catch (e) {
    console.error("사용자 삭제 실패:", e);
    snackbar.show("사용자 삭제에 실패했습니다.", "error");
  } finally {
    closeDeleteDialog();
  }
};

/* 추가 모달 */
const showDialog = ref(false);
const saving = ref(false);

/* 초기 form 상태 */
const initialFormState = {
  employeeNo: "",
  name: "",
  password: "",
  roleId: null,
  email: "",
  department: "",
  position: "",
};

/* form ref */
const form = ref({ ...initialFormState });

/* form 리셋 */
const resetForm = () => {
  form.value = { ...initialFormState };
};

const openDialog = () => {
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

/* 모달 닫힐 때 자동 리셋 */
watch(showDialog, (val) => {
  if (!val) {
    resetForm();
  }
});

const createUser = async () => {
  try {
    if (!form.value.employeeNo || !form.value.name || !form.value.password) {
      snackbar.show("사번 / 이름 / 비밀번호는 필수입니다.", "error");
      return;
    }

    saving.value = true;
    await api.post("/api/admin/create", {
      ...form.value,
      roleId: Number(form.value.roleId),
    });
    await fetchUsers();
    snackbar.show("사용자를 추가했습니다.", "success");
    closeDialog();
  } catch (e) {
    console.error("사용자 생성 실패:", e);
    snackbar.show("사용자 생성에 실패했습니다.", "error");
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.admin-users-page {
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

.users-section {
  display: flex;
  justify-content: center;
  width: 100%;
}

.users-card {
  width: 100%;
  max-width: 1120px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(148, 163, 184, 0.24);
  padding: 22px 24px 16px;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.18);
}

/* 상단 영역 */
.users-card-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.users-card-title-wrap {
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

.users-card-title {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #0f172a;
  margin: 0;
}

.users-card-subtitle {
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

/* 툴바 */
.users-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  padding: 10px 12px;
  border-radius: 16px;
}

.glass-toolbar {
  background: rgba(248, 250, 252, 0.7);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.toolbar-search {
  flex: 1 1 auto;
  min-width: 220px;
}

.toolbar-select {
  flex: 0 0 150px;
}

.toolbar-add-btn {
  text-transform: none;
  font-weight: 600;
  font-size: 0.9rem;
  padding-inline: 16px;
  box-shadow: 0 8px 18px rgba(59, 130, 246, 0.35);
}

/* 부드러운 divider */
.divider-soft {
  margin: 14px 0 8px;
  opacity: 0.75;
}

/* 테이블 헤더 */
.table-header-row {
  display: grid;
  grid-template-columns: 2.3fr 1fr 1.2fr 1.2fr 2.2fr 0.9fr 0.9fr;
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

/* 테이블 바디 */
.table-body {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.9);
  background-color: rgba(249, 250, 251, 0.7);
}

.table-row {
  display: grid;
  grid-template-columns: 2.3fr 1fr 1.2fr 1.2fr 2.2fr 0.9fr 0.9fr;
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

.td {
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 사용자 셀 */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #22c55e);
  color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
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
  font-size: 0.92rem;
}

.user-email-sub {
  font-size: 0.78rem;
  color: #9ca3af;
}

/* 빈 상태 */
.table-empty {
  padding: 26px 8px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  background-color: #ffffff;
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

.status-active {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.status-inactive {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.status-temp {
  background: linear-gradient(135deg, #eab308, #f97316);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background-color: rgba(248, 250, 252, 0.9);
}

/* 삭제 버튼 */
.delete-btn {
  text-transform: none;
  font-size: 0.8rem;
  color: #b91c1c;
}

.pill-btn-danger {
  border-radius: 999px;
  padding-inline: 10px;
}

/* 하단 푸터 */
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

/* 사용자 추가 모달 */
.user-add-card {
  background: rgba(248, 250, 252, 0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.user-add-header {
  padding: 16px 22px 12px;
}

.user-add-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
}

.user-add-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 2px;
}

.user-add-body {
  padding: 16px 22px 8px;
}

/* 섹션 박스 */
.user-add-section {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(229, 231, 235, 0.9);
}

.user-add-section-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

/* 하단 버튼 영역 */
.user-add-actions {
  padding: 10px 22px 18px;
}

.user-add-cancel {
  text-transform: none;
  font-size: 0.85rem;
  color: #6b7280;
}

.user-add-save {
  text-transform: none;
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 96px;
  border-radius: 999px;
}

/* 삭제 모달 */
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

.dialog-user-name {
  font-weight: 600;
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
  .admin-users-page {
    padding: 20px 16px 28px;
  }

  .users-card {
    padding-inline: 18px;
  }

  .users-card-title-wrap {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-select {
    flex: 0 0 130px;
  }

  .table-header-row,
  .table-row {
    grid-template-columns: 2.6fr 1.4fr 1.4fr 1.1fr 1fr;
  }

  .hide-on-md {
    display: none;
  }
}
</style>
