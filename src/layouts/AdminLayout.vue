<template>
  <div class="admin-layout">
    <!-- 왼쪽 사이드바 -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <img :src="logoSrc" alt="logo" class="sidebar-logo" />
        <div class="sidebar-title-wrap">
          <span class="sidebar-title-main">RIA Console</span>
          <span class="sidebar-title-sub">관리 콘솔</span>
        </div>
      </div>

      <nav class="menu">
        <RouterLink
          v-for="item in menuItems"
          :key="item.name"
          :to="item.to"
          class="menu-item"
          :class="{ active: route.name === item.name }"
        >
          <div class="menu-pill">
            <v-icon class="menu-icon" :icon="item.icon" />
            <span class="menu-label">{{ item.label }}</span>
          </div>
        </RouterLink>
      </nav>
    </aside>

    <!-- 오른쪽 전체 영역 -->
    <main class="admin-main">
      <!-- 상단 현재 페이지 이름 + 로그아웃 아이콘 -->
      <header class="admin-header">
        <h1 class="admin-header-title">
          {{ route.meta.title ?? "관리자 페이지" }}
        </h1>

        <div class="admin-header-actions">
          <v-btn
            icon
            variant="text"
            elevation="0"
            class="logout-btn"
            @click="logoutHandler"
          >
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </div>
      </header>

      <!-- 실제 페이지 들어가는 곳 -->
      <section class="admin-content">
        <RouterView />
      </section>

      <footer class="admin-footer">
        © 2025 갤러리아 관리 콘솔. All rights reserved.
      </footer>
    </main>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { logout as logoutApi } from "@/apis/auth";
import logoSrc from "/Users/joyongju/git/be18-fin-FIVEGUYS-RIA-FE/src/assets/로고.png";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const menuItems = [
  {
    name: "AdminUsers",
    label: "사용자 관리",
    to: "/admin/users",
    icon: "mdi-account",
  },
  {
    name: "AdminRoles",
    label: "권한 설정",
    to: "/admin/roles",
    icon: "mdi-shield-check",
  },
  {
    name: "AdminLogs",
    label: "로그 관리",
    to: "/admin/logs",
    icon: "mdi-notebook-edit",
  },
  {
    name: "AdminDanger",
    label: "삭제 페이지",
    to: "/admin/danger",
    icon: "mdi-cog",
  },
];

const logoutHandler = async () => {
  try {
    await logoutApi(); // 서버 로그아웃 호출
  } catch (e) {
    console.error(e);
  } finally {
    authStore.forceLogout(); // 토큰/상태 초기화
    router.push("/login"); // 로그인으로 이동
  }
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  box-sizing: border-box;
  background: radial-gradient(circle at top left, #e0f2fe 0, transparent 45%),
    radial-gradient(circle at bottom right, #e5e7eb 0, transparent 40%),
    linear-gradient(135deg, #f9fafb, #eef2ff);
  font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

/* ===== 사이드바 ===== */
.admin-sidebar {
  width: 240px;
  padding: 22px 18px;
  background: rgba(249, 250, 251, 0.94);
  border-right: 1px solid rgba(209, 213, 219, 0.9);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 8px 0 24px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding: 4px 4px 8px;
  border-radius: 12px;
}

.sidebar-logo {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  object-fit: contain;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
  background: #ffffff;
}

.sidebar-title-wrap {
  display: flex;
  flex-direction: column;
}

.sidebar-title-main {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.03em;
  color: #111827;
}

.sidebar-title-sub {
  font-size: 11px;
  color: #9ca3af;
}

/* 메뉴 영역 */
.menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* RouterLink */
.menu-item {
  text-decoration: none;
  color: inherit;
}

.menu-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 999px;
  font-size: 14px;
  color: #4b5563;
  transition: background-color 0.18s ease, color 0.18s ease,
    transform 0.08s ease, box-shadow 0.16s ease;
}

.menu-pill:hover {
  background: rgba(226, 232, 240, 0.95);
  transform: translateY(-1px);
}

/* 아이콘 스타일 */
.menu-icon {
  font-size: 20px;
  color: #6b7280;
}

/* 텍스트 */
.menu-label {
  flex: 1;
}

/* 활성 메뉴 */
.menu-item.active .menu-pill {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #f9fafb;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.4);
}

.menu-item.active .menu-icon {
  color: #e5f0ff;
}

/* ===== 오른쪽 메인 영역 ===== */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 상단 헤더 */
.admin-header {
  padding: 20px 32px 10px;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid rgba(209, 213, 219, 0.9);
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.admin-header-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: #111827;
}

/* 헤더 오른쪽 액션 영역 */
.admin-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logout-btn {
  color: #6b7280;
}

.logout-btn:hover {
  background: rgba(229, 231, 235, 0.9);
}

/* 컨텐츠 영역 */
.admin-content {
  flex: 1;
  padding: 24px 32px;
  overflow: auto;
  background: transparent; /* 각 페이지에서 카드가 떠 보이도록 */
}

/* 푸터 */
.admin-footer {
  padding: 10px 32px 14px;
  font-size: 12px;
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid rgba(209, 213, 219, 0.9);
}

/* 반응형(좁은 화면에서) */
@media (max-width: 900px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-inline: 20px;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  }

  .menu {
    flex-direction: row;
    gap: 4px;
  }

  .menu-pill {
    padding-inline: 10px;
  }
}
</style>
