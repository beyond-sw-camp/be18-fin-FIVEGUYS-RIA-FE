<template>
  <div class="admin-users-page">
    <section class="users-section">
      <v-card class="users-card" elevation="0">
        <!-- 상단 -->
        <div class="users-card-header">
          <h2 class="users-card-title">사용자 목록</h2>

          <div class="users-toolbar">
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

            <v-btn color="primary" class="toolbar-add-btn" @click="openDialog">
              + 사용자 추가
            </v-btn>
          </div>
        </div>

        <v-divider />

        <!-- 테이블 헤더 -->
        <div class="table-header-row">
          <span class="th th-name">이름</span>
          <span class="th th-emp">사번</span>
          <span class="th th-dept">부서</span>
          <span class="th th-position">직책</span>
          <span class="th th-email">이메일</span>
          <span class="th th-status">상태</span>
          <span class="th th-actions">삭제</span>
        </div>

        <v-divider />

        <!-- 테이블 바디 -->
        <div class="table-body">
          <div v-for="user in pagedUsers" :key="user.id" class="table-row">
            <span class="td th-name">{{ user.name }}</span>
            <span class="td th-emp">{{ user.employeeNo }}</span>
            <span class="td th-dept">{{ user.department }}</span>
            <span class="td th-position">{{ user.position }}</span>
            <span class="td th-email">{{ user.email }}</span>

            <span class="td th-status">
              <v-chip
                :color="getStatusColor(user.state)"
                size="small"
                variant="flat"
              >
                {{ getStatusLabel(user.state) }}
              </v-chip>
            </span>

            <span class="td th-actions">
              <v-btn
                size="small"
                color="error"
                variant="outlined"
                @click="openDeleteDialog(user)"
              >
                삭제
              </v-btn>
            </span>
          </div>

          <div v-if="pagedUsers.length === 0" class="table-empty">
            등록된 사용자가 없습니다.
          </div>
        </div>

        <v-divider />

        <!-- 페이지네이션 -->
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

    <!-- 추가 모달 -->
    <v-dialog v-model="showDialog" max-width="600">
      <v-card>
        <v-card-title class="dialog-title">사용자 추가</v-card-title>

        <v-card-text class="dialog-body">
          <v-text-field
            v-model="form.employeeNo"
            label="사번"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field
            v-model="form.name"
            label="이름"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field
            v-model="form.password"
            type="password"
            label="비밀번호"
            variant="outlined"
            class="mb-3"
          />

          <v-select
            v-model="form.roleId"
            :items="roleSelectOptions"
            item-title="label"
            item-value="value"
            label="권한"
            variant="outlined"
            class="mb-1"
          />

          <v-text-field
            v-model="form.email"
            label="이메일"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field
            v-model="form.department"
            label="부서"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field
            v-model="form.position"
            label="직책"
            variant="outlined"
            class="mb-1"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">취소</v-btn>
          <v-btn color="primary" :loading="saving" @click="createUser">
            저장
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 모달 -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="dialog-title">사용자 삭제</v-card-title>

        <v-card-text>
          <p>
            <strong>{{ deleteTargetUser?.name }}</strong> 사용자를
            삭제하시겠습니까?
          </p>
        </v-card-text>

        <v-card-actions>
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
  { label: "권한 1", value: 1 },
  { label: "권한 2", value: 2 },
  { label: "권한 3", value: 3 },
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

const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "INACTIVE":
      return "grey";
    case "TEMP_PASSWORD":
      return "warning";
    default:
      return "grey";
  }
};

/* 데이터 & 페이지네이션 */
const users = ref([]);
const page = ref(1);
const pageSize = 10;

/** 전체 사용자 목록 가져오기 (PageResponse → content만 사용) */
const fetchUsers = async () => {
  try {
    const res = await api.get("/api/admin/users", {
      params: { page: 0, size: 1000 }, // 충분히 큰 숫자로 전체 조회
    });

    const data = res.data;
    users.value = Array.isArray(data.content) ? data.content : [];
  } catch (e) {
    console.error("사용자 목록 조회 실패:", e);
    users.value = [];
  }
};

/** 필터 적용된 전체 목록 */
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

/** 현재 페이지에 보여줄 목록 */
const pagedUsers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredUsers.value.slice(start, start + pageSize);
});

/** 필터 결과 기준 총 페이지 수 */
const totalPages = computed(() => {
  const len = filteredUsers.value.length;
  return len === 0 ? 1 : Math.ceil(len / pageSize);
});

/** 필터 바뀔 때는 항상 1페이지로 */
watch([searchText, selectedTeam, selectedRole, selectedStatus], () => {
  page.value = 1;
});

/* 초기 로딩 */
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
  } finally {
    closeDeleteDialog();
  }
};

/* 추가 모달 */
const showDialog = ref(false);
const saving = ref(false);
const form = ref({
  employeeNo: "",
  name: "",
  password: "",
  roleId: null,
  email: "",
  department: "",
  position: "",
});

const openDialog = () => {
  showDialog.value = true;
};
const closeDialog = () => {
  showDialog.value = false;
};

const createUser = async () => {
  try {
    saving.value = true;
    await api.post("/api/admin/create", {
      ...form.value,
      roleId: Number(form.value.roleId),
    });
    await fetchUsers();
    closeDialog();
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.admin-users-page {
  padding: 24px 40px 32px;
  background-color: #f5f5f5;
  min-height: 100%;
  box-sizing: border-box;
}
.users-section {
  display: flex;
  justify-content: center;
}
.users-card {
  width: 100%;
  max-width: 960px;
  border-radius: 16px;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  padding: 20px 24px 12px;
}
.users-card-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.users-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.toolbar-search {
  flex: 1 1 auto;
  min-width: 250px;
}
.toolbar-select {
  flex: 0 0 150px;
}
.table-header-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr 2fr 0.8fr 0.8fr;
  padding: 10px 4px;
  font-size: 13px;
  font-weight: 600;
  color: #777;
}
.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr 2fr 0.8fr 0.8fr;
  padding: 10px 4px;
}
.table-empty {
  padding: 24px;
  text-align: center;
}
.table-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 0 4px;
}
</style>
