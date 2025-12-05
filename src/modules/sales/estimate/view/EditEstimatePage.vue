<template>
  <v-container fluid class="page-wrapper">
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- 페이지 타이틀 -->
    <div class="page-title">견적 수정</div>

    <!-- ========== 견적 수정 화면 (생성 화면 동일 스타일 적용) ========== -->
    <v-card elevation="1" class="estimate-card">
      <!-- ---------------- 견적 정보 ---------------- -->
      <div class="section-title">견적 정보</div>

      <v-row dense>
        <!-- 제목 -->
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
          <v-select
            :items="projectOptions"
            v-model="form.projectId"
            class="input-field"
            item-title="projectTitle"
            item-value="projectId"
            placeholder="프로젝트 선택"
            variant="outlined"
            hide-details
            clearable
            @update:modelValue="onProjectChange"
          />
        </v-col>

        <!-- 제안 -->
        <v-col cols="12" md="6">
          <div class="input-label">제안</div>
          <v-select
            :items="proposalOptions"
            v-model="form.proposalId"
            class="input-field"
            item-title="title"
            item-value="id"
            label=" "
            placeholder="제안 선택"
            variant="outlined"
            hide-details
            clearable
            persistent-placeholder
          />
        </v-col>

        <!-- 고객사 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객사</div>
          <v-text-field
            v-model="selectedCompanyName"
            class="input-field"
            readonly
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
            class="input-field"
            readonly
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
            rows="3"
            variant="outlined"
            hide-details
          />
        </v-col>
      </v-row>

      <!-- =============== 공간 정보 영역 =============== -->
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
              item-title="storeName"
              item-value="storeId"
              hide-details
              :no-data-text="!sp.floorId ? '층을 먼저 선택해주세요' : ''"
              @update:modelValue="onStoreChange(idx)"
            />
          </v-col>

          <v-col cols="12" md="3">
            <div class="input-label">임대료</div>
            <v-text-field
              :model-value="toComma(sp.rentPrice)"
              class="input-field"
              readonly
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <div class="input-label">면적</div>
            <v-text-field
              :model-value="sp.areaSize + '㎡'"
              class="input-field"
              readonly
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <div class="input-label">추가 비용</div>
            <v-text-field
              v-model.number="sp.additionalFee"
              type="number"
              class="input-field"
              hide-details
            />
          </v-col>

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

        <!-- 공간 설명 -->
        <v-col cols="12">
          <div class="input-label">공간 설명</div>
          <v-textarea
            v-model="sp.description"
            class="textarea-field"
            rows="2"
            hide-details
          />
        </v-col>

        <v-btn color="red" class="mt-2" @click="removeSpace(idx)">
          공간 삭제
        </v-btn>
      </v-card>

      <!-- 공간 추가 버튼 (생성 화면 동일) -->
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
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { updateEstimate, getEstimateDetail } from "@/apis/estimate";
import { getFloors, getSpaces } from "@/apis/storemap";
import { getProjectMeta, getProjectsWithPipelines } from "@/apis/project";
import { getProposalsByProject, getProposalDetail } from "@/apis/proposal";
import {
  getSimpleClientCompanies,
  getSimpleClientsByCompany,
} from "@/apis/client";

const route = useRoute();
const router = useRouter();

/* ---------------- 기본 ---------------- */
const toComma = (v) => {
  if (v === undefined || v === null || v === "") return "0";
  const num = Number(v);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString();
};

const paymentOptions = [
  { label: "선불", value: "PREPAY" },
  { label: "후불", value: "POSTPAY" },
];

/* ---------------- form ---------------- */
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

/* ---------------- state ---------------- */
const selectedCompanyName = ref("");
const selectedClientName = ref("");

const detailProjectTitle = ref("");

const projectOptions = ref([]);
const proposalOptions = ref([]);

const companyList = ref([]);
const clientList = ref([]);

const floorOptions = ref([]);
const spaceStoreOptions = ref([]);

const companyDialog = ref(false);
const clientDialog = ref(false);

const companySearch = ref("");
const clientSearch = ref("");

const snackbar = ref(false);
const snackbarColor = ref("");
const snackbarMessage = ref("");

const estimateMenu = ref(false);
const deliveryMenu = ref(false);

/* ---------------- snackbar ---------------- */
const showError = (err) => {
  console.error(err);
  snackbarColor.value = "red";
  snackbarMessage.value =
    err?.response?.data?.message ||
    err?.response?.data?.errorMessage ||
    err?.message ||
    "오류 발생";
  snackbar.value = true;
};

const showSuccess = (msg) => {
  snackbarColor.value = "green";
  snackbarMessage.value = msg;
  snackbar.value = true;
};

/* ---------------- date ---------------- */
const formatDate = (date) =>
  date ? new Date(date).toISOString().substring(0, 10) : "";

/* ---------------- 회사/담당자 ---------------- */
const loadCompanies = async () => {
  const res = await getSimpleClientCompanies({ page: 1, size: 100 });
  companyList.value = res.data.content.map((c) => ({
    companyId: c.id,
    companyName: c.name,
  }));
};

const loadClients = async (companyId) => {
  if (!companyId) return;
  const res = await getSimpleClientsByCompany(companyId, {
    page: 1,
    size: 100,
  });

  clientList.value = res.data.content.map((c) => ({
    id: c.id,
    name: c.name,
  }));
};

const filteredCompanyList = computed(() =>
  companyList.value.filter((c) =>
    c.companyName.toLowerCase().includes(companySearch.value.toLowerCase())
  )
);

const filteredClientList = computed(() =>
  clientList.value.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.value.toLowerCase())
  )
);

const selectCompany = (c) => {
  selectedCompanyName.value = c.companyName;
  form.clientCompanyId = c.companyId;

  form.clientId = null;
  selectedClientName.value = "";

  loadClients(c.companyId);
  companyDialog.value = false;
};

const selectClient = (p) => {
  selectedClientName.value = p.name;
  form.clientId = p.id;
  clientDialog.value = false;
};

/* ---------------- 프로젝트/제안 ---------------- */
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

const ensureCurrentProjectInOptions = () => {
  if (!form.projectId) return;

  const exists = projectOptions.value.some(
    (p) => p.projectId === form.projectId
  );

  if (!exists) {
    projectOptions.value.push({
      projectId: form.projectId,
      projectTitle: detailProjectTitle.value || `프로젝트 #${form.projectId}`,
    });
  }
};

const onProjectChange = async (projectId) => {
  form.proposalId = null;
  proposalOptions.value = [];

  if (!projectId) return;

  const { data } = await getProjectMeta(projectId);

  form.clientCompanyId = data.clientCompanyId;
  selectedCompanyName.value = data.clientCompanyName;

  form.clientId = data.clientId;
  selectedClientName.value = data.clientName;

  await loadClients(data.clientCompanyId);

  const proposals = await getProposalsByProject(projectId);
  proposalOptions.value = proposals.data.map((p) => ({
    id: p.id,
    title: p.title,
  }));
};

const onProposalChange = async (proposalId) => {
  if (!proposalId) return;

  const { data } = await getProposalDetail(proposalId);

  form.clientCompanyId = data.clientCompanyId;
  form.clientId = data.clientId;

  selectedCompanyName.value = data.clientCompanyName;
  selectedClientName.value = data.clientName;

  await loadClients(data.clientCompanyId);
};

/* ---------------- 공간: 층/매장 ---------------- */
const loadFloors = async () => {
  const { data } = await getFloors(1);

  floorOptions.value = data.floors.map((f) => ({
    id: f.floorId,
    label: f.floorName,
  }));
};

const onFloorChange = async (idx) => {
  const floorId = form.spaces[idx]?.floorId;
  if (!floorId) return;

  const { data } = await getSpaces(floorId);

  spaceStoreOptions.value[idx] = data.stores.map((s) => ({
    storeId: s.storeId,
    storeName: s.storeNumber,
    rentPrice: s.rentPrice,
    areaSize: s.areaSize,
    description: s.description,
  }));
};

const onStoreChange = (idx) => {
  const options = spaceStoreOptions.value[idx];
  if (!options) return;

  const sp = form.spaces[idx];
  const selected = options.find((item) => item.storeId === sp.storeId);
  if (!selected) return;

  sp.rentPrice = selected.rentPrice ?? 0;
  sp.areaSize = selected.areaSize ?? 0;
  sp.description = selected.description ?? "";
};

/* ---------------- 공간 추가/삭제 ---------------- */
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
  form.spaces.splice(idx, 1);
  spaceStoreOptions.value.splice(idx, 1);
};

/* ---------------- 총 금액 ---------------- */
const totalPrice = computed(() =>
  form.spaces.reduce((sum, sp) => {
    const rent = Number(sp.rentPrice ?? 0);
    const add = Number(sp.additionalFee ?? 0);
    const disc = Number(sp.discountAmount ?? 0);
    return sum + rent + add - disc;
  }, 0)
);

/* ---------------- 상세정보 로딩 ---------------- */
const loadDetail = async () => {
  const { data } = await getEstimateDetail(route.params.id);

  form.title = data.estimateTitle;
  form.projectId = data.projectId;
  form.proposalId = data.proposalId;

  detailProjectTitle.value = data.projectTitle || "";

  form.clientCompanyId = data.clientCompanyId;
  form.clientId = data.clientId;

  selectedCompanyName.value = data.clientCompanyName || "";
  selectedClientName.value = data.clientName || "";

  form.estimateDate = data.estimateDate;
  form.deliveryDate = data.deliveryDate;

  form.paymentCondition = data.paymentCondition;
  form.remark = data.remark;

  form.spaces = (data.spaces || []).map((sp) => ({
    storeEstimateMapId: sp.storeEstimateMapId,
    floorId: sp.floorId,
    storeId: sp.storeId,
    rentPrice: sp.rentFee ?? 0,
    areaSize: sp.area ?? 0,
    additionalFee: sp.additionalFee ?? 0,
    discountAmount: sp.discountAmount ?? 0,
    description: sp.remark ?? "",
  }));
};

/* ---------------- 저장 ---------------- */
const saveEstimate = async () => {
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
      spaces: form.spaces.map((sp) => ({
        storeEstimateMapId: sp.storeEstimateMapId,
        storeId: sp.storeId,
        additionalFee: sp.additionalFee ?? 0,
        discountAmount: sp.discountAmount ?? 0,
        description: sp.description ?? "",
      })),
    };

    await updateEstimate(route.params.id, payload);

    showSuccess("견적이 수정되었습니다.");

    router.push({
      name: "EstimateDetail",
      params: { id: route.params.id },
    });
  } catch (err) {
    showError(err);
  }
};

/* ---------------- mount ---------------- */
onMounted(async () => {
  try {
    await loadDetail();

    await Promise.all([loadFloors(), loadProjects(), loadCompanies()]);

    ensureCurrentProjectInOptions();

    if (form.projectId) {
      const res = await getProposalsByProject(form.projectId);
      proposalOptions.value = res.data.map((p) => ({
        id: p.id,
        title: p.title,
      }));
    }

    if (form.clientCompanyId) {
      await loadClients(form.clientCompanyId);
    }

    spaceStoreOptions.value = Array.from(
      { length: form.spaces.length },
      () => []
    );

    for (let i = 0; i < form.spaces.length; i++) {
      if (form.spaces[i].floorId) {
        await onFloorChange(i);
        onStoreChange(i);
      }
    }
  } catch (err) {
    showError(err);
  }
});
</script>

<style scoped>
/* ===== 페이지 / 카드 공통 ===== */
.page-wrapper {
  background: #fafafa;
  min-height: 100vh;
  padding: 8px 16px;
}

.page-title {
  max-width: 1100px;
  margin: 4px auto 10px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #111;
}

.estimate-card {
  max-width: 1100px;
  margin: 0 auto 10px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e5e5e5;
  padding: 8px 14px 20px;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

/* v-col padding (생성 화면과 동일) */
.estimate-card :deep(.v-col) {
  padding-top: 1px !important;
  padding-bottom: 1px !important;
}

/* ===== 입력 박스 공통 ===== */
.input-field {
  border-radius: 6px !important;
  font-size: 0.8rem !important;
}

.input-field :deep(.v-field) {
  min-height: 32px !important;
  height: 32px !important;
  border-radius: 6px !important;
}

.input-field :deep(.v-field__input) {
  font-size: 0.8rem !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  min-height: 32px !important;
  height: 32px !important;
}

.input-field :deep(.v-field__append-inner),
.input-field :deep(.v-field__suffix),
.input-field :deep(.v-field__prepend-inner) {
  font-size: 0.8rem !important;
  padding: 0 !important;
  align-items: center !important;
}

/* ===== textarea (비고 / 공간설명) ===== */
.textarea-field :deep(.v-field) {
  min-height: 65px !important;
  border-radius: 6px !important;
}

.textarea-field :deep(.v-field__input) {
  padding-top: 14px !important;
  padding-bottom: 6px !important;
  font-size: 0.8rem !important;
  align-items: flex-start !important;
}

.textarea-field :deep(textarea) {
  min-height: 50px !important;
  line-height: 1.25 !important;
  resize: none !important;
}

/* ===== 공간 카드 ===== */
.space-card {
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fff;
  padding: 12px;
  margin-bottom: 8px;
}

/* ===== 공간 추가 버튼 (생성화면 동일 스타일) ===== */
.space-add-btn {
  border: 1px solid #1976d2;
  color: #1976d2;
  font-size: 0.8rem;
  padding: 6px 0;
  width: 120px;
  float: right;
  margin-top: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  background: white;
}

/* ===== 총 금액 카드 ===== */
.total-card {
  border: 1px solid #eee;
  border-radius: 10px;
  background: white;
  text-align: right;
  margin-bottom: 20px;
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

/* ===== 저장 버튼 ===== */
.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

/* ===== 모달 ===== */
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
  background: #fff3e0;
}

/* 추가비용 / 할인 금액 number 필드의 스핀 버튼 제거 */
.input-field :deep(input[type="number"])::-webkit-inner-spin-button,
.input-field :deep(input[type="number"])::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-field :deep(input[type="number"]) {
  -moz-appearance: textfield; /* Firefox */
}

/* v-select 박스 높이 통일 */
.input-field :deep(.v-field.v-field--select) {
  min-height: 32px !important;
  height: 32px !important;
}

/* v-select 내부 인풋 정렬 */
.input-field :deep(.v-field.v-field--select .v-field__input) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  align-items: center !important;
}

/* v-select placeholder 정렬 */
.input-field :deep(.v-select__selection-text) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  display: flex !important;
  align-items: center !important;
  font-size: 0.8rem !important;
}

.input-field :deep(.v-select__selection) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  display: flex !important;
  align-items: center !important;
}

/* placeholder (v-field-label) */
:deep(.v-field-label) {
  top: 50% !important;
  transform: translateY(-50%) !important;
}

/* 선택된 값이 들어가는 input 영역 */
:deep(.v-field__input) {
  display: flex !important;
  align-items: center !important;
}

/* v-select 텍스트 수직 가운데 정렬 강제 */
.input-field :deep(.v-field__input),
.input-field :deep(.v-select__selection),
.input-field :deep(.v-select__selection-text),
.input-field :deep(.v-field__placeholder) {
  display: flex !important;
  align-items: center !important;
  height: 32px !important; /* 인풋 높이에 맞춤 */
  line-height: 1 !important;
}

/* ===== v-select 및 v-text-field 텍스트 정렬 완전 강제 ===== */
.input-field :deep(.v-field__input),
.input-field :deep(.v-select__selection),
.input-field :deep(.v-select__selection-text),
.input-field :deep(.v-field__append-inner),
.input-field :deep(.v-field__prefix),
.input-field :deep(.v-field__suffix),
.input-field :deep(.v-field__placeholder) {
  align-items: center !important;
  display: flex !important;
  line-height: normal !important;
  height: 32px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* v-select / text-field 내부 input 영역 높이 강제 */
.input-field :deep(.v-field__input) {
  min-height: 32px !important;
  height: 32px !important;
}

:deep(.v-field-label--active) {
  top: 50% !important;
  transform: translateY(-50%) !important;
}
</style>
