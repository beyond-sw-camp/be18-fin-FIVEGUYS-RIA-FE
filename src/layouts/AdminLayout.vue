<template>
  <div class="admin-layout">
    <!-- 왼쪽 사이드바 -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">관리 콘솔</div>

      <nav class="menu">
        <RouterLink
          v-for="item in menuItems"
          :key="item.name"
          :to="item.to"
          class="menu-item"
          :class="{ active: route.name === item.name }"
        >
          <v-icon class="menu-icon" :icon="item.icon" />
          <span class="menu-label">{{ item.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- 오른쪽 전체 영역 -->
    <main class="admin-main">
      <!-- 상단 현재 페이지 이름 -->
      <header class="admin-header">
        <h1>{{ route.meta.title ?? "관리자 페이지" }}</h1>
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
import { useRoute } from "vue-router";
// Vuetify 전역 등록돼 있으니 v-icon 바로 사용 가능

const route = useRoute();

const menuItems = [
  {
    name: "AdminUsers",
    label: "사용자 관리",
    to: "/admin/users",
    icon: "mdi-account", // 사람 아이콘
  },
  {
    name: "AdminRoles",
    label: "권한 설정",
    to: "/admin/roles",
    icon: "mdi-shield-check", // 방패 + 체크
  },
  {
    name: "AdminLogs",
    label: "로그 관리",
    to: "/admin/logs",
    icon: "mdi-notebook-edit", // 노트 + 펜
  },
  {
    name: "AdminDanger",
    label: "삭제 페이지",
    to: "/admin/danger",
    icon: "mdi-cog", // 톱니바퀴
  },
];
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.admin-sidebar {
  width: 240px;
  background: #f8f9fa;
  border-right: 1px solid #e2e2e2;
  padding: 24px 16px;
}

.sidebar-header {
  font-weight: 700;
  margin-bottom: 24px;
}

/* 메뉴 영역 */
.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* RouterLink 기본 스타일 */
.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  font-size: 14px;
  transition: background 0.15s ease, color 0.15s ease;
}

/* 호버 시 */
.menu-item:hover {
  background: #e3f2fd;
}

/* 아이콘 스타일 */
.menu-icon {
  font-size: 20px;
  color: #555;
}

/* 텍스트 */
.menu-label {
  flex: 1;
}

/* 활성 메뉴 */
.menu-item.active {
  background: #1976d2;
  color: #ffffff;
}

.menu-item.active .menu-icon {
  color: #ffffff;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-header {
  padding: 24px 32px 8px;
  background: white;
  border-bottom: 1px solid #e2e2e2;
}

.admin-content {
  flex: 1;
  padding: 24px 32px;
  overflow: auto;
  background: #f5f5f5;
}

.admin-footer {
  padding: 12px 32px;
  font-size: 12px;
  color: #777;
  background: white;
  border-top: 1px solid #e2e2e2;
}
</style>
