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
      <v-col cols="12" sm="6" md="3" lg="3">
        <v-card elevation="2" class="pa-4" rounded="xl">
          <div class="kpi-label">총 VIP 회원 수</div>
          <div class="kpi-value">{{ totalVip }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3" lg="3" v-for="(grade, index) in vipGrades" :key="index">
        <v-card elevation="2" class="pa-4" rounded="xl">
          <div class="kpi-label">{{ grade.name }}</div>
          <div class="kpi-value" :style="{ color: getGradeColor(grade.name) }">
            {{ grade.count }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 검색 / 필터 -->
    <div class="d-flex align-center justify-space-between mb-4">
      <v-text-field v-model="search" placeholder="검색 (이름, 연락처, 담당자)" density="compact" variant="outlined" hide-details
        clearable rounded="lg" style="max-width: 300px;" />
      <v-select v-model="selectedGrade" :items="gradeList" density="compact" variant="outlined" hide-details
        rounded="lg" style="max-width: 200px;" placeholder="등급별 필터" @update:model-value="onGradeChange" />
    </div>

    <!-- 리스트 -->
    <v-card elevation="2" rounded="xl" class="pa-4">
      <v-row class="header-row pa-2" dense>
        <v-col cols="2" class="font-weight-bold">이름</v-col>
        <v-col cols="2" class="font-weight-bold">연락처</v-col>
        <v-col cols="2" class="font-weight-bold">VIP 등급</v-col>
        <v-col cols="2" class="font-weight-bold">최근 구매액</v-col>
        <v-col cols="2" class="font-weight-bold">담당 영업사원</v-col>
        <v-col cols="2" class="font-weight-bold">최종 상호작용</v-col>
      </v-row>
      <v-divider />

      <v-row v-for="(vip, index) in vipList" :key="index" class="store-row pa-2 align-center" dense>
        <v-col cols="2">{{ vip.name }}</v-col>
        <v-col cols="2">{{ vip.phone }}</v-col>
        <v-col cols="2">
          <v-chip size="small" label class="white--text" :style="{
            backgroundColor: getGradeColor(vip.grade),
            color: 'white',
          }">
            {{ vip.grade }}
          </v-chip>
        </v-col>
        <v-col cols="2">{{ vip.lastPurchase.toLocaleString() }}원</v-col>
        <v-col cols="2">{{ vip.salesPerson }}</v-col>
        <v-col cols="2">{{ vip.lastInteraction }}</v-col>
      </v-row>

      <div class="d-flex justify-center mt-4">
        <v-pagination v-show="totalPages > 1" v-model="page" :length="Math.max(totalPages, 1)"
          @update:model-value="onPageChange" />
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { getVipList, getVipStats } from "@/apis/vip";

// KPI
const totalVip = ref(0);
const vipGrades = ref([]);

// 검색 / 필터
const search = ref("");
const selectedGrade = ref("전체 등급");
const gradeList = ref(["전체 등급"]);

// 리스트 / 페이징
const vipList = ref([]);
const page = ref(1);      // 항상 1-based
const size = ref(10);
const totalElements = ref(0);
const totalPages = ref(0);

// 색상 맵
const gradeColorMap = {
  PSR_BLACK: "#3B2F2F",
  PSR_WHITE: "#F7C873",
  PARK_JADE_BLACK: "#1B4332",
  PARK_JADE_WHITE: "#74C69D",
  PARK_JADE_BLUE: "#4D96FF",
  JADE_PLUS: "#9B5DE5",
  JADE: "#00A896",
};
const getGradeColor = (grade) => gradeColorMap[grade] || "#999";

// 리스트 로딩 (page는 읽기만)
const loadVipList = async () => {
  const gradeParam =
    selectedGrade.value === "전체 등급" ? undefined : selectedGrade.value;
  const keyword = search.value.trim() || undefined;

  const { data } = await getVipList({
    page: page.value,
    size: size.value,
    grade: gradeParam,
    keyword,
  });

  totalElements.value = data.totalElements;
  totalPages.value = data.totalPages;

  vipList.value = (data.vips || []).map((v) => ({
    name: v.name,
    phone: v.phone,
    grade: v.grade,
    lastPurchase: v.lastPurchase ?? 0,
    salesPerson: v.salesPerson ?? "-",
    lastInteraction: v.lastInteraction ?? "-",
  }));

  console.log(
    "[VIP] page=", page.value,
    " / totalPages=", totalPages.value,
    " / elements=", totalElements.value,
    " / currentLength=", vipList.value.length
  );
};

// 통계
const loadVipStats = async () => {
  const { data } = await getVipStats();

  totalVip.value = data.total || 0;

  vipGrades.value = [
    { name: "PSR_BLACK", count: data.psrBlack || 0 },
    { name: "PSR_WHITE", count: data.psrWhite || 0 },
    { name: "PARK_JADE_BLACK", count: data.parkJadeBlack || 0 },
    { name: "PARK_JADE_WHITE", count: data.parkJadeWhite || 0 },
    { name: "PARK_JADE_BLUE", count: data.parkJadeBlue || 0 },
    { name: "JADE_PLUS", count: data.jadePlus || 0 },
    { name: "JADE", count: data.jade || 0 },
  ];

  gradeList.value = ["전체 등급", ...vipGrades.value.map((g) => g.name)];
};

// 페이지 변경
const onPageChange = async (newPage) => {
  page.value = newPage;
  await loadVipList();
};

// 등급 변경
const onGradeChange = async () => {
  page.value = 1;
  await loadVipList();
};

// 검색 변경
watch(
  () => search.value,
  async () => {
    page.value = 1;
    await loadVipList();
  }
);

onMounted(async () => {
  await Promise.all([loadVipStats(), loadVipList()]);
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
