<template>
  <div class="admin-role-page">
    <section class="users-section">
      <v-card class="users-card" elevation="0">
        <!-- 카드 상단 -->
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

            <!-- 권한 칩 + 드롭다운 -->
            <span class="td th-role">
              <v-menu>
                <template #activator="{ props }">
                  <v-chip
                    v-bind="props"
                    class="role-chip clickable-chip"
                    :color="getRoleColor(user.roleId)"
                    size="small"
                    variant="flat"
                  >
                    {{ getRoleLabel(user.roleId) }}
                    <v-icon end small>mdi-chevron-down</v-icon>
                  </v-chip>
                </template>

                <v-list>
                  <v-list-item
                    v-for="role in roleOptions"
                    :key="role.value"
                    @click="changeUserRole(user, role.value)"
                  >
                    <v-chip
                      :color="role.color"
                      size="small"
                      class="role-chip"
                      variant="flat"
                    >
                      {{ role.label }}
                    </v-chip>
                  </v-list-item>
                </v-list>
              </v-menu>
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

const snackbar = useSnackbarStore();

/* ---------------------------
 * 상태 / 상수
 * ------------------------- */
const searchText = ref("");
const selectedRoleFilter = ref("ALL");

const roleFilterOptions = [
  { label: "모든 역할", value: "ALL" },
  { label: "관리자", value: 1 },
  { label: "팀장", value: 2 },
  { label: "팀원", value: 3 },
];

// 칩 색상 포함 옵션
const roleOptions = [
  { label: "관리자", value: 1, color: "red" },
  { label: "팀장", value: 2, color: "blue" },
  { label: "팀원", value: 3, color: "green" },
];

const getRoleLabel = (roleId) =>
  roleOptions.find((r) => r.value === roleId)?.label || "알수없음";

const getRoleColor = (roleId) =>
  roleOptions.find((r) => r.value === roleId)?.color || "green";

const users = ref([]);
const page = ref(1);
const pageSize = 10;

/* ---------------------------
 * API 호출
 * ------------------------- */
const fetchUsers = async () => {
  try {
    const res = await api.get("/api/admin/users", {
      params: { page: 0, size: 1000 },
    });

    users.value = Array.isArray(res.data.content) ? res.data.content : [];
  } catch (error) {
    console.error("사용자 목록 조회 실패:", error);
    snackbar.show("사용자 목록 조회에 실패했습니다.", "error");
  }
};

/* ---------------------------
 * 권한 변경
 * ------------------------- */
const changeUserRole = async (user, newRoleId) => {
  const prev = user.roleId;

  try {
    await api.patch(`/api/admin/users/${user.id}/changes`, {
      roleId: newRoleId,
    });
    snackbar.show("권한이 변경되었습니다.", "success");
    await fetchUsers();
  } catch (err) {
    console.error("권한 변경 실패:", err);
    user.roleId = prev; // 롤백
    snackbar.show("권한 변경 실패", "error");
  }
};

/* ---------------------------
 * 필터 / 페이지네이션
 * ------------------------- */
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const s = searchText.value;

    const matchSearch = !s || user.name?.includes(s) || user.email?.includes(s);

    const matchRole =
      selectedRoleFilter.value === "ALL" ||
      String(user.roleId) === String(selectedRoleFilter.value);

    return matchSearch && matchRole;
  });
});

const totalPages = computed(() =>
  filteredUsers.value.length === 0
    ? 1
    : Math.ceil(filteredUsers.value.length / pageSize)
);

const pagedUsers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredUsers.value.slice(start, start + pageSize);
});

watch([searchText, selectedRoleFilter], () => {
  page.value = 1;
});

watch(
  () => filteredUsers.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value;
  }
);

onMounted(fetchUsers);
</script>

<style scoped>
.admin-role-page {
  padding: 24px 40px 32px;
  background-color: #f5f5f5;
}

.users-section {
  display: flex;
  justify-content: center;
}

.users-card {
  width: 100%;
  max-width: 900px;
  border-radius: 16px;
  background: white;
  border: 1px solid #e5e5e5;
  padding: 20px 24px;
}

.users-card-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.users-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.users-toolbar {
  display: flex;
  gap: 8px;
}

.toolbar-search {
  flex: 1 1 auto;
}

.toolbar-select {
  flex: 0 0 150px;
}

.table-header-row,
.table-row {
  display: grid;
  grid-template-columns: 1.2fr 2fr 1.2fr;
  align-items: center;
  padding: 10px 4px;
}

.th,
.td {
  padding: 0 8px;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-empty {
  padding: 24px 8px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 권한 칩 */
.role-chip {
  color: white !important;
  font-weight: 600;
  padding: 4px 12px;
}

.clickable-chip {
  cursor: pointer;
  transition: 0.15s ease;
}

.clickable-chip:hover {
  opacity: 0.9;
}

/* 하단 페이지네이션 */
.table-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
}

.footer-btn {
  min-width: 72px;
}

.page-info {
  font-size: 13px;
  color: #555;
}
</style>
