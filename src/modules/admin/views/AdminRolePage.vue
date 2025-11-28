<template>
  <div class="admin-role-page">
    <!-- 중앙 카드 영역 -->
    <section class="users-section">
      <v-card class="users-card" elevation="0">
        <!-- 카드 상단: 제목 + 검색/필터 -->
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
              v-model="selectedRoleFilter"
              :items="roleFilterOptions"
              item-title="label"
              item-value="value"
              density="comfortable"
              variant="outlined"
              hide-details
              class="toolbar-select"
              label="모든 역할"
            />
          </div>
        </div>

        <v-divider />

        <!-- 테이블 헤더 -->
        <div class="table-header-row">
          <span class="th th-name">이름</span>
          <span class="th th-email">이메일</span>
          <span class="th th-role">권한</span>
        </div>

        <v-divider />

        <!-- 테이블 바디 -->
        <div class="table-body">
          <div v-for="user in pagedUsers" :key="user.id" class="table-row">
            <span class="td th-name">{{ user.name }}</span>
            <span class="td th-email">{{ user.email }}</span>

            <span class="td th-role">
              <v-select
                v-model="user.roleId"
                :items="roleOptions"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                class="role-select"
                @update:model-value="(val) => changeUserRole(user, val)"
              />
            </span>
          </div>

          <div v-if="pagedUsers.length === 0" class="table-empty">
            등록된 사용자가 없습니다.
          </div>
        </div>

        <v-divider />

        <!-- 하단 페이지네이션 -->
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
import { ref, computed, onMounted, watch } from "vue";
import api from "@/apis/http";
import { useSnackbarStore } from "@/stores/useSnackbarStore";

/* 전역 스낵바 스토어 */
const snackbar = useSnackbarStore();

/* ---------------------------
 * 상태 / 상수
 * ------------------------- */
const searchText = ref("");
const selectedRoleFilter = ref("ALL");

const roleFilterOptions = [
  { label: "모든 역할", value: "ALL" },
  { label: "관리자", value: 1 }, // ROLE_ADMIN
  { label: "팀장", value: 2 }, // ROLE_SALES_LEAD
  { label: "팀원", value: 3 }, // ROLE_SALES_MEMBER
];

const roleOptions = [
  { label: "관리자", value: 1 },
  { label: "팀장", value: 2 },
  { label: "팀원", value: 3 },
];

// 사용자 목록 & 페이지네이션(프론트)
const users = ref([]);
const page = ref(1);
const pageSize = 10;

/* ---------------------------
 * API 호출
 * ------------------------- */
const fetchUsers = async () => {
  try {
    const res = await api.get("/api/admin/users", {
      params: {
        page: 0,
        size: 1000,
      },
    });

    const data = res.data;
    users.value = Array.isArray(data.content) ? data.content : [];
  } catch (error) {
    console.error("사용자 목록 조회 실패:", error);
    snackbar.show("사용자 목록 조회에 실패했습니다.", "error");
    users.value = [];
  }
};

/* ---------------------------
 * 권한 변경
 * ------------------------- */
const changeUserRole = async (user, newRoleId) => {
  const previousRoleId = user.roleId;

  try {
    await api.patch(`/api/admin/users/${user.id}/changes`, {
      roleId: newRoleId,
    });
    snackbar.show("권한이 변경되었습니다.", "success");
    await fetchUsers();
  } catch (e) {
    console.error("권한 변경 실패:", e);
    // 실패 시 롤백
    user.roleId = previousRoleId;
    snackbar.show("권한 변경 중 오류가 발생했습니다.", "error");
  }
};

/* ---------------------------
 * 필터 + 프론트 페이지네이션
 * ------------------------- */
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchSearch =
      !searchText.value ||
      user.name?.includes(searchText.value) ||
      user.email?.includes(searchText.value);

    const matchRole =
      selectedRoleFilter.value === "ALL" ||
      String(user.roleId) === String(selectedRoleFilter.value);

    return matchSearch && matchRole;
  });
});

const totalPages = computed(() => {
  const len = filteredUsers.value.length;
  return len === 0 ? 1 : Math.ceil(len / pageSize);
});

const pagedUsers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredUsers.value.slice(start, start + pageSize);
});

// 검색어나 필터가 바뀌면 1페이지로 리셋
watch([searchText, selectedRoleFilter], () => {
  page.value = 1;
});

// 필터 결과가 줄어들었을 때 페이지 보정
watch(
  () => filteredUsers.value.length,
  () => {
    if (page.value > totalPages.value) {
      page.value = totalPages.value;
    }
  }
);

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.admin-role-page {
  padding: 24px 40px 32px;
  background-color: #f5f5f5;
  min-height: 100%;
  box-sizing: border-box;
}

/* 상단 타이틀 */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #222;
}

/* 중앙 카드 정렬 */
.users-section {
  display: flex;
  justify-content: center;
}

.users-card {
  width: 100%;
  max-width: 800px;
  border-radius: 16px;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  padding: 20px 24px 12px;
}

/* 카드 헤더 */
.users-card-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.users-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* 검색 / 필터 */
.users-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.toolbar-search {
  flex: 1 1 auto;
  min-width: 260px;
}

.toolbar-select {
  flex: 0 0 150px;
}

/* 테이블 레이아웃 */
.table-header-row {
  display: grid;
  grid-template-columns: 1.2fr 2fr 1.2fr;
  padding: 10px 4px;
  font-size: 13px;
  font-weight: 600;
  color: #777;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 1.2fr 2fr 1.2fr;
  padding: 10px 4px;
  font-size: 14px;
  align-items: center;
}

.th,
.td {
  padding: 0 8px;
}

.role-select :deep(.v-field) {
  min-height: 36px;
}

.table-empty {
  padding: 24px 8px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 하단 페이지네이션 */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 4px;
}

.footer-btn {
  min-width: 72px;
}

.page-info {
  font-size: 13px;
  color: #555;
}
</style>
