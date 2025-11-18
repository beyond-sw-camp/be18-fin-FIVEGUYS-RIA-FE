<template>
  <v-container fluid class="pa-6 page-wrapper">

    <!-- 페이지 타이틀 -->
    <div class="page-title mb-6">프로젝트 생성</div>

    <!-- 카드 -->
    <v-card
      elevation="1"
      class="project-card pa-8"
    >
      <div class="section-title mb-6">새 프로젝트 정보</div>

      <v-row dense>

        <!-- 프로젝트명 -->
        <v-col cols="12" md="6">
          <div class="input-label">프로젝트명</div>
          <v-text-field
            v-model="form.projectName"
            placeholder="프로젝트명을 입력하세요"
            variant="outlined"
            class="input-field"
            hide-details
          />
        </v-col>

        <!-- 고객사 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객사</div>
          <v-text-field
            v-model="form.clientCompany"
            placeholder="고객사를 선택하세요"
            variant="outlined"
            class="input-field"
            hide-details
            readonly
            @click="clientDialog = true"
          />
        </v-col>

        <!-- 영업 관리자 -->
        <v-col cols="12" md="6">
          <div class="input-label">영업 관리자</div>
          <v-text-field
            v-model="form.salesManager"
            placeholder="담당 직원을 선택하세요"
            variant="outlined"
            class="input-field"
            hide-details
            readonly
            @click="managerDialog = true"
          />
        </v-col>

        <!-- 날짜: 시작일 -->
        <v-col cols="12" md="3">
          <div class="input-label">시작일</div>
          <v-menu
            v-model="startMenu"
            :close-on-content-click="false"
            offset-y
          >
            <template #activator="{ props }">
              <v-text-field
                v-model="form.startDate"
                placeholder="시작일"
                variant="outlined"
                hide-details
                v-bind="props"
                class="input-field"
                readonly
              />
            </template>

            <v-date-picker
              v-model="form.startDate"
              @update:model-value="startMenu = false"
            />
          </v-menu>
        </v-col>

        <!-- 날짜: 종료일 -->
        <v-col cols="12" md="3">
          <div class="input-label">종료일</div>
          <v-menu
            v-model="endMenu"
            :close-on-content-click="false"
            offset-y
          >
            <template #activator="{ props }">
              <v-text-field
                v-model="form.endDate"
                placeholder="종료일"
                variant="outlined"
                hide-details
                class="input-field"
                v-bind="props"
                readonly
              />
            </template>

            <v-date-picker
              v-model="form.endDate"
              @update:model-value="endMenu = false"
            />
          </v-menu>
        </v-col>

        <!-- 예상 매출 -->
        <v-col cols="12" md="6">
          <div class="input-label">예상 매출액</div>
          <v-text-field
            :model-value="formattedRevenue"
            placeholder="금액을 입력하세요"
            variant="outlined"
            suffix="원"
            class="input-field"
            hide-details
            @update:model-value="updateRevenue"
          />
        </v-col>

        <!-- 마진율 -->
        <v-col cols="12" md="6">
          <div class="input-label">예상 마진율</div>
          <v-text-field
            v-model.number="form.expectedMarginRate"
            placeholder="0~100"
            type="number"
            suffix="%"
            variant="outlined"
            class="input-field"
            hide-details
          />
        </v-col>

        <!-- 자동계산 예상 이익 -->
        <v-col cols="12" md="6">
          <div class="input-label">예상 이익</div>
          <v-text-field
            :model-value="formattedProfit"
            readonly
            variant="outlined"
            class="input-field result-field"
            hide-details
          />
        </v-col>

        <!-- 프로젝트 상태 -->
        <v-col cols="12" md="6">
          <div class="input-label">프로젝트 상태</div>
          <v-select
            v-model="form.projectStatus"
            :items="statusOptions"
            placeholder="상태 선택"
            variant="outlined"
            class="input-field"
            hide-details
          />
        </v-col>

      </v-row>

      <!-- 저장 버튼 -->
      <div class="text-right mt-8">
        <v-btn
          color="orange darken-2"
          class="white--text px-6"
          rounded="lg"
          elevation="2"
          @click="saveProject"
        >
          저장
        </v-btn>
      </div>
    </v-card>

    <!-- 고객사 선택 모달 -->
    <v-dialog v-model="clientDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객사 선택</div>

        <v-text-field
          v-model="clientSearch"
          placeholder="검색"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="mb-4"
        />

        <v-list>
          <v-list-item
            v-for="item in filteredClients"
            :key="item"
            @click="selectClient(item)"
            class="dialog-item"
          >
            {{ item }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 영업 관리자 선택 모달 -->
    <v-dialog v-model="managerDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">영업 관리자 선택</div>

        <v-text-field
          v-model="managerSearch"
          placeholder="검색"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="mb-4"
        />

        <v-list>
          <v-list-item
            v-for="m in filteredManagers"
            :key="m"
            @click="selectManager(m)"
            class="dialog-item"
          >
            {{ m }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { reactive, ref, computed } from "vue";

const startMenu = ref(false);
const endMenu = ref(false);

const clientDialog = ref(false);
const managerDialog = ref(false);

const clientSearch = ref("");
const managerSearch = ref("");

// 임시 데이터 (API 연동 시 대체 가능)
const clientList = ["삼성전자", "LG CNS", "카카오", "네이버", "현대자동차"];
const managerList = ["김영업", "박관리", "최영업", "장팀장", "이사원"];

const form = reactive({
  projectName: "",
  clientCompany: "",
  salesManager: "",
  startDate: null,
  endDate: null,
  expectedRevenue: null,
  expectedMarginRate: null,
  expectedProfit: null,
  projectStatus: "제안 수신", // ✔ 디폴트 값
});

// 상태 옵션
const statusOptions = ["제안 수신", "내부 검토", "제안 작성", "협상 시작", "계약 성공"];

// 고객사 필터
const filteredClients = computed(() =>
  clientList.filter((c) => c.includes(clientSearch.value))
);

// 관리자 필터
const filteredManagers = computed(() =>
  managerList.filter((m) => m.includes(managerSearch.value))
);

// 선택 처리
const selectClient = (v) => {
  form.clientCompany = v;
  clientDialog.value = false;
};

const selectManager = (v) => {
  form.salesManager = v;
  managerDialog.value = false;
};

// 천 단위 콤마 표시
const formattedRevenue = computed(() => {
  if (!form.expectedRevenue) return "";
  return Number(form.expectedRevenue).toLocaleString();
});

// 입력 시 숫자만 저장
const updateRevenue = (val) => {
  const numeric = Number(val.replace(/[^0-9]/g, ""));
  form.expectedRevenue = numeric || null;
};

// 예상 이익 자동 계산
const formattedProfit = computed(() => {
  if (!form.expectedRevenue || !form.expectedMarginRate) return "";

  const profit = (form.expectedRevenue * form.expectedMarginRate) / 100;
  form.expectedProfit = profit;

  return profit.toLocaleString() + " 원";
});

// 저장
const saveProject = () => {
  console.log("저장할 데이터:", form);
};
</script>

<style scoped>
/* 전체 페이지 */
.page-wrapper {
  background: #fafafa;
  min-height: 100vh;
}

/* 타이틀 */
.page-title {
  font-size: 1.7rem;
  font-weight: 700;
  color: #1a1a1a;
}

/* 카드 */
.project-card {
  border-radius: 16px;
  background: white;
  border: 1px solid #e7e7e7;
}

/* 섹션 타이틀 */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* 라벨 */
.input-label {
  font-size: 0.83rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
}

/* 입력 필드 */
.input-field {
  border-radius: 10px;
}

/* 자동 계산된 결과 강조 */
.result-field {
  background: #fdf7ed !important;
  font-weight: 600;
}

/* 모달 */
.dialog-title {
  font-size: 1.2rem;
  font-weight: 600;
}

.dialog-item {
  padding: 12px 8px;
  cursor: pointer;
}

.dialog-item:hover {
  background: #fff3e0;
}
</style>
