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
            <span class="td th-name">
              <span class="user-name">{{ user.name }}</span>
            </span>
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
          <div class="footer-left">
            <span class="footer-count">총 {{ filteredUsers.length }}명</span>
          </div>

          <div class="footer-center">
            <!-- 첫 페이지 -->
            <v-btn
              variant="outlined"
              size="small"
              class="footer-btn"
              :disabled="page === 1"
              @click="goFirst"
            >
              «
            </v-btn>

            <!-- -10 페이지 -->
            <v-btn
              variant="outlined"
              size="small"
              class="footer-btn"
              :disabled="page === 1"
              @click="jumpPrevBlock"
            >
              -10
            </v-btn>

            <!-- 이전 1페이지 -->
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

            <!-- 다음 1페이지 -->
            <v-btn
              variant="outlined"
              size="small"
              class="footer-btn"
              :disabled="page === totalPages"
              @click="page++"
            >
              다음
            </v-btn>

            <!-- +10 페이지 -->
            <v-btn
              variant="outlined"
              size="small"
              class="footer-btn"
              :disabled="page === totalPages"
              @click="jumpNextBlock"
            >
              +10
            </v-btn>

            <!-- 마지막 페이지 -->
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

          <div class="footer-right" />
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

/* 필터 바뀌면 1페이지로 */
watch([searchText, selectedRoleFilter], () => {
  page.value = 1;
});

/* 전체 개수/페이지 변화 시 현재 페이지 보정 */
watch(
  () => filteredUsers.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value;
  }
);

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
</script>

<style scoped>
.admin-role-page {
  padding: 24px 40px 32px;
  min-height: 100%;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

/* 가운데 카드 정렬 */
.users-section {
  display: flex;
  justify-content: center;
}

/* 카드 (users 페이지와 맞춤) */
.users-card {
  width: 100%;
  max-width: 960px;
  border-radius: 18px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 20px 24px 12px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
}

/* 상단 영역 */
.users-card-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 4px;
}

.users-card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* 툴바 */
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

/* 테이블 헤더 */
.table-header-row {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1.2fr;
  align-items: center;
  padding: 10px 4px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.th {
  display: flex;
  align-items: center;
}

/* 테이블 바디 */
.table-body {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f3f4f6;
  background-color: #f9fafb;
}

/* 행 스타일 */
.table-row {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1.2fr;
  align-items: center;
  padding: 10px 8px;
  font-size: 0.9rem;
  background-color: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s ease, transform 0.08s ease;
}

.table-row:nth-child(2n) {
  background-color: #fdfdfd;
}

.table-row:hover {
  background-color: #f3f4ff;
  transform: translateY(-1px);
}

.td {
  padding: 0 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 이름 굵게 */
.user-name {
  font-weight: 600;
  color: #111827;
}

/* 빈 상태 */
.table-empty {
  padding: 24px 8px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  background-color: #ffffff;
}

/* 권한 칩 */
.role-chip {
  color: #ffffff !important;
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

/* 하단 페이지네이션 (users 페이지와 맞춤) */
.table-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding-top: 10px;
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
  gap: 8px;
}

.footer-right {
  /* 오른쪽 여백용 */
}

.footer-count {
  color: #6b7280;
}

.footer-btn {
  min-width: 40px;
  text-transform: none;
  font-size: 0.8rem;
}

.page-info {
  font-size: 13px;
  color: #4b5563;
}
</style>
