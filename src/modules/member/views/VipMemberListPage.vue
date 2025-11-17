<template>
  <v-container fluid class="pa-6">
    <!-- 상단 타이틀 영역 -->
    <div class="mb-6">
      <h2 class="page-title">VIP 회원 목록</h2>
      <p class="page-subtitle">
        가장 소중한 고객인 VIP 회원의 상세 정보를 확인하고 관리합니다.
      </p>
    </div>

    <!-- VIP 회원 KPI 카드 영역 -->
    <v-row dense class="mb-6">
      <!-- 전체 VIP 회원 수 카드 -->
      <v-col cols="12" sm="6" md="3" lg="3">
        <v-card elevation="2" class="pa-4" rounded="xl">
          <div class="kpi-label">총 VIP 회원 수</div>
          <div class="kpi-value">{{ totalVip }}</div>
        </v-card>
      </v-col>

      <!-- 등급별 VIP 회원 카드 -->
      <v-col cols="12" sm="6" md="3" lg="3" v-for="(grade, index) in vipGrades" :key="index">
        <v-card elevation="2" class="pa-4" rounded="xl">
          <div class="kpi-label">{{ grade.name }}</div>
          <div class="kpi-value">{{ grade.count }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- VIP 리스트 검색 및 필터 -->
    <div class="d-flex align-center justify-space-between mb-4">
      <v-text-field
        v-model="search"
        placeholder="검색 (이름, 연락처, 담당자)"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        rounded="lg"
        style="max-width: 300px;"
      />
      <v-select
        v-model="selectedGrade"
        :items="gradeList"
        density="compact"
        variant="outlined"
        hide-details
        rounded="lg"
        style="max-width: 200px;"
        placeholder="등급별 필터"
      />
    </div>

    <!-- VIP 회원 리스트 (게시판 형식) -->
    <v-card elevation="2" rounded="xl" class="pa-4">
      <!-- 테이블 헤더 -->
      <v-row class="header-row pa-2" dense>
        <v-col cols="2" class="font-weight-bold">이름</v-col>
        <v-col cols="2" class="font-weight-bold">연락처</v-col>
        <v-col cols="2" class="font-weight-bold">VIP 등급</v-col>
        <v-col cols="2" class="font-weight-bold">최근 구매액</v-col>
        <v-col cols="2" class="font-weight-bold">담당 영업사원</v-col>
        <v-col cols="2" class="font-weight-bold">최종 상호작용</v-col>
      </v-row>
      <v-divider></v-divider>

      <!-- 리스트 항목 -->
      <v-row v-for="(vip, index) in filteredVipList" :key="index" class="store-row pa-2 align-center" dense>
        <v-col cols="2">{{ vip.name }}</v-col>
        <v-col cols="2">{{ vip.phone }}</v-col>
        <v-col cols="2">{{ vip.grade }}</v-col>
        <v-col cols="2">{{ vip.lastPurchase.toLocaleString() }}원</v-col>
        <v-col cols="2">{{ vip.salesPerson }}</v-col>
        <v-col cols="2">{{ vip.lastInteraction }}</v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, ref, computed } from "vue";

// KPI 카드
const totalVip = 1234;
const vipGrades = reactive([
  { name: "PSR Black", count: 120 },
  { name: "PSR White", count: 98 },
  { name: "Park Jade Black", count: 75 },
  { name: "Park Jade White", count: 60 },
  { name: "Park Jade Blue", count: 50 },
  { name: "Jade+", count: 40 },
  { name: "Jade", count: 30 },
]);

// 검색 및 필터
const search = ref("");
const selectedGrade = ref("전체 등급");
const gradeList = ["전체 등급", ...vipGrades.map(g => g.name)];

// VIP 리스트 예시 데이터
const vipList = reactive([
  { name: "홍길동", phone: "010-1234-5678", grade: "PSR Black", lastPurchase: 1200000, salesPerson: "김민수", lastInteraction: "2025-11-10" },
  { name: "김철수", phone: "010-2345-6789", grade: "PSR White", lastPurchase: 800000, salesPerson: "박영희", lastInteraction: "2025-11-08" },
  { name: "이영희", phone: "010-3456-7890", grade: "Jade+", lastPurchase: 500000, salesPerson: "김민수", lastInteraction: "2025-11-05" },
  // ... 더미 데이터 추가 가능
]);

// 검색 + 등급 필터 적용
const filteredVipList = computed(() => {
  return vipList.filter(vip => {
    const matchesSearch = vip.name.includes(search.value) || vip.phone.includes(search.value) || vip.salesPerson.includes(search.value);
    const matchesGrade = selectedGrade.value === "전체 등급" ? true : vip.grade === selectedGrade.value;
    return matchesSearch && matchesGrade;
  });
});
</script>

<style scoped>
.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #222;
  margin: 0;
}
.page-subtitle {
  font-size: 0.9rem;
  color: #888;
  margin-top: 4px;
}

.kpi-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
}
.kpi-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #222;
}
.header-row {
  background-color: #f5f5f5;
  border-radius: 6px;
  font-size: 0.85rem;
}
.store-row {
  font-size: 0.85rem;
  border-bottom: 1px solid #eee;
}
.store-row:last-child {
  border-bottom: none;
}
</style>
