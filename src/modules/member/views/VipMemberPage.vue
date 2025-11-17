<template>
  <v-container fluid class="pa-6">

    <!-- 상단 타이틀 + 검색 + 카테고리 -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h5 font-weight-medium">VIP 매출 현황</div>
      <div class="d-flex align-center" style="gap: 12px;">
        <v-text-field
          v-model="search"
          placeholder="검색 (고객, 브랜드, 매장)"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          rounded="lg"
          style="max-width: 220px;"
        />
        <v-select
          v-model="selectedCategory"
          :items="categoryList"
          density="compact"
          variant="outlined"
          hide-details
          rounded="lg"
          style="max-width: 160px;"
        />
      </div>
    </div>

    <!-- KPI 카드 영역 -->
    <v-row dense class="mb-8">
      <!-- 1) VIP 매출 비중 -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="pa-4" rounded="xl">
          <div class="kpi-label">VIP 매출 비중</div>
          <div class="kpi-value">{{ vipRate }}%</div>
          <div class="text-grey text-caption mt-1">전체 매출 대비</div>
          <v-progress-linear 
            :model-value="vipRate"
            height="8"
            rounded
            class="mt-3"
          />
          <div 
            class="text-caption mt-2"
            :class="{
              'text-success': vipMoM > 0,
              'text-error': vipMoM < 0,
              'text-grey': vipMoM === 0
            }"
          >
            전월 대비 <strong>{{ vipMoM > 0 ? '+' + vipMoM : vipMoM }}%</strong>
          </div>
        </v-card>
      </v-col>

      <!-- 2) VIP 고객 수 -->
      <v-col cols="12" md="4">
        <v-card
          elevation="2"
          class="pa-4"
          rounded="xl"
          style="cursor: pointer;"
          @click="goToVipList"
        >
          <div class="kpi-label">VIP 고객 수</div>
          <div class="kpi-value">{{ vipCount }}명</div>
          <div class="text-grey text-caption mt-1">/ 전체 {{ totalCustomer }}명</div>
          <div class="mt-3" style="height: 1px; background-color: #e0e0e0;"></div>
          <div 
            class="text-caption mt-2"
            :class="{
              'text-success': vipCountMoM > 0,
              'text-error': vipCountMoM < 0,
              'text-grey': vipCountMoM === 0
            }"
          >
            전월 대비 <strong>{{ vipCountMoM > 0 ? '+' + vipCountMoM : vipCountMoM }}%</strong>
          </div>
        </v-card>
      </v-col>

      <!-- 3) VIP 매출 비율 TOP5 브랜드 -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="pa-4" rounded="xl">
          <div class="kpi-label">VIP 매출 비율 TOP5 브랜드</div>
          <v-list density="compact" class="mt-2">
            <v-list-item v-for="(item, index) in top5Brands" :key="index">
              <div class="d-flex justify-space-between align-center w-100">
                <span class="text-body-2">{{ index + 1 }}. {{ item.name }}</span>
                <span class="text-body-2 font-weight-medium">{{ item.rate }}%</span>
              </div>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- VIP 매출 추이 카드 -->
    <v-row dense class="mb-8">
      <v-col cols="12">
        <v-card elevation="2" class="pa-4" rounded="xl">
          <div class="kpi-label mb-3">VIP 매출 추이</div>

          <v-row class="mb-4" dense>
            <v-col
              v-for="(month, index) in monthlySales"
              :key="index"
              cols="2"
              class="d-flex flex-column align-center"
            >
              <div class="text-caption mb-1">{{ month.name }}</div>
              <div class="font-weight-medium">{{ ((month.value / monthlyMax) * 100).toFixed(1) }}%</div>
            </v-col>
          </v-row>

          <!-- 2줄째: 6개월 VIP 매출, 전년 대비 증가, 6개월 전체 매출 -->
          <v-row dense>
            <v-col cols="12" md="4">
              <v-card class="pa-3 d-flex flex-column" elevation="1" rounded="lg">
                <div class="text-caption mb-1">6개월 VIP 매출액</div>
                <div class="font-weight-medium text-h6">{{ sixMonthVipSales.toLocaleString() }}원</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="pa-3 d-flex flex-column" elevation="1" rounded="lg">
                <div class="text-caption mb-1">전년 대비 증가율</div>
                <div :class="{'text-success': yoyChange > 0, 'text-error': yoyChange < 0}">
                  <strong>{{ yoyChange > 0 ? '+' + yoyChange : yoyChange }}%</strong>
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="pa-3 d-flex flex-column" elevation="1" rounded="lg">
                <div class="text-caption mb-1">6개월 전체 매출</div>
                <div class="font-weight-medium text-h6">{{ sixMonthTotalSales.toLocaleString() }}원</div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- 매장별 VIP 매출 현황 -->
    <v-row dense>
      <v-col cols="12">
        <v-card elevation="2" rounded="xl" class="pa-4">
          <div class="section-title mb-4">매장별 VIP 매출 현황</div>

          <!-- 테이블 헤더 -->
          <v-row class="header-row pa-2" dense>
            <v-col cols="3" class="font-weight-bold">매장명</v-col>
            <v-col cols="2" class="font-weight-bold">VIP 비중(%)</v-col>
            <v-col cols="3" class="font-weight-bold">VIP 매출액</v-col>
            <v-col cols="3" class="font-weight-bold">총 매출액</v-col>
            <v-col cols="1" class="font-weight-bold text-right">전월대비(%)</v-col>
          </v-row>

          <v-divider></v-divider>

          <!-- 리스트 항목 -->
          <v-row
            v-for="(store, index) in storeVipSales"
            :key="index"
            class="store-row pa-2 align-center"
            dense
          >
            <v-col cols="3">{{ store.name }}</v-col>
            <v-col cols="2">{{ store.rate }}%</v-col>
            <v-col cols="3">{{ store.vipSales.toLocaleString() }}원</v-col>
            <v-col cols="3">{{ store.totalSales.toLocaleString() }}원</v-col>
            <v-col cols="1" class="text-right">
              <span :class="store.momChange >= 0 ? 'up' : 'down'">
                {{ store.momChange >= 0 ? '+' : '' }}{{ store.momChange }}%
              </span>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')
const selectedCategory = ref(null)
const categoryList = ['전체', '브랜드', '매장']

// KPI 데이터
const vipRate = ref(35.6)
const vipMoM = ref(5.2)
const vipCount = ref(125)
const totalCustomer = ref(500)
const vipCountMoM = ref(-2.1)
const top5Brands = reactive([
  { name: '디올', rate: 45 },
  { name: '샤넬', rate: 38 },
  { name: '루이비통', rate: 32 },
  { name: '구찌', rate: 28 },
  { name: '프라다', rate: 25 },
])

// VIP 매출 추이
const monthlySales = reactive([
  { name: '1월', value: 3200000 },
  { name: '2월', value: 4100000 },
  { name: '3월', value: 2900000 },
  { name: '4월', value: 3600000 },
  { name: '5월', value: 4500000 },
  { name: '6월', value: 5000000 },
])
const monthlyMax = computed(() => Math.max(...monthlySales.map(m => m.value)))

// 2줄 카드 데이터
const sixMonthVipSales = ref(23300000)
const yoyChange = ref(12.5)
const sixMonthTotalSales = ref(67000000)

// 매장별 VIP 매출
const storeVipSales = reactive([
  { name: '디올', rate: 45, vipSales: 4500000, totalSales: 10000000, momChange: 5 },
  { name: '샤넬', rate: 38, vipSales: 3800000, totalSales: 10000000, momChange: -3 },
  { name: '루이비통', rate: 32, vipSales: 3200000, totalSales: 10000000, momChange: 2 },
  { name: '구찌', rate: 28, vipSales: 2800000, totalSales: 10000000, momChange: -1 },
  { name: '프라다', rate: 25, vipSales: 2500000, totalSales: 10000000, momChange: 0 },
])

const goToVipList = () => {
  router.push({ name: 'VipMemberList' })
}
</script>

<style scoped>
.text-success { color: #28a745; }
.text-error { color: #dc3545; }
.text-grey { color: #888; }

.kpi-label { font-size: 0.9rem; font-weight: 500; color: #666; }
.kpi-value { font-size: 1.6rem; font-weight: 700; margin-top: 4px; }
.section-title { font-size: 1.1rem; font-weight: 600; }
.store-row { border-bottom: 1px solid #eee; }
.store-row:last-child { border-bottom: none; }
</style>
