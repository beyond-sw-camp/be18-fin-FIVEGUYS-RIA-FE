<template>
  <v-container fluid class="page-wrapper">
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
      {{ snackbarMessage }}
    </v-snackbar>

    <div class="page-title">견적 수정</div>

    <!-- ===================== 견적 정보 ===================== -->
    <v-card elevation="1" class="estimate-card">
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
          />
        </v-col>

        <!-- 프로젝트 -->
        <v-col cols="12" md="6">
          <div class="input-label">프로젝트</div>
          <v-text-field
            v-model="selectedProjectName"
            readonly
            class="input-field"
            variant="outlined"
            hide-details
            @click="projectDialog = true"
          />
        </v-col>

        <!-- 제안 -->
        <v-col cols="12" md="6">
          <div class="input-label">제안</div>
          <v-text-field
            v-model="selectedProposalName"
            readonly
            class="input-field"
            variant="outlined"
            hide-details
            @click="proposalDialog = true"
          />
        </v-col>

        <!-- 고객사 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객사</div>
          <v-text-field
            v-model="selectedCompanyName"
            readonly
            class="input-field"
            variant="outlined"
            hide-details
            @click="companyDialog = true"
          />
        </v-col>

        <!-- 고객 담당자 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객 담당자</div>
          <v-text-field
            v-model="selectedClientName"
            readonly
            class="input-field"
            variant="outlined"
            hide-details
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
                readonly
                class="input-field"
                v-bind="props"
                variant="outlined"
                hide-details
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
                readonly
                class="input-field"
                v-bind="props"
                variant="outlined"
                hide-details
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
            rows="3"
            class="textarea-field"
            variant="outlined"
            hide-details
          />
        </v-col>
      </v-row>

      <!-- ===================== 공간 정보 ===================== -->
      <div class="section-title mt-6">공간 정보</div>

      <v-card
        v-for="(sp, idx) in form.spaces"
        :key="idx"
        class="space-card pa-3 mb-3"
      >
        <v-row dense>
          <!-- 층 선택 -->
          <v-col cols="12" md="3">
            <div class="input-label">층 선택</div>
            <v-select
              :items="floorOptions"
              v-model="sp.floorId"
              item-title="label"
              item-value="id"
              class="input-field"
              hide-details
              @update:modelValue="onFloorChange(idx)"
            />
          </v-col>

          <!-- 호수 선택 -->
          <v-col cols="12" md="3">
            <div class="input-label">매장(호수)</div>
<v-select
  :items="spaceStoreOptions[idx]"
  v-model="sp.storeId"
  item-title="storeName"
  item-value="storeId"
  class="input-field"
  hide-details
  :disabled="spaceDisabled[idx]"
  no-data-text="이용 가능한 매장이 없습니다"
  @update:modelValue="onStoreChange(idx)"
/>
          </v-col>

          <!-- 임대료 -->
          <v-col cols="12" md="3">
            <div class="input-label">임대료</div>
            <v-text-field
              :model-value="toComma(sp.rentPrice)"
              readonly
              class="input-field"
              hide-details
            />
          </v-col>

          <!-- 면적 -->
          <v-col cols="12" md="3">
            <div class="input-label">면적</div>
            <v-text-field
              :model-value="sp.areaSize + '㎡'"
              readonly
              class="input-field"
              hide-details
            />
          </v-col>

          <!-- 추가 비용 -->
          <v-col cols="12" md="3">
            <div class="input-label">추가 비용</div>
            <v-text-field
              v-model.number="sp.additionalFee"
              type="number"
              class="input-field"
              hide-details
            />
          </v-col>

          <!-- 할인 -->
          <v-col cols="12" md="3">
            <div class="input-label">할인 금액</div>
            <v-text-field
              v-model.number="sp.discountAmount"
              type="number"
              class="input-field"
              hide-details
            />
          </v-col>
        </v-row>

        <!-- 설명 -->
        <v-col cols="12">
          <div class="input-label">공간 설명</div>
          <v-textarea
            v-model="sp.description"
            rows="2"
            class="textarea-field"
            hide-details
          />
        </v-col>

        <v-btn color="red" class="mt-2" @click="removeSpace(idx)">
          공간 삭제
        </v-btn>
      </v-card>

      <!-- 공간 추가 버튼 -->
      <div class="actions-row">
        <v-btn class="space-add-btn" variant="outlined" @click="addSpace">
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
          color="orange-darken-2"
          class="white--text px-6"
          rounded="lg"
          elevation="2"
          @click="saveEstimate"
        >
          저장
        </v-btn>
      </div>
    </v-card>

    <!-- ===================== 모달들 ===================== -->

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
            :key="p.projectId"
            @click="selectProject(p)"
            class="dialog-item"
          >
            {{ p.projectTitle }}
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
            {{ p.title }}
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
            v-for="cl in filteredClientList"
            :key="cl.id"
            @click="selectClient(cl)"
            class="dialog-item"
          >
            {{ cl.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { updateEstimate, getEstimateDetail } from "@/apis/estimate";
import { getFloors, getSpaces } from "@/apis/storemap";
import { getProjectsWithPipelines, getProjectMeta } from "@/apis/project";
import { getProposalsByProject, getProposalDetail } from "@/apis/proposal";
import {
  getSimpleClientCompanies,
  getSimpleClientsByCompany,
} from "@/apis/client";

const route = useRoute();
const router = useRouter();
const spaceDisabled = ref([]);
/* ===================== 옵션 ===================== */
const paymentOptions = [
  { label: "선불", value: "PREPAY" },
  { label: "후불", value: "POSTPAY" },
];

const toComma = (v) => Number(v || 0).toLocaleString();

/* ===================== FORM ===================== */
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
  spaces: [],
});

/* ===================== UI 표시 이름 ===================== */
const selectedProjectName = ref("");
const selectedProposalName = ref("");
const selectedCompanyName = ref("");
const selectedClientName = ref("");

/* ===================== 옵션 리스트 ===================== */
const projectOptions = ref([]);
const proposalOptions = ref([]);
const floorOptions = ref([]);
const spaceStoreOptions = ref([]);

const companyList = ref([]);
const clientList = ref([]);

const companyTypeFilter = ref("ALL");

/* ===================== 검색 ===================== */
const projectSearch = ref("");
const proposalSearch = ref("");
const companySearch = ref("");
const clientSearch = ref("");

/* ===================== 모달 ===================== */
const projectDialog = ref(false);
const proposalDialog = ref(false);
const companyDialog = ref(false);
const clientDialog = ref(false);

/* ===================== 날짜 메뉴 ===================== */
const estimateMenu = ref(false);
const deliveryMenu = ref(false);

/* ===================== 스낵바 ===================== */
const snackbar = ref(false);
const snackbarColor = ref("");
const snackbarMessage = ref("");

const showError = (err) => {
  snackbarColor.value = "red";

  if (typeof err === "string") {
    snackbarMessage.value = err;
  } else {
    snackbarMessage.value =
      err?.response?.data?.message ||
      err?.response?.data?.errorMessage ||
      "오류 발생";
  }

  snackbar.value = true;
};

const showSuccess = (msg) => {
  snackbarColor.value = "green";
  snackbarMessage.value = msg;
  snackbar.value = true;
};

/* ===================== Utils ===================== */
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().substring(0, 10);
};

/* ===================== FILTER LIST ===================== */
const filteredProjects = computed(() =>
  projectOptions.value.filter((p) =>
    p.projectTitle.toLowerCase().includes(projectSearch.value.toLowerCase())
  )
);

const filteredProposals = computed(() =>
  proposalOptions.value.filter((p) =>
    p.title.toLowerCase().includes(proposalSearch.value.toLowerCase())
  )
);

const filteredCompanies = computed(() => {
  const search = companySearch.value.trim().toLowerCase();
  return companyList.value.filter((c) =>
    c.companyName.toLowerCase().includes(search)
  );
});

const filteredClientList = computed(() =>
  clientList.value.filter((cl) =>
    cl.name.toLowerCase().includes(clientSearch.value.toLowerCase())
  )
);

/* ===================== 회사 / 담당자 선택 ===================== */
const selectCompany = async (c) => {
  selectedCompanyName.value = c.companyName;
  form.clientCompanyId = c.companyId;

  selectedClientName.value = "";
  form.clientId = null;

  await loadClients(c.companyId);
  companyDialog.value = false;
};

const selectClient = (cl) => {
  selectedClientName.value = cl.name;
  form.clientId = cl.id;
  clientDialog.value = false;
};

/* ===================== API - LOAD ===================== */

const loadProjects = async () => {
  const res = await getProjectsWithPipelines({
    myProject: true,
    page: 1,
    size: 100,
  });
  projectOptions.value = res.data.content.map((p) => ({
    projectId: p.projectId,
    projectTitle: p.title,
  }));
};

const loadProposals = async (projectId) => {
  if (!projectId) return;

  const res = await getProposalsByProject(projectId);
  proposalOptions.value = res.data.map((p) => ({
    id: p.id,
    title: p.title,
  }));
};

const loadCompanies = async () => {
  const params = {
    page: 1,
    size: 100,
  };

  // 칩으로 선택되는 타입 필터 (CLIENT, LEAD)
  if (companyTypeFilter.value !== "ALL") {
    params.type = companyTypeFilter.value;
  }

  // 검색어도 서버에 전달
  if (companySearch.value.trim()) {
    params.keyword = companySearch.value.trim();
  }

  const res = await getSimpleClientCompanies(params);

  let rows = [];

  if (Array.isArray(res.data)) rows = res.data;
  else if (Array.isArray(res.data?.content)) rows = res.data.content;
  else if (Array.isArray(res.data?.data)) rows = res.data.data;

  companyList.value = rows.map((c) => ({
    companyId: c.id,
    companyName: c.name,
    type: c.type ?? "UNKNOWN",
  }));
};

watch(
  () => companyDialog.value,
  (open) => {
    if (open) {
      companySearch.value = "";
      companyTypeFilter.value = "ALL";
      loadCompanies();
    }
  }
);

watch([companyTypeFilter, companySearch], () => {
  if (companyDialog.value) loadCompanies();
});

const loadClients = async (companyId) => {
  if (!companyId) return;
  const res = await getSimpleClientsByCompany(companyId, {
    page: 1,
    size: 100,
  });

  const rows = res.data?.content || res.data?.data || res.data || [];

  clientList.value = rows.map((cl) => ({
    id: cl.id,
    name: cl.name,
  }));
};

const loadFloors = async () => {
  const res = await getFloors(1);
  floorOptions.value = res.data.floors.map((f) => ({
    id: f.floorId,
    label: f.floorName,
  }));
};

/* 다이얼로그 열릴 때 회사 필터 초기화 + 새로 로딩 */
watch(
  () => companyDialog.value,
  (open) => {
    if (open) {
      companySearch.value = "";
      companyTypeFilter.value = "ALL";
      loadCompanies();
    }
  }
);

/* ===================== 프로젝트 선택 ===================== */
const selectProject = async (p) => {
  selectedProjectName.value = p.projectTitle;
  form.projectId = p.projectId;

  // 제안 초기화
  form.proposalId = null;
  selectedProposalName.value = "";

  // 제안 가져오기
  await loadProposals(p.projectId);

  // 프로젝트 기본 고객사/담당자
  const { data } = await getProjectMeta(p.projectId);
  form.clientCompanyId = data.clientCompanyId;
  form.clientId = data.clientId;

  selectedCompanyName.value = data.clientCompanyName;
  selectedClientName.value = data.clientName;

  await loadClients(form.clientCompanyId);

  projectDialog.value = false;
};

/* ===================== 제안 선택 ===================== */
const selectProposal = async (p) => {
  form.proposalId = p.id;
  selectedProposalName.value = p.title;

  const { data } = await getProposalDetail(p.id);

  form.clientCompanyId = data.clientCompanyId;
  form.clientId = data.clientId;

  selectedCompanyName.value = data.clientCompanyName;
  selectedClientName.value = data.clientName;

  await loadClients(form.clientCompanyId);

  proposalDialog.value = false;
};

/* ===================== 공간 선택 ===================== */
const onFloorChange = async (idx, isInit = false) => {
  const sp = form.spaces[idx];
  const floorId = sp.floorId;
  if (!floorId) return;

  // 🔹 사용자가 층을 바꾼 경우만 초기화
  if (!isInit) {
    sp.storeId = null;
    sp.rentPrice = 0;
    sp.areaSize = 0;
    sp.additionalFee = 0;
    sp.discountAmount = 0;
    sp.description = "";
  }

  try {
    const { data } = await getSpaces(floorId);

    let stores = (data?.stores ?? []).map((s) => ({
      storeId: s.storeId,
      storeName: s.storeNumber,
      rentPrice: s.rentPrice,
      areaSize: s.areaSize,
      description: s.description,
    }));

    if (
      isInit &&
      sp.storeId &&
      !stores.some((s) => s.storeId === sp.storeId)
    ) {
      stores.unshift({
        storeId: sp.storeId,
        storeName: sp.storeName,    
        rentPrice: sp.rentPrice,
        areaSize: sp.areaSize,
        description: sp.description,
      });
    }

    spaceStoreOptions.value[idx] = stores;
    spaceDisabled.value[idx] = false;

    if (isInit && sp.storeId) {
      const selected = stores.find((s) => s.storeId === sp.storeId);
      if (selected) {
        sp.rentPrice = selected.rentPrice;
        sp.areaSize = selected.areaSize;
        sp.description = selected.description;
      }
    }
  } catch (e) {
    spaceStoreOptions.value[idx] = [];
    spaceDisabled.value[idx] = true;
    if (!isInit) {
      showError("매장 정보를 불러오지 못했습니다.");
    }
  }
};
const onStoreChange = (idx) => {
  const storeId = form.spaces[idx].storeId;
  if (!storeId) return;

  const stores = spaceStoreOptions.value[idx];
  const store = stores.find((s) => s.storeId === storeId);
  if (!store) return;

  form.spaces[idx].rentPrice = store.rentPrice;
  form.spaces[idx].areaSize = store.areaSize;
  form.spaces[idx].description = store.description;
};

/* ===================== 공간 추가/삭제 ===================== */
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
  spaceDisabled.value.push(true); // 신규 공간은 막기
};
const removeSpace = (idx) => {
  form.spaces.splice(idx, 1);
  spaceStoreOptions.value.splice(idx, 1);
};

/* ===================== 총 금액 ===================== */
const totalPrice = computed(() =>
  form.spaces.reduce((sum, s) => {
    return (
      sum +
      (s.rentPrice || 0) +
      (s.additionalFee || 0) -
      (s.discountAmount || 0)
    );
  }, 0)
);

/* ===================== 상세 로딩 ===================== */
const loadDetail = async () => {
  const { data } = await getEstimateDetail(route.params.id);

  form.title = data.estimateTitle;
  form.projectId = data.projectId;
  selectedProjectName.value = data.projectTitle;

  form.proposalId = data.proposalId;
  selectedProposalName.value = data.proposalTitle;

  form.clientCompanyId = data.clientCompanyId;
  form.clientId = data.clientId;

  selectedCompanyName.value = data.clientCompanyName;
  selectedClientName.value = data.clientName;

  form.estimateDate = data.estimateDate;
  form.deliveryDate = data.deliveryDate;
  form.paymentCondition = data.paymentCondition;
  form.remark = data.remark;

form.spaces = data.spaces.map((s) => ({
  storeEstimateMapId: s.storeEstimateMapId,

  floorId: s.floorId,

  
  storeId: s.storeId,
  storeName: s.storeName,      
  rentPrice: s.rentFee,
  areaSize: s.area,
  description: s.remark,

  additionalFee: s.additionalFee,
  discountAmount: s.discountAmount,
}));
};
const hasInvalidSpace = computed(() =>
  form.spaces.some((sp, idx) => {
    return spaceDisabled.value[idx] || !sp.storeId;
  })
);
/* ===================== 저장 ===================== */
const saveEstimate = async () => {

  if (hasInvalidSpace.value) {
  showError("선택되지 않은 매장이 있어 수정이 불가능합니다.");
  return;
  }
  try {
    const payload = {

      
      estimateTitle: form.title,
      projectId: form.projectId,
      proposalId: form.proposalId,
      clientCompanyId: form.clientCompanyId,
      clientId: form.clientId,
      estimateDate: formatDate(form.estimateDate),
      deliveryDate: formatDate(form.deliveryDate),
      paymentCondition: form.paymentCondition,
      remark: form.remark,
      spaces: form.spaces.map((s) => ({
        storeEstimateMapId: s.storeEstimateMapId,
        storeId: s.storeId,
        additionalFee: s.additionalFee,
        discountAmount: s.discountAmount,
        description: s.description,
      })),
    };

    await updateEstimate(route.params.id, payload);

    showSuccess("견적이 수정되었습니다.");
    router.push({ name: "EstimateDetail", params: { id: route.params.id } });
  } catch (err) {
    showError(err);
  }
};

/* ===================== 초기 로딩 ===================== */
onMounted(async () => {
  await loadDetail();   
  await loadFloors();
  await loadProjects();   
  spaceStoreOptions.value = Array.from(
    { length: form.spaces.length },
    () => []
  );
  spaceDisabled.value = Array.from(
    { length: form.spaces.length },
    () => false
  );

  for (let i = 0; i < form.spaces.length; i++) {
    await onFloorChange(i, true); 
    onStoreChange(i);             
  }
});
</script>

<style scoped>
/*        기본 페이지 레이아웃            */
.page-wrapper {
  background: #fafafa;
  min-height: 100vh;
  padding: 8px 16px 10px;
}

.page-title {
  max-width: 1100px;
  margin: 4px auto 10px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #111;
}

/*              카드 컨테이너              */
.estimate-card {
  max-width: 1100px;
  margin: 0 auto 10px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e5e5e5;
  padding: 8px 14px 20px;
}

/* 섹션 제목 */
.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

/*             입력 라벨 스타일            */
.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

/*       v-col 간 상하 간격 줄이기         */
.estimate-card :deep(.v-col) {
  padding-top: 1px !important;
  padding-bottom: 1px !important;
}

/*     input / select 공통 스타일링        */
.input-field {
  border-radius: 6px !important;
  font-size: 0.8rem;
}

/* 박스 높이 통일 */
.input-field :deep(.v-field) {
  min-height: 32px !important;
  height: 32px !important;
}

/* 입력 텍스트 */
.input-field :deep(.v-field__input) {
  font-size: 0.8rem !important;
  line-height: 1.2 !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  min-height: 32px !important;
}

/* 중앙정렬 */
.input-field :deep(.v-field__field) {
  align-items: center !important;
}

/* placeholder 중앙정렬 */
.input-field :deep(.v-field:not(.v-field--dirty) .v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* floating label 기본 위치 */
.input-field :deep(.v-field-label) {
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-size: 0.8rem !important;
}

/* 값 입력 시 라벨 작게 위로 */
.input-field :deep(.v-field--dirty .v-field-label) {
  top: 6px !important;
  transform: none !important;
  font-size: 0.65rem !important;
}

/*           v-select 스타일               */
.input-field :deep(.v-select__selection-text) {
  display: flex !important;
  align-items: center !important;
}

.input-field :deep(.v-select .v-field__field) {
  display: flex !important;
  align-items: center !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 32px !important;
  height: 32px !important;
}

/*             textarea 스타일             */
.textarea-field :deep(.v-field) {
  min-height: 65px !important;
}

.textarea-field :deep(.v-field__input) {
  font-size: 0.8rem !important;
  padding-top: 16px !important;
  padding-bottom: 6px !important;
  align-items: flex-start !important;
}

.textarea-field :deep(textarea) {
  min-height: 50px !important;
  line-height: 1.25 !important;
  resize: none !important;
}

/*                공간 카드                */
.space-card {
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fff;
  padding: 12px;
  margin-bottom: 8px;
}

/*          공간 추가 버튼 스타일          */
.space-add-btn {
  border: 1px solid #1976d2;
  color: #1976d2 !important;
  width: 120px;
  font-size: 0.8rem;
}

/*              총 금액 카드              */
.total-card {
  border: 1px solid #eee;
  background: white;
  border-radius: 10px;
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

.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

/* 모달 타이틀 & 리스트 */
.dialog-title {
  font-size: 0.9rem;
  font-weight: 600;
}

.dialog-item {
  padding: 5px 6px !important;
  cursor: pointer;
  font-size: 0.8rem;
}

.dialog-item:hover {
  background: #fff3e0 !important;
}
</style>