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
            <v-text-field v-model="searchText" density="comfortable" variant="outlined" placeholder="이름 또는 이메일 검색"
              hide-details prepend-inner-icon="mdi-magnify" class="toolbar-search" />

            <v-select v-model="selectedRoleFilter" :items="roleFilterOptions" item-title="label" item-value="value"
              density="comfortable" variant="outlined" hide-details class="toolbar-select" label="모든 역할" />
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
                  <v-chip v-bind="props" class="role-chip clickable-chip" :class="getRoleChipClass(user.roleId)"
                    size="small" variant="flat">
                    <span class="dot" />
                    {{ getRoleLabel(user.roleId) }}
                    <v-icon end size="16">mdi-chevron-down</v-icon>
                  </v-chip>
                </template>

                <v-list class="role-menu">
                  <v-list-item v-for="role in roleOptions" :key="role.value" @click="changeUserRole(user, role.value)">
                    <v-chip size="small" class="role-chip role-option-chip" :class="getRoleChipClass(role.value)"
                      variant="flat">
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

        <!-- 하단 페이지네이션 + 디버그 버튼 -->
        <div class="table-footer">
          <div class="footer-left">
            <span class="footer-count">총 {{ filteredUsers.length }}명</span>
          </div>

          <div class="footer-center">
            <!-- 첫 페이지 -->
            <v-btn variant="text" size="small" class="footer-btn pill-btn" :disabled="page === 1" @click="goFirst">
              «
            </v-btn>

            <!-- -10 페이지 -->
            <v-btn variant="text" size="small" class="footer-btn pill-btn" :disabled="page === 1"
              @click="jumpPrevBlock">
              -10
            </v-btn>

            <!-- 이전 1페이지 -->
            <v-btn variant="text" size="small" class="footer-btn pill-btn" :disabled="page === 1" @click="page--">
              이전
            </v-btn>

            <span class="page-info">
              페이지
              <strong>{{ page }}</strong>
              /
              {{ totalPages }}
            </span>

            <!-- 다음 1페이지 -->
            <v-btn variant="text" size="small" class="footer-btn pill-btn" :disabled="page === totalPages"
              @click="page++">
              다음
            </v-btn>

            <!-- +10 페이지 -->
            <v-btn variant="text" size="small" class="footer-btn pill-btn" :disabled="page === totalPages"
              @click="jumpNextBlock">
              +10
            </v-btn>

            <!-- 마지막 페이지 -->
            <v-btn variant="text" size="small" class="footer-btn pill-btn" :disabled="page === totalPages"
              @click="goLast">
              »
            </v-btn>
          </div>

          <div class="footer-right">
            <!-- 숨김용 디버그 버튼 -->
            <v-btn size="small" variant="text" class="footer-debug-btn" @click="debugDialog = true">
              집계 디버그
            </v-btn>
          </div>
        </div>
      </v-card>
    </section>

    <!-- 디버그 모달 -->
    <v-dialog v-model="debugDialog" max-width="720">
      <v-card class="debug-card">
        <v-card-title class="debug-title">
          매출/정산 집계 디버그 엔드포인트
          <v-spacer />
          <v-btn icon size="small" variant="text" @click="debugDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-subtitle class="debug-subtitle">
          아래 엔드포인트는 운영에는 노출되지 않는 수동 집계용 디버그 API이다.
        </v-card-subtitle>

        <v-divider class="mb-2" />

        <v-card-text class="debug-body">
          <div v-for="group in debugApiGroups" :key="group.key" class="debug-group">
            <h3 class="debug-group-title">
              {{ group.title }}
              <span class="debug-base-path">{{ group.basePath }}</span>
            </h3>

            <v-list density="compact" class="debug-list">
              <v-list-item v-for="ep in group.endpoints" :key="ep.path" class="debug-endpoint-item">
                <div class="debug-endpoint-header">
                  <v-chip size="x-small" class="debug-method-chip" variant="flat">
                    {{ ep.method }}
                  </v-chip>
                  <code class="debug-path">
                {{ group.basePath }}{{ ep.path }}
              </code>
                  <v-spacer />
                  <v-btn size="x-small" variant="tonal" class="debug-run-btn"
                    @click.stop="openDebugRunDialog(group, ep)">
                    실행
                  </v-btn>
                </div>
                <div class="debug-desc">
                  {{ ep.description }}
                </div>
                <div v-if="ep.params?.length" class="debug-params">
                  <span class="debug-params-label">파라미터:</span>
                  <span v-for="p in ep.params" :key="p.name" class="debug-param-chip">
                    {{ p.name }}: {{ p.desc }}
                  </span>
                </div>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="debug-actions">
          <v-spacer />
          <v-btn variant="text" @click="debugDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 실행 파라미터 입력 모달 -->
    <v-dialog v-model="runDialog" max-width="420">
      <v-card>
        <v-card-title class="run-title">
          디버그 집계 실행
        </v-card-title>

        <v-card-subtitle v-if="selectedEndpoint" class="run-subtitle">
          <code class="run-path">
        {{ selectedEndpoint.basePath }}{{ selectedEndpoint.path }}
      </code>
        </v-card-subtitle>

        <v-card-text>
          <div v-if="selectedEndpoint?.params?.length">
            <v-text-field v-for="p in selectedEndpoint.params" :key="p.name" v-model="paramValues[p.name]"
              :label="`${p.name} (${p.desc})`" density="comfortable" variant="outlined" hide-details="auto"
              class="mb-2" />
          </div>
          <div v-else>
            추가 파라미터 없이 바로 실행된다.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="runDialog = false">취소</v-btn>
          <v-btn color="primary" variant="flat" @click="executeDebug">
            실행
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
import {
  triggerDailySales,
  triggerMonthlySales,
  triggerYearlySales,
  triggerMonthlySettlement,
  triggerLastMonthSettlement,
  triggerDailyTemporarySettlement,
  triggerYesterdayTemporarySettlement,
} from "@/apis/debug";

const snackbar = useSnackbarStore();

/* 상태 / 상수 */
const searchText = ref("");
const selectedRoleFilter = ref("ALL");
const debugDialog = ref(false);

const runDialog = ref(false);
const selectedEndpoint = ref(null);
const paramValues = ref({});

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

/* 연도 전체 일매출 루프 */
const runDailyForYear = async (year) => {
  for (let month = 1; month <= 12; month++) {
    const days = new Date(year, month, 0).getDate();
    for (let day = 1; day <= days; day++) {
      await triggerDailySales(year, month, day);
    }
  }
};

/* 디버그 API 메타데이터 */
const debugApiGroups = ref([
  {
    key: "sales",
    title: "매출 집계 디버그 (SalesDebugController)",
    basePath: "/debug/sales",
    endpoints: [
      {
        method: "POST",
        path: "/daily",
        action: "salesDaily",
        description:
          "지정한 연/월/일 기준으로 SALES_DAILY 집계를 강제 실행한다.",
        params: [
          { name: "year", desc: "연도 (예: 2024)" },
          { name: "month", desc: "월 (예: 1)" },
          { name: "day", desc: "일 (예: 15)" },
        ],
      },
      {
        method: "POST",
        path: "/daily (year-batch)",
        action: "salesDailyYear",
        description:
          "특정 연도의 모든 날짜(1월1일~12월31일)에 대해 SALES_DAILY를 순차 실행한다.",
        params: [{ name: "year", desc: "연도 (예: 2024)" }],
      },
      {
        method: "POST",
        path: "/monthly",
        action: "salesMonthly",
        description:
          "지정한 연/월 기준으로 SALES_MONTHLY 집계를 강제 실행한다.",
        params: [
          { name: "year", desc: "연도 (예: 2024)" },
          { name: "month", desc: "월 (예: 1)" },
        ],
      },
      {
        method: "POST",
        path: "/yearly",
        action: "salesYearly",
        description:
          "지정한 연도 기준으로 SALES_YEARLY 집계를 강제 실행한다.",
        params: [{ name: "year", desc: "연도 (예: 2024)" }],
      },
    ],
  },
  {
    key: "settlement",
    title: "정산 집계 디버그 (SettlementDebugController)",
    basePath: "/debug/settlement",
    endpoints: [
      {
        method: "POST",
        path: "/monthly",
        action: "settlementMonthly",
        description:
          "특정 연·월에 대한 REGULAR 매장의 월 정산을 강제 실행한다.",
        params: [
          { name: "year", desc: "연도 (예: 2024)" },
          { name: "month", desc: "월 (예: 1)" },
        ],
      },
      {
        method: "POST",
        path: "/last-month",
        action: "settlementLastMonth",
        description:
          "현재 시점 기준 지난달의 REGULAR 매장 월 정산을 강제 실행한다.",
        params: [],
      },
      {
        method: "POST",
        path: "/daily/temporary",
        action: "settlementDailyTemporary",
        description:
          "지정한 날짜(LocalDate)에 대해 TEMPORARY 매장의 일 정산을 강제 실행한다.",
        params: [{ name: "date", desc: "YYYY-MM-DD 형식 (예: 2023-01-15)" }],
      },
      {
        method: "POST",
        path: "/daily/temporary/yesterday",
        action: "settlementDailyTemporaryYesterday",
        description:
          "현재 기준 어제 날짜로 TEMPORARY 매장의 일 정산을 강제 실행한다.",
        params: [],
      },
    ],
  },
]);

/* 실행 다이얼로그 열기 */
const openDebugRunDialog = (group, ep) => {
  selectedEndpoint.value = {
    ...ep,
    basePath: group.basePath,
  };
  const init = {};
  (ep.params || []).forEach((p) => {
    init[p.name] = "";
  });
  paramValues.value = init;
  runDialog.value = true;
};

/* 디버그 실행 */
const executeDebug = async () => {
  if (!selectedEndpoint.value) return;

  try {
    const action = selectedEndpoint.value.action;
    const params = paramValues.value;

    switch (action) {
      case "salesDaily":
        await triggerDailySales(
          Number(params.year),
          Number(params.month),
          Number(params.day)
        );
        break;
      case "salesDailyYear":
        await runDailyForYear(Number(params.year));
        break;
      case "salesMonthly":
        await triggerMonthlySales(Number(params.year), Number(params.month));
        break;
      case "salesYearly":
        await triggerYearlySales(Number(params.year));
        break;
      case "settlementMonthly":
        await triggerMonthlySettlement(
          Number(params.year),
          Number(params.month)
        );
        break;
      case "settlementLastMonth":
        await triggerLastMonthSettlement();
        break;
      case "settlementDailyTemporary":
        await triggerDailyTemporarySettlement(params.date);
        break;
      case "settlementDailyTemporaryYesterday":
        await triggerYesterdayTemporarySettlement();
        break;
      default:
        throw new Error("지원하지 않는 디버그 액션");
    }

    snackbar.show("디버그 집계 요청이 전송되었습니다.", "success");
    runDialog.value = false;
  } catch (e) {
    console.error(e);
    snackbar.show("디버그 집계 요청에 실패했습니다.", "error");
  }
};

/* API 호출 */
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

/* 권한 변경 */
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
    user.roleId = prev;
    snackbar.show("권한 변경 실패", "error");
  }
};

/* 필터 / 페이지네이션 */
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const s = searchText.value?.trim();

    const matchSearch =
      !s || user.name?.includes(s) || user.email?.includes(s);

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

.users-section {
  display: flex;
  justify-content: center;
  width: 100%;
}

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
  gap: 8px;
}

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

.divider-soft {
  margin: 12px 0 6px;
  opacity: 0.7;
}

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
  background: linear-gradient(135deg,
      rgba(248, 250, 252, 0.9),
      rgba(239, 246, 255, 0.9));
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.th {
  display: flex;
  align-items: center;
}

.table-body {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.9);
  background-color: rgba(249, 250, 251, 0.7);
}

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

.table-empty {
  padding: 26px 8px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  background-color: #ffffff;
}

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
  display: flex;
  justify-content: flex-end;
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

/* 디버그 버튼: 최대한 안 보이게 */
.footer-debug-btn {
  text-transform: none;
  font-size: 0.8rem;
  border-radius: 999px;
  padding-inline: 14px;

  color: #ffffff !important;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  min-width: 0;
  padding-inline: 0;
}

.footer-debug-btn:hover,
.footer-debug-btn:focus-visible {
  background: transparent !important;
  box-shadow: none !important;
}

/* 디버그 모달 스타일 */
.debug-card {
  border-radius: 18px;
}

.debug-title {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.debug-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
}

.debug-body {
  max-height: 420px;
  overflow-y: auto;
}

.debug-group {
  margin-bottom: 18px;
}

.debug-group-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.debug-base-path {
  font-size: 0.8rem;
  color: #6b7280;
}

.debug-list {
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.debug-endpoint-item {
  border-bottom: 1px solid #e5e7eb;
  padding-block: 8px;
}

.debug-endpoint-item:last-child {
  border-bottom: none;
}

.debug-endpoint-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.debug-method-chip {
  text-transform: none;
}

.debug-path {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 0.8rem;
}

.debug-desc {
  font-size: 0.8rem;
  color: #4b5563;
}

.debug-params {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.debug-params-label {
  font-size: 0.78rem;
  color: #6b7280;
}

.debug-param-chip {
  border-radius: 999px;
  background: #e5e7eb;
  padding: 2px 8px;
  font-size: 0.75rem;
}

.debug-actions {
  padding-inline: 16px;
}

.run-title {
  font-weight: 600;
}

.run-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
}

.run-path {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}

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
