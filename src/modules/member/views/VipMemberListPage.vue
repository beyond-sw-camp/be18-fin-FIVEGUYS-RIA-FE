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

      <v-col
        cols="12"
        sm="6"
        md="3"
        lg="3"
        v-for="(grade, index) in vipGrades"
        :key="index"
      >
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
      <v-text-field
        v-model="search"
        placeholder="검색 (이름, 연락처)"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        rounded="lg"
        style="max-width: 300px"
      />
      <v-select
        v-model="selectedGrade"
        :items="gradeList"
        density="compact"
        variant="outlined"
        hide-details
        rounded="lg"
        style="max-width: 200px"
        placeholder="등급별 필터"
        @update:model-value="onGradeChange"
      />
    </div>

    <!-- 리스트 -->
    <v-card elevation="2" rounded="xl" class="pa-4">
      <v-row class="header-row pa-2" dense>
        <v-col cols="2" class="font-weight-bold text-center">이름</v-col>
        <v-col cols="2" class="font-weight-bold text-center">연락처</v-col>
        <v-col cols="2" class="font-weight-bold text-center">VIP 등급</v-col>
        <!-- 🔥 여기 텍스트만 변경 -->
        <v-col cols="2" class="font-weight-bold text-center">총 매출액</v-col>
        <v-col cols="2" class="font-weight-bold text-center">생성일</v-col>
        <v-col cols="2" class="font-weight-bold text-center">AI</v-col>
      </v-row>
      <v-divider />

      <v-row
        v-for="(vip, index) in vipList"
        :key="index"
        class="store-row pa-2 align-center"
        dense
      >
        <v-col cols="2" class="text-center">{{ vip.name }}</v-col>
        <v-col cols="2" class="text-center">{{ vip.phone }}</v-col>

        <!-- 등급 칩도 가운데 정렬 -->
        <v-col cols="2" class="text-center">
          <v-chip
            size="small"
            label
            class="white--text"
            :style="{
              backgroundColor: getGradeColor(vip.grade),
              color: 'white',
            }"
          >
            {{ vip.grade }}
          </v-chip>
        </v-col>

        <!-- 🔥 총 매출액 표시 -->
        <v-col cols="2" class="text-center">
          {{ vip.totalSales.toLocaleString() }}원
        </v-col>

        <v-col cols="2" class="text-center">
          {{ vip.createdAt }}
        </v-col>

        <!-- AI -->
        <v-col cols="2" class="d-flex flex-column align-center">
          <v-btn
            size="x-small"
            variant="outlined"
            class="ai-btn"
            @click="openAiDialog(vip)"
          >
            AI 추천
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- AI 추천 모달 -->
    <v-dialog v-model="aiDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <span>AI 추천 생성</span>
        </v-card-title>

        <v-card-text>
          <!-- VIP 이름 -->
          <v-text-field
            label="VIP 이름"
            v-model="aiVipName"
            readonly
            variant="outlined"
            density="comfortable"
            class="mb-4"
          />

          <v-btn
            color="primary"
            :loading="aiLoading"
            @click="onGenerateAi"
            class="mb-4"
          >
            추천 생성
          </v-btn>

          <v-divider class="my-4" />

          <div v-if="aiLoading">
            <span class="text-caption">AI 추천을 생성/조회 중입니다...</span>
          </div>

          <!-- 추천 결과 리스트 -->
          <div v-else>
            <h3 class="text-subtitle-1 font-weight-medium mb-2">추천 결과</h3>
            <div v-if="aiResultList.length">
              <v-list density="compact">
                <v-list-item
                  v-for="(rec, idx) in aiResultList"
                  :key="rec.recoId ?? idx"
                >
                  <v-list-item-title>
                    {{ rec.targetName }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    유형: {{ rec.recoType }} / 매출액: {{ rec.score }}
                  </v-list-item-subtitle>
                  <div class="text-caption mt-1">이유: {{ rec.reason }}</div>
                </v-list-item>
              </v-list>
            </div>
            <div v-else class="text-caption text-grey">
              아직 저장된 추천 결과가 없습니다.
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="aiDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import axios from "axios";
import { getVipList, getVipStats } from "@/apis/vip";

// =======================
// KPI / 상태
// =======================
const totalVip = ref(0);
const vipGrades = ref([]);

// 검색 / 필터
const search = ref("");
const selectedGrade = ref("전체 등급");
const gradeList = ref(["전체 등급"]);

// 리스트 / 페이징
const vipList = ref([]);
const page = ref(1); // 1-based
const size = ref(10);
const totalElements = ref(0);
const totalPages = ref(0);

// AI 모달 상태
const aiDialog = ref(false);
const aiVipName = ref("");
const selectedVipId = ref(null);
const aiLoading = ref(false);
const aiResultList = ref([]);

// =======================
// 백엔드 axios 인스턴스
// =======================
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

// 매 요청마다 Authorization 헤더 붙이기
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =======================
// 색상 맵
// =======================
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

// =======================
// VIP 리스트 로딩
// =======================
const loadVipList = async () => {
  const gradeParam =
    selectedGrade.value === "전체 등급" ? undefined : selectedGrade.value;
  const rawKeyword = search.value ?? "";
  const keyword = rawKeyword.trim() || undefined;

  const { data } = await getVipList({
    page: page.value,
    size: size.value,
    grade: gradeParam,
    keyword,
  });

  console.log("VIP API raw data:", JSON.stringify(data.vips, null, 2));

  totalElements.value = data.totalElements;
  totalPages.value = data.totalPages;

  vipList.value = (data.vips || []).map((v) => ({
    id: v.vipId, // ai 호출에 사용할 vipId
    name: v.name,
    phone: v.phone,
    grade: v.grade,
    // 🔥 백엔드에서 내려주는 totalSales 사용
    totalSales: v.totalSales ?? 0,
    createdAt: v.createdAt ?? "-",
  }));

  console.log(
    "[VIP] page=",
    page.value,
    " / totalPages=",
    totalPages.value,
    " / elements=",
    totalElements.value,
    " / currentLength=",
    vipList.value.length
  );
};

// =======================
// VIP 통계
// =======================
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

// =======================
// 페이징 / 필터 / 검색
// =======================
const onPageChange = async (newPage) => {
  page.value = newPage;
  await loadVipList();
};

const onGradeChange = async () => {
  page.value = 1;
  await loadVipList();
};

watch(
  () => search.value,
  async () => {
    page.value = 1;
    await loadVipList();
  }
);

// =======================
// AI 모달 & API
// =======================
const openAiDialog = async (vip) => {
  selectedVipId.value = vip.id;
  aiVipName.value = vip.name;
  aiResultList.value = [];
  aiDialog.value = true;

  await loadAiRecommendations();
};

// GET /api/ai/{vipId}/recommendations
const loadAiRecommendations = async () => {
  if (!selectedVipId.value) return;
  aiLoading.value = true;
  try {
    const { data } = await api.get(
      `/ai/${selectedVipId.value}/recommendations`
    );
    aiResultList.value = data || [];
  } catch (e) {
    console.error(e);
  } finally {
    aiLoading.value = false;
  }
};

// POST /api/ai/{vipId}/recommendations/generate
const onGenerateAi = async () => {
  console.log("[AI] selectedVipId =", selectedVipId.value);
  if (!selectedVipId.value) {
    console.error("[AI] vipId가 없습니다.");
    return;
  }
  aiLoading.value = true;
  try {
    await api.post(`/ai/${selectedVipId.value}/recommendations/generate`);
    await loadAiRecommendations();
  } catch (e) {
    console.error(e);
  } finally {
    aiLoading.value = false;
  }
};

// =======================
// 초기 로딩
// =======================
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

.ai-btn {
  min-width: 80px;
  padding-inline: 8px;
}
</style>
