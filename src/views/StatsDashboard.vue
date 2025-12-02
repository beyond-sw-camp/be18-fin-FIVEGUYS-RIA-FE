<template>
  <div class="stats-dashboard">
    <header class="page-header">
      <h1 class="page-title">매출 · 계약 분석 대시보드</h1>
      <p class="page-desc">
        매장, 브랜드, 계약, 팝업/전시회 관리를 위한 핵심 지표
      </p>
    </header>

    <v-container fluid>
      <v-row dense>
        <!-- 1. 매장별 일매출 -->
        <v-col cols="12" md="6">
          <ChartCard
            v-if="storeDailySales"
            title="매장별 일매출"
            subtitle="운영의 중심"
            type="bar"
            :data="storeDailySales"
            :options="barOptions('원')"
          />
        </v-col>

        <!-- 2. 브랜드별 월매출 상위/하위 TOP5 -->
        <v-col cols="12" md="6">
          <ChartCard
            v-if="brandMonthlySalesTopBottom"
            title="브랜드별 월매출 TOP5 / 하위5"
            subtitle="경영진 관심 1위"
            type="bar"
            :data="brandMonthlySalesTopBottom"
            :options="stackedBarOptions('원')"
          />
        </v-col>

        <!-- 3. 월 정산 금액 -->
        <v-col cols="12" md="6">
          <ChartCard
            v-if="monthlySettlement"
            title="월 정산 금액 추이"
            subtitle="회사가 실제로 버는 돈"
            type="line"
            :data="monthlySettlement"
            :options="lineOptions('원')"
          />
        </v-col>

        <!-- 4. 매장 면적 대비 효율 상/하위 5 -->
        <v-col cols="12" md="6">
          <ChartCard
            v-if="storeEfficiency"
            title="매장 면적 대비 효율 TOP5 / 하위5"
            subtitle="재계약 판단 지표"
            type="bar"
            :data="storeEfficiency"
            :options="stackedBarOptions('원/㎡')"
          />
        </v-col>

        <!-- 5. VIP 매출 비중 -->
        <v-col cols="12" md="4">
          <ChartCard
            v-if="vipRatio"
            title="VIP 매출 비중"
            subtitle="CRM 핵심"
            type="doughnut"
            :data="vipRatio"
            :options="pieOptions"
          />
        </v-col>

        <!-- 6. 층별 매출 -->
        <v-col cols="12" md="4">
          <ChartCard
            v-if="floorSales"
            title="층별 매출"
            subtitle="공간 전략"
            type="bar"
            :data="floorSales"
            :options="barOptions('원')"
          />
        </v-col>

        <!-- 7. 계약별 실적 비교 -->
        <v-col cols="12" md="4">
          <ChartCard
            v-if="contractPerformance"
            title="계약별 실적 비교"
            subtitle="영업 KPI"
            type="bar"
            :data="contractPerformance"
            :options="groupedBarOptions('원')"
          />
        </v-col>

        <!-- 8. 팝업/전시회 일별 차트 -->
        <v-col cols="12">
          <ChartCard
            v-if="popupDaily"
            title="팝업/전시회 일별 매출"
            subtitle="행사 관리 핵심"
            type="line"
            :data="popupDaily"
            :options="lineOptions('원', true)"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ChartCard from "@/components/charts/ChartCard.vue";

/**
 * 공통 옵션 헬퍼들
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
 * 📊 임시 Mock 데이터
 * 나중에 백엔드 붙일 때 여기만 axios로 교체하면 됨
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
      data: [950000, 830000, 780000, 720000, 700000], // 원/㎡
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
      data: [65, 35], // %
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
  padding: 16px;
}
.page-header {
  margin-bottom: 12px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
}
.page-desc {
  font-size: 13px;
  color: #666;
}
</style>
