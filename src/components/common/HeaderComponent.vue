<template>
  <v-app-bar app fixed flat color="white" height="64" class="px-8">
    <!-- 🔥 로고만 표시 -->
    <router-link to="/home" class="logo-container mr-3">
      <img :src="logoSrc" alt="logo" class="nav-logo" />
    </router-link>

    <v-btn text to="/calendar">캘린더</v-btn>
    <v-btn text to="/project">프로젝트</v-btn>

    <!-- 배치도 -->
    <v-menu>
      <template #activator="{ props }">
        <v-btn text v-bind="props">
          배치도
          <v-icon>mdi-menu-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item :to="{ name: 'Floor', params: { level: 'B1' } }"
          ><v-list-item-title>B1</v-list-item-title></v-list-item
        >
        <v-list-item :to="{ name: 'Floor', params: { level: '1F' } }"
          ><v-list-item-title>1F</v-list-item-title></v-list-item
        >
        <v-list-item :to="{ name: 'Floor', params: { level: '2F' } }"
          ><v-list-item-title>2F</v-list-item-title></v-list-item
        >
        <v-list-item :to="{ name: 'Floor', params: { level: '3F' } }"
          ><v-list-item-title>3F</v-list-item-title></v-list-item
        >
        <v-list-item :to="{ name: 'Floor', params: { level: '4F' } }"
          ><v-list-item-title>4F</v-list-item-title></v-list-item
        >
      </v-list>
    </v-menu>

    <!-- VIP -->
    <v-menu>
      <template #activator="{ props }">
        <v-btn text v-bind="props">
          VIP
          <v-icon>mdi-menu-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item :to="{ name: 'VipMemberList' }"
          ><v-list-item-title>회원</v-list-item-title></v-list-item
        >
        <v-list-item :to="{ name: 'VipMember' }"
          ><v-list-item-title>매출현황</v-list-item-title></v-list-item
        >
      </v-list>
    </v-menu>

    <!-- 고객 -->
    <v-menu>
      <template #activator="{ props }">
        <v-btn text v-bind="props">
          고객
          <v-icon>mdi-menu-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item to="/potentialclient">잠재 고객</v-list-item>
        <v-list-item to="/clientcompany">고객사</v-list-item>
      </v-list>
    </v-menu>

    <!-- 영업관리 -->
    <v-menu>
      <template #activator="{ props }">
        <v-btn text v-bind="props">
          영업관리
          <v-icon>mdi-menu-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item to="/proposal">제안</v-list-item>
        <v-list-item to="/estimate">견적</v-list-item>
        <v-list-item to="/contract">계약</v-list-item>
        <v-list-item to="/revenue">매출</v-list-item>
      </v-list>
    </v-menu>

    <v-btn text to="/filestorage">저장소</v-btn>

    <v-spacer></v-spacer>

    <v-btn icon><v-icon>mdi-bell-outline</v-icon></v-btn>
    <v-btn icon><v-icon>mdi-cog-outline</v-icon></v-btn>
    <v-btn icon to="/mypage"><v-icon>mdi-account-circle</v-icon></v-btn>
    <v-btn icon @click="logoutHandler"><v-icon>mdi-logout</v-icon></v-btn>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { logout as logoutApi } from "@/apis/auth";
import logoSrc from "@/assets/로고.png";

const router = useRouter();
const authStore = useAuthStore();

const logoutHandler = async () => {
  try {
    await logoutApi();
  } catch (e) {
    console.error(e);
  } finally {
    authStore.forceLogout();
    router.push("/login");
  }
};
</script>

<style>
.v-application,
.v-btn,
.v-list,
.v-list-item-title,
.v-toolbar-title {
  font-family: "Pretendard", sans-serif !important;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* 🔥 로고 컨테이너 */
.logo-container {
  display: flex;
  align-items: center;
  text-decoration: none;
}

/* 🔥 로고만 표시 */
.nav-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin-top: 3px; /* UI 균형 맞춤 */
}
</style>
