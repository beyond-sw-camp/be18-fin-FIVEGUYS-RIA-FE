<!-- src/modules/dashboard/view/StatsDashboard.vue -->
<template>
  <div class="stats-dashboard">
    <header class="page-header">
      <div class="page-header-main">
        <div>
          <h1 class="page-title">매출 · 계약 분석 대시보드</h1>
          <p class="page-desc">
          </p>
        </div>

        <v-btn-toggle v-model="selectedRole" mandatory class="role-toggle" rounded="xl">
          <v-btn value="ROLE_SALES_MEMBER" class="role-toggle-btn">
            팀원
          </v-btn>
          <v-btn value="ROLE_SALES_LEAD" class="role-toggle-btn">
            팀장
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- 기준 월 · 이전/다음 달 네비게이션 -->
      <div class="period-nav" v-if="currentYear && currentMonth">
        <div class="period-left">
          <span class="period-label">기준 월</span>
          <span class="period-value">{{ displayMonth }}</span>
        </div>
        <div class="period-right">
          <v-btn size="small" variant="text" class="period-btn" :disabled="!hasPrevMonth" @click="goPrevMonth">
            ‹ 이전달
          </v-btn>
          <v-btn size="small" variant="text" class="period-btn" :disabled="!hasNextMonth" @click="goNextMonth">
            다음달 ›
          </v-btn>
        </div>
      </div>
    </header>

    <v-container class="dashboard-container" fluid>
      <!-- 팀원 화면 -->
      <v-row v-if="isMember" dense class="chart-grid">
        <!-- 좌상단: 매장별 월매출 (Amount = bar, Count = line) -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="storeMonthlySalesChart" title="매장별 월매출" subtitle="담당 매장 월 매출 · 판매건수" type="bar"
            :data="storeMonthlySalesChart" :options="mixedStoreSalesOptions" />
        </v-col>

        <!-- 우상단: 계약별 실적 비교 (매출/수익 4종) -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="contractPerformance" title="계약별 실적 비교" subtitle="담당 매장 매출 · 수익 vs 목표" type="bar"
            :data="contractPerformance" :options="groupedBarOptions('원')" />
        </v-col>

        <!-- 좌하단: 브랜드별 매출 점유율 (도넛) -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="brandShare" title="브랜드별 매출 점유율" subtitle="담당 브랜드 기준" type="doughnut" :data="brandShare"
            :options="donutOptions" />
        </v-col>

        <!-- 우하단: 팝업/전시회 일별 매출 -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="popupDaily" :title="popupTitle" :subtitle="popupSubtitle" type="line" :data="popupDaily"
            :options="lineOptions('원', true)" />
        </v-col>
      </v-row>

      <!-- 팀장 화면 -->
      <v-row v-else dense class="chart-grid">
        <!-- 좌상단: 브랜드별 월매출 랭킹 (상위/하위 TOP5 리스트) -->
        <v-col cols="12" md="6" class="chart-cell">
          <v-card class="chart-card rank-card" elevation="2">
            <div class="rank-card-header">
              <div>
                <h2 class="rank-card-title">브랜드별 월매출 랭킹</h2>
              </div>
            </div>

            <div class="rank-card-body">
              <!-- 상위 TOP5 -->
              <div class="rank-column">
                <div class="rank-column-title">매출 상위 TOP5 브랜드</div>
                <ul class="rank-list">
                  <li v-for="item in brandRankingTop" :key="`top-${item.rank}`" class="rank-item">
                    <div class="rank-item-left">
                      <div class="rank-avatar">
                        <span class="rank-avatar-floor">{{ item.floorName || 'FL' }}</span>
                      </div>
                      <div class="rank-meta">
                        <div class="rank-main-line">
                          <span class="rank-order">#{{ item.rank }}</span>
                          <span class="rank-brand">{{ item.storeName }}</span>
                        </div>
                        <div class="rank-amount">
                          {{ formatAmount(item.totalAmount) }} 원
                        </div>
                      </div>
                    </div>
                    <div class="rank-item-right">
                      <span class="rank-change" :class="item.direction === 'up' ? 'is-up' : 'is-down'">
                        {{ formatChangeRate(item.changeRate) }}
                      </span>
                      <v-icon size="16" class="rank-change-icon"
                        :color="item.direction === 'up' ? '#dc2626' : '#2563eb'">
                        {{ item.direction === 'up' ? 'mdi-trending-up' : 'mdi-trending-down' }}
                      </v-icon>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 하위 TOP5 -->
              <div class="rank-column">
                <div class="rank-column-title">매출 하위 TOP5 브랜드</div>
                <ul class="rank-list">
                  <li v-for="item in brandRankingBottom" :key="`bottom-${item.rank}`" class="rank-item">
                    <div class="rank-item-left">
                      <div class="rank-avatar">
                        <span class="rank-avatar-floor">{{ item.floorName || 'FL' }}</span>
                      </div>
                      <div class="rank-meta">
                        <div class="rank-main-line">
                          <span class="rank-order">#{{ item.rank }}</span>
                          <span class="rank-brand">{{ item.storeName }}</span>
                        </div>
                        <div class="rank-amount">
                          {{ formatAmount(item.totalAmount) }} 원
                        </div>
                      </div>
                    </div>
                    <div class="rank-item-right">
                      <span class="rank-change" :class="item.direction === 'up' ? 'is-up' : 'is-down'">
                        {{ formatChangeRate(item.changeRate) }}
                      </span>
                      <v-icon size="16" class="rank-change-icon"
                        :color="item.direction === 'up' ? '#dc2626' : '#2563eb'">
                        {{ item.direction === 'up' ? 'mdi-trending-up' : 'mdi-trending-down' }}
                      </v-icon>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- 우상단: 월 정산 금액 추이 -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="monthlySettlement" title="월 정산 금액 추이" subtitle="실제 수익 흐름" type="line"
            :data="monthlySettlement" :options="lineOptions('원', true)" />
        </v-col>

        <!-- 좌하단: 매장 면적 대비 효율 -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="storeEfficiency" title="매장 면적 대비 효율 TOP5 / 하위5" subtitle="재계약 · 면적 조정 기준" type="bar"
            :data="storeEfficiency" :options="barOptions('원/㎡')" />
        </v-col>

        <!-- 우하단: 층별 매출 -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="floorSales" title="층별 매출" subtitle="층 전략 및 리뉴얼 판단" type="bar" :data="floorSales"
            :options="barOptions('원')" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import ChartCard from "@/components/charts/ChartCard.vue";
import {
  fetchMonthlyStoreSales,
  fetchMonthlyPerformance,
  fetchBrandMonthlyShare,
  fetchPopupDailySales,
  fetchBrandMonthlyRanking,
  fetchMonthlySettlementTrend,
  fetchStoreAreaEfficiencyRanking,
  fetchMonthlyFloorSales,
} from "@/apis/dashboard";

const props = defineProps({
  initialRole: {
    type: String,
    default: "ROLE_SALES_MEMBER",
  },
});

const selectedRole = ref(props.initialRole);

const isMember = computed(() => selectedRole.value === "ROLE_SALES_MEMBER");
const isLead = computed(() => selectedRole.value === "ROLE_SALES_LEAD");

/**
 * 색상 팔레트
 */
const COLOR_BLUE = "#4F81BD";
const COLOR_BLUE_SOFT = "rgba(79, 129, 189, 0.22)";
const COLOR_ORANGE = "#F79646";
const COLOR_ORANGE_SOFT = "rgba(247, 150, 70, 0.22)";

const BRAND_COLORS = ["#10B981", "#0F766E", "#FBBF24", "#F97316", "#111827"];

/**
 * 공통 옵션
 */
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      beginAtZero: true,
      ticks: {
        callback: (v) => Number(v).toLocaleString(),
      },
    },
  },
};

const barOptions = (unitLabel) => ({
  ...baseOptions,
  plugins: {
    ...baseOptions.plugins,
    tooltip: {
      ...baseOptions.plugins.tooltip,
      callbacks: {
        label: (ctx) =>
          `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} ${unitLabel}`,
      },
    },
  },
});

const groupedBarOptions = (unitLabel) => ({
  ...barOptions(unitLabel),
  scales: {
    ...baseOptions.scales,
    x: {
      ...baseOptions.scales.x,
      categoryPercentage: 0.7,
      barPercentage: 0.8,
    },
  },
});

const lineOptions = (unitLabel, showArea = false) => ({
  ...baseOptions,
  elements: {
    line: { tension: 0.3, fill: showArea },
    point: { radius: 3 },
  },
  plugins: {
    ...baseOptions.plugins,
    tooltip: {
      ...baseOptions.plugins.tooltip,
      callbacks: {
        label: (ctx) =>
          `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} ${unitLabel}`,
      },
    },
  },
});

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        padding: 10,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const value = ctx.parsed;
          return `${ctx.label}: ${value.toLocaleString()}%`;
        },
      },
    },
  },
  cutout: "70%",
};

/**
 * 매장별 월매출 차트 옵션 (Amount = bar, Count = line)
 */
const mixedStoreSalesOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" },
    tooltip: {
      mode: "index",
      intersect: false,
      callbacks: {
        label: (ctx) => {
          const value = ctx.parsed.y ?? ctx.parsed;
          if (ctx.dataset.yAxisID === "y1") {
            return `${ctx.dataset.label}: ${Number(value).toLocaleString()} 원`;
          }
          return `${ctx.dataset.label}: ${Number(value).toLocaleString()} 건`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y1: {
      type: "linear",
      position: "left",
      beginAtZero: true,
      ticks: {
        callback: (v) => Number(v).toLocaleString(),
      },
    },
    y2: {
      type: "linear",
      position: "right",
      beginAtZero: true,
      grid: { drawOnChartArea: false },
      ticks: {
        callback: (v) => Number(v).toLocaleString(),
      },
    },
  },
};

/**
 * API 데이터 상태
 */
const currentYear = ref(null);
const currentMonth = ref(null);
const hasPrevMonth = ref(false);
const hasNextMonth = ref(false);

const storeMonthlySalesChart = ref(null);
const contractPerformance = ref(null);
const brandShare = ref(null);
const popupDaily = ref(null);

const popupStoreName = ref(null);

/**
 * 랭킹 데이터
 */
const brandRankingTop = ref([]);
const brandRankingBottom = ref([]);

/**
 * 팀장용 월 정산 추이 데이터
 */
const monthlySettlement = ref(null);

/**
 * 팀장용 매장 면적 효율 데이터
 */
const storeEfficiency = ref(null);

/**
 * 층별 매출 데이터
 */
const floorSales = ref(null);

/**
 * 기준 월 표시
 */
const displayMonth = computed(() => {
  if (!currentYear.value || !currentMonth.value) return "-";
  return `${currentYear.value}년 ${String(currentMonth.value).padStart(2, "0")}월`;
});

/**
 * 팝업/전시회 타이틀/서브타이틀
 */
const popupTitle = computed(() => {
  if (!popupStoreName.value) return "팝업/전시회 일별 매출";
  return `${popupStoreName.value} 일별 매출`;
});

const popupSubtitle = computed(() => {
  if (!popupStoreName.value) return "담당 행사 기간 성과";
  return `${popupStoreName.value} · 행사 기간 성과`;
});

/**
 * 계약별 실적/목표/수익
 */
async function loadMonthlyPerformance(year = null, month = null) {
  const { data } = await fetchMonthlyPerformance({ year, month });

  const labels = data.stores.map((s) => s.storeName);

  const targetAmountData = data.stores.map((s) => s.targetAmount);
  const actualAmountData = data.stores.map((s) => s.actualAmount);
  const expectedProfitData = data.stores.map((s) => s.expectedProfit);
  const actualProfitData = data.stores.map((s) => s.actualProfit);

  contractPerformance.value = {
    labels,
    datasets: [
      {
        label: "목표 매출",
        data: targetAmountData,
        backgroundColor: COLOR_BLUE_SOFT,
        borderRadius: 8,
        maxBarThickness: 26,
      },
      {
        label: "실제 매출",
        data: actualAmountData,
        backgroundColor: COLOR_BLUE,
        borderRadius: 8,
        maxBarThickness: 26,
      },
      {
        label: "예상 수익",
        data: expectedProfitData,
        backgroundColor: COLOR_ORANGE_SOFT,
        borderRadius: 8,
        maxBarThickness: 26,
      },
      {
        label: "실제 수익",
        data: actualProfitData,
        backgroundColor: COLOR_ORANGE,
        borderRadius: 8,
        maxBarThickness: 26,
      },
    ],
  };
}

/**
 * 담당 브랜드별 매출 점유율
 */
async function loadBrandShare(year = null, month = null) {
  const { data } = await fetchBrandMonthlyShare({ year, month });

  const labels = data.stores.map((s) => s.storeName);
  const amountData = data.stores.map((s) => s.totalSalesAmount);

  const total = amountData.reduce((a, b) => a + b, 0);
  const shares =
    total > 0
      ? amountData.map((v) => Math.round((v / total) * 100))
      : amountData.map(() => 0);

  brandShare.value = {
    labels,
    datasets: [
      {
        data: shares,
        backgroundColor: BRAND_COLORS.slice(0, labels.length),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };
}

/**
 * 팝업/전시회 일별 매출
 */
async function loadPopupDailySalesData(year = null, month = null) {
  const { data } = await fetchPopupDailySales({ year, month });

  const days = Array.isArray(data.days) ? data.days : [];

  popupStoreName.value =
    days.length > 0 && days[0].storeName ? days[0].storeName : null;

  const labels = days.map((d) => `${d.day}일`);
  const amountData = days.map((d) => d.totalAmount);

  popupDaily.value = {
    labels,
    datasets: [
      {
        type: "line",
        label: popupStoreName.value
          ? `${popupStoreName.value} 일별 매출`
          : "일별 매출",
        data: amountData,
        borderColor: COLOR_ORANGE,
        backgroundColor: COLOR_ORANGE_SOFT,
        tension: 0.25,
        pointRadius: 3,
        fill: true,
      },
    ],
  };
}

/**
 * 브랜드별 월매출 랭킹
 */
async function loadBrandMonthlyRanking(year = null, month = null) {
  const { data } = await fetchBrandMonthlyRanking({ year, month });

  brandRankingTop.value = Array.isArray(data.topBrands) ? data.topBrands : [];
  brandRankingBottom.value = Array.isArray(data.bottomBrands)
    ? data.bottomBrands
    : [];
}

/**
 * 매장 면적 대비 효율 TOP5 / 하위5
 */
async function loadStoreAreaEfficiencyRanking(year = null, month = null) {
  const { data } = await fetchStoreAreaEfficiencyRanking({ year, month });

  const top = Array.isArray(data.topStores) ? data.topStores : [];
  const bottom = Array.isArray(data.bottomStores) ? data.bottomStores : [];

  const labels = [
    ...top.map((s) => s.storeName),
    ...bottom.map((s) => s.storeName),
  ];

  const efficiencyData = [
    ...top.map((s) => s.efficiency),
    ...bottom.map((s) => s.efficiency),
  ];

  const backgroundColor = [
    ...top.map(() => COLOR_BLUE), // 상위 TOP5
    ...bottom.map(() => COLOR_ORANGE), // 하위 TOP5
  ];

  storeEfficiency.value = {
    labels,
    datasets: [
      {
        label: "면적당 수익 (원/㎡)",
        data: efficiencyData,
        backgroundColor,
        borderRadius: 8,
        maxBarThickness: 38,
      },
    ],
  };
}

/**
 * 층별 매출
 */
async function loadMonthlyFloorSales(year = null, month = null) {
  const { data } = await fetchMonthlyFloorSales({ year, month });

  const floors = Array.isArray(data.floors) ? data.floors : [];

  const labels = floors.map((f) => f.floorName);
  const amountData = floors.map((f) => f.totalAmount);

  floorSales.value = {
    labels,
    datasets: [
      {
        label: "층별 매출",
        data: amountData,
        backgroundColor: COLOR_BLUE,
        borderRadius: 8,
        maxBarThickness: 38,
      },
    ],
  };
}

/**
 * 팀장용 – 월 정산 금액 추이
 */
async function loadMonthlySettlementTrend(year = null) {
  const params = {};
  if (year) params.year = year;

  const { data } = await fetchMonthlySettlementTrend(params);

  const labels = (data.items || []).map((item) =>
    `${String(item.month).padStart(2, "0")}월`
  );
  const amounts = (data.items || []).map((item) => item.totalAmount);

  monthlySettlement.value = {
    labels,
    datasets: [
      {
        label: "정산 금액",
        data: amounts,
        borderColor: COLOR_ORANGE,
        backgroundColor: COLOR_ORANGE_SOFT,
        tension: 0.25,
        pointRadius: 3,
        fill: true,
      },
    ],
  };
}

/**
 * 매장별 월매출
 * 이걸 기준으로 다른 차트들도 같은 year/month 사용
 */
const loadMonthlyStoreSales = async (year = null, month = null) => {
  const { data } = await fetchMonthlyStoreSales({ year, month });

  currentYear.value = data.year;
  currentMonth.value = data.month;
  hasPrevMonth.value = data.hasPrevMonth;
  hasNextMonth.value = data.hasNextMonth;

  const labels = data.stores.map((s) => s.storeName);
  const amountData = data.stores.map((s) => s.totalSalesAmount);
  const countData = data.stores.map((s) => s.totalSalesCount);

  storeMonthlySalesChart.value = {
    labels,
    datasets: [
      {
        type: "bar",
        label: "매출액",
        data: amountData,
        yAxisID: "y1",
        backgroundColor: COLOR_BLUE,
        borderRadius: 8,
        maxBarThickness: 38,
      },
      {
        type: "line",
        label: "판매건수",
        data: countData,
        yAxisID: "y2",
        tension: 0.25,
        borderColor: COLOR_ORANGE,
        backgroundColor: COLOR_ORANGE,
        pointRadius: 3,
        pointHoverRadius: 4,
      },
    ],
  };

  await loadMonthlyPerformance(data.year, data.month);
  await loadBrandShare(data.year, data.month);
  await loadPopupDailySalesData(data.year, data.month);
  await loadBrandMonthlyRanking(data.year, data.month);
  await loadStoreAreaEfficiencyRanking(data.year, data.month);
  await loadMonthlyFloorSales(data.year, data.month);
  await loadMonthlySettlementTrend(data.year);
};

/**
 * 월 이동
 */
const changeMonth = (offset) => {
  if (!currentYear.value || !currentMonth.value) return;
  const base = new Date(currentYear.value, currentMonth.value - 1 + offset, 1);
  const nextYear = base.getFullYear();
  const nextMonth = base.getMonth() + 1;
  loadMonthlyStoreSales(nextYear, nextMonth);
};

const goPrevMonth = () => {
  if (!hasPrevMonth.value) return;
  changeMonth(-1);
};

const goNextMonth = () => {
  if (!hasNextMonth.value) return;
  changeMonth(1);
};

/**
 * 역할 변경 시 데이터 로딩 전략
 */
watch(
  () => selectedRole.value,
  async (role) => {
    if (role === "ROLE_SALES_LEAD" && currentYear.value) {
      await loadMonthlySettlementTrend(currentYear.value);
      await loadBrandMonthlyRanking(currentYear.value, currentMonth.value);
      await loadStoreAreaEfficiencyRanking(currentYear.value, currentMonth.value);
      await loadMonthlyFloorSales(currentYear.value, currentMonth.value);
    }
  }
);

onMounted(() => {
  loadMonthlyStoreSales();
});

/**
 * 포맷터
 */
const formatChangeRate = (v) => {
  if (v == null || isNaN(v)) return "-";
  const num = Number(v);
  const fixed = num.toFixed(1);
  return (num > 0 ? "+" : "") + fixed + "%";
};

const formatAmount = (v) => {
  if (v == null || isNaN(v)) return "-";
  return Number(v).toLocaleString();
};
</script>

<style scoped>
.stats-dashboard {
  padding: 16px 16px 56px;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui,
    -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.page-header {
  margin-bottom: 12px;
}

.page-header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: #0f172a;
}

.page-desc {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

/* 기준 월 · 이전/다음 달 네비게이션 */
.period-nav {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid #e5e7eb;
}

.period-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.period-label {
  font-size: 12px;
  color: #9ca3af;
}

.period-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.period-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.period-btn {
  text-transform: none;
  font-size: 12px;
  min-width: 0;
  padding-inline: 6px;
}

/* 역할 토글 */
.role-toggle {
  background: #f2f2f7;
  padding: 2px;
  border-radius: 999px !important;
  min-height: 32px;
  box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.04);
}

.role-toggle :deep(.v-btn-group) {
  border-radius: 999px;
}

.role-toggle-btn {
  text-transform: none;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.2px;
  box-shadow: none !important;
}

.role-toggle-btn :deep(.v-btn__overlay) {
  display: none;
}

.role-toggle-btn :deep(.v-btn__content) {
  padding-inline: 10px;
}

.role-toggle :deep(.v-btn--active:not(.v-btn--disabled).v-btn--variant-elevated) {
  background-color: #ffffff;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
}

/* 대시보드 영역 */
.dashboard-container {
  padding: 0;
  margin-top: 8px;
}

.chart-grid {}

.chart-cell {
  display: flex;
  flex-direction: column;
  padding: 6px !important;
}

/* 공통 카드 스타일 (ChartCard + 랭킹 카드) */
.chart-cell :deep(.chart-card),
.rank-card {
  border-radius: 22px;
  background: #ffffff;
  box-shadow:
    0 0 0 0.5px rgba(15, 23, 42, 0.03),
    0 10px 25px rgba(15, 23, 42, 0.06);
  padding: 12px 12px 4px;
}

/* 랭킹 카드 – 내부 레이아웃만 정의 */
.rank-card {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.rank-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rank-card-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: #0f172a;
}

.rank-card-subtitle {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.rank-card-body {
  display: flex;
  gap: 24px;
  margin-top: 14px;
  flex: 1;
}

/* 랭킹 리스트 내부 */
.rank-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.rank-column-title {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.rank-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rank-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 4px;
}

.rank-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-avatar-floor {
  font-size: 13px;
  font-weight: 600;
  color: #f9fafb;
}

.rank-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rank-main-line {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.rank-order {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.rank-brand {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}

.rank-amount {
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
}

.rank-item-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rank-change {
  font-size: 12px;
  font-weight: 600;
}

.rank-change.is-up {
  color: #dc2626;
}

.rank-change.is-down {
  color: #2563eb;
}

.rank-change-icon {
  margin-top: 1px;
}

/* 반응형 */
@media (max-width: 960px) {
  .stats-dashboard {
    padding: 12px 12px 56px;
  }

  .chart-cell {
    min-height: 260px;
  }

  .period-nav {
    flex-direction: column;
    align-items: flex-start;
  }

  .period-right {
    align-self: flex-end;
  }

  .rank-card-body {
    flex-direction: column;
  }
}
</style>
