<template>
  <v-container fluid class="page-wrapper">
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
      {{ snackbarMessage }}
    </v-snackbar>

    <div class="page-title">견적 수정</div>

    <v-card elevation="1" class="estimate-card">
      <!-- ---------------- 견적 정보 ---------------- -->
      <div class="section-title">견적 정보</div>

      <v-row dense>
        <!-- 제목 -->
        <v-col cols="12" md="6">
          <div class="input-label">견적 제목</div>
          <v-text-field v-model="form.title" variant="outlined" hide-details />
        </v-col>

        <!-- 프로젝트 -->
        <v-col cols="12" md="6">
          <div class="input-label">프로젝트</div>
          <v-select
            :items="projectOptions"
            v-model="form.projectId"
            item-title="projectTitle"
            item-value="projectId"
            placeholder="프로젝트 선택"
            variant="outlined"
            clearable
            hide-details
            @update:modelValue="onProjectChange"
          />
        </v-col>

        <!-- 제안 -->
        <v-col cols="12" md="6">
          <div class="input-label">제안</div>
          <v-select
            :items="proposalOptions"
            v-model="form.proposalId"
            item-title="title"
            item-value="id"
            placeholder="제안 선택"
            variant="outlined"
            clearable
            hide-details
            :no-data-text="
              !form.projectId
                ? '프로젝트를 먼저 선택하세요'
                : proposalOptions.length === 0
                ? '연결할 수 있는 제안이 없습니다'
                : ''
            "
            @update:modelValue="onProposalChange"
          />
        </v-col>

        <!-- 고객사 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객사</div>
          <v-text-field
            v-model="selectedCompanyName"
            readonly
            variant="outlined"
            hide-details
            @click="companyDialog = true"
          />
        </v-col>

        <!-- 고객사 선택 모달 -->
        <v-dialog v-model="companyDialog" width="500">
          <v-card class="pa-4">
            <div class="dialog-title mb-2">고객사 선택</div>

            <v-text-field
              v-model="companySearch"
              placeholder="검색"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              class="mb-3"
            />

            <v-list>
              <v-list-item
                v-for="c in filteredCompanyList"
                :key="c.companyId"
                @click="selectCompany(c)"
                class="dialog-item"
              >
                {{ c.companyName }}
              </v-list-item>
            </v-list>
          </v-card>
        </v-dialog>

        <!-- 담당자 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객 담당자</div>
          <v-text-field
            v-model="selectedClientName"
            readonly
            variant="outlined"
            hide-details
            @click="clientDialog = true"
          />
        </v-col>

        <!-- 담당자 선택 모달 -->
        <v-dialog v-model="clientDialog" width="500">
          <v-card class="pa-4">
            <div class="dialog-title mb-3">담당자 선택</div>

            <v-text-field
              v-model="clientSearch"
              prepend-inner-icon="mdi-magnify"
              placeholder="검색"
              variant="outlined"
              hide-details
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

        <!-- 견적일 -->
        <v-col cols="12" md="3">
          <div class="input-label">견적일</div>
          <v-menu v-model="estimateMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-text-field
                :model-value="formatDate(form.estimateDate)"
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
            variant="outlined"
            hide-details
          />
        </v-col>
      </v-row>

      <!-- ---------------- 공간 정보 ---------------- -->
      <div class="section-title mt-6">공간 정보</div>

      <v-card
        class="space-card pa-3 mb-3"
        v-for="(sp, idx) in form.spaces"
        :key="idx"
      >
        <v-row dense>
          <!-- 층 -->
          <v-col cols="12" md="3">
            <div class="input-label">층 선택</div>
            <v-select
              :items="floorOptions"
              v-model="sp.floorId"
              item-title="label"
              item-value="id"
              @update:modelValue="onFloorChange(idx)"
            />
          </v-col>

          <!-- 매장 -->
          <v-col cols="12" md="3">
            <div class="input-label">매장(호수)</div>
            <v-select
              :items="spaceStoreOptions[idx]"
              v-model="sp.storeId"
              item-title="storeName"
              item-value="storeId"
              @update:modelValue="onStoreChange(idx)"
            />
          </v-col>

          <!-- 임대료 -->
          <v-col cols="12" md="3">
            <div class="input-label">임대료</div>
            <v-text-field
              :model-value="toComma(sp.rentPrice)"
              readonly
              hide-details
            />
          </v-col>

          <!-- 면적 -->
          <v-col cols="12" md="3">
            <div class="input-label">면적</div>
            <v-text-field
              :model-value="sp.areaSize + '㎡'"
              readonly
              hide-details
            />
          </v-col>

          <!-- 추가 비용 -->
          <v-col cols="12" md="3">
            <div class="input-label">추가 비용</div>
            <v-text-field v-model.number="sp.additionalFee" type="number" />
          </v-col>

          <!-- 할인 -->
          <v-col cols="12" md="3">
            <div class="input-label">할인 금액</div>
            <v-text-field v-model.number="sp.discountAmount" type="number" />
          </v-col>
        </v-row>

        <v-col cols="12">
          <div class="input-label">공간 설명</div>
          <v-textarea v-model="sp.description" rows="2" />
        </v-col>

        <v-btn color="red" class="mt-2" @click="removeSpace(idx)">
          공간 삭제
        </v-btn>
      </v-card>

      <v-btn block class="mb-4" variant="outlined" @click="addSpace">
        + 공간 추가
      </v-btn>

      <!-- ⭐ 총 견적 금액 (공간 정보 아래로 이동됨) -->
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
import { getProjectTitles, getProjectMeta } from "@/apis/project";
import { getProposalsByProject, getProposalDetail } from "@/apis/proposal";
import {
  getSimpleClientCompanies,
  getSimpleClientsByCompany,
} from "@/apis/client";

const route = useRoute();
const router = useRouter();

/* ---------------- 기본 ---------------- */
const toComma = (v) => (v ? v.toLocaleString() : "0");

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

const projectOptions = ref([]);
const proposalOptions = ref([]);

const companyList = ref([]);
const clientList = ref([]);

const floorOptions = ref([]);

// ★ 수정 — 반드시 반응형 초기화 필요
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
  snackbarColor.value = "red";
  snackbarMessage.value =
    err?.response?.data?.message ||
    err?.response?.data?.errorMessage ||
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
  const res = await getProjectTitles();
  projectOptions.value = res.data.map((p) => ({
    projectId: p.projectId,
    projectTitle: p.projectTitle,
  }));
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
  const floorId = form.spaces[idx].floorId;
  if (!floorId) return;

  const { data } = await getSpaces(floorId);

  // ★ 수정 — 반응형 set
  spaceStoreOptions.value[idx] = data.stores.map((s) => ({
    storeId: s.storeId,
    storeName: s.storeNumber,
    rentPrice: s.rentPrice,
    areaSize: s.areaSize,
    description: s.description,
  }));

  console.log("🟦 store API 응답:", data);
};

const onStoreChange = (idx) => {
  const options = spaceStoreOptions.value[idx];
  if (!options) return;

  const sp = form.spaces[idx];
  const selected = options.find((item) => item.storeId === sp.storeId);
  if (!selected) return;

  sp.rentPrice = selected.rentPrice;
  sp.areaSize = selected.areaSize;
  sp.description = selected.description;
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
  form.spaces.reduce(
    (sum, sp) =>
      sum +
      (sp.rentPrice || 0) +
      (sp.additionalFee || 0) -
      (sp.discountAmount || 0),
    0
  )
);

/* ---------------- 상세정보 로딩 ---------------- */
const loadDetail = async () => {
  const { data } = await getEstimateDetail(route.params.id);

  form.title = data.estimateTitle;
  form.projectId = data.projectId;
  form.proposalId = data.proposalId;

  form.clientCompanyId = data.clientCompanyId;
  form.clientId = data.clientId;

  selectedCompanyName.value = data.clientCompanyName;
  selectedClientName.value = data.clientName;

  form.estimateDate = data.estimateDate;
  form.deliveryDate = data.deliveryDate;
  form.paymentCondition = data.paymentCondition;
  form.remark = data.remark;

  form.spaces = data.spaces.map((sp) => ({
    storeEstimateMapId: sp.storeEstimateMapId,
    floorId: sp.floorId,
    storeId: sp.storeId,
    rentPrice: sp.rentFee,
    areaSize: sp.area,
    additionalFee: sp.additionalFee,
    discountAmount: sp.discountAmount,
    description: sp.remark,
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
        additionalFee: sp.additionalFee,
        discountAmount: sp.discountAmount,
        description: sp.description,
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
  await loadFloors();
  await loadProjects();
  await loadCompanies();

  await loadDetail();

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

  // ★ 수정 — 반응형 초기화
  spaceStoreOptions.value = Array.from(
    { length: form.spaces.length },
    () => []
  );

  for (let i = 0; i < form.spaces.length; i++) {
    await onFloorChange(i);
    onStoreChange(i);
  }
});
</script>

<style scoped>
.page-wrapper {
  background: #fafafa;
  min-height: 100vh;
  padding: 8px 16px;
}

/* 페이지 타이틀 */
.page-title {
  max-width: 1100px;
  margin: 4px auto 10px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #111;
}

/* 카드 Wrapper */
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

.space-card {
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fff;
  padding: 12px;
  margin-bottom: 8px;
}

/* 총 금액 */
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

.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

/* 모달 */
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
</style>
