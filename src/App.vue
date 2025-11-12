<template>
  <v-app>
    <HeaderComponent />

    <v-main>
      <router-view />
    </v-main>

    <FooterComponent />
  </v-app>
</template>

<script setup>
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import FooterComponent from '@/components/common/FooterComponent.vue';
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

.v-row {
  width: 100vw !important;
  max-width: 100vw !important;
  min-width: 0 !important;
}

.v-col {
  min-width: 0 !important;
}
</style>
