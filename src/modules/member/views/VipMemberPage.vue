<template>
  <v-container fluid class="pa-6">
    <!-- 상단 타이틀 + 기준 월 -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center" style="gap: 12px;">
        <div class="text-h5 font-weight-medium">VIP 매출 현황</div>
        <div v-if="storeYear && storeMonth" class="text-caption text-grey">
          기준 월: {{ storeYear }}년 {{ storeMonth }}월
        </div>
      </div>
    </div>

    <!-- KPI 카드 영역 -->
    <v-row dense class="mb-8">
      <!-- 1) VIP 매출 비중 (API: /api/vip/sales/stats) -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="pa-4" rounded="xl">
          <div class="kpi-label">VIP 매출 비중</div>
          <div class="kpi-value">{{ vipRate }}%</div>
          <div class="text-grey text-caption mt-1">
            전체 매출 대비
          </div>
          <v-progress-linear :model-value="vipRate" height="8" rounded class="mt-3" />
          <div class="text-caption mt-2" :class="{
            'text-success': vipMoM > 0,
            'text-error': vipMoM < 0,
            'text-grey': vipMoM === 0,
          }">
            전월 대비
            <strong>{{ vipMoM > 0 ? '+' + vipMoM : vipMoM }}%</strong>
          </div>
        </v-card>
      </v-col>

      <!-- 2) VIP 고객 수 + 등급별 인원 -->
      <v-col cols="12" md="4" class="equal-card">
        <v-card elevation="2" class="pa-4 equal-inner" rounded="xl" style="cursor: pointer;" @click="goToVipList">
          <div class="kpi-label">VIP 고객 수</div>
          <div class="kpi-value">{{ vipCount }}명</div>

          <div class="vip-count-divider mt-3"></div>

          <div class="vip-grade-list mt-3">
            <div v-for="grade in vipGrades" :key="grade.code" class="vip-grade-row">
              <span class="vip-chip-label">{{ grade.label }}</span>
              <span class="vip-badge" :style="{ backgroundColor: getGradeColor(grade.code) }">
                {{ grade.count }}명
              </span>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- 3) VIP 매출 비율 TOP5 브랜드 -->
      <v-col cols="12" md="4" class="equal-card">
        <v-card elevation="2" class="pa-4 equal-inner" rounded="xl">
          <div class="kpi-label mb-3">VIP 매출 비율 TOP5 브랜드</div>
          <v-list class="brand-list">
            <v-list-item v-for="(item, index) in top5Brands" :key="index" class="brand-item">
              <div class="d-flex justify-space-between align-center w-100">
                <span class="brand-name">
                  {{ item.rank }}. {{ item.name }}
                </span>
                <span class="brand-rate">
                  {{ item.rate }}%
                </span>
              </div>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- VIP 매출 추이 카드 (API: /api/vip/sales/trend) -->
    <v-row dense class="mb-8">
      <v-col cols="12">
        <v-card elevation="2" class="pa-4" rounded="xl">
          <div class="kpi-label mb-3">VIP 매출 추이</div>

          <v-row class="mb-4" dense>
            <v-col v-for="(month, index) in monthlySales" :key="index" cols="2" class="d-flex flex-column align-center">
              <div class="text-caption mb-1">{{ month.name }}</div>
              <div class="font-weight-medium">
                {{ month.value.toFixed(1) }}%
              </div>
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" md="4">
              <v-card class="pa-3 d-flex flex-column" elevation="1" rounded="lg">
                <div class="text-caption mb-1">6개월 VIP 매출액</div>
                <div class="font-weight-medium text-h6">
                  {{ sixMonthVipSales.toLocaleString() }}원
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="pa-3 d-flex flex-column" elevation="1" rounded="lg">
                <div class="text-caption mb-1">전년 대비 증가율</div>
                <div :class="{
                  'text-success': yoyChange > 0,
                  'text-error': yoyChange < 0,
                }">
                  <strong>
                    {{ yoyChange > 0 ? '+' + yoyChange : yoyChange }}%
                  </strong>
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="pa-3 d-flex flex-column" elevation="1" rounded="lg">
                <div class="text-caption mb-1">6개월 전체 매출</div>
                <div class="font-weight-medium text-h6">
                  {{ sixMonthTotalSales.toLocaleString() }}원
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- 매장별 VIP 매출 현황 (API: /api/vip/sales/stores) -->
    <v-row dense>
      <v-col cols="12">
        <v-card elevation="2" rounded="xl" class="pa-4">
          <div class="section-title mb-2">매장별 VIP 매출 현황</div>

          <v-row class="header-row pa-2" dense>
            <v-col cols="3" class="font-weight-bold">매장명</v-col>
            <v-col cols="2" class="font-weight-bold">VIP 비중(%)</v-col>
            <v-col cols="3" class="font-weight-bold">VIP 매출액</v-col>
            <v-col cols="3" class="font-weight-bold">총 매출액</v-col>
            <v-col cols="1" class="font-weight-bold text-right">
              전월대비(%)
            </v-col>
          </v-row>

          <v-divider />

          <v-row v-for="(store, index) in storeVipSales" :key="index" class="store-row pa-2 align-center" dense>
            <v-col cols="3">{{ store.storeName }}</v-col>
            <v-col cols="2">{{ store.vipRatio }}%</v-col>
            <v-col cols="3">
              {{ store.vipSalesAmount.toLocaleString() }}원
            </v-col>
            <v-col cols="3">
              {{ store.totalSalesAmount.toLocaleString() }}원
            </v-col>
            <v-col cols="1" class="text-right">
              <span :style="{
                color:
                  store.momChange > 0
                    ? '#28a745'
                    : store.momChange < 0
                      ? '#dc3545'
                      : '#1c1c1e',
                fontWeight: 600,
              }">
                {{ store.momChange > 0 ? '+' : '' }}{{ store.momChange }}%
              </span>
            </v-col>
          </v-row>

          <div class="store-pagination mt-4" v-if="storeTotalPages > 1">
            <v-pagination v-model="storePage" :length="storeTotalPages" total-visible="5"
              @update:model-value="onChangeStorePage" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getVipStats,
  getVipSalesStats,
  getVipBrandTop5,
  getVipSalesTrend,
  getVipStoreSalesPage,
} from "@/apis/vip";

const router = useRouter();

// KPI: VIP 매출 비중
const vipRate = ref(0);
const vipMoM = ref(0);

// VIP 수
const vipCount = ref(0);

// 등급별 VIP 수
const vipGrades = ref([]);

const GRADE_LABEL_MAP = {
  PSR_BLACK: "PSR BLACK",
  PSR_WHITE: "PSR WHITE",
  PARK_JADE_BLACK: "PARK JADE BLACK",
  PARK_JADE_WHITE: "PARK JADE WHITE",
  PARK_JADE_BLUE: "PARK JADE BLUE",
  JADE_PLUS: "JADE PLUS",
  JADE: "JADE",
};

const gradeColorMap = {
  PSR_BLACK: "#3B2F2F",
  PSR_WHITE: "#F7C873",
  PARK_JADE_BLACK: "#1B4332",
  PARK_JADE_WHITE: "#74C69D",
  PARK_JADE_BLUE: "#4D96FF",
  JADE_PLUS: "#9B5DE5",
  JADE: "#00A896",
};

const getGradeColor = (code) => gradeColorMap[code] || "#9CA3AF";

// 브랜드 TOP5
const top5Brands = ref([]);

// VIP 매출 추이 데이터
const baseYear = ref(null);
const baseMonth = ref(null);
const monthlySales = ref([]);
const sixMonthVipSales = ref(0);
const sixMonthTotalSales = ref(0);
const yoyChange = ref(0);

const monthlyMax = computed(() =>
  monthlySales.value.length
    ? Math.max(...monthlySales.value.map((m) => m.value))
    : 0,
);

// 매장별 VIP 매출 페이징 데이터
const storeYear = ref(null);
const storeMonth = ref(null);
const storeVipSales = ref([]);
const storePage = ref(1); // v-pagination은 1부터 시작
const storeSize = ref(5);
const storeTotalPages = ref(0);
const storeTotalElements = ref(0);

// 라우팅
const goToVipList = () => {
  router.push({ name: "VipMemberList" });
};

// VIP 등급/인원 통계
const loadVipStats = async () => {
  const { data } = await getVipStats();

  vipCount.value = data?.total ?? 0;

  vipGrades.value = [
    { code: "PSR_BLACK", label: GRADE_LABEL_MAP.PSR_BLACK, count: data.psrBlack ?? 0 },
    { code: "PSR_WHITE", label: GRADE_LABEL_MAP.PSR_WHITE, count: data.psrWhite ?? 0 },
    {
      code: "PARK_JADE_BLACK",
      label: GRADE_LABEL_MAP.PARK_JADE_BLACK,
      count: data.parkJadeBlack ?? 0,
    },
    {
      code: "PARK_JADE_WHITE",
      label: GRADE_LABEL_MAP.PARK_JADE_WHITE,
      count: data.parkJadeWhite ?? 0,
    },
    {
      code: "PARK_JADE_BLUE",
      label: GRADE_LABEL_MAP.PARK_JADE_BLUE,
      count: data.parkJadeBlue ?? 0,
    },
    { code: "JADE_PLUS", label: GRADE_LABEL_MAP.JADE_PLUS, count: data.jadePlus ?? 0 },
    { code: "JADE", label: GRADE_LABEL_MAP.JADE, count: data.jade ?? 0 },
  ];
};

// VIP 매출 비중 통계
const loadVipSalesStats = async () => {
  const { data } = await getVipSalesStats();

  vipRate.value = data?.vipRatio ?? 0;
  vipMoM.value = data?.diffRatio ?? 0;
};

// VIP 브랜드 TOP5
const loadVipBrandTop5 = async () => {
  const { data } = await getVipBrandTop5();
  top5Brands.value = data?.items ?? [];
};

// VIP 매출 추이
const loadVipSalesTrend = async () => {
  const { data } = await getVipSalesTrend();

  baseYear.value = data?.baseYear ?? null;
  baseMonth.value = data?.baseMonth ?? null;

  monthlySales.value = (data?.items ?? []).map((item) => ({
    name: `${item.month}월`,
    value: item.vipRatio ?? 0,
  }));

  sixMonthVipSales.value = data?.sixMonthVipSales ?? 0;
  sixMonthTotalSales.value = data?.sixMonthTotalSales ?? 0;
  yoyChange.value = data?.yoyChange ?? 0;
};

// 매장별 VIP 매출 페이징 조회
const loadVipStoreSalesPage = async () => {
  const { data } = await getVipStoreSalesPage({
    page: storePage.value - 1, // 백엔드는 0-based
    size: storeSize.value,
  });

  storeYear.value = data?.year ?? null;
  storeMonth.value = data?.month ?? null;
  storeVipSales.value = data?.items ?? [];
  storeTotalElements.value = data?.totalElements ?? 0;
  storeTotalPages.value = data?.totalPages ?? 0;
};

const onChangeStorePage = () => {
  loadVipStoreSalesPage();
};

onMounted(() => {
  loadVipStats();
  loadVipSalesStats();
  loadVipBrandTop5();
  loadVipSalesTrend();
  loadVipStoreSalesPage();
});
</script>

<style scoped>
.text-success {
  color: #28a745;
}

.text-error {
  color: #dc3545;
}

.text-grey {
  color: #888;
}

.kpi-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
}

.kpi-value {
  font-size: 1.6rem;
  font-weight: 700;
  margin-top: 4px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.store-row {
  border-bottom: 1px solid #eee;
}

.store-row:last-child {
  border-bottom: none;
}

.vip-count-divider {
  height: 1px;
  background-color: #e0e0e0;
}

.vip-grade-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vip-grade-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
}

.text-h6 {
  font-size: 1rem !important;
}

.vip-chip-label {
  font-weight: 500;
  color: #4b5563;
}

.vip-badge {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
  min-width: 52px;
  text-align: center;
}

.equal-card {
  display: flex;
}

.equal-inner {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.brand-list {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.brand-item {
  min-height: 48px;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

.brand-name {
  font-size: 0.95rem;
}

.brand-rate {
  font-size: 0.95rem;
  font-weight: 600;
}

.store-pagination {
  display: flex;
  justify-content: center;
}
</style>
