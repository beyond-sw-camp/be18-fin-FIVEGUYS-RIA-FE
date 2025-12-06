<!-- src/modules/dashboard/view/StatsDashboard.vue -->
<template>
  <div class="stats-dashboard">
    <header class="page-header">
      <div class="page-header-main">
        <div>
          <h1 class="page-title">매출 · 계약 분석 대시보드</h1>
          <p class="page-desc">
            매장, 브랜드, 계약, 팝업/전시회 관리를 위한 핵심 지표
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
          <ChartCard v-if="popupDaily" title="팝업/전시회 일별 매출" subtitle="담당 행사 기간 성과" type="line" :data="popupDaily"
            :options="lineOptions('원', true)" />
        </v-col>
      </v-row>

      <!-- 팀장 화면 -->
      <v-row v-else dense class="chart-grid">
        <!-- 좌상단: 브랜드별 월매출 TOP5 / 하위5 -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="brandMonthlySalesTopBottom" title="브랜드별 월매출 TOP5 / 하위5" subtitle="브랜드 포트폴리오" type="bar"
            :data="brandMonthlySalesTopBottom" :options="stackedBarOptions('원')" />
        </v-col>

        <!-- 우상단: 월 정산 금액 추이 -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="monthlySettlement" title="월 정산 금액 추이" subtitle="실제 수익 흐름" type="line"
            :data="monthlySettlement" :options="lineOptions('원', true)" />
        </v-col>

        <!-- 좌하단: 매장 면적 대비 효율 -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="storeEfficiency" title="매장 면적 대비 효율 TOP5 / 하위5" subtitle="재계약 · 면적 조정 기준" type="bar"
            :data="storeEfficiency" :options="stackedBarOptions('원/㎡')" />
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
import { ref, computed, onMounted } from "vue";
import ChartCard from "@/components/charts/ChartCard.vue";
import { fetchMonthlyStoreSales, fetchMonthlyPerformance } from "@/apis/dashboard";

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
 * 색상 팔레트 – 매출(파랑) / 수익(주황), 목표·예상은 연한색, 실제는 진한색
 */
const COLOR_BLUE = "#4F81BD"; // 실제 매출
const COLOR_BLUE_SOFT = "rgba(79, 129, 189, 0.22)"; // 목표 매출
const COLOR_ORANGE = "#F79646"; // 실제 수익
const COLOR_ORANGE_SOFT = "rgba(247, 150, 70, 0.22)"; // 예상 수익

// 브랜드별 도넛용 색상
const BRAND_COLORS = [
  "#10B981", // teal
  "#0F766E",
  "#FBBF24",
  "#F97316",
  "#111827",
];

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

const stackedBarOptions = (unitLabel) => ({
  ...barOptions(unitLabel),
  scales: {
    x: { stacked: true, grid: { display: false } },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        callback: (v) => Number(v).toLocaleString(),
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

// 브랜드 점유율 도넛 옵션
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
 * y1: 금액, y2: 건수
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

// 매장별 월매출 차트 데이터
const storeMonthlySalesChart = ref(null);

// 계약별 실적 비교 차트 데이터
// (목표 매출 / 실제 매출 / 예상 수익 / 실제 수익)
const contractPerformance = ref(null);

// 담당 브랜드 매출 점유율 (도넛)
const brandShare = ref(null);

/**
 * 기준 월 표시용
 */
const displayMonth = computed(() => {
  if (!currentYear.value || !currentMonth.value) return "-";
  return `${currentYear.value}년 ${String(currentMonth.value).padStart(2, "0")}월`;
});

/**
 * 매장별 실적/목표/수익 호출
 * GET /api/dashboard/sales/performance
 * 배치: [목표 매출, 실제 매출] / [예상 수익, 실제 수익]
 */
async function loadMonthlyPerformance(year = null, month = null) {
  const { data } = await fetchMonthlyPerformance({
    year,
    month,
  });

  const labels = data.stores.map((s) => s.storeName);

  const targetAmountData = data.stores.map((s) => s.targetAmount); // 목표 매출
  const actualAmountData = data.stores.map((s) => s.actualAmount); // 실제 매출
  const expectedProfitData = data.stores.map((s) => s.expectedProfit); // 예상 수익
  const actualProfitData = data.stores.map((s) => s.actualProfit); // 실제 수익

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
 * 매장별 월매출 호출
 * GET /api/dashboard/sales/monthly
 */
const loadMonthlyStoreSales = async (year = null, month = null) => {
  const { data } = await fetchMonthlyStoreSales({
    year,
    month,
  });

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

  // 같은 기준 월로 실적/수익 차트도 갱신
  await loadMonthlyPerformance(data.year, data.month);

  // 브랜드별 매출 점유율 (현재는 mock · 담당 브랜드 기준으로 바꾸려면 여기서 API 매핑)
  // labels/amountData를 그대로 써서 "담당 매장 = 담당 브랜드" 관점으로 도넛 구성
  brandShare.value = {
    labels,
    datasets: [
      {
        data: amountData.map((v) => Math.round((v / amountData.reduce((a, b) => a + b, 0)) * 100)),
        backgroundColor: BRAND_COLORS.slice(0, labels.length),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };
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

// 첫 렌더 시 최신월 조회 (year/month null → 백엔드에서 기본값 처리)
onMounted(() => {
  loadMonthlyStoreSales();
});

/**
 * 아래부터는 나머지 mock 데이터 (블루/오렌지 팔레트 통일)
 */

// 브랜드별 월매출 TOP5 / 하위5
const brandMonthlySalesTopBottom = ref({
  labels: ["GUCCI", "LOUIS VUITTON", "NIKE", "ZARA", "MLB"],
  datasets: [
    {
      label: "상위 TOP5",
      data: [90000000, 82000000, 60000000, 45000000, 40000000],
      stack: "stack1",
      backgroundColor: COLOR_BLUE,
    },
    {
      label: "하위 TOP5",
      data: [8000000, 6000000, 5500000, 5200000, 5000000],
      stack: "stack1",
      backgroundColor: COLOR_ORANGE,
    },
  ],
});

// 월 정산 금액
const monthlySettlement = ref({
  labels: ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"],
  datasets: [
    {
      label: "정산 금액",
      data: [120000000, 135000000, 128000000, 150000000, 142000000, 160000000],
      borderColor: COLOR_ORANGE,
      backgroundColor: COLOR_ORANGE_SOFT,
      tension: 0.25,
      pointRadius: 3,
      fill: true,
    },
  ],
});

// 매장 면적 대비 효율
const storeEfficiency = ref({
  labels: ["명품관", "푸드관", "생활관", "아울렛", "키즈관"],
  datasets: [
    {
      label: "상위 TOP5",
      data: [950000, 830000, 780000, 720000, 700000],
      stack: "eff",
      backgroundColor: COLOR_BLUE,
    },
    {
      label: "하위 TOP5",
      data: [350000, 320000, 300000, 280000, 260000],
      stack: "eff",
      backgroundColor: COLOR_ORANGE,
    },
  ],
});

// 층별 매출
const floorSales = ref({
  labels: ["B1", "1F", "2F", "3F", "4F"],
  datasets: [
    {
      label: "층별 매출",
      data: [25000000, 42000000, 38000000, 30000000, 22000000],
      backgroundColor: COLOR_BLUE,
      borderRadius: 8,
      maxBarThickness: 38,
    },
  ],
});

// 팝업/전시회 일별 매출
const popupDaily = ref({
  labels: ["1일", "2일", "3일", "4일", "5일", "6일", "7일"],
  datasets: [
    {
      label: "일별 매출",
      data: [5000000, 6200000, 4800000, 7000000, 6800000, 7300000, 6500000],
      borderColor: COLOR_ORANGE,
      backgroundColor: COLOR_ORANGE_SOFT,
      tension: 0.25,
      pointRadius: 3,
      fill: true,
    },
  ],
});
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
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.18);
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

/* 카드 스타일 */
.chart-cell :deep(.chart-card) {
  border-radius: 22px;
  background: #ffffff;
  box-shadow:
    0 0 0 0.5px rgba(15, 23, 42, 0.03),
    0 10px 25px rgba(15, 23, 42, 0.06);
  padding: 12px 12px 4px;
}

.chart-cell :deep(.chart-card-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-cell :deep(.chart-card-title) {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: #0f172a;
}

.chart-cell :deep(.chart-card-subtitle) {
  font-size: 11px;
  color: #9ca3af;
}

/* 차트 높이 */
.chart-cell :deep(.chart-card-body),
.chart-cell :deep(.chart-wrapper) {
  min-height: 220px;
}

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
}
</style>
