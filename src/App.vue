<template>
  <v-app>
    <HeaderComponent v-if="!hideHeader" />

    <v-main>
      <router-view />
    </v-main>

    <FooterComponent v-if="!hideFooter" />

    <!-- 전역 스낵바 -->
    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top center"
      class="toast-snackbar"
    >
      {{ snackbar.message }}
    </v-snackbar>

    <!-- 전역 토스트 알림 -->
    <div class="toast-container">
      <ToastNotification
        v-for="t in notificationStore.toastList"
        :key="t.id"
        :notification="t.notification"
      />
    </div>
  </v-app>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import HeaderComponent from "@/components/common/HeaderComponent.vue";
import FooterComponent from "@/components/common/FooterComponent.vue";
import { useSnackbarStore } from "@/stores/useSnackbarStore";
import { useNotificationStore } from "@/modules/notification/store/notificationStore";
import ToastNotification from "@/modules/notification/components/ToastNotification.vue"
import { useAuthStore } from "./stores/auth";
import { onMounted } from 'vue';

const route = useRoute();
const snackbar = useSnackbarStore();

const notificationStore = useNotificationStore();
const authStore = useAuthStore();

const hideHeader = computed(() => !!route.meta?.hideHeader);
const hideFooter = computed(() => !!route.meta?.hideFooter);

onMounted(async () => {
  console.log('App.vue onMounted 실행됨')

  if (!localStorage.getItem('accessToken')) {
    authStore.isAuthenticated = false
  }

  if (!authStore.isAuthenticated) {
    console.log('인증되지 않은 상태. 초기 알림/ SSE 연결 스킵')
    return
  }

  try {
    // 1) 초기 알림 가져오기
    console.log('fetchNotifications 호출 전')
    await notificationStore.fetchNotifications()
    console.log('fetchNotifications 완료')

    // 2) SSE 연결
    console.log('connectSSE 호출 전')
    notificationStore.connectSSE()
    console.log('connectSSE 호출 완료')

  } catch (error) {
    console.error('App.vue 초기 로딩 중 오류:', error)
  }
})
</script>

<style>
#app {
  width: 100% !important;
  max-width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.v-application {
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  max-width: 100% !important;
  height: 100% !important;
  justify-content: unset !important;
  align-items: unset !important;
}

.v-application__wrap {
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  max-width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  min-width: 0 !important;
}

.v-main {
  flex: 1 1 auto !important;
  width: 100% !important;
  height: 100% !important;
  min-height: calc(100vh - 64px);
  box-sizing: border-box !important;
}

.v-container {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}

.full-app {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column-reverse;
  gap: 6px;
  z-index: 9999;
}
</style>
