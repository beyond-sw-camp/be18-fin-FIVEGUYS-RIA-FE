<template>
    <v-app>
        <!-- 라우트 meta에 hideHeader가 없으면 헤더 표시 -->
        <!-- <HeaderComponent v-if="!$route.meta.hideHeader" /> -->
        <HeaderComponent />
        
        <!-- 실제 페이지 컨텐츠 -->
        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<script setup>
    import HeaderComponent from '../components/common/HeaderComponent.vue'
</script>
