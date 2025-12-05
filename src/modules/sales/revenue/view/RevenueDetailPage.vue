<template>
  <v-container fluid class="detail-container">
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
      <v-col cols="12" md="6" class="project-col">
        <v-card class="project-card mb-3" elevation="2">
          <v-card-title class="card-title">프로젝트 기본 정보</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12">
                <div class="input-label">프로젝트명</div>
                <v-text-field :model-value="detail.projectTitle" readonly variant="outlined"
                  class="input-field readonly-field" hide-details />
              </v-col>

              <v-col cols="12">
                <div class="input-label">계약</div>
                <v-text-field :model-value="detail.contractTitle" readonly variant="outlined"
                  class="input-field readonly-field" hide-details />
              </v-col>

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

              <v-col cols="12" md="6">
                <div class="input-label">영업 담당</div>
                <v-text-field :model-value="detail.salesManagerName" readonly variant="outlined"
                  class="input-field readonly-field" hide-details />
              </v-col>

              <v-col cols="12" md="6">
                <div class="input-label">계약 기간</div>
                <v-text-field :model-value="contractPeriodText" readonly variant="outlined"
                  class="input-field readonly-field" hide-details />
              </v-col>

              <!-- 계약 당시 임대료 -->
              <v-col cols="12" md="6">
                <div class="input-label">계약 당시 임대료 (월)</div>
                <v-text-field :model-value="formattedBaseRent" readonly variant="outlined"
                  class="input-field readonly-field has-won" hide-details />
              </v-col>

              <!-- 계약 당시 수수료율 -->
              <v-col cols="12" md="6">
                <div class="input-label">계약 당시 수수료율</div>
                <v-text-field :model-value="formattedContractCommissionRate" readonly variant="outlined"
                  class="input-field readonly-field has-percent" hide-details />
              </v-col>

            </v-row>
          </v-card-text>

          <v-card-actions class="summary-row">
            <div class="summary-label">누적 매출</div>
            <div class="summary-value">
              {{ formattedTotalSalesAccumulated }}
            </div>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 우측 정산카드 -->
      <v-col cols="12" md="6" class="project-col">
        <v-card class="project-card mb-3" elevation="2">
          <v-card-title class="card-title">매장 및 수수료 정보</v-card-title>

          <v-card-text class="pa-0">
            <div class="history-card settlement-card">
              <div class="history-inner">
                <div class="history-left">
                  <div class="history-line" />
                  <div class="history-icon history-icon--settlement">
                    <v-icon size="18">mdi-cash-multiple</v-icon>
                  </div>
                </div>

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
                    KRW {{ Number(detail.latestFinalRevenue || 0).toLocaleString() }}
                  </div>
                </div>

              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { getRevenueDetail } from '@/apis/revenue'

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
  return [floorName, storeNumber, storeDisplayName].filter(Boolean).join(' › ')
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

function formatNumber(v) {
  if (v === null || v === undefined) return ''
  return Number(v).toLocaleString()
}

function withWon(v) {
  if (v === null || v === undefined) return ''
  return `${Number(v).toLocaleString()} 원`
}

const formattedBaseRent = computed(() => formatNumber(detail.baseRentSnapshot))
const formattedContractCommissionRate = computed(() => formatNumber(detail.commissionRate))
const formattedTotalSalesAccumulated = computed(() => withWon(detail.totalSalesAccumulated))
const formattedLatestTotalSales = computed(() => formatNumber(detail.latestTotalSalesAmount))
const formattedLatestCommissionRate = computed(() => formatNumber(detail.latestCommissionRate))
const formattedLatestCommissionAmount = computed(() => formatNumber(detail.latestCommissionAmount))

const contractTypeMap = {
  LEASE: '임대',
  CONSIGNMENT: '위탁',
  MIX: '임대·위탁 혼합',
}

const contractTypeText = computed(() => contractTypeMap[detail.contractType] || detail.contractType)

async function loadDetail() {
  const revenueId = route.params.revenueId || route.params.id
  if (!revenueId) return

  const storeTenantMapId = route.query.storeTenantMapId
    ? Number(route.query.storeTenantMapId)
    : undefined

  const res = await getRevenueDetail(revenueId, storeTenantMapId)
  const dto = res.data

  Object.assign(detail, dto)
}

onMounted(loadDetail)
</script>

<style scoped>
.detail-container {
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: 8px 16px 10px !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
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

.has-won,
.has-percent {
  position: relative;
}

.has-won :deep(.v-field__input),
.has-percent :deep(.v-field__input) {
  padding-right: 28px !important;
}

.has-won::after,
.has-percent::after {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.78rem;
  color: #555;
}

.has-won::after {
  content: '원';
}

.has-percent::after {
  content: '%';
}

/* 접미사 영역을 인풋 안에 붙여서 보이게 */
.suffix-inline :deep(.v-field__append-inner) {
  padding-inline-start: 4px;
  padding-inline-end: 10px;
  align-items: center;
}

/* 텍스트 스타일 */
.suffix-inline-text {
  font-size: 0.78rem;
  color: #555;
}

.project-card {
  border-radius: 14px;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  padding: 10px 16px 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.input-field :deep(.v-field__suffix) {
  font-size: 0.78rem;
  color: #555;
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

.suffix-text {
  font-size: 0.78rem;
  line-height: 1.1;
  display: flex;
  align-items: center;
}

/* 좌측 카드 하단 누적 매출 */
.summary-row {
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 0.82rem;
  color: #555;
  font-weight: 600;
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
</style>
