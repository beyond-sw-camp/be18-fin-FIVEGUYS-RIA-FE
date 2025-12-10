<template>
  <v-container fluid class="page-wrapper">
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- 페이지 타이틀 -->
    <div class="page-title">견적 작성</div>

    <v-card elevation="1" class="estimate-card">
      <!-- ---------------- 견적 정보 ---------------- -->
      <div class="section-title">견적 정보</div>
      <v-row dense>
        <!-- 견적 제목 -->
        <v-col cols="12" md="6">
          <div class="input-label">견적 제목</div>
          <v-text-field
            v-model="form.title"
            class="input-field"
            variant="outlined"
            hide-details
            placeholder="예: 팝업 스토어 견적"
          />
        </v-col>

        <!-- 프로젝트 선택 -->
        <v-col cols="12" md="6">
          <div class="input-label">프로젝트</div>
          <v-text-field
            v-model="selectedProjectName"
            placeholder="프로젝트 선택"
            class="input-field"
            variant="outlined"
            hide-details
            readonly
            @click="projectDialog = true"
          />
        </v-col>

        <!-- 제안 선택 -->
        <v-col cols="12" md="6">
          <div class="input-label">제안</div>
          <v-text-field
            v-model="selectedProposalName"
            placeholder="제안 선택"
            class="input-field"
            variant="outlined"
            hide-details
            readonly
            @click="proposalDialog = true"
          />
        </v-col>

        <!-- 고객사 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객사</div>
          <v-text-field
            v-model="selectedCompanyName"
            class="input-field"
            variant="outlined"
            hide-details
            readonly
            placeholder="고객사 선택"
            @click="companyDialog = true"
          />
        </v-col>

        <!-- 고객 담당자 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객 담당자</div>
          <v-text-field
            v-model="selectedClientName"
            class="input-field"
            variant="outlined"
            hide-details
            readonly
            placeholder="담당자 선택"
            @click="clientDialog = true"
          />
        </v-col>

        <!-- 견적일 -->
        <v-col cols="12" md="3">
          <div class="input-label">견적일</div>
          <v-menu v-model="estimateMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-text-field
                :model-value="formatDate(form.estimateDate)"
                class="input-field"
                readonly
                placeholder="YYYY-MM-DD"
                variant="outlined"
                hide-details
                v-bind="props"
              />
            </template>
            <v-date-picker
              v-model="form.estimateDate"
              @update:model-value="estimateMenu = false"
            />
          </v-menu>
        </v-col>

        <!-- 납기일 -->
        <v-col cols="12" md="3">
          <div class="input-label">납기일</div>
          <v-menu v-model="deliveryMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-text-field
                :model-value="formatDate(form.deliveryDate)"
                class="input-field"
                readonly
                placeholder="YYYY-MM-DD"
                variant="outlined"
                hide-details
                v-bind="props"
              />
            </template>
            <v-date-picker
              v-model="form.deliveryDate"
              @update:model-value="deliveryMenu = false"
            />
          </v-menu>
        </v-col>

        <!-- 결제 조건 -->
        <v-col cols="12" md="6">
          <div class="input-label">결제 조건</div>
          <v-select
            :items="paymentOptions"
            v-model="form.paymentCondition"
            class="input-field"
            item-title="label"
            item-value="value"
            variant="outlined"
            hide-details
          />
        </v-col>

        <!-- 비고 -->
        <v-col cols="12">
          <div class="input-label">비고</div>
          <v-textarea
            v-model="form.remark"
            class="textarea-field"
            variant="outlined"
            hide-details
            rows="3"
            placeholder="비고 입력"
          />
        </v-col>
      </v-row>

      <!-- ---------------- 공간 정보 ---------------- -->
      <div class="section-title mt-6">공간 정보</div>

      <v-card
        v-for="(sp, idx) in form.spaces"
        :key="idx"
        class="space-card pa-3 mb-3"
      >
        <v-row dense>
          <v-col cols="12" md="3">
            <div class="input-label">층 선택</div>
            <v-select
              :items="floorOptions"
              v-model="sp.floorId"
              class="input-field"
              item-title="label"
              item-value="id"
              hide-details
              @update:modelValue="onFloorChange(idx)"
            />
          </v-col>

          <v-col cols="12" md="3">
            <div class="input-label">매장(호수)</div>
            <v-select
              :items="spaceStoreOptions[idx]"
              v-model="sp.storeId"
              class="input-field"
              item-title="storeNumber"
              item-value="storeId"
              hide-details
              @update:modelValue="onStoreChange(idx)"
            />
          </v-col>

          <v-col cols="12" md="3">
            <div class="input-label">임대료</div>
            <v-text-field
              :model-value="
                sp.rentPrice ? sp.rentPrice.toLocaleString() + '원' : ''
              "
              class="input-field"
              readonly
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <div class="input-label">면적</div>
            <v-text-field
              :model-value="sp.areaSize ? sp.areaSize + '㎡' : ''"
              class="input-field"
              readonly
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <div class="input-label">추가 비용</div>
            <v-text-field
              v-model.number="sp.additionalFee"
              class="input-field"
              type="number"
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <div class="input-label">할인 금액</div>
            <v-text-field
              v-model.number="sp.discountAmount"
              class="input-field"
              type="number"
              hide-details
            />
          </v-col>
        </v-row>

        <v-col cols="12">
          <div class="input-label">공간 설명</div>
          <v-textarea
            v-model="sp.description"
            class="textarea-field"
            hide-details
            rows="2"
          />
        </v-col>

        <v-btn
          color="red"
          variant="outlined"
          class="mt-2"
          @click="removeSpace(idx)"
        >
          공간 삭제
        </v-btn>
      </v-card>

      <!-- 공간 추가 버튼 -->
      <div class="actions-row mb-4">
        <v-btn
          class="space-add-btn"
          variant="outlined"
          color="blue"
          @click="addSpace"
        >
          + 공간 추가
        </v-btn>
      </div>

      <!-- 총 금액 -->
      <v-card class="total-card pa-4">
        <div class="total-title">총 견적 금액</div>
        <div class="total-price">₩{{ totalPrice.toLocaleString() }}</div>
      </v-card>

      <!-- 저장 버튼 -->
      <div class="actions-row">
        <v-btn
          color="orange darken-2"
          class="white--text px-6"
          rounded="lg"
          elevation="2"
          @click="saveEstimate"
        >
          저장
        </v-btn>
      </div>
    </v-card>

    <!-- ================= 모달들 ================= -->

    <!-- 프로젝트 선택 -->
    <v-dialog v-model="projectDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">프로젝트 선택</div>
        <v-text-field
          v-model="projectSearch"
          placeholder="검색"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          class="mb-4"
        />
        <v-list>
          <v-list-item
            v-for="p in filteredProjects"
            :key="p.id"
            @click="selectProject(p)"
            class="dialog-item"
          >
            {{ p.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 제안 선택 -->
    <v-dialog v-model="proposalDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">제안 선택</div>
        <v-text-field
          v-model="proposalSearch"
          placeholder="검색"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          class="mb-4"
        />
        <v-list>
          <v-list-item
            v-for="p in filteredProposals"
            :key="p.id"
            @click="selectProposal(p)"
            class="dialog-item"
          >
            {{ p.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 고객사 선택 -->
    <v-dialog v-model="companyDialog" width="500">
      <v-card class="pa-4">
        <v-card-text>
          <div class="dialog-title mb-3">고객사 선택</div>

          <div class="mb-3 d-flex">
            <v-chip
              class="mr-2"
              :color="
                companyTypeFilter === 'ALL' ? 'orange darken-2' : undefined
              "
              :text-color="companyTypeFilter === 'ALL' ? 'white' : undefined"
              @click="companyTypeFilter = 'ALL'"
            >
              전체
            </v-chip>

            <v-chip
              class="mr-2"
              :color="
                companyTypeFilter === 'CLIENT' ? 'orange darken-2' : undefined
              "
              :text-color="companyTypeFilter === 'CLIENT' ? 'white' : undefined"
              @click="companyTypeFilter = 'CLIENT'"
            >
              고객사
            </v-chip>

            <v-chip
              :color="
                companyTypeFilter === 'LEAD' ? 'orange darken-2' : undefined
              "
              :text-color="companyTypeFilter === 'LEAD' ? 'white' : undefined"
              @click="companyTypeFilter = 'LEAD'"
            >
              잠재고객사
            </v-chip>
          </div>

          <v-text-field
            v-model="companySearch"
            placeholder="검색"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            class="mb-4"
          />

          <v-list>
            <v-list-item
              v-for="c in filteredCompanies"
              :key="c.companyId"
              @click="selectCompany(c)"
              class="dialog-item"
            >
              {{ c.companyName }}
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 담당자 선택 -->
    <v-dialog v-model="clientDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객 담당자 선택</div>
        <v-text-field
          v-model="clientSearch"
          placeholder="검색"
          variant="outlined"
          class="mb-4"
        />
        <v-list>
          <v-list-item
            v-for="p in filteredClientList"
            :key="p.id"
            @click="selectClient(p)"
            class="dialog-item"
          >
            {{ p.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

import { createEstimate } from "@/apis/estimate";
import { getFloors, getSpaces } from "@/apis/storemap";
import { getProposalsByProject, getProposalDetail } from "@/apis/proposal";
import { getProjectsWithPipelines, getProjectMeta } from "@/apis/project";
import {
  getSimpleClientCompanies,
  getSimpleClientsByCompany,
} from "@/apis/client";

const router = useRouter();

/* ------------ 옵션들 ------------ */
const paymentOptions = ref([
  { label: "선불", value: "PREPAY" },
  { label: "후불", value: "POSTPAY" },
]);

// 고객사 타입 필터 (전체 / 고객사 / 잠재고객사)
const companyTypeFilter = ref("ALL");

/* 프로젝트 / 제안 리스트 (모달용) */
const projects = ref([]); // {id, name}
const proposalList = ref([]); // {id, name}

/* 고객사 / 담당자 리스트 */
const companyList = ref([]);
const clientList = ref([]);

/* 층 / 매장 리스트 */
const floorOptions = ref([]);
const spaceStoreOptions = ref([]);

/* Date menu */
const estimateMenu = ref(false);
const deliveryMenu = ref(false);

/* ------------ FORM ------------ */
const form = reactive({
  title: "",
  projectId: null,
  proposalId: null,
  clientCompanyId: null,
  clientId: null,

  estimateDate: null,
  deliveryDate: null,
  paymentCondition: "PREPAY",
  remark: "",

  spaces: [
    {
      floorId: null,
      storeId: null,
      rentPrice: 0,
      areaSize: 0,
      additionalFee: 0,
      discountAmount: 0,
      description: "",
    },
  ],
});

/* ------------ UI / 선택된 이름들 ------------ */
const selectedProjectName = ref("");
const selectedProposalName = ref("");
const selectedCompanyName = ref("");
const selectedClientName = ref("");

/* 모달 열림 여부 */
const projectDialog = ref(false);
const proposalDialog = ref(false);
const companyDialog = ref(false);
const clientDialog = ref(false);

/* 검색어 */
const projectSearch = ref("");
const proposalSearch = ref("");
const companySearch = ref("");
const clientSearch = ref("");

/* ------------ Snackbar ------------ */
const snackbar = ref(false);
const snackbarColor = ref("red");
const snackbarMessage = ref("");

const showError = (msg) => {
  snackbarMessage.value = msg;
  snackbarColor.value = "red";
  snackbar.value = true;
};
const showSuccess = (msg) => {
  snackbarMessage.value = msg;
  snackbarColor.value = "green";
  snackbar.value = true;
};

/* ------------ Utils ------------ */
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().substring(0, 10);
};

/* ====================================================================== */
/*                           프로젝트 / 제안 로딩                          */
/* ====================================================================== */
const loadProjects = async () => {
  const res = await getProjectsWithPipelines({
    myProject: true,
    page: 1,
    size: 100,
  });

  projects.value = res.data.content.map((p) => ({
    id: p.projectId,
    name: p.title,
  }));
};

/* 프로젝트 변경 시 공통 로직 */
const onProjectChange = async (projectId) => {
  form.projectId = projectId;

  // 제안 초기화
  form.proposalId = null;
  proposalList.value = [];
  selectedProposalName.value = "";

  if (!projectId) return;

  const { data } = await getProjectMeta(projectId);

  // 1) 이름 세팅
  selectedCompanyName.value = data.clientCompanyName || "";
  selectedClientName.value = data.clientName || "";

  // 2) 회사 자동 매칭 (현재 로딩된 companyList 안에서 찾기)
  const company = companyList.value.find(
    (c) => c.companyName === data.clientCompanyName
  );
  form.clientCompanyId = company ? company.companyId : null;

  // 3) 클라이언트 자동 매칭
  if (form.clientCompanyId) {
    await loadClients(form.clientCompanyId);
    const client = clientList.value.find((c) => c.name === data.clientName);
    form.clientId = client ? client.id : null;
  } else {
    form.clientId = null;
  }

  // 4) 해당 프로젝트의 제안 로딩
  const proposals = await getProposalsByProject(projectId);
  proposalList.value = proposals.data.map((p) => ({
    id: p.id,
    name: p.title,
  }));
};

/* 제안 선택 시 자동 세팅 */
const onProposalChange = async (proposalId) => {
  form.proposalId = proposalId;
  if (!proposalId) return;

  const { data } = await getProposalDetail(proposalId);

  selectedCompanyName.value = data.clientCompanyName;
  selectedClientName.value = data.clientName;

  const company = companyList.value.find(
    (c) => c.companyName === data.clientCompanyName
  );
  form.clientCompanyId = company ? company.companyId : null;

  if (form.clientCompanyId) {
    await loadClients(form.clientCompanyId);
    const client = clientList.value.find((c) => c.name === data.clientName);
    form.clientId = client ? client.id : null;
  } else {
    form.clientId = null;
  }
};

/* ====================================================================== */
/*                           프로젝트 / 제안 모달                          */
/* ====================================================================== */
const filteredProjects = computed(() =>
  projects.value.filter((p) =>
    p.name.toLowerCase().includes(projectSearch.value.trim().toLowerCase())
  )
);

const filteredProposals = computed(() =>
  proposalList.value.filter((p) =>
    p.name.toLowerCase().includes(proposalSearch.value.trim().toLowerCase())
  )
);

const selectProject = async (p) => {
  selectedProjectName.value = p.name;
  projectDialog.value = false;
  await onProjectChange(p.id);
};

const selectProposal = async (p) => {
  selectedProposalName.value = p.name;
  proposalDialog.value = false;
  await onProposalChange(p.id);
};

/* ====================================================================== */
/*                           고객사 / 고객 선택                            */
/* ====================================================================== */

const selectCompany = (c) => {
  selectedCompanyName.value = c.companyName;
  form.clientCompanyId = c.companyId;

  form.clientId = null;
  selectedClientName.value = "";

  loadClients(c.companyId);
  companyDialog.value = false;
};

/**
 * 🔥 제안 생성 페이지와 동일 방식
 * - type 필터는 서버 쿼리 파라미터로 넘긴다 (CLIENT / LEAD)
 * - 프론트에서는 이름 검색만 한다
 */
const filteredCompanies = computed(() => {
  const keyword = companySearch.value.trim().toLowerCase();

  return companyList.value.filter((c) =>
    c.companyName.toLowerCase().includes(keyword)
  );
});

// 고객사 리스트 로딩 (type / keyword 서버로 전달)
const loadCompanies = async () => {
  const params = {
    page: 1,
    size: 100,
  };

  if (companyTypeFilter.value && companyTypeFilter.value !== "ALL") {
    params.type = companyTypeFilter.value; // CLIENT 또는 LEAD
  }

  if (companySearch.value.trim()) {
    params.keyword = companySearch.value.trim();
  }

  const res = await getSimpleClientCompanies(params);

  let rows = [];

  if (Array.isArray(res.data)) {
    rows = res.data;
  } else if (Array.isArray(res.data?.content)) {
    rows = res.data.content;
  } else if (Array.isArray(res.data?.data)) {
    rows = res.data.data;
  }

  companyList.value = rows.map((c) => ({
    companyId: c.id,
    companyName: c.name,
  }));
};

// 모달 열릴 때 초기화 + 로딩
watch(
  () => companyDialog.value,
  (open) => {
    if (open) {
      companySearch.value = "";
      companyTypeFilter.value = "ALL";
      companyList.value = [];
      loadCompanies();
    }
  }
);

// 칩(고객사/잠재고객사) or 검색어가 바뀌면 서버 재조회
watch([companyTypeFilter, companySearch], () => {
  if (companyDialog.value) {
    loadCompanies();
  }
});

const loadClients = async (companyId) => {
  if (!companyId) return;
  const res = await getSimpleClientsByCompany(companyId, {
    page: 1,
    size: 100,
  });

  const rows = res.data?.content || res.data?.data || res.data || [];

  clientList.value = rows.map((c) => ({
    id: c.id,
    name: c.name,
  }));
};

const filteredClientList = computed(() =>
  clientList.value.filter((c) => c.name.includes(clientSearch.value.trim()))
);

const selectClient = (p) => {
  selectedClientName.value = p.name;
  form.clientId = p.id;
  clientDialog.value = false;
};

/* ====================================================================== */
/*                           매장 / 공간                                   */
/* ====================================================================== */
const loadFloors = async () => {
  const { data } = await getFloors(1);
  floorOptions.value = data.floors.map((f) => ({
    id: f.floorId,
    label: f.floorName,
  }));
};

const onFloorChange = async (idx) => {
  const floorId = form.spaces[idx].floorId;
  if (!floorId) return;

  const { data } = await getSpaces(floorId);
  spaceStoreOptions.value[idx] = data.stores;

  form.spaces[idx].storeId = null;
};

const onStoreChange = (idx) => {
  const sp = form.spaces[idx];
  const selected = spaceStoreOptions.value[idx].find(
    (item) => item.storeId === sp.storeId
  );

  if (!selected) return;

  sp.rentPrice = selected.rentPrice;
  sp.areaSize = selected.areaSize;
  sp.description = selected.description;
};

const addSpace = () => {
  form.spaces.push({
    floorId: null,
    storeId: null,
    rentPrice: 0,
    areaSize: 0,
    additionalFee: 0,
    discountAmount: 0,
    description: "",
  });
  spaceStoreOptions.value.push([]);
};

const removeSpace = (idx) => {
  if (form.spaces.length <= 1) return;
  form.spaces.splice(idx, 1);
  spaceStoreOptions.value.splice(idx, 1);
};

/* ====================================================================== */
/*                           총 금액                                      */
/* ====================================================================== */
const totalPrice = computed(() =>
  form.spaces.reduce(
    (sum, sp) =>
      sum +
      (sp.rentPrice || 0) +
      (sp.additionalFee || 0) -
      (sp.discountAmount || 0),
    0
  )
);

/* ====================================================================== */
/*                           저장                                         */
/* ====================================================================== */
const saveEstimate = async () => {
  if (!form.clientCompanyId) return showError("고객사를 선택해주세요!");
  if (!form.clientId) return showError("고객 담당자를 선택해주세요!");

  const payload = {
    title: form.title,
    projectId: form.projectId,
    proposalId: form.proposalId,
    clientCompanyId: form.clientCompanyId,
    clientId: form.clientId,
    estimateDate: formatDate(form.estimateDate),
    deliveryDate: formatDate(form.deliveryDate),
    paymentCondition: form.paymentCondition,
    remark: form.remark || null,
    spaces: form.spaces.map((sp) => ({
      storeId: sp.storeId,
      additionalFee: sp.additionalFee,
      discountAmount: sp.discountAmount,
      description: sp.description,
    })),
  };

  try {
    await createEstimate(payload);
    showSuccess("견적이 생성되었습니다.");
    router.push({ name: "Estimate" });
  } catch (err) {
    showError(err?.response?.data?.message || "생성 실패");
  }
};

/* ====================================================================== */
/*                           MOUNT                                        */
/* ====================================================================== */
onMounted(async () => {
  await loadProjects();
  await loadCompanies();
  await loadFloors();

  spaceStoreOptions.value = Array.from(
    { length: form.spaces.length },
    () => []
  );
});
</script>

<style scoped>
/* 전체 페이지 Wrapper */
.page-wrapper {
  background: #fafafa;
  min-height: 100vh;
  padding: 8px 16px 10px;
}

/* 페이지 타이틀 */
.page-title {
  max-width: 1100px;
  margin: 4px auto 10px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #111;
}

/* 견적 정보 카드 */
.estimate-card {
  max-width: 1100px;
  margin: 0 auto 10px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e5e5e5;
  padding: 8px 14px 20px;
}

/* 섹션 타이틀 */
.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

/* 라벨 */
.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

/* v-col 기본 여백 밀어버리기 */
.estimate-card :deep(.v-col) {
  padding-top: 1px !important;
  padding-bottom: 1px !important;
}

/* 인풋 공통 */
.input-field {
  border-radius: 6px !important;
  font-size: 0.8rem;
}

.input-field :deep(.v-field) {
  min-height: 32px !important;
  height: 32px !important;
}

.input-field :deep(.v-field__input) {
  font-size: 0.8rem !important;
  line-height: 1.2 !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  min-height: 32px !important;
}

/* suffix / prefix / 아이콘 정렬 */
.input-field :deep(.v-field__append-inner),
.input-field :deep(.v-field__suffix),
.input-field :deep(.v-field__prepend-inner) {
  font-size: 0.8rem !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  align-items: center !important;
}

/* textarea 높이 */
.textarea-field :deep(.v-field) {
  min-height: 65px !important;
}

.textarea-field :deep(.v-field__input) {
  font-size: 0.8rem !important;
  padding-top: 16px !important;
  padding-bottom: 6px !important;
  align-items: flex-start !important;
}

/* textarea 리사이즈 막기 */
.textarea-field :deep(textarea) {
  min-height: 50px !important;
  line-height: 1.25 !important;
  resize: none !important;
}

/* 버튼 라인 정렬 */
.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

/* 모달 타이틀 */
.dialog-title {
  font-size: 0.9rem;
  font-weight: 600;
}

/* 모달 리스트 */
.dialog-item {
  padding: 5px 6px !important;
  cursor: pointer;
  font-size: 0.8rem;
}

.dialog-item:hover {
  background: #fff3e0 !important;
}

/* 공간 카드 */
.space-card {
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fff;
  padding: 12px;
  margin-bottom: 8px;
}

/* 전체 금액 카드 */
.total-card {
  border: 1px solid #eee;
  border-radius: 10px;
  background: white;
  text-align: right;
}

.total-title {
  font-size: 0.9rem;
  font-weight: 600;
}

.total-price {
  font-size: 1.3rem;
  font-weight: 800;
  margin-top: 4px;
}

/* placeholder 상태 중앙 정렬 */
.input-field
  :deep(.v-field:not(.v-field--dirty) .v-field__field .v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* 입력 영역 자체 세로 중앙 정렬 */
.input-field :deep(.v-field__field) {
  align-items: center !important;
}

/* floating label 위치 조정 */
.input-field :deep(.v-field-label) {
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-size: 0.8rem !important;
  pointer-events: none !important;
}

.input-field :deep(.v-field--dirty .v-field-label) {
  top: 6px !important;
  transform: none !important;
  font-size: 0.65rem !important;
}

/* v-select selection 정렬 */
.input-field :deep(.v-select__selection-text) {
  align-items: center !important;
  display: flex !important;
}

/* v-select 전체 박스를 강제로 수직 중앙정렬 */
.input-field :deep(.v-select .v-field__field) {
  display: flex !important;
  align-items: center !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 32px !important;
  height: 32px !important;
}
</style>
