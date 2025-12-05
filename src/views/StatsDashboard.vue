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
    </header>

    <v-container class="dashboard-container" fluid>
      <!-- 팀원 화면 -->
      <v-row v-if="isMember" dense class="chart-grid">
        <!-- 좌상단: 매장별 일매출 -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="storeDailySales" title="매장별 일매출" subtitle="담당 매장/층 일매출" type="bar" :data="storeDailySales"
            :options="barOptions('원')" />
        </v-col>

        <!-- 우상단: 계약별 실적 비교 -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="contractPerformance" title="계약별 실적 비교" subtitle="담당 계약 실적 vs 목표" type="bar"
            :data="contractPerformance" :options="groupedBarOptions('원')" />
        </v-col>

        <!-- 좌하단: VIP 매출 비중 -->
        <v-col cols="12" md="6" class="chart-cell">
          <ChartCard v-if="vipRatio" title="VIP 매출 비중" subtitle="담당 매장/브랜드 기준" type="doughnut" :data="vipRatio"
            :options="pieOptions" />
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
            :data="monthlySettlement" :options="lineOptions('원')" />
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
import { ref, computed } from "vue";
import ChartCard from "@/components/charts/ChartCard.vue";

const props = defineProps({
  initialRole: {
    type: String,
    default: "ROLE_SALES_MEMBER", // 서버에서 내려주는 기본 권한과 맞춰라
  },
});

const selectedRole = ref(props.initialRole);

const isMember = computed(
  () => selectedRole.value === "ROLE_SALES_MEMBER"
);
const isLead = computed(
  () => selectedRole.value === "ROLE_SALES_LEAD"
);

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
    y: { beginAtZero: true },
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
    y: { stacked: true, beginAtZero: true },
  },
});

const groupedBarOptions = (unitLabel) => barOptions(unitLabel);

const lineOptions = (unitLabel, showArea = false) => ({
  ...baseOptions,
  elements: {
    line: { tension: 0.3, fill: showArea },
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

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" },
  },
};

/**
 * Mock 데이터
 */

// 1. 매장별 일매출
const storeDailySales = ref({
  labels: ["명품관", "푸드관", "생활관", "아울렛"],
  datasets: [
    {
      label: "일매출",
      data: [48000000, 32000000, 21000000, 15000000],
    },
  ],
});

// 2. 브랜드별 월매출 TOP5 / 하위5
const brandMonthlySalesTopBottom = ref({
  labels: ["GUCCI", "LOUIS VUITTON", "NIKE", "ZARA", "MLB"],
  datasets: [
    {
      label: "상위 TOP5",
      data: [90000000, 82000000, 60000000, 45000000, 40000000],
      stack: "stack1",
    },
    {
      label: "하위 TOP5",
      data: [8000000, 6000000, 5500000, 5200000, 5000000],
      stack: "stack1",
    },
  ],
});

// 3. 월 정산 금액
const monthlySettlement = ref({
  labels: ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"],
  datasets: [
    {
      label: "정산 금액",
      data: [120000000, 135000000, 128000000, 150000000, 142000000, 160000000],
    },
  ],
});

// 4. 매장 면적 대비 효율
const storeEfficiency = ref({
  labels: ["명품관", "푸드관", "생활관", "아울렛", "키즈관"],
  datasets: [
    {
      label: "상위 TOP5",
      data: [950000, 830000, 780000, 720000, 700000],
      stack: "eff",
    },
    {
      label: "하위 TOP5",
      data: [350000, 320000, 300000, 280000, 260000],
      stack: "eff",
    },
  ],
});

// 5. VIP 매출 비중
const vipRatio = ref({
  labels: ["VIP", "일반"],
  datasets: [
    {
      label: "매출 비중",
      data: [65, 35],
    },
  ],
});

// 6. 층별 매출
const floorSales = ref({
  labels: ["B1", "1F", "2F", "3F", "4F"],
  datasets: [
    {
      label: "층별 매출",
      data: [25000000, 42000000, 38000000, 30000000, 22000000],
    },
  ],
});

// 7. 계약별 실적 비교
const contractPerformance = ref({
  labels: ["A-2025-01", "A-2025-02", "B-2025-01", "C-2025-01"],
  datasets: [
    {
      label: "실적",
      data: [110000000, 95000000, 87000000, 76000000],
    },
    {
      label: "목표",
      data: [100000000, 100000000, 90000000, 80000000],
    },
  ],
});

// 8. 팝업/전시회 일별 매출
const popupDaily = ref({
  labels: ["1일", "2일", "3일", "4일", "5일", "6일", "7일"],
  datasets: [
    {
      label: "일별 매출",
      data: [5000000, 6200000, 4800000, 7000000, 6800000, 7300000, 6500000],
    },
  ],
});
</script>

<style scoped>
.stats-dashboard {
  padding: 16px 16px 56px;
  /* footer(40px) + 여유 */
  background: #ffffff;
  /* 다른 페이지와 통일 */
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
  color: #111827;
}

.page-desc {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

/* 역할 토글 – iOS 느낌 유지 */
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

/* 대시보드 영역: vh 고정 제거 */
.dashboard-container {
  padding: 0;
  margin-top: 8px;
}

/* chart-grid 높이 고정 제거 → 페이지 전체 스크롤 */
.chart-grid {
  /* height: calc(100vh - 96px);  제거 */
}

.chart-cell {
  display: flex;
  flex-direction: column;
  padding: 6px !important;
}

/* 카드 스타일 – 흰 배경 유지 */
.chart-cell :deep(.chart-card) {
  border-radius: 22px;
  background: #ffffff;
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.04),
    0 10px 25px rgba(0, 0, 0, 0.04);
  padding: 12px 12px 4px;
}

.chart-cell :deep(.chart-card-title) {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: #111827;
}

.chart-cell :deep(.chart-card-subtitle) {
  font-size: 11px;
  color: #9ca3af;
}

/* 차트 높이는 적당히만 고정 */
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
}
</style>
