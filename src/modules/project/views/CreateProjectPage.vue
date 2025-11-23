<template>
  <v-container fluid class="pa-6 page-wrapper">

    <!-- 페이지 타이틀 -->
    <div class="page-title mb-6">프로젝트 생성</div>

    <!-- 카드 -->
    <v-card elevation="1" class="project-card pa-8">
      <div class="section-title mb-6">새 프로젝트 정보</div>

      <v-row dense>

        <!-- 프로젝트명 -->
        <v-col cols="12" md="6">
          <div class="input-label">프로젝트명</div>
          <v-text-field v-model="form.projectName" placeholder="프로젝트명을 입력하세요" variant="outlined" class="input-field"
            hide-details />
        </v-col>

        <!-- 고객사 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객사</div>
          <v-text-field v-model="form.clientCompany" placeholder="고객사를 선택하세요" variant="outlined" class="input-field"
            hide-details readonly @click="clientDialog = true" />
        </v-col>

        <!-- 고객사 담당자 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객사 담당자</div>
          <v-text-field v-model="form.client" placeholder="고객사 담당자를 선택하세요" variant="outlined" class="input-field"
            hide-details readonly @click="clientPersonDialog = true" />
        </v-col>


        <!-- 영업 관리자 -->
        <v-col cols="12" md="6">
          <div class="input-label">영업 관리자</div>
          <v-text-field v-model="form.salesManager" placeholder="담당 직원을 선택하세요" variant="outlined" class="input-field"
            hide-details readonly @click="managerDialog = true" />
        </v-col>

        <!-- 유형 -->
        <v-col cols="12" md="6">
          <div class="input-label">유형</div>
          <v-select v-model="form.salesType" :items="typeList" placeholder="판매 유형을 선택하세요" variant="outlined"
            class="input-field" hide-details dense solo />
        </v-col>

        <!-- 날짜: 시작일 -->
        <v-col cols="12" md="3">
          <div class="input-label">시작일</div>
          <v-menu v-model="startMenu" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-text-field v-model="form.startDate" placeholder="시작일" variant="outlined" hide-details v-bind="props"
                class="input-field" readonly />
            </template>

            <v-date-picker v-model="form.startDate" @update:model-value="startMenu = false" />
          </v-menu>
        </v-col>

        <!-- 날짜: 종료일 -->
        <v-col cols="12" md="3">
          <div class="input-label">종료일</div>
          <v-menu v-model="endMenu" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-text-field v-model="form.endDate" placeholder="종료일" variant="outlined" hide-details class="input-field"
                v-bind="props" readonly />
            </template>

            <v-date-picker v-model="form.endDate" @update:model-value="endMenu = false" />
          </v-menu>
        </v-col>

        <!-- 예상 매출 -->
        <v-col cols="12" md="6">
          <div class="input-label">예상 매출액</div>
          <v-text-field :model-value="formattedRevenue" placeholder="금액을 입력하세요" variant="outlined" suffix="원"
            class="input-field" hide-details @update:model-value="updateRevenue" />
        </v-col>

        <!-- 마진율 -->
        <v-col cols="12" md="6">
          <div class="input-label">예상 마진율</div>
          <v-text-field v-model.number="form.expectedMarginRate" placeholder="0~100" type="number" suffix="%"
            variant="outlined" class="input-field" hide-details />
        </v-col>

        <!-- 자동계산 예상 이익 -->
        <v-col cols="12" md="6">
          <div class="input-label">예상 이익</div>
          <v-text-field :model-value="formattedProfit" readonly variant="outlined" class="input-field result-field"
            hide-details />
        </v-col>

        <!-- 프로젝트 상태
        <v-col cols="12" md="6">
          <div class="input-label">프로젝트 상태</div>
          <v-select v-model="form.projectStatus" :items="statusOptions" placeholder="상태 선택" variant="outlined"
            class="input-field" hide-details />
        </v-col> -->

        <!-- 메모 / 비고 -->
        <v-col cols="12">
          <div class="input-label">비고</div>
          <v-textarea v-model="form.description" placeholder="프로젝트 관련 메모를 입력하세요" variant="outlined" rows="3"
            class="input-field" hide-details />
        </v-col>
      </v-row>

      <!-- 저장 버튼 -->
      <div class="text-right mt-8">
        <v-btn color="orange darken-2" class="white--text px-6" rounded="lg" elevation="2" @click="saveProject">
          저장
        </v-btn>
      </div>
    </v-card>

    <!-- 고객사 선택 모달 -->
    <v-dialog v-model="clientDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객사 선택</div>

        <!-- 타입 필터 -->
        <div class="mb-3 d-flex">
          <v-chip class="mr-2" :color="clientTypeFilter === 'ALL' ? 'orange darken-2' : undefined"
            :text-color="clientTypeFilter === 'ALL' ? 'white' : undefined" @click="clientTypeFilter = 'ALL'">
            전체
          </v-chip>
          <v-chip class="mr-2" :color="clientTypeFilter === 'CLIENT' ? 'orange darken-2' : undefined"
            :text-color="clientTypeFilter === 'CLIENT' ? 'white' : undefined" @click="clientTypeFilter = 'CLIENT'">
            고객사
          </v-chip>
          <v-chip :color="clientTypeFilter === 'LEAD' ? 'orange darken-2' : undefined"
            :text-color="clientTypeFilter === 'LEAD' ? 'white' : undefined" @click="clientTypeFilter = 'LEAD'">
            잠재고객사
          </v-chip>
        </div>

        <!-- 검색 -->
        <v-text-field v-model="clientSearch" placeholder="고객사명을 입력하세요" prepend-inner-icon="mdi-magnify"
          variant="outlined" hide-details class="mb-4" />

        <!-- 목록 -->
        <v-list>
          <v-list-item v-for="item in filteredClients" :key="item.id" @click="selectClient(item)" class="dialog-item">
            {{ item.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 고객 담당자 선택 모달 -->
    <v-dialog v-model="clientPersonDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객 담당자 선택</div>

        <v-text-field v-model="clientPersonSearch" placeholder="검색" prepend-inner-icon="mdi-magnify" variant="outlined"
          hide-details class="mb-4" />

        <v-list>
          <v-list-item v-for="p in filteredClientPersons" :key="p.id" @click="selectClientPerson(p)"
            class="dialog-item">
            {{ p.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>


    <!-- 영업 관리자 선택 모달 -->
    <!-- 영업 관리자 선택 모달 -->
    <v-dialog v-model="managerDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">영업 관리자 선택</div>

        <v-text-field v-model="managerSearch" placeholder="검색" prepend-inner-icon="mdi-magnify" variant="outlined"
          hide-details class="mb-4" />

        <v-list>
          <v-list-item v-for="m in filteredManagers" :key="m.userId" @click="selectManager(m)" class="dialog-item"
            :class="{
              'selected-item': selectedManagerId === m.userId
            }">
            <v-list-item-title>
              {{ m.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <!-- 하단 선택 버튼 -->
        <v-card-actions class="justify-end mt-2">
          <v-btn color="orange darken-2" class="white--text" :disabled="!selectedManagerId"
            @click="confirmManagerSelect">
            선택하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from "vue"; // onMounted 추가
import { useRouter } from "vue-router";
import { createProject } from "@/apis/project";
import {
  getSimpleClientCompanies,
  getSimpleClientsByCompany,
} from "@/apis/client"; // 파일 경로 실제에 맞춰라
import { getMyProfile, getUserList } from "@/apis/user";

const router = useRouter();

const startMenu = ref(false);
const endMenu = ref(false);

const clientDialog = ref(false);
const managerDialog = ref(false);

const clientSearch = ref("");
const managerSearch = ref("");

// 로그인 사용자
const currentUser = ref(null);

// 고객사 타입 필터: ALL / CLIENT / LEAD
const clientTypeFilter = ref("ALL");

// 페이지네이션 상태
const clientPage = ref(1);
const clientPageSize = ref(10);
const clientTotalCount = ref(0);

// 서버에서 받아오는 고객사 목록
const clientList = ref([]);

// 고객 담당자 모달/검색
const clientPersonDialog = ref(false);
const clientPersonSearch = ref("");

const clientPersonList = ref([]); // API로 채울 대상

// 담당자 목록(서버에서 이미 필터링한다고 가정하면 그대로 사용)
const filteredClientPersons = computed(() => clientPersonList.value);

// 영업 관리자 목록 (임시)
const managerList = ref([]);

const selectedManagerId = ref(null);


const loadManagers = async () => {
  const res = await getUserList();
  // 응답: [{ userId, name }, ...]
  managerList.value = res.data || [];
};
const typeList = ["팝업 스토어", "전시회", "임대"];

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

// 상태 옵션
const statusOptions = ["제안 수신", "내부 검토", "제안 작성", "협상 시작", "계약 성공"];

// ─────────────────────────────
// 로그인 사용자 프로필 로딩 + 기본 영업담당자 세팅
// ─────────────────────────────
onMounted(async () => {
  const res = await getMyProfile();     // /api/users/profile 호출 (백엔드 매핑에 맞춰라)
  currentUser.value = res.data;

  // 프로필 DTO에 맞게 필드 이름 맞춰라
  // 예: { userId, name, ... }
  if (!form.salesManagerId) {
    form.salesManagerId = currentUser.value.userId;
    form.salesManager = currentUser.value.name;
  }
});

// ─────────────────────────────
// 고객사 목록 로딩
// ─────────────────────────────
const loadClients = async () => {
  const params = {
    page: clientPage.value,
    size: clientPageSize.value,
  };

  // 타입 필터
  if (clientTypeFilter.value && clientTypeFilter.value !== "ALL") {
    params.type = clientTypeFilter.value; // "CLIENT" | "LEAD"
  }

  // 검색어
  if (clientSearch.value.trim()) {
    params.keyword = clientSearch.value.trim();
  }

  const res = await getSimpleClientCompanies(params);
  clientList.value = res.data.content || [];
  clientTotalCount.value = res.data.totalCount || 0;
};

// 고객사 목록(서버에서 이미 필터링하므로 그대로 사용하거나, 추가 필터 원하면 여기에)
const filteredClients = computed(() =>
  clientList.value.filter((c) => c.name.includes(clientSearch.value))
);

// 모달 열릴 때 1페이지 로딩
watch(clientDialog, (open) => {
  if (open) {
    clientPage.value = 1;
    loadClients();
  }
});

watch(managerDialog, async (open) => {
  if (open) {
    managerSearch.value = "";
    selectedManagerId.value = form.salesManagerId; // 이미 선택된 값 있으면 표시
    await loadManagers();
  }
});

// 타입/검색어 변경 시 재조회
watch([clientTypeFilter, clientSearch], () => {
  if (clientDialog.value) {
    clientPage.value = 1;
    loadClients();
  }
});

// ─────────────────────────────
// 고객 담당자 목록 로딩
// ─────────────────────────────
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

// 담당자 모달 열릴 때 자동 로딩
watch(clientPersonDialog, (open) => {
  if (open && form.clientCompanyId) {
    clientPersonSearch.value = "";
    loadClientPersons(form.clientCompanyId);
  }
});

// 담당자 검색어 변경 시 재조회
watch(clientPersonSearch, () => {
  if (!form.clientCompanyId) return;
  if (!clientPersonDialog.value) return;
  loadClientPersons(form.clientCompanyId);
});

// 관리자 필터
const filteredManagers = computed(() =>
  managerList.value.filter((m) => m.name.includes(managerSearch.value))
);


// 고객사 선택
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
  // 모달 안에서 어떤 사용자를 골랐는지만 표시
  selectedManagerId.value = item.userId;
};

const mapSalesTypeToEnum = (label) => {
  switch (label) {
    case "팝업 스토어":
      return "POPUP";
    case "전시회":
      return "EXHIBITION";
    case "임대":
      return "RENTAL";
    default:
      return null;
  }
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
const saveProject = async () => {
  const payload = {
    title: form.projectName,
    clientCompanyId: form.clientCompanyId,
    clientId: form.clientId,
    salesManagerId: form.salesManagerId,
    type: mapSalesTypeToEnum(form.salesType),
    description: form.description || "",
    startDay: form.startDate,
    endDay: form.endDate,
    expectedRevenue: form.expectedRevenue,
    expectedMarginRate: form.expectedMarginRate,
  };

  const res = await createProject(payload);

  const createdId = res.data.projectId;
  if (createdId) {
    router.push(`/project/${createdId}`);
  }
};

const selectClientPerson = (p) => {
  form.client = p.name;
  form.clientId = p.id;
  clientPersonDialog.value = false;
};

const confirmManagerSelect = () => {
  if (!selectedManagerId.value) return;

  const selected = managerList.value.find(
    (m) => m.userId === selectedManagerId.value
  );
  if (!selected) return;

  form.salesManagerId = selected.userId;
  form.salesManager = selected.name;

  managerDialog.value = false;
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

.selected-item {
  background: #fff3e0;
}
</style>
