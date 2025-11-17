<template>
    <v-container fluid class="pa-0 full-height">
        <v-row no-gutters class="full-height">

        <!-- 좌측 사이드바 -->
        <v-col cols="12" md="2" class="pa-4 sidebar">
            <v-card class="pa-6 sidebar-card" flat>
            <!-- 검색 -->
            <v-text-field
                v-model="search"
                append-inner-icon="mdi-magnify"
                label="검색"
                variant="outlined"
                hide-details
                density="comfortable"
                class="mb-4 sidebar-input"
            ></v-text-field>

            <div class="status-label mb-2">사업 유형</div>

            <!-- 옵션 체크박스 -->
            <v-checkbox
                v-for="(option, index) in options"
                :key="index"
                v-model="option.value"
                :label="option.label"
                class="my-0 sidebar-checkbox"
                density="compact"
            ></v-checkbox>
            </v-card>
        </v-col>

        <!-- 메인 컨텐츠 -->
        <v-col cols="12" md="10" class="pa-6 main-content">
            <div class="d-flex justify-end mb-4">
            <v-btn color="orange darken-2" class="white--text" elevation="4" rounded>
                잠재 고객 추가
            </v-btn>
            </div>

            <v-row dense>
            <v-col
                v-for="(customer, index) in potentialCustomers"
                :key="index"
                cols="12"
                sm="6"
                md="4"
            >
                <v-card outlined class="pa-4 customer-card">
                
                <!-- 상단: 고객사 타이틀 중앙 배치 -->
                <v-card-title class="customer-title text-center">
                    {{ customer.company }}
                </v-card-title>

                <!-- 얇은 회색 선 -->
                <v-divider class="my-2" />

                <!-- 고객 상세 정보 -->
                <v-card-text class="pa-0">
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">담당자</v-col>
                    <v-col cols="7">{{ customer.owner }}</v-col>
                    </v-row>
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">연락처</v-col>
                    <v-col cols="7">{{ customer.phone }}</v-col>
                    </v-row>
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">이메일</v-col>
                    <v-col cols="7">{{ customer.email }}</v-col>
                    </v-row>
                    <v-row dense>
                    <v-col cols="5" class="label">최근 미팅일</v-col>
                    <v-col cols="7">{{ customer.lastMeeting }}</v-col>
                    </v-row>
                </v-card-text>
                </v-card>
            </v-col>
            </v-row>
        </v-col>

        </v-row>
    </v-container>
</template>

<script setup>
import { reactive } from 'vue'

const search = reactive('')
const sort = reactive('최신순')
const filter = reactive('모든 프로젝트')

const options = reactive([
    { label: '패션', value: false },
    { label: '뷰티', value: false },
    { label: 'F&B', value: false },
    { label: '라이프 스타일', value: false }
])

const potentialCustomers = reactive([
    { company: '디올', owner: '김민수', phone: '010-1234-5678', email: 'kim@dior.com', lastMeeting: '2025-11-10' },
    { company: '에르메스', owner: '박영희', phone: '010-2345-6789', email: 'park@hermes.com', lastMeeting: '2025-11-08' },
    { company: '샤넬', owner: '이영희', phone: '010-3456-7890', email: 'lee@chanel.com', lastMeeting: '2025-11-05' }
])
</script>

<style scoped>
/* ==================== 사이드바 ==================== */
.sidebar-card {
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    padding: 24px;
    height: 100%;
    transition: all 0.2s ease-in-out;
}

.sidebar-card:hover {
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.status-label {
    font-weight: 600;
    color: #555;
    font-size: 14px;
    margin-bottom: 8px;
}

.sidebar-input {
    background-color: #fff;
    border-radius: 8px;
}

.sidebar-checkbox {
    margin: 0 !important;
    padding: 0 !important;
    min-height: 18px !important;
    font-size: 0.7rem !important;
}

.sidebar-checkbox .v-input--selection-controls__ripple {
    width: 14px !important;
    height: 14px !important;
}

.sidebar-checkbox .v-label {
    font-size: 0.7rem !important;
    line-height: 14px !important;
    padding-left: 4px !important;
}

/* ==================== 잠재 고객 카드 ==================== */
.customer-card {
    transition: box-shadow 0.3s, transform 0.2s;
    font-size: 0.9rem;
    border-radius: 12px;
    padding: 16px;
}

.customer-card:hover {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.customer-title {
    font-size: 1.2rem; /* 크기 키움 */
    font-weight: 700;
    margin-bottom: 0;
}

.label {
    font-weight: 500;
    color: #888;
}
</style>
