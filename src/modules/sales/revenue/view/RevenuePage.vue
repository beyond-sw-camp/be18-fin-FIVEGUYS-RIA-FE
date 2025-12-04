<template>
    <v-container fluid class="pa-0 full-height main-container">
        <v-row no-gutters class="full-height">
            <!-- 좌측 사이드바 (검색 + 필터) -->
            <!-- 사이드바: 즐겨찾기를 검색 위로 이동 -->
            <v-col cols="12" md="2" class="pa-4 sidebar">
                <v-card class="sidebar-card pa-6" flat>

                    <!-- ⭐ 즐겨찾기 버튼 (최상단) -->
                    <div class="d-flex justify-end mb-4">
                        <v-btn small class="favorite-toggle-btn" @click="showFavoritesOnly = !showFavoritesOnly"
                            elevation="1">
                            <v-icon :color="showFavoritesOnly ? '#FFD60A' : '#8e8e93'">
                                {{ showFavoritesOnly ? "mdi-star" : "mdi-star-outline" }}
                            </v-icon>
                        </v-btn>
                    </div>

                    <!-- 🔍 검색 -->
                    <v-text-field v-model="keyword" append-inner-icon="mdi-magnify" placeholder="판매 이름 또는 고객사 검색..."
                        variant="outlined" hide-details density="comfortable" class="mb-6" />

                    <!-- 판매 유형 -->
                    <v-select v-model="saleType" :items="saleTypeOptions" label="판매 유형" variant="outlined"
                        density="comfortable" hide-details class="mb-4" />

                    <!-- 날짜 정렬 -->
                    <v-select v-model="dateSort" :items="dateSortOptions" label="날짜" variant="outlined"
                        density="comfortable" hide-details class="mb-4" />

                    <!-- 담당자 -->
                    <v-select v-model="managerFilter" :items="managerOptions" label="담당자" variant="outlined"
                        density="comfortable" hide-details class="mb-6" />

                </v-card>
            </v-col>


            <!-- 메인 컨텐츠 -->
            <v-col cols="12" md="10" class="pa-6 main-content">
                <v-row dense>
                    <v-col v-for="sale in filteredSales" :key="sale.id" cols="12" sm="6" md="3" rounded="xl"
                        class="proposal-col">
                        <v-card outlined class="proposal-card" elevation="2" rounded="xl">
                            <!-- 즐겨찾기 버튼 -->
                            <v-btn small class="favorite-btn" @click.stop="toggleFavorite(sale)" elevation="0">
                                <v-icon :color="sale.isFavorite ? '#FFD60A' : '#8e8e93'">
                                    {{ sale.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}
                                </v-icon>
                            </v-btn>

                            <!-- 제목 -->
                            <v-card-title class="proposal-title">
                                {{ sale.productName }}
                            </v-card-title>
                            <v-divider class="my-2" />

                            <!-- 상단 정보 -->
                            <v-card-text class="pa-0">
                                <v-row dense class="info-row">
                                    <v-col cols="5" class="label">고객사</v-col>
                                    <v-col cols="7" class="value-col">{{ sale.clientCompany }}</v-col>
                                </v-row>

                                <v-row dense class="info-row">
                                    <v-col cols="5" class="label">계약기간</v-col>
                                    <v-col cols="7" class="value-col">
                                        {{ formatPeriod(sale.contractStartDay, sale.contractEndDay) }}
                                    </v-col>
                                </v-row>

                                <v-row dense class="info-row">
                                    <v-col cols="5" class="label">담당자</v-col>
                                    <v-col cols="7" class="value-col">{{ sale.salesManager }}</v-col>
                                </v-row>
                            </v-card-text>

                            <v-divider class="my-2" />

                            <!-- 하단 정보 (제안 카드 디자인 동일 적용) -->
                            <v-card-text class="pa-0 d-flex justify-space-between align-center">
                                <span class="sidebar-text sale-type-badge">
                                    {{ sale.saleType }}
                                </span>

                                <span class="period-text d-flex flex-column">
                                    <span>최근 정산: {{ formatYearMonth(sale.settlementYear, sale.settlementMonth) }}</span>
                                    <span>금액: {{ formatPrice(sale.saleAmount) }}</span>
                                </span>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- 페이지네이션 -->
                <v-row justify="center" class="mt-6">
                    <v-pagination v-model="page" :length="totalPages" @update:modelValue="onPageChange" />
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchRevenueList } from '@/apis/revenue'

const keyword = ref('')
const showFavoritesOnly = ref(false)

const saleType = ref('전체')
const dateSort = ref('날짜 최신순')
const managerFilter = ref('전체')

const saleTypeOptions = ['전체', '임대', '팝업', '전시회']
const dateSortOptions = ['날짜 최신순', '날짜 오래된순']

const page = ref(1)
const size = ref(12)
const totalPages = ref(0)
const totalElements = ref(0)

const sales = ref([])

const mapStoreTypeToLabel = type => {
    if (type === 'REGULAR') return '임대'
    if (type === 'POPUP') return '팝업'
    if (type === 'EXHIBITION') return '전시회'
    return type || '-'
}

const formatPeriod = (s, e) => {
    if (!s && !e) return '-'
    if (!s) return `~ ${e}`
    if (!e) return `${s} ~`
    return `${s} ~ ${e}`
}

const loadSales = async (reset = false) => {
    if (reset) page.value = 1

    const res = await fetchRevenueList({
        page: page.value - 1,
        size: size.value,
    })

    const data = res.data || {}
    const content = Array.isArray(data.content) ? data.content : []

    sales.value = content.map(item => ({
        id: item.revenueId,
        productName: item.contractTitle,
        clientCompany: item.clientCompanyName,
        contractStartDay: item.contractStartDay,
        contractEndDay: item.contractEndDay,
        salesManager: item.managerName,
        settlementYear: item.settlementYear,
        settlementMonth: item.settlementMonth,
        saleAmount: Number(item.finalRevenue ?? 0),
        saleType: mapStoreTypeToLabel(item.storeType),
        isFavorite: false
    }))

    totalPages.value = data.totalPages || 0
    totalElements.value = data.totalElements || 0
}

onMounted(() => loadSales(true))

const managerOptions = computed(() => {
    const base = ['전체']
    const names = [...new Set(sales.value.map(s => s.salesManager).filter(Boolean))]
    return base.concat(names)
})

const toggleFavorite = sale => sale.isFavorite = !sale.isFavorite

const filteredSales = computed(() => {
    let list = sales.value.slice()

    const kw = keyword.value.trim()
    if (kw) {
        list = list.filter(s =>
            [s.productName, s.clientCompany].some(v => v?.includes(kw))
        )
    }

    if (showFavoritesOnly.value) list = list.filter(s => s.isFavorite)
    if (saleType.value !== '전체') list = list.filter(s => s.saleType === saleType.value)
    if (managerFilter.value !== '전체') list = list.filter(s => s.salesManager === managerFilter.value)

    if (dateSort.value === '날짜 최신순') {
        list.sort((a, b) => b.settlementYear * 100 + b.settlementMonth - (a.settlementYear * 100 + a.settlementMonth))
    } else {
        list.sort((a, b) => a.settlementYear * 100 + a.settlementMonth - (b.settlementYear * 100 + b.settlementMonth))
    }

    return list
})

const formatPrice = p => Math.floor(p).toLocaleString() + '원'
const formatYearMonth = (y, m) => (!y || !m) ? '-' : `${y}-${String(m).padStart(2, '0')}`

const onPageChange = () => loadSales(false)
</script>

<style scoped>
.main-container {
    background-color: #ffffff;
    min-height: 100vh;
}

/* ─── 사이드바 ───────────────────────────── */
.sidebar-card {
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    background-color: #ffffff;
}

/* 제안과 동일한 즐겨찾기 버튼 스타일 */
.favorite-toggle-btn {
    margin-top: 12px;
    border-radius: 8px;
    background-color: #ffffff;
    padding: 6px;
    border: 1px solid rgba(0, 0, 0, 0.12);
}

.favorite-toggle-btn .v-icon {
    font-size: 1.2rem;
}

/* ─── 카드 리스트 정렬 동일화 ───────────── */
.proposal-col {
    padding-left: 10px;
    padding-right: 10px;
    margin-bottom: 18px;
}

/* ─── 카드 디자인 ───────────────────────── */
.proposal-card {
    position: relative;
    padding: 16px;
    border-radius: 16px;
    background-color: #ffffff;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
    transition: transform 0.15s, box-shadow 0.15s;
    cursor: pointer;
}

.proposal-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 즐겨찾기 버튼 */
.favorite-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.favorite-btn .v-icon {
    font-size: 1.1rem;
}

/* 폰트 통일 */
.proposal-card * {
    font-size: 0.78rem !important;
}

.label {
    font-size: 0.7rem;
    color: #8e8e93;
}

/* 행 간격 통일 */
.info-row {
    margin-bottom: 2px;
}

.info-row:last-of-type {
    margin-bottom: 0;
}

.info-row>.v-col {
    padding-top: 0;
    padding-bottom: 0;
}

.value-col {
    padding-left: 0;
    font-weight: 500;
    color: #333;
}

/* 하단 스타일 (제안 디자인 동일 적용) */
.sidebar-text {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 6px;
}

.sale-type-badge {
    color: #08956a;
    background-color: #e6f8f0;
}

.period-text {
    font-size: 0.75rem;
    color: #888;
    font-weight: 400;
}

.proposal-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 4px;
}
</style>
