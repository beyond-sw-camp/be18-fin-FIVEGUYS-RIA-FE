<template>
  <v-container fluid class="page-wrapper">
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="2500"
      location="top center"
      class="toast-snackbar"
    >
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- 페이지 타이틀 -->
    <div class="page-title">프로젝트 생성</div>

    <!-- 카드 -->
    <v-card elevation="1" class="project-card">
      <div class="section-title">새 프로젝트 정보</div>

      <v-row dense class="container">
        <!-- 프로젝트명 -->
        <v-col cols="12" md="6">
          <div class="input-label">프로젝트명</div>
          <v-text-field
            v-model="form.projectName"
            placeholder="프로젝트명을 입력하세요"
            variant="outlined"
            class="input-field"
            density="compact"
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
            density="compact"
            hide-details
            readonly
            @click="clientDialog = true"
          />
        </v-col>

        <!-- 고객사 담당자 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객사 담당자</div>
          <v-text-field
            v-model="form.client"
            placeholder="고객사 담당자를 선택하세요"
            variant="outlined"
            class="input-field"
            density="compact"
            hide-details
            readonly
            @click="clientPersonDialog = true"
          />
        </v-col>

        <!-- 영업 관리자 -->
        <v-col cols="12" md="6">
          <div class="input-label">영업 관리자</div>
          <v-text-field
            v-model="form.salesManager"
            variant="outlined"
            class="input-field"
            density="compact"
            hide-details
            readonly
          />
        </v-col>

        <!-- 유형 -->
        <v-col cols="12" md="6">
          <div class="input-label">유형</div>
          <v-select
            v-model="form.salesType"
            :items="typeList"
            placeholder="판매 유형을 선택하세요"
            variant="outlined"
            class="input-field"
            density="compact"
            hide-details
          />
        </v-col>

        <!-- 날짜: 시작일 -->
        <v-col cols="12" md="3">
          <div class="input-label">시작일</div>
          <v-menu v-model="startMenu" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-text-field
                :model-value="formattedStartDate"
                placeholder="시작일"
                variant="outlined"
                class="input-field"
                density="compact"
                hide-details
                v-bind="props"
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
          <v-menu v-model="endMenu" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-text-field
                :model-value="formattedEndDate"
                placeholder="종료일"
                variant="outlined"
                class="input-field"
                density="compact"
                hide-details
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
            density="compact"
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
            density="compact"
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
            density="compact"
            hide-details
          />
        </v-col>

        <!-- 메모 / 비고 -->
        <v-col cols="12">
          <div class="input-label">비고</div>
          <v-textarea
            v-model="form.description"
            placeholder="프로젝트 관련 메모를 입력하세요"
            variant="outlined"
            rows="2"
            class="input-field"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <!-- 저장 버튼 -->
      <div class="actions-row">
        <v-btn
          color="orange darken-2"
          class="white--text px-5"
          size="small"
          rounded="lg"
          elevation="1"
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

        <div class="mb-3 d-flex">
          <v-chip
            class="mr-2"
            :color="clientTypeFilter === 'ALL' ? 'orange darken-2' : undefined"
            :text-color="clientTypeFilter === 'ALL' ? 'white' : undefined"
            @click="clientTypeFilter = 'ALL'"
          >
            전체
          </v-chip>
          <v-chip
            class="mr-2"
            :color="
              clientTypeFilter === 'CLIENT' ? 'orange darken-2' : undefined
            "
            :text-color="clientTypeFilter === 'CLIENT' ? 'white' : undefined"
            @click="clientTypeFilter = 'CLIENT'"
          >
            고객사
          </v-chip>
          <v-chip
            :color="clientTypeFilter === 'LEAD' ? 'orange darken-2' : undefined"
            :text-color="clientTypeFilter === 'LEAD' ? 'white' : undefined"
            @click="clientTypeFilter = 'LEAD'"
          >
            잠재고객사
          </v-chip>
        </div>

        <v-text-field
          v-model="clientSearch"
          placeholder="고객사명을 입력하세요"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-4"
        />

        <v-list>
          <v-list-item
            v-for="item in filteredClients"
            :key="item.id"
            @click="selectClient(item)"
            class="dialog-item"
          >
            {{ item.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 고객 담당자 선택 모달 -->
    <v-dialog v-model="clientPersonDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객 담당자 선택</div>

        <v-text-field
          v-model="clientPersonSearch"
          placeholder="검색"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-4"
        />

        <v-list>
          <v-list-item
            v-for="p in filteredClientPersons"
            :key="p.id"
            @click="selectClientPerson(p)"
            class="dialog-item"
          >
            {{ p.name }}
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
          density="compact"
          hide-details
          class="mb-4"
        />

        <v-list>
          <v-list-item
            v-for="m in filteredManagers"
            :key="m.userId"
            @click="selectManager(m)"
            class="dialog-item"
            :class="{ 'selected-item': selectedManagerId === m.userId }"
          >
            <v-list-item-title>
              {{ m.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <v-card-actions class="justify-end mt-2">
          <v-btn
            color="orange darken-2"
            class="white--text"
            size="small"
            :disabled="!selectedManagerId"
            @click="confirmManagerSelect"
          >
            선택하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { createProject } from "@/apis/project";
import {
  getSimpleClientCompanies,
  getSimpleClientsByCompany,
} from "@/apis/client";
import { getMyProfile, getUserList } from "@/apis/user";

const router = useRouter();

const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("red");

const showError = (
  err,
  fallbackMessage = "요청 처리 중 오류가 발생했습니다."
) => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.errorMessage ||
    fallbackMessage;

  snackbarMessage.value = msg;
  snackbarColor.value = "red";
  snackbar.value = true;
};

const showSuccess = (msg = "프로젝트가 생성되었습니다.") => {
  snackbarMessage.value = msg;
  snackbarColor.value = "green";
  snackbar.value = true;
};

const startMenu = ref(false);
const endMenu = ref(false);

const clientDialog = ref(false);
const managerDialog = ref(false);

const clientSearch = ref("");
const managerSearch = ref("");

// 로그인 사용자
const currentUser = ref(null);

// 고객사 타입 필터
const clientTypeFilter = ref("ALL");

// 페이지네이션
const clientPage = ref(1);
const clientPageSize = ref(10);
const clientTotalCount = ref(0);

// 고객사 목록
const clientList = ref([]);

// 고객 담당자 모달/검색
const clientPersonDialog = ref(false);
const clientPersonSearch = ref("");
const clientPersonList = ref([]);

// 영업 관리자 목록
const managerList = ref([]);
const selectedManagerId = ref(null);

const loadManagers = async () => {
  const res = await getUserList();
  managerList.value = (res.data || []).filter(
    (u) => u.roleName !== "ROLE_ADMIN"
  );
};

const typeList = ["팝업 스토어", "전시회", "입점"];

const form = reactive({
  projectName: "",
  clientCompany: "",
  clientCompanyId: null,
  client: "",
  clientId: null,
  salesManager: "",
  salesManagerId: null,
  salesType: "",
  startDate: null,
  endDate: null,
  expectedRevenue: null,
  expectedMarginRate: null,
  expectedProfit: null,
  description: "",
  projectStatus: "제안 수신",
});

const statusOptions = [
  "제안 수신",
  "내부 검토",
  "제안 작성",
  "협상 시작",
  "계약 성공",
];

onMounted(async () => {
  const res = await getMyProfile();
  currentUser.value = res.data;

  if (!form.salesManagerId) {
    form.salesManagerId = currentUser.value.userId;
    form.salesManager = currentUser.value.name;
  }
});

const loadClients = async () => {
  const params = {
    page: clientPage.value,
    size: clientPageSize.value,
  };

  if (clientTypeFilter.value && clientTypeFilter.value !== "ALL") {
    params.type = clientTypeFilter.value;
  }

  if (clientSearch.value.trim()) {
    params.keyword = clientSearch.value.trim();
  }

  const res = await getSimpleClientCompanies(params);
  clientList.value = res.data.content || [];
  clientTotalCount.value = res.data.totalCount || 0;
};

const filteredClients = computed(() =>
  clientList.value.filter((c) => c.name.includes(clientSearch.value))
);

watch(clientDialog, (open) => {
  if (open) {
    clientPage.value = 1;
    loadClients();
  }
});

watch(managerDialog, (open) => {
  if (open) managerDialog.value = false;
});

watch([clientTypeFilter, clientSearch], () => {
  if (clientDialog.value) {
    clientPage.value = 1;
    loadClients();
  }
});

const loadClientPersons = async (companyId) => {
  if (!companyId) return;

  const params = {
    page: 1,
    size: 50,
  };

  if (clientPersonSearch.value.trim()) {
    params.keyword = clientPersonSearch.value.trim();
  }

  const res = await getSimpleClientsByCompany(companyId, params);
  clientPersonList.value = res.data.content || [];
};

watch(clientPersonDialog, (open) => {
  if (open && form.clientCompanyId) {
    clientPersonSearch.value = "";
    loadClientPersons(form.clientCompanyId);
  }
});

watch(clientPersonSearch, () => {
  if (!form.clientCompanyId) return;
  if (!clientPersonDialog.value) return;
  loadClientPersons(form.clientCompanyId);
});

const filteredClientPersons = computed(() => clientPersonList.value);

const filteredManagers = computed(() =>
  managerList.value.filter((m) => m.name.includes(managerSearch.value))
);

const selectClient = (item) => {
  form.clientCompany = item.name;
  form.clientCompanyId = item.id;

  form.client = "";
  form.clientId = null;
  clientPersonSearch.value = "";
  clientPersonList.value = [];

  clientDialog.value = false;

  loadClientPersons(item.id);
};

const selectManager = (item) => {
  selectedManagerId.value = item.userId;
};

const mapSalesTypeToEnum = (label) => {
  switch (label) {
    case "팝업 스토어":
      return "POPUP";
    case "전시회":
      return "EXHIBITION";
    case "입점":
      return "RENTAL";
    default:
      return null;
  }
};

const formattedRevenue = computed(() => {
  if (!form.expectedRevenue) return "";
  return Number(form.expectedRevenue).toLocaleString();
});

const updateRevenue = (val) => {
  const numeric = Number(val.replace(/[^0-9]/g, ""));
  form.expectedRevenue = numeric || null;
};

const formattedProfit = computed(() => {
  if (!form.expectedRevenue || !form.expectedMarginRate) return "";

  const profit = (form.expectedRevenue * form.expectedMarginRate) / 100;
  form.expectedProfit = profit;

  return profit.toLocaleString() + " 원";
});

const toDateString = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formattedStartDate = computed(() => toDateString(form.startDate));
const formattedEndDate = computed(() => toDateString(form.endDate));

const toLocalDateString = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const saveProject = async () => {
  const payload = {
    title: form.projectName,
    clientCompanyId: form.clientCompanyId,
    clientId: form.clientId,
    salesManagerId: form.salesManagerId,
    type: mapSalesTypeToEnum(form.salesType),
    description: form.description || "",
    startDay: toLocalDateString(form.startDate),
    endDay: toLocalDateString(form.endDate),
    expectedRevenue: form.expectedRevenue,
    expectedMarginRate: form.expectedMarginRate,
  };

  try {
    const res = await createProject(payload);
    const createdId = res.data.projectId;

    showSuccess("프로젝트가 생성되었습니다.");

    if (createdId) {
      router.push(`/project/${createdId}`);
    }
  } catch (err) {
    showError(err, "프로젝트를 생성할 수 없습니다.");
  }
};

const selectClientPerson = (p) => {
  form.client = p.name;
  form.clientId = p.id;
  clientPersonDialog.value = false;
};

// const confirmManagerSelect = () => {
//   if (!selectedManagerId.value) return;

//   const selected = managerList.value.find(
//     (m) => m.userId === selectedManagerId.value
//   );
//   if (!selected) return;

//   form.salesManagerId = selected.userId;
//   form.salesManager = selected.name;

//   managerDialog.value = false;
// };
</script>

<style scoped>
.page-wrapper {
  background: #fafafa;
  min-height: 100vh;
  padding: 16px 24px 24px;
}

/* 타이틀: 카드와 정렬, 크기 약 30% 축소 */
.page-title {
  max-width: 1200px;
  margin: 8px auto 16px;
  font-size: 1.4rem;
  font-weight: 700;
  color: #111;
}

/* 카드: 폭 고정 + 패딩 축소 */
.project-card {
  max-width: 1200px;
  margin: 0 auto 16px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e7e7e7;
  padding: 16px 20px 18px;
}

/* 섹션 타이틀 */
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

/* 라벨: 폰트/간격 축소 */
.input-label {
  font-size: 0.76rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 3px;
}

/* 컬럼 세로 간격: 30% 축소 */
.project-card :deep(.v-col) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

/* 입력 필드: 높이/폰트 축소 */
.input-field {
  border-radius: 8px !important;
  font-size: 0.9rem;
}

/* Vuetify 필드 내부 높이/패딩 축소 */
.input-field :deep(.v-field) {
  min-height: 34px !important;
}

.input-field :deep(.v-field__input) {
  padding-top: 3px !important;
  padding-bottom: 3px !important;
}

/* textarea 최소 높이 축소 */
:deep(textarea) {
  min-height: 52px !important;
}

/* 자동 계산 필드 강조 */
.result-field {
  background: #fdf7ed !important;
  font-weight: 600;
}

/* 하단 버튼 영역: 위 여백만 조금 */
.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 모달 타이틀/아이템도 약간 축소 */
.dialog-title {
  font-size: 1rem;
  font-weight: 600;
}

.dialog-item {
  padding: 8px 6px !important;
  cursor: pointer;
  font-size: 0.9rem;
}

.dialog-item:hover {
  background: #fff3e0 !important;
}

.selected-item {
  background: #fff3e0 !important;
}
</style>
