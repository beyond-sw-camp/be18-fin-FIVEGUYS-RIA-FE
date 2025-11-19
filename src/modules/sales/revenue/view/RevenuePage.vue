<template>
    <v-container fluid class="pa-0 full-height main-container">
        <v-row no-gutters class="full-height">

        <!-- 좌측 사이드바 (검색만) -->
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
            <!-- 즐겨찾기 전체 필터 -->
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
            </v-card>
        </v-col>

        <!-- 메인 컨텐츠 -->
        <v-col cols="12" md="10" class="pa-6 main-content">

            <div class="d-flex justify-end mb-4">
            <v-btn color="#ff9500" class="white--text" rounded elevation="4">
                새 매출 추가
            </v-btn>
            </div>

            <v-row dense>
            <v-col
                v-for="sale in filteredSales"
                :key="sale.id"
                cols="12"
                sm="6"
                md="3"
                rounded="xl"
            >
                <v-card outlined class="proposal-card" elevation="2" rounded="xl">

                <!-- 즐겨찾기 -->
                <v-btn
                    small
                    class="favorite-btn"
                    @click.stop="toggleFavorite(sale)"
                    elevation="0"
                >
                    <v-icon :color="sale.isFavorite ? '#FFD60A' : '#8e8e93'">
                    {{ sale.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}
                    </v-icon>
                </v-btn>

                <!-- 카드 내용 -->
                <v-card-title class="proposal-title">{{ sale.productName }}</v-card-title>
                <v-divider class="my-2" />

                <v-card-text class="pa-0">
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">고객사</v-col>
                    <v-col cols="7">{{ sale.clientCompany }}</v-col>
                    </v-row>
                    <v-row dense class="mb-1">
                    <v-col cols="5" class="label">고객</v-col>
                    <v-col cols="7">{{ sale.clientOwner }}</v-col>
                    </v-row>
                    <v-row dense>
                    <v-col cols="5" class="label">담당자</v-col>
                    <v-col cols="7">{{ sale.salesManager }}</v-col>
                    </v-row>
                </v-card-text>

                <v-divider class="my-2" />

                <!-- 판매일과 금액 (우측 정렬) -->
                <v-card-text class="pa-0 d-flex justify-end flex-column align-end">
                    <span class="period-text">판매일: {{ sale.saleDate }}</span>
                    <span class="period-text">금액: {{ formatPrice(sale.saleAmount) }}</span>
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

const search = ref('');
const showFavoritesOnly = ref(false);

const sales = reactive([
    { id: 1, productName: '상품 A', clientCompany: '삼성전자', clientOwner: '김영업', salesManager: '박팀장',
        saleDate: '2025-11-15', saleAmount: 1800000, isFavorite: false },

    { id: 2, productName: '상품 B', clientCompany: 'LG CNS', clientOwner: '이영희', salesManager: '최팀장',
        saleDate: '2025-12-10', saleAmount: 3000000, isFavorite: true },

    { id: 3, productName: '상품 C', clientCompany: '카카오', clientOwner: '홍길동', salesManager: '이팀장',
        saleDate: '2025-12-20', saleAmount: 5500000, isFavorite: false },
]);

const toggleFavorite = (sale) => {
    sale.isFavorite = !sale.isFavorite;
};

const filteredSales = computed(() => {
    return sales.filter(s => {
        const matchesSearch = !search.value || s.productName.includes(search.value);
        const matchesFavorite = !showFavoritesOnly.value || s.isFavorite;
        return matchesSearch && matchesFavorite;
    });
});

// 금액 포맷 함수
const formatPrice = (price) => {
    return price.toLocaleString() + '원';
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

/* 즐겨찾기 버튼 (전체 필터) */
.favorite-toggle-btn {
    border-radius: 8px;
    background-color: #ffffff;
    padding: 6px;
    border: 1px solid rgba(0,0,0,0.12);
}

/* 카드 */
.proposal-card {
    position: relative;
    padding: 16px;
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.05);
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    background-color: #ffffff;
}

.proposal-card:hover {
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

.proposal-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 4px;
}
</style>
