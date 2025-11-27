<template>
    <v-app-bar app fixed flat color="white" height="64" class="px-8">
        <router-link to="/home" class="text-decoration-none mr-6">
            <v-toolbar-title class="font-weight-bold text-orange text-h5">
                Galleria
            </v-toolbar-title>
        </router-link>

        <v-btn text to="/calendar">캘린더</v-btn>
        <v-btn text to="/project">프로젝트</v-btn>
        <v-btn text to="/floor">배치도</v-btn>
        <v-btn text to="/vipmember">VIP 회원</v-btn>

        <!-- <v-menu>
            <template #activator="{ props }">
                <v-btn text v-bind="props">
                회원 <v-icon>mdi-menu-down</v-icon>
                </v-btn>
            </template>
<v-list>
    <v-list-item to="/generalmember">일반 회원</v-list-item>
    <v-list-item to="/vipmember">VIP 회원</v-list-item>
</v-list>
</v-menu> -->

        <v-menu>
            <template #activator="{ props }">
                <v-btn text v-bind="props">
                    고객 <v-icon>mdi-menu-down</v-icon>
                </v-btn>
            </template>
            <v-list>
                <v-list-item to="/potentialclient">잠재 고객</v-list-item>
                <!-- <v-list-item to="/client">고객</v-list-item> -->
                <v-list-item to="/clientcompany">고객사</v-list-item>
            </v-list>
        </v-menu>

        <v-menu>
            <template #activator="{ props }">
                <v-btn text v-bind="props">
                    영업관리 <v-icon>mdi-menu-down</v-icon>
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
        <v-btn icon to="/mypage">
            <v-icon>mdi-account-circle</v-icon>
        </v-btn> </v-app-bar>
</template>

<style>
.v-application,
.v-btn,
.v-list,
.v-list-item-title,
.v-toolbar-title {
    font-family: 'Pretendard', sans-serif !important;
    font-weight: 500;
    letter-spacing: 0.3px;
}
</style>
