<template>
    <v-container fluid class="pa-0 full-height main-container">
        <v-row no-gutters class="full-height">

        <!-- 좌측 사이드바 -->
        <v-col cols="12" md="2" class="pa-4 sidebar">
            <v-card class="sidebar-card pa-6" flat>

                <!-- 검색 -->
                <v-text-field
                    v-model="search"
                    append-inner-icon="mdi-magnify"
                    label="검색"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    class="mb-4"
                />

                <!-- 즐겨찾기 버튼 -->
                <div class="d-flex justify-end mt-2">
                    <v-btn
                        small
                        class="favorite-toggle-btn"
                        @click="showFavoritesOnly = !showFavoritesOnly"
                        elevation="1"
                    >
                        <v-icon :color="showFavoritesOnly ? '#FFD60A' : '#8e8e93'">
                        {{ showFavoritesOnly ? 'mdi-star' : 'mdi-star-outline' }}
                        </v-icon>
                    </v-btn>
                </div>

                <!-- 상태 체크박스 그룹 -->
                <div class="sidebar-checkbox-group mt-4">진행 상태
                <v-checkbox
                    v-for="sidebar in sidebares"
                    :key="sidebar.value"
                    v-model="sidebar.checked"
                    :label="sidebar.label"
                    hide-details
                    dense
                    class="sidebar-checkbox"
                ></v-checkbox>
                </div>

            </v-card>
        </v-col>

        <!-- 메인 컨텐츠 -->
        <v-col cols="12" md="10" class="pa-6 main-content">

            <div class="d-flex justify-end mb-4">
                <v-btn color="#ff9500" class="white--text" rounded elevation="4">
                    새 견적 추가
                </v-btn>
            </div>

            <v-row dense>
                <v-col
                    v-for="estimate in filteredestimates"
                    :key="estimate.id"
                    cols="12"
                    sm="6"
                    md="3"
                    rounded="xl"
                >
                    <v-card outlined class="estimate-card" @click="goToEstimateDetail(estimate.id)" elevation="2" rounded="xl" >

                        <!-- 즐겨찾기 -->
                        <v-btn
                            small
                            class="favorite-btn"
                            @click.stop="toggleFavorite(estimate)"
                            elevation="0"
                        >
                            <v-icon :color="estimate.isFavorite ? '#FFD60A' : '#8e8e93'">
                            {{ estimate.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}
                            </v-icon>
                        </v-btn>

                        <!-- 카드 내용 -->
                        <v-card-title class="estimate-title">{{ estimate.projectName }}</v-card-title>
                        <v-divider class="my-2" />

                        <v-card-text class="pa-0">
                            <v-row dense class="mb-1">
                                <v-col cols="5" class="label">고객사</v-col>
                                <v-col cols="7">{{ estimate.clientCompany }}</v-col>
                            </v-row>
                            <v-row dense class="mb-1">
                                <v-col cols="5" class="label">고객</v-col>
                                <v-col cols="7">{{ estimate.clientOwner }}</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="5" class="label">담당자</v-col>
                                <v-col cols="7">{{ estimate.salesManager }}</v-col>
                            </v-row>
                        </v-card-text>

                        <v-divider class="my-2" />

                        <v-card-text class="pa-0 d-flex justify-space-between align-center">
                            <span :class="['sidebar-text', sidebarClass(estimate.sidebar)]">
                                {{ estimate.sidebar }}
                            </span>

                            <!-- 변경된 내용 -->
                            <span class="period-text d-flex flex-column">
                                <span>견적일: {{ estimate.estimateDate }}</span>
                                <span>견적금액: {{ formatPrice(estimate.estimatePrice) }}</span>
                            </span>
                        </v-card-text>

                    </v-card>
                </v-col>
            </v-row>

        </v-col>

        </v-row>
    </v-container>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const search = ref('');
const showFavoritesOnly = ref(false);

const estimates = reactive([
        { id: 1, projectName: '견적 A', clientCompany: '삼성전자', clientOwner: '김영업', salesManager: '박팀장',
        estimateDate: '2025-11-01', estimatePrice: 1500000, sidebar: 'Draft', isFavorite: false },

        { id: 2, projectName: '견적 B', clientCompany: 'LG CNS', clientOwner: '이영희', salesManager: '최팀장',
        estimateDate: '2025-12-02', estimatePrice: 2800000, sidebar: 'Submitted', isFavorite: true },

        { id: 3, projectName: '견적 C', clientCompany: '카카오', clientOwner: '홍길동', salesManager: '이팀장',
        estimateDate: '2025-12-10', estimatePrice: 5200000, sidebar: 'Completed', isFavorite: false },
]);

const toggleFavorite = (estimate) => {
    estimate.isFavorite = !estimate.isFavorite;
};

const sidebarClass = (sidebar) => {
    switch(sidebar) {
        case 'Draft': return 'sidebar-draft';
        case 'Submitted': return 'sidebar-submitted';
        case 'Completed': return 'sidebar-completed';
        case 'Canceled': return 'sidebar-canceled';
        default: return '';
    }
};

const sidebares = reactive([
    { label: 'Draft', value: 'Draft', checked: true },
    { label: 'Submitted', value: 'Submitted', checked: true },
    { label: 'Completed', value: 'Completed', checked: true },
    { label: 'Canceled', value: 'Canceled', checked: true },
]);

const filteredestimates = computed(() => {
    return estimates.filter(p => {
        const matchesSearch = !search.value || p.projectName.includes(search.value);
        const matchessidebar = sidebares.some(s => s.checked && s.value === p.sidebar);
        const matchesFavorite = !showFavoritesOnly.value || p.isFavorite;
        return matchesSearch && matchessidebar && matchesFavorite;
    });
});

// 금액 포맷 함수
const formatPrice = (price) => {
    return price.toLocaleString() + '원';
};

const goToEstimateDetail = (id) => {
    router.push({ name: 'EstimateDetail', params: { id } });
};

</script>

<style scoped>
.main-container {
    background-color: #ffffff;
    min-height: 100vh;
}

/* 사이드바 */
.sidebar-card {
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.12);
    box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    background-color: #ffffff;
}

/* 즐겨찾기 */
.favorite-toggle-btn {
    border-radius: 8px;
    background-color: #ffffff;
    padding: 6px;
    border: 1px solid rgba(0,0,0,0.12);
}

/* 카드 */
.estimate-card {
    position: relative;
    padding: 16px;
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.05);
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    background-color: #ffffff;
}

.estimate-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

/* 즐겨찾기 버튼 (카드) */
.favorite-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    min-width: 32px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.favorite-btn .v-icon {
    font-size: 1.1rem;
}

/* 상태 */
.sidebar-text {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 6px;
}
.sidebar-draft { color: #888; background-color: #f0f0f0; }
.sidebar-submitted { color: #1976d2; background-color: #e3f2fd; }
.sidebar-completed { color: #4caf50; background-color: #e8f5e9; }
.sidebar-canceled { color: #f44336; background-color: #ffebee; }

.period-text {
    font-size: 0.75rem;
    color: #888888;
    font-weight: 400;
}

/* 라벨 */
.label {
    font-size: 0.7rem;
    color: #8e8e93;
}

.estimate-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 4px;
}

/* 체크박스 */
.sidebar-checkbox .v-label {
    font-size: 0.75rem;
}
</style>
