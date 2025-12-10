<!-- src/modules/sales/revenue/view/RevenueDetailPage.vue -->
<template>
  <v-container fluid class="detail-container">
    <!-- 상단 제목 -->
    <v-row class="align-center justify-space-between mb-4 header-row">
      <v-col cols="12" md="8">
        <h2 class="project-title">{{ detail.projectTitle }}</h2>
        <div class="subtitle">
          <span class="subtitle-item">{{ detail.clientCompanyName }}</span>
          <span class="divider">·</span>
          <span class="subtitle-item">{{ detail.clientName }}</span>
          <span class="divider">·</span>
          <span class="subtitle-item">{{ detail.salesManagerName }}</span>
          <span class="divider">·</span>
          <span class="subtitle-item">{{ contractTypeText }}</span>
        </div>
      </v-col>
    </v-row>

    <v-row dense class="cards-row">
      <!-- 좌측: 프로젝트 / 계약 기본 정보 -->
      <v-col cols="12" md="6" class="project-col">
        <v-card class="project-card mb-3" elevation="2">
          <v-card-title class="card-title">프로젝트 기본 정보</v-card-title>
          <v-card-text>
            <v-row dense>
              <!-- 프로젝트명 -->
              <v-col cols="12">
                <div class="input-label">프로젝트명</div>
                <v-text-field :model-value="detail.projectTitle" readonly variant="outlined"
                  class="input-field readonly-field" hide-details />
              </v-col>

              <!-- 계약명 -->
              <v-col cols="12">
                <div class="input-label">계약</div>
                <v-text-field :model-value="detail.contractTitle" readonly variant="outlined"
                  class="input-field readonly-field" hide-details />
              </v-col>

              <!-- 고객사 / 담당자 -->
              <v-col cols="12" md="6">
                <div class="input-label">고객사</div>
                <v-text-field :model-value="detail.clientCompanyName" readonly variant="outlined"
                  class="input-field readonly-field" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <div class="input-label">고객 담당자</div>
                <v-text-field :model-value="detail.clientName" readonly variant="outlined"
                  class="input-field readonly-field" hide-details />
              </v-col>

              <!-- 영업 담당 -->
              <v-col cols="12" md="6">
                <div class="input-label">영업 담당</div>
                <v-text-field :model-value="detail.salesManagerName" readonly variant="outlined"
                  class="input-field readonly-field" hide-details />
              </v-col>

              <!-- 계약 기간 -->
              <v-col cols="12" md="6">
                <div class="input-label">계약 기간</div>
                <v-text-field :model-value="contractPeriodText" readonly variant="outlined"
                  class="input-field readonly-field" hide-details />
              </v-col>

              <!-- 계약 당시 임대료(월) -->
              <v-col cols="12" md="6">
                <div class="input-label">계약 당시 임대료 (월)</div>
                <v-text-field :model-value="formattedBaseRent" readonly variant="outlined"
                  class="input-field readonly-field suffix-won" hide-details />
              </v-col>

              <!-- 계약 당시 수수료율 -->
              <v-col cols="12" md="6">
                <div class="input-label">계약 당시 수수료율</div>
                <v-text-field :model-value="formattedContractCommissionRate" readonly variant="outlined"
                  class="input-field readonly-field suffix-percent" hide-details />
              </v-col>
            </v-row>
          </v-card-text>

          <!-- 누적 매출 / 누적 수익 요약 -->
          <v-card-actions class="summary-row">
            <div class="summary-item">
              <div class="summary-label">누적 매출액</div>
              <div class="summary-value">
                {{ formattedAccumulatedSales }}
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-label">누적 수익</div>
              <div class="summary-value">
                {{ formattedAccumulatedRevenue }}
              </div>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 우측: 매장 / 수수료 정보 – 최신 정산 카드 -->
      <v-col cols="12" md="6" class="project-col">
        <v-card class="project-card mb-3" elevation="2">
          <v-card-title class="card-title">매장 및 수수료 정보</v-card-title>

          <v-card-text class="pa-0">
            <div class="history-card settlement-card">
              <div class="history-inner">
                <!-- 왼쪽 아이콘 + 세로 라인 -->
                <div class="history-left">
                  <div class="history-line" />
                  <div class="history-icon history-icon--settlement">
                    <v-icon size="18">mdi-cash-multiple</v-icon>
                  </div>
                </div>

                <!-- 본문 -->
                <div class="history-main">
                  <div class="history-top-row">
                    <div class="history-type">정산</div>
                    <div class="history-date">
                      {{ latestSettlementText }}
                    </div>
                  </div>

                  <div class="history-title">
                    {{ storeLocationText }} 정산
                  </div>

                  <div class="history-desc">
                    총 매출 : {{ formattedLatestTotalSales }} 원
                  </div>

                  <div class="history-meta">
                    수수료율 : {{ formattedLatestCommissionRate }}% ·
                    수수료 : {{ formattedLatestCommissionAmount }} 원
                  </div>

                  <div class="history-amount">
                    KRW {{ formatNumber(detail.latestFinalRevenue || 0) }}
                  </div>

                  <!-- 내역 보기 버튼 -->
                  <div class="history-more-row">
                    <v-btn variant="text" size="small" class="history-more-btn" @click="openHistoryDialog">
                      내역 보기
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 내역 모달 (정산 / 일별 매출 탭) -->
    <v-dialog v-model="showHistoryDialog" max-width="720">
      <v-card class="history-dialog-card">
        <v-card-title class="dialog-title">
          <span>매장 내역</span>
          <v-spacer />
          <v-btn icon variant="text" density="comfortable" @click="showHistoryDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />

        <v-card-text class="dialog-body">
          <!-- iOS 스타일 탭 -->
          <div class="ios-tabs-wrapper">
            <v-tabs v-model="activeHistoryTab" class="ios-tabs" bg-color="transparent" density="comfortable"
              hide-slider>
              <v-tab value="settlement" :ripple="false" :class="[
                'ios-tab',
                { 'ios-tab--active': activeHistoryTab === 'settlement' },
              ]">
                정산
              </v-tab>
              <v-tab value="daily" :ripple="false" :class="[
                'ios-tab',
                { 'ios-tab--active': activeHistoryTab === 'daily' },
              ]">
                일별 매출
              </v-tab>
            </v-tabs>
          </div>

          <v-window v-model="activeHistoryTab" class="history-window" :transition="false" :touch="false">
            <!-- 정산 탭 -->
            <v-window-item value="settlement">
              <!-- 필터 영역 -->
              <div class="dialog-filter-row">
                <v-select v-model="historyFilter.startYear" :items="yearOptions" item-title="label" item-value="value"
                  label="시작 연도" variant="outlined" density="compact" hide-details class="filter-select" />
                <v-select v-model="historyFilter.startMonth" :items="monthOptions" item-title="label" item-value="value"
                  label="시작 월" variant="outlined" density="compact" hide-details class="filter-select" />
                <span class="filter-tilde">~</span>
                <v-select v-model="historyFilter.endYear" :items="yearOptions" item-title="label" item-value="value"
                  label="종료 연도" variant="outlined" density="compact" hide-details class="filter-select" />
                <v-select v-model="historyFilter.endMonth" :items="monthOptions" item-title="label" item-value="value"
                  label="종료 월" variant="outlined" density="compact" hide-details class="filter-select" />
                <v-btn class="filter-search-btn white--text" color="orange-darken-2" variant="flat"
                  density="comfortable" @click="loadSettlementHistory">
                  조회
                </v-btn>
              </div>

              <!-- 조회 결과 -->
              <div v-if="isSettlementLoading" class="dialog-loading">
                정산 내역을 불러오는 중입니다...
              </div>

              <div v-else-if="settlementError" class="dialog-error">
                {{ settlementError }}
              </div>

              <div v-else-if="!settlementHistory.length" class="dialog-empty">
                조회된 정산 이력이 없습니다.
              </div>

              <div v-else class="dialog-list">
                <div v-for="item in settlementHistory" :key="item.settlementYear + '-' + item.settlementMonth"
                  class="dialog-history-item">
                  <div class="dialog-history-header">
                    <div class="dialog-history-title">
                      {{ storeLocationText }} 정산
                    </div>
                    <div class="dialog-history-date">
                      {{ formatYearMonth(item.settlementYear, item.settlementMonth) }}
                    </div>
                  </div>

                  <div class="dialog-history-row">
                    <span class="label">총 매출</span>
                    <span class="value">
                      {{ formatNumber(item.totalSalesAmount) }} 원
                    </span>
                  </div>

                  <div class="dialog-history-row">
                    <span class="label">수수료율</span>
                    <span class="value">
                      {{ formatNumber(item.commissionRate) }} %
                    </span>
                  </div>

                  <div class="dialog-history-row">
                    <span class="label">수수료</span>
                    <span class="value">
                      {{ formatNumber(item.commissionAmount) }} 원
                    </span>
                  </div>

                  <div class="dialog-history-row dialog-history-row--strong">
                    <span class="label">최종 수익</span>
                    <span class="value">
                      KRW {{ formatNumber(item.finalRevenue) }}
                    </span>
                  </div>
                </div>
              </div>
            </v-window-item>

            <!-- 일별 매출 탭 -->
            <v-window-item value="daily">
              <!-- 필터 영역 -->
              <div class="dialog-filter-row">
                <v-text-field v-model="dailyFilter.startDate" label="시작 일자" type="date" variant="outlined"
                  density="compact" hide-details class="filter-select" />
                <span class="filter-tilde">~</span>
                <v-text-field v-model="dailyFilter.endDate" label="종료 일자" type="date" variant="outlined"
                  density="compact" hide-details class="filter-select" />
                <v-btn class="filter-search-btn white--text" color="orange-darken-2" variant="flat"
                  density="comfortable" @click="loadDailyHistory">
                  조회
                </v-btn>
              </div>

              <!-- 조회 결과 -->
              <div v-if="isDailyLoading" class="dialog-loading">
                일별 매출을 불러오는 중입니다...
              </div>

              <div v-else-if="dailyError" class="dialog-error">
                {{ dailyError }}
              </div>

              <div v-else-if="!dailyHistory.length" class="dialog-empty">
                조회된 일별 매출이 없습니다.
              </div>

              <div v-else class="dialog-list">
                <div v-for="item in dailyHistory" :key="item.salesDate" class="dialog-history-item">
                  <div class="dialog-history-header">
                    <div class="dialog-history-title">
                      {{ storeLocationText }} 일별 매출
                    </div>
                    <div class="dialog-history-date">
                      {{ formatDate(item.salesDate) }}
                    </div>
                  </div>

                  <div class="dialog-history-row">
                    <span class="label">총 매출</span>
                    <span class="value">
                      {{ formatNumber(item.totalSalesAmount) }} 원
                    </span>
                  </div>

                  <div class="dialog-history-row">
                    <span class="label">총 건수</span>
                    <span class="value">
                      {{ formatNumber(item.totalSalesCount) }} 건
                    </span>
                  </div>

                  <div class="dialog-history-row">
                    <span class="label">VIP 매출</span>
                    <span class="value">
                      {{ formatNumber(item.vipSalesAmount) }} 원
                    </span>
                  </div>

                  <div class="dialog-history-row">
                    <span class="label">VIP 건수</span>
                    <span class="value">
                      {{ formatNumber(item.vipSalesCount) }} 건
                    </span>
                  </div>
                </div>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  getRevenueDetail,
  getSettlementHistory,
  getDailySalesHistory,
} from '@/apis/revenue'

const route = useRoute()

const detail = reactive({
  projectId: null,
  projectTitle: '',
  projectType: '',
  salesManagerName: '',
  contractId: null,
  contractTitle: '',
  contractType: '',
  contractStartDate: '',
  contractEndDate: '',
  currency: 'KRW',
  commissionRate: 0,
  depositAmount: 0,
  paymentCondition: '',
  clientCompanyName: '',
  clientName: '',
  stores: [],
  revenueId: null,
  baseRentSnapshot: 0,
  totalSalesAccumulated: 0,
  commissionAmountAccumulated: 0,
  finalRevenueAccumulated: 0,
  latestSettlementYear: null,
  latestSettlementMonth: null,
  latestTotalSalesAmount: 0,
  latestCommissionRate: 0,
  latestCommissionAmount: 0,
  latestFinalRevenue: 0,
})

const currentStore = computed(() => detail.stores[0] || null)

const storeLocationText = computed(() => {
  if (!currentStore.value) return '- › - › -'
  const { floorName, storeNumber, storeDisplayName } = currentStore.value
  return [floorName, storeNumber, storeDisplayName]
    .filter((v) => v && v !== '')
    .join(' › ')
})

const contractPeriodText = computed(() => {
  if (!detail.contractStartDate || !detail.contractEndDate) return '-'
  return `${detail.contractStartDate} ~ ${detail.contractEndDate}`
})

const latestSettlementText = computed(() => {
  if (!detail.latestSettlementYear || !detail.latestSettlementMonth) return '-'
  const m = String(detail.latestSettlementMonth).padStart(2, '0')
  return `${detail.latestSettlementYear}.${m}`
})

// 숫자 포맷 (소수점 버림)
function formatNumber(v) {
  if (v === null || v === undefined) return ''
  const n = Number(v)
  if (Number.isNaN(n)) return ''
  return Math.trunc(n).toLocaleString()
}

function withWon(v) {
  if (v === null || v === undefined) return ''
  return `${formatNumber(v)} 원`
}

const formattedBaseRent = computed(() => formatNumber(detail.baseRentSnapshot))
const formattedContractCommissionRate = computed(() =>
  formatNumber(detail.commissionRate),
)

// 누적 매출액(총 매출) / 누적 수익(임대료+수수료)
const formattedAccumulatedSales = computed(() =>
  withWon(detail.totalSalesAccumulated),
)
const formattedAccumulatedRevenue = computed(() =>
  withWon(detail.finalRevenueAccumulated),
)

const formattedLatestTotalSales = computed(() =>
  formatNumber(detail.latestTotalSalesAmount),
)
const formattedLatestCommissionRate = computed(() =>
  formatNumber(detail.latestCommissionRate),
)
const formattedLatestCommissionAmount = computed(() =>
  formatNumber(detail.latestCommissionAmount),
)

const contractTypeMap = {
  LEASE: '임대',
  CONSIGNMENT: '위탁',
  MIX: '임대·위탁 혼합',
}

const contractTypeText = computed(() => {
  return contractTypeMap[detail.contractType] || detail.contractType
})

const showHistoryDialog = ref(false)
const activeHistoryTab = ref('settlement')

// 정산 히스토리 상태
const isSettlementLoading = ref(false)
const settlementHistory = ref([])
const settlementError = ref('')

const historyFilter = reactive({
  startYear: null,
  startMonth: null,
  endYear: null,
  endMonth: null,
})

// 일별 매출 상태
const isDailyLoading = ref(false)
const dailyHistory = ref([])
const dailyError = ref('')

const dailyFilter = reactive({
  startDate: '',
  endDate: '',
})

// 연도 옵션 (계약 기간 기준)
const yearOptions = computed(() => {
  let startYear
  let endYear

  if (detail.contractStartDate) {
    startYear = Number(detail.contractStartDate.substring(0, 4))
  }
  if (detail.contractEndDate) {
    endYear = Number(detail.contractEndDate.substring(0, 4))
  }

  if (!startYear) {
    startYear = detail.latestSettlementYear || new Date().getFullYear()
  }
  if (!endYear) {
    endYear = detail.latestSettlementYear || startYear
  }

  const list = []
  for (let y = startYear; y <= endYear; y += 1) {
    list.push({ label: `${y}년`, value: y })
  }
  return list
})

const monthOptions = [
  { label: '1월', value: 1 },
  { label: '2월', value: 2 },
  { label: '3월', value: 3 },
  { label: '4월', value: 4 },
  { label: '5월', value: 5 },
  { label: '6월', value: 6 },
  { label: '7월', value: 7 },
  { label: '8월', value: 8 },
  { label: '9월', value: 9 },
  { label: '10월', value: 10 },
  { label: '11월', value: 11 },
  { label: '12월', value: 12 },
]

function formatYearMonth(year, month) {
  if (!year || !month) return '-'
  const m = String(month).padStart(2, '0')
  return `${year}.${m}`
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const [y, m, d] = dateStr.split('-')
  if (!y || !m || !d) return dateStr
  return `${y}.${m}.${d}`
}

async function loadSettlementHistory() {
  if (!detail.contractId) return
  if (
    !historyFilter.startYear ||
    !historyFilter.startMonth ||
    !historyFilter.endYear ||
    !historyFilter.endMonth
  ) {
    return
  }

  isSettlementLoading.value = true
  settlementError.value = ''
  settlementHistory.value = []

  try {
    const res = await getSettlementHistory(detail.contractId, {
      startYear: historyFilter.startYear,
      startMonth: historyFilter.startMonth,
      endYear: historyFilter.endYear,
      endMonth: historyFilter.endMonth,
    })
    const dto = res.data
    settlementHistory.value = dto.settlements || []
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.errorMessage ||
      '정산 내역을 불러올 수 없습니다.'
    settlementError.value = msg
  } finally {
    isSettlementLoading.value = false
  }
}

async function loadDailyHistory() {
  const store = currentStore.value
  if (!store || !store.storeTenantMapId) return
  if (!dailyFilter.startDate || !dailyFilter.endDate) return

  isDailyLoading.value = true
  dailyError.value = ''
  dailyHistory.value = []

  try {
    const res = await getDailySalesHistory(store.storeTenantMapId, {
      startDate: dailyFilter.startDate,
      endDate: dailyFilter.endDate,
    })
    const dto = res.data
    dailyHistory.value = dto.items || []
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.errorMessage ||
      '일별 매출을 불러올 수 없습니다.'
    dailyError.value = msg
  } finally {
    isDailyLoading.value = false
  }
}

function openHistoryDialog() {
  showHistoryDialog.value = true
  activeHistoryTab.value = 'settlement'
  settlementError.value = ''
  dailyError.value = ''
}

async function loadDetail() {
  const revenueId = route.params.revenueId || route.params.id
  if (!revenueId) return

  const storeTenantMapId = route.query.storeTenantMapId
    ? Number(route.query.storeTenantMapId)
    : undefined

  const res = await getRevenueDetail(revenueId, storeTenantMapId)
  const dto = res.data

  detail.projectId = dto.projectId
  detail.projectTitle = dto.projectTitle
  detail.projectType = dto.projectType
  detail.salesManagerName = dto.salesManagerName
  detail.contractId = dto.contractId
  detail.contractTitle = dto.contractTitle
  detail.contractType = dto.contractType
  detail.contractStartDate = dto.contractStartDate
  detail.contractEndDate = dto.contractEndDate
  detail.currency = dto.currency
  detail.commissionRate = dto.commissionRate
  detail.depositAmount = dto.depositAmount
  detail.paymentCondition = dto.paymentCondition
  detail.clientCompanyName = dto.clientCompanyName
  detail.clientName = dto.clientName
  detail.stores = dto.stores || []
  detail.revenueId = dto.revenueId
  detail.baseRentSnapshot = dto.baseRentSnapshot
  detail.totalSalesAccumulated = dto.totalSalesAccumulated
  detail.commissionAmountAccumulated = dto.commissionAmountAccumulated
  detail.finalRevenueAccumulated = dto.finalRevenueAccumulated
  detail.latestSettlementYear = dto.latestSettlementYear
  detail.latestSettlementMonth = dto.latestSettlementMonth
  detail.latestTotalSalesAmount = dto.latestTotalSalesAmount
  detail.latestCommissionRate = dto.latestCommissionRate
  detail.latestCommissionAmount = dto.latestCommissionAmount
  detail.latestFinalRevenue = dto.latestFinalRevenue
}

onMounted(loadDetail)
</script>

<style scoped>
.detail-container {
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: 8px 16px 10px !important;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui,
    'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

/* 상단 헤더 */
.header-row {
  max-width: 1100px;
  margin: 0 auto 8px;
}

.project-title {
  max-width: 1100px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;
  margin: 4px auto 0;
}

.subtitle {
  max-width: 1100px;
  margin: 2px auto 0;
  font-size: 0.78rem;
  color: #6b6b6b;
}

.subtitle-item {
  color: #555;
}

.divider {
  margin: 0 4px;
  color: #b3b3b3;
}

/* 카드 레이아웃 */
.cards-row {
  max-width: 1100px;
  margin: 0 auto;
}

.project-col {
  padding-left: 8px;
  padding-right: 8px;
  margin-bottom: 20px;
}

.project-card {
  border-radius: 14px;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  padding: 10px 16px 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  padding: 4px 0 2px;
  margin-bottom: 12px;
}

.project-card :deep(.v-col) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.input-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

.input-field {
  border-radius: 6px !important;
}

.input-field :deep(.v-field) {
  --v-input-control-height: 45px !important;
  min-height: 45px !important;
  height: 45px !important;
}

.input-field :deep(.v-field__input),
.input-field :deep(input),
.input-field :deep(textarea) {
  font-size: 0.78rem !important;
  line-height: 1.25 !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  min-height: 45px !important;
}

.readonly-field :deep(.v-field__overlay) {
  background-color: #f5f5f5 !important;
}

.readonly-field :deep(input) {
  color: #555 !important;
}

/* 접미사: 원 / % */
.suffix-won,
.suffix-percent {
  position: relative;
}

.suffix-won :deep(.v-field__input),
.suffix-percent :deep(.v-field__input) {
  padding-right: 28px !important;
}

.suffix-won::after,
.suffix-percent::after {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.78rem;
  color: #555;
}

.suffix-won::after {
  content: '원';
}

.suffix-percent::after {
  content: '%';
}

/* 좌측 카드 하단 누적 매출/수익 */
.summary-row {
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 16px;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-left: 8px;
}

.summary-label {
  font-size: 0.82rem;
  color: #555;
  font-weight: 600;
  margin-bottom: 2px;
}

.summary-value {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

/* 이력 카드 스타일 */
.history-card {
  border-radius: 16px;
  border: 1px solid #e5e5e5;
  background-color: #fff;
  padding: 10px 14px;
  margin-top: 4px;
}

.history-inner {
  display: flex;
}

.history-left {
  position: relative;
  width: 32px;
  display: flex;
  justify-content: center;
}

.history-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e5e5e5;
}

.history-icon {
  position: relative;
  z-index: 1;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-icon--settlement {
  background-color: #eef3ff;
}

.history-main {
  flex: 1;
  margin-left: 10px;
}

.history-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.history-type {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.history-date {
  font-size: 0.75rem;
  color: #999;
}

.history-title {
  font-size: 0.86rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 2px;
}

.history-desc {
  font-size: 0.78rem;
  color: #555;
  margin-bottom: 2px;
}

.history-meta {
  font-size: 0.75rem;
  color: #777;
  margin-bottom: 2px;
}

.history-amount {
  font-size: 0.8rem;
  font-weight: 600;
  color: #111;
}

.history-more-row {
  margin-top: 6px;
  display: flex;
  justify-content: flex-end;
}

.history-more-btn {
  font-size: 0.75rem;
  text-transform: none;
  padding: 0 4px;
  min-width: auto;
}

/* 모달 */
.history-dialog-card {
  border-radius: 18px;
  background-color: #f9f9fb;
}

.dialog-title {
  font-size: 1rem;
  font-weight: 600;
  padding: 10px 16px;
}

.dialog-body {
  padding: 12px 16px 16px;
}

/* iOS 탭 */
.ios-tabs-wrapper {
  background-color: transparent;
  padding: 4px 2px 6px;
  margin-bottom: 6px;
}

.ios-tabs {
  background-color: #f2f2f7;
  border-radius: 999px;
  padding: 3px;
  min-height: 32px;
}

.ios-tabs :deep(.v-slide-group__content) {
  gap: 4px;
}

.ios-tab {
  flex: 1;
  border-radius: 999px !important;
  text-transform: none !important;
  font-size: 0.8rem !important;
  min-height: 28px !important;
  padding: 4px 10px !important;
  letter-spacing: 0 !important;
}

.ios-tab :deep(.v-btn__content) {
  line-height: 1.2 !important;
}

.ios-tab--active {
  background-color: #ffffff !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 탭 전환 애니메이션 제거 */
.ios-tabs :deep(.v-btn),
.ios-tabs :deep(.v-tab),
.ios-tabs :deep(.v-slide-group__content),
.ios-tabs :deep(.v-btn__overlay),
.ios-tabs :deep(.v-btn__underlay) {
  transition: none !important;
}

/* v-window 전환 애니메이션 제거 */
.history-window :deep(.v-window__container),
.history-window :deep(.v-window-item) {
  transition: none !important;
}

.history-window {
  margin-top: 4px;
}

/* 필터 */
.dialog-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 18px;
  margin-bottom: 12px;
}

.filter-select {
  min-width: 120px;
  max-width: 160px;
}

.filter-tilde {
  font-size: 0.9rem;
  color: #666;
}

.filter-search-btn {
  margin-left: auto;
  font-size: 0.8rem;
  text-transform: none;
}

/* 모달 내용 */
.dialog-loading,
.dialog-empty {
  font-size: 0.85rem;
  color: #666;
  padding: 12px 4px;
}

/* 에러 메시지 */
.dialog-error {
  font-size: 0.82rem;
  color: #dc2626;
  padding: 10px 4px;
}

.dialog-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dialog-history-item {
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  padding: 10px 12px;
  background-color: #ffffff;
}

.dialog-history-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.dialog-history-date {
  font-size: 0.85rem;
  color: #777;
}

.dialog-history-title {
  font-size: 0.86rem;
  font-weight: 600;
  color: #222;
}

.dialog-history-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-top: 2px;
}

.dialog-history-row .label {
  color: #555;
}

.dialog-history-row .value {
  color: #111;
}

.dialog-history-row--strong .label {
  font-weight: 600;
}

.dialog-history-row--strong .value {
  font-weight: 700;
}
</style>
