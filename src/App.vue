<template>
  <v-app>
    <HeaderComponent v-if="!hideHeader"/>

    <v-main>
      <router-view />
    </v-main>

    <FooterComponent v-if="!hideFooter"/>
  </v-app>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router';
  import HeaderComponent from '@/components/common/HeaderComponent.vue';
  import FooterComponent from '@/components/common/FooterComponent.vue';

  const route = useRoute();

  const hideHeader = computed(() => !!route.meta?.hideHeader);
  const hideFooter = computed(() => !!route.meta?.hideFooter);

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

/* .v-row {
  width: 100vw !important;
  max-width: 100vw !important;
  min-width: 0 !important;
}

.v-col {
  min-width: 0 !important;
} */
</style>
