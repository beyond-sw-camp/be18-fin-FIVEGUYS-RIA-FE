<template>
    <v-container class="login-container" fluid>
        <v-row class="d-flex align-center justify-center">
            <v-col cols="12" md="8" lg="6">
                <v-card elevation="8" class="rounded-xl pa-8 d-flex">
                    <!-- 왼쪽: 이미지 -->
                    <v-col cols="6" class="pa-0 d-none d-md-flex align-center justify-center">
                        <v-img
                        src="@/assets/login-illustration.svg"
                        contain
                        max-width="300"
                        alt="Login Illustration"
                        ></v-img>
                    </v-col>

                    <!-- 오른쪽: 로그인 폼 -->
                    <v-col cols="12" md="6">
                        <h2 class="text-h5 font-weight-bold mb-6 text-center">LIA 로그인</h2>

                        <v-text-field
                        v-model="email"
                        label="이메일"
                        variant="outlined"
                        prepend-inner-icon="mdi-email-outline"
                        class="mb-4"
                        />

                        <v-text-field
                        v-model="password"
                        label="비밀번호"
                        type="password"
                        variant="outlined"
                        prepend-inner-icon="mdi-lock-outline"
                        class="mb-6"
                        />

                        <v-btn block color="orange" size="large" @click="login">로그인</v-btn>

                        <div class="text-center mt-4">
                        <RouterLink to="/signup" class="text-grey">회원가입</RouterLink>
                        </div>
                    </v-col>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>

</script>

<style scoped>
.login-container {
    min-height: 100vh;
}
</style>
