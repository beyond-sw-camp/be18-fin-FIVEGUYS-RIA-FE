<template>
    <v-container fluid class="pa-0 full-height main-container">
        <v-row no-gutters class="full-height">
            <!-- 좌측 사이드바 -->
            <v-col cols="12" md="2" class="pa-4 sidebar">
                <v-card class="sidebar-card pa-6" flat>
                    <!-- 즐겨찾기 버튼 (최상단) -->
                    <div class="d-flex justify-end mb-4">
                        <v-btn small class="favorite-toggle-btn" @click="showFavoritesOnly = !showFavoritesOnly"
                            elevation="1">
                            <v-icon :color="showFavoritesOnly ? '#FFD60A' : '#8e8e93'">
                                {{ showFavoritesOnly ? 'mdi-star' : 'mdi-star-outline' }}
                            </v-icon>
                        </v-btn>
                    </div>

                    <!-- 검색 -->
                    <v-text-field v-model="keyword" append-inner-icon="mdi-magnify" placeholder="판매 이름 또는 고객사 검색..."
                        variant="outlined" hide-details density="comfortable" class="mb-6" />

                    <!-- 판매 유형 -->
                    <v-select v-model="saleType" :items="saleTypeOptions" label="판매 유형" variant="outlined"
                        density="comfortable" hide-details class="mb-4" />

                    <!-- 날짜 정렬 -->
                    <v-select v-model="dateSort" :items="dateSortOptions" label="날짜" variant="outlined"
                        density="comfortable" hide-details class="mb-4" />

                    <!-- 담당자 -->
                    <v-select v-model="managerFilter" :items="managerOptions" item-title="title" item-value="value"
                        label="담당자" variant="outlined" density="comfortable" hide-details class="mb-6" />
                </v-card>
            </v-col>

            <!-- 메인 컨텐츠 -->
            <v-col cols="12" md="10" class="pa-6 main-content">
                <v-row dense>
                    <v-col v-for="sale in filteredSales" :key="sale.id" cols="12" sm="6" md="3" class="proposal-col">
                        <v-card outlined class="proposal-card" elevation="2" rounded="xl" @click="goDetail(sale)">
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
                                    <v-col cols="7" class="value-col">
                                        {{ sale.clientCompany }}
                                    </v-col>
                                </v-row>

                                <v-row dense class="info-row">
                                    <v-col cols="5" class="label">계약기간</v-col>
                                    <v-col cols="7" class="value-col">
                                        <span class="period-badge">
                                            {{ sale.contractStartDay }}<br />{{ sale.contractEndDay }}
                                        </span>
                                    </v-col>
                                </v-row>

                                <v-row dense class="info-row">
                                    <v-col cols="5" class="label">담당자</v-col>
                                    <v-col cols="7" class="value-col">
                                        {{ sale.salesManager }}
                                    </v-col>
                                </v-row>
                            </v-card-text>

                            <v-divider class="my-2" />

                            <!-- 하단 정보 -->
                            <v-card-text class="pa-0 d-flex justify-space-between align-center">
                                <span class="sidebar-text sale-type-badge">
                                    {{ sale.saleType }}
                                </span>

                                <span class="period-text d-flex flex-column">
                                    <span>
                                        최근 정산:
                                        {{ formatYearMonth(sale.settlementYear, sale.settlementMonth) }}
                                    </span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchRevenueList } from '@/apis/revenue'

const router = useRouter()

const keyword = ref('')
const showFavoritesOnly = ref(false)

const saleType = ref('전체')
const dateSort = ref('날짜 최신순')
const managerFilter = ref(null) // 숫자 id 또는 null

const saleTypeOptions = ['전체', '입점', '팝업', '전시회']
const dateSortOptions = ['날짜 최신순', '날짜 오래된순']

const page = ref(1) // UI 1-based
const size = ref(12)
const totalPages = ref(0)
const totalElements = ref(0)

const sales = ref([])

// 담당자 드롭다운용 별도 상태
const managerOptions = ref([
    { title: '전체', value: null },
])

const mapStoreTypeToLabel = (type) => {
    if (type === 'REGULAR') return '입점'
    if (type === 'POPUP') return '팝업'
    if (type === 'EXHIBITION') return '전시회'
    return type || '-'
}

const mapLabelToStoreType = (label) => {
    if (label === '입점') return 'REGULAR'
    if (label === '팝업') return 'POPUP'
    if (label === '전시회') return 'EXHIBITION'
    return null
}

// 목록 조회 (필터 적용된 데이터)
const loadSales = async (reset = false) => {
    if (reset) {
        page.value = 1
    }

    const params = {
        page: page.value - 1,
        size: size.value,
        keyword: keyword.value.trim() || null,
        storeType: mapLabelToStoreType(saleType.value),
        sort: dateSort.value === '날짜 최신순' ? 'LATEST' : 'OLDEST',
    }

    // 담당자 필터 적용
    if (managerFilter.value != null) {
        params.managerId = managerFilter.value
    }

    const res = await fetchRevenueList(params)

    const data = res.data || {}
    const items = Array.isArray(data.data) ? data.data : []

    sales.value = items.map((item) => ({
        id: item.revenueId,
        productName: item.contractTitle,
        clientCompany: item.clientCompanyName,
        contractStartDay: item.contractStartDay,
        contractEndDay: item.contractEndDay,
        salesManager: item.managerName,
        managerId: item.managerId,
        settlementYear: item.settlementYear,
        settlementMonth: item.settlementMonth,
        saleAmount: Number(item.finalRevenue ?? 0),
        saleType: mapStoreTypeToLabel(item.storeType),
        isFavorite: false,
    }))

    const totalCount = Number(data.totalCount ?? 0)
    const pageSize = Number((data.size ?? size.value) || 1)

    totalElements.value = totalCount
    totalPages.value = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0
}

// 담당자 옵션용 데이터는 필터 없이 한 번만 가져온다
const loadManagerOptions = async () => {
    const res = await fetchRevenueList({
        page: 0,
        size: 1000, // 충분히 크게
        sort: 'LATEST',
        // managerId 절대 넣지 않는다
        // 다른 필터도 걸지 말고 전체 기준으로 가져오는 것이 안정적
    })

    const data = res.data || {}
    const items = Array.isArray(data.data) ? data.data : []

    const seen = new Set()
    const list = [{ title: '전체', value: null }]

    items.forEach((item) => {
        if (!item.managerId || seen.has(item.managerId)) return
        seen.add(item.managerId)
        list.push({
            title: item.managerName || '-',
            value: item.managerId,
        })
    })

    managerOptions.value = list
}

onMounted(async () => {
    await Promise.all([
        loadSales(true),
        loadManagerOptions(),
    ])
})

watch([saleType, dateSort, managerFilter, keyword], () => {
    loadSales(true)
})

const toggleFavorite = (sale) => {
    sale.isFavorite = !sale.isFavorite
}

const filteredSales = computed(() => {
    let list = sales.value.slice()

    if (managerFilter.value != null) {
        list = list.filter((s) => s.managerId === managerFilter.value)
    }

    if (showFavoritesOnly.value) {
        list = list.filter((s) => s.isFavorite)
    }

    return list
})

const formatPrice = (p) => Math.floor(p).toLocaleString() + '원'

const formatYearMonth = (y, m) =>
    !y || !m ? '-' : `${y}-${String(m).padStart(2, '0')}`

const onPageChange = () => {
    loadSales(false)
}

const goDetail = (sale) => {
    if (!sale?.id) return
    router.push({
        name: 'RevenueDetail',
        params: { id: sale.id },
    })
}
</script>

<style scoped>
.main-container {
    background-color: #ffffff;
    min-height: 100vh;
}

/* 사이드바 */
.sidebar-card {
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    background-color: #ffffff;
}

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

/* 카드 리스트 정렬 */
.proposal-col {
    padding-left: 10px;
    padding-right: 10px;
    margin-bottom: 18px;
}

/* 카드 디자인 */
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

/* 행 간격 */
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

/* 라벨/텍스트 */
.label {
    font-size: 0.7rem;
    color: #8e8e93;
}

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
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 4px;
}

/* 계약기간 배지 */
.period-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 6px;
    background-color: #f2f2f7;
    font-size: 0.72rem;
    color: #555;
    line-height: 1.2;
}
</style>
