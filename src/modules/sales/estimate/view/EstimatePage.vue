<template>
  <v-container fluid class="pa-0 full-height main-container">
    <v-row no-gutters class="full-height">

      <!-- =======================
           좌측 사이드바
      ======================== -->
      <v-col cols="12" md="2" class="pa-4 sidebar">
        <v-card class="sidebar-card pa-6" flat>

          <!-- 검색 -->
          <v-text-field
            v-model="search"
            append-inner-icon="mdi-magnify"
            label="검색"
            variant="outlined"
            hide-details
            density="comfortable"
            class="mb-4"
          />

          <!-- 즐겨찾기 버튼 -->
          <div class="d-flex justify-end mt-2">
            <v-btn
              small
              class="favorite-toggle-btn"
              @click="showFavoritesOnly = !showFavoritesOnly"
              elevation="1"
            >
              <v-icon :color="showFavoritesOnly ? '#FFD60A' : '#8e8e93'">
                {{ showFavoritesOnly ? 'mdi-star' : 'mdi-star-outline' }}
              </v-icon>
            </v-btn>
          </div>

          <!-- 상태 체크박스 그룹 -->
          <div class="sidebar-checkbox-group mt-4">
            진행 상태
            <v-checkbox
              v-for="sidebar in sidebares"
              :key="sidebar.value"
              v-model="sidebar.checked"
              :label="sidebar.label"
              hide-details
              dense
              class="sidebar-checkbox"
            />
          </div>
        </v-card>
      </v-col>

      <!-- =======================
           메인 컨텐츠
      ======================== -->
      <v-col cols="12" md="10" class="pa-6 main-content">

        <div class="d-flex justify-end mb-4">
          <v-btn
            color="#ff9500"
            class="white--text"
            rounded
            elevation="4"
            @click="goToCreateEstimate()"
          >
            새 견적 추가
          </v-btn>
        </div>

        <!-- 카드 목록 -->
        <v-row dense>
          <v-col
            v-for="estimate in filteredEstimates"
            :key="estimate.id"
            cols="12"
            sm="6"
            md="3"
            class="proposal-col"
          >
            <v-card
              outlined
              class="proposal-card"
              elevation="2"
              rounded="xl"
              @click="goToEstimateDetail(estimate.id)"
            >

              <!-- 즐겨찾기 버튼 -->
              <v-btn
                small
                class="favorite-btn"
                @click.stop="toggleFavorite(estimate)"
                elevation="0"
              >
                <v-icon :color="estimate.isFavorite ? '#FFD60A' : '#8e8e93'">
                  {{ estimate.isFavorite ? "mdi-star" : "mdi-star-outline" }}
                </v-icon>
              </v-btn>

              <!-- 제목 -->
              <v-card-title class="proposal-title">
                {{ estimate.estimateTitle }}
              </v-card-title>

              <v-divider class="my-2" />

              <!-- 카드 본문 -->
              <v-card-text class="pa-0">
                <v-row dense class="mb-1">
                  <v-col cols="5" class="label">고객사</v-col>
                  <v-col cols="7">{{ estimate.clientCompanyName }}</v-col>
                </v-row>

                <v-row dense class="mb-1">
                  <v-col cols="5" class="label">고객</v-col>
                  <v-col cols="7">{{ estimate.clientName }}</v-col>
                </v-row>

                <v-row dense>
                  <v-col cols="5" class="label">담당자</v-col>
                  <v-col cols="7">{{ estimate.createdUserName }}</v-col>
                </v-row>
              </v-card-text>

              <v-divider class="my-2" />

              <v-card-text class="pa-0 d-flex justify-space-between align-center">
                <!-- 상태 -->
                <span :class="['sidebar-text', statusClass(estimate.status)]">
                  {{ statusLabel(estimate.status) }}
                </span>

                <!-- 날짜 2줄 표시 -->
                <span class="period-text d-flex flex-column">
                  <span>견적일: {{ estimate.estimateDate }}</span>
                </span>
              </v-card-text>

            </v-card>
          </v-col>
        </v-row>

        <!-- 페이지네이션 -->
        <v-row justify="center" class="mt-6">
          <v-pagination
            v-model="page"
            :length="totalPages"
            @update:modelValue="onPageChange"
          />
        </v-row>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getEstimates } from "@/apis/estimate";

const router = useRouter();

/* 검색 & 즐겨찾기 */
const search = ref("");
const showFavoritesOnly = ref(false);

/* 서버 데이터 */
const estimates = ref([]);

/* 페이징 */
const page = ref(1);
const size = ref(12);
const totalPages = ref(0);

/* 상태 필터 */
const sidebares = reactive([
  { label: "작성중", value: "DRAFT", checked: false },
  { label: "제출됨", value: "SUBMITTED", checked: false },
  { label: "완료", value: "COMPLETED", checked: false },
  { label: "취소됨", value: "CANCELED", checked: false },
]);

/* 즐겨찾기 토글 */
const toggleFavorite = (item) => {
  item.isFavorite = !item.isFavorite;
};

/* 상태 CSS */
const statusClass = (status) => {
  const s = String(status || "").toUpperCase();
  return {
    DRAFT: "sidebar-draft",
    SUBMITTED: "sidebar-submitted",
    COMPLETED: "sidebar-completed",
    CANCELED: "sidebar-canceled",
  }[s] || "";
};

/* 상태 라벨 */
const statusLabel = (status) => {
  const s = String(status || "").toUpperCase();
  return {
    DRAFT: "작성중",
    SUBMITTED: "제출됨",
    COMPLETED: "완료",
    CANCELED: "취소됨",
  }[s] || status;
};

/* API 호출 */
const fetchEstimates = async () => {
  const { data } = await getEstimates({
    page: page.value,
    size: size.value,
    keyword: search.value || undefined,
  });

  const list = data.data || [];

  estimates.value = list.map((item) => ({
    ...item,
    isFavorite: false,
  }));

  totalPages.value = Math.ceil(data.totalCount / data.size);
};

/* FE 필터 */
const filteredEstimates = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  const activeStatuses = sidebares
    .filter((s) => s.checked)
    .map((s) => s.value);

  return estimates.value.filter((e) => {
    const matchesSearch =
      !keyword ||
      e.estimateTitle.toLowerCase().includes(keyword) ||
      e.clientCompanyName.toLowerCase().includes(keyword) ||
      e.clientName.toLowerCase().includes(keyword);

    const matchesStatus =
      activeStatuses.length === 0 ||
      activeStatuses.includes(String(e.status).toUpperCase());

    const matchesFavorite =
      !showFavoritesOnly.value || e.isFavorite;

    return matchesSearch && matchesStatus && matchesFavorite;
  });
});

/* 페이지 변경 */
const onPageChange = () => fetchEstimates();

/* 라우팅 */
const goToEstimateDetail = (id) =>
  router.push({ name: "EstimateDetail", params: { id } });

const goToCreateEstimate = () =>
  router.push({ name: "CreateEstimate" });

onMounted(fetchEstimates);
</script>

<style scoped>
/* ===== Proposal 카드 스타일 그대로 복사 ===== */

.main-container {
  background-color: #ffffff;
  min-height: 100vh;
}

.sidebar-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  background-color: #ffffff;
}

.proposal-col {
  padding-left: 10px;
  padding-right: 10px;
  margin-bottom: 18px;
}

.favorite-toggle-btn {
  margin-top: 12px;
  border-radius: 8px;
  background-color: #ffffff;
  padding: 6px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.favorite-toggle-btn .v-icon {
  font-size: 1.2rem;
  transition: color 0.2s;
}

.proposal-card {
  position: relative;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  background-color: #ffffff;
}

.proposal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.sidebar-text {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 6px;
}

.sidebar-draft {
  color: #888;
  background-color: #f0f0f0;
}

.sidebar-submitted {
  color: #1976d2;
  background-color: #e3f2fd;
}

.sidebar-completed {
  color: #4caf50;
  background-color: #e8f5e9;
}

.sidebar-canceled {
  color: #f44336;
  background-color: #ffebee;
}

.period-text {
  font-size: 0.75rem;
  color: #888888;
  font-weight: 400;
}

.label {
  font-size: 0.7rem;
  color: #8e8e93;
}

.proposal-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.sidebar-checkbox .v-label {
  font-size: 0.75rem;
  color: #1c1c1e;
  font-weight: 500;
}
</style>
