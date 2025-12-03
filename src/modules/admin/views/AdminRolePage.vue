<template>
  <div class="admin-role-page">
    <section class="users-section">
      <v-card class="users-card" elevation="0">
        <!-- 카드 상단 -->
        <div class="users-card-header">
          <div class="users-card-title-wrap">
            <div class="title-left">
              <h2 class="users-card-title">사용자 & 권한 관리</h2>
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

        <v-divider class="divider-soft" />

        <!-- 테이블 헤더 -->
        <div class="table-header-row glass-header">
          <span class="th th-name">이름</span>
          <span class="th th-email">이메일</span>
          <span class="th th-role">권한</span>
        </div>

        <!-- 테이블 바디 -->
        <div class="table-body">
          <div v-for="user in pagedUsers" :key="user.id" class="table-row">
            <span class="td th-name">
              <div class="user-cell">
                <div class="user-avatar">
                  {{ user.name?.charAt(0) || "?" }}
                </div>
                <div class="user-text">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-email-sub">{{ user.email }}</span>
                </div>
              </div>
            </span>

            <span class="td th-email hide-on-md">
              {{ user.email }}
            </span>

            <!-- 권한 칩 + 드롭다운 -->
            <span class="td th-role">
              <v-menu>
                <template #activator="{ props }">
                  <v-chip
                    v-bind="props"
                    class="role-chip clickable-chip"
                    :class="getRoleChipClass(user.roleId)"
                    size="small"
                    variant="flat"
                  >
                    <span class="dot" />
                    {{ getRoleLabel(user.roleId) }}
                    <v-icon end size="16">mdi-chevron-down</v-icon>
                  </v-chip>
                </template>

                <v-list class="role-menu">
                  <v-list-item
                    v-for="role in roleOptions"
                    :key="role.value"
                    @click="changeUserRole(user, role.value)"
                  >
                    <v-chip
                      size="small"
                      class="role-chip role-option-chip"
                      :class="getRoleChipClass(role.value)"
                      variant="flat"
                    >
                      <span class="dot" />
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

        <v-divider class="divider-soft" />

        <!-- 하단 페이지네이션 -->
        <div class="table-footer">
          <div class="footer-left">
            <span class="footer-count">총 {{ filteredUsers.length }}명</span>
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
              페이지
              <strong>{{ page }}</strong>
              /
              {{ totalPages }}
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

const roleOptions = [
  { label: "관리자", value: 1 },
  { label: "팀장", value: 2 },
  { label: "팀원", value: 3 },
];

const getRoleLabel = (roleId) =>
  roleOptions.find((r) => r.value === roleId)?.label || "알 수 없음";

const getRoleColor = (roleId) => {
  switch (roleId) {
    case 1:
      return "관리자";
    case 2:
      return "팀장";
    case 3:
      return "팀원";
    default:
      return "알 수 없음";
  }
};

const getRoleChipClass = (roleId) => {
  switch (Number(roleId)) {
    case 1:
      return "role-admin";
    case 2:
      return "role-leader";
    case 3:
      return "role-member";
    default:
      return "role-member";
  }
};

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
    const s = searchText.value?.trim();

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

/* 가운데 카드 정렬 */
.users-section {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* 카드 */
.users-card {
  width: 100%;
  max-width: 960px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(148, 163, 184, 0.24);
  padding: 20px 24px 16px;
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
  min-width: 250px;
}

.toolbar-select {
  flex: 0 0 160px;
}

/* 부드러운 divider */
.divider-soft {
  margin: 12px 0 6px;
  opacity: 0.7;
}

/* 테이블 헤더 */
.table-header-row {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 2.4fr) minmax(0, 1.6fr);
  align-items: center;
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

/* 행 스타일 */
.table-row {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 2.4fr) minmax(0, 1.6fr);
  align-items: center;
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
  padding: 0 6px;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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

/* 권한 칩 */
.role-chip {
  color: #ffffff !important;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.22);
}

.role-option-chip {
  box-shadow: none;
}

.clickable-chip {
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}

.clickable-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(30, 64, 175, 0.35);
  opacity: 0.96;
}

.role-admin {
  background: linear-gradient(135deg, #f97316, #ef4444);
}

.role-leader {
  background: linear-gradient(135deg, #3b82f6, #4f46e5);
}

.role-member {
  background: linear-gradient(135deg, #22c55e, #14b8a6);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background-color: rgba(248, 250, 252, 0.9);
}

/* 하단 페이지네이션 */
.table-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding-top: 12px;
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
  min-width: 40px;
  text-transform: none;
  font-size: 0.8rem;
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
  font-size: 13px;
  color: #4b5563;
  padding-inline: 8px;
}

/* 반응형 */
@media (max-width: 900px) {
  .admin-role-page {
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
    flex: 0 0 140px;
  }

  .hide-on-md {
    display: none;
  }

  .table-header-row,
  .table-row {
    grid-template-columns: minmax(0, 2.4fr) minmax(0, 1.8fr);
  }
}
</style>
