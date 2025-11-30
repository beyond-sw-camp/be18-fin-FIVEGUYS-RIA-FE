<template>
  <v-container fluid class="page-wrapper">
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- 페이지 타이틀 -->
    <div class="page-title">견적 작성</div>

    <!-- 카드 -->
    <v-card elevation="1" class="estimate-card">
      <div class="section-title">견적 정보</div>

      <v-row dense class="container">
        <!-- 견적 제목 -->
        <v-col cols="12" md="6">
          <div class="input-label">견적 제목</div>
          <v-text-field
            v-model="form.title"
            placeholder="예: 팝업 스토어 견적"
            variant="outlined"
            class="input-field"
            hide-details
          />
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
            hide-details
            class="input-field"
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
            item-title="title"
            item-value="id"
            placeholder="제안 선택"
            variant="outlined"
            hide-details
            class="input-field"
            clearable
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
            placeholder="고객사 선택"
            variant="outlined"
            class="input-field"
            hide-details
            readonly
            @click="companyDialog = true"
          />
        </v-col>

        <!-- 고객사 선택 모달 -->
        <v-dialog v-model="companyDialog" width="500">
          <v-card class="pa-4">
            <div class="dialog-title mb-2">고객사 선택</div>

            <!-- 필터 버튼 -->
            <div class="mb-3 d-flex">
              <v-chip
                class="mr-2"
                :color="companyFilter === 'ALL' ? 'orange darken-2' : undefined"
                :text-color="companyFilter === 'ALL' ? 'white' : undefined"
                @click="companyFilter = 'ALL'"
              >
                전체
              </v-chip>

              <v-chip
                class="mr-2"
                :color="
                  companyFilter === 'CLIENT' ? 'orange darken-2' : undefined
                "
                :text-color="companyFilter === 'CLIENT' ? 'white' : undefined"
                @click="companyFilter = 'CLIENT'"
              >
                고객사
              </v-chip>

              <v-chip
                :color="
                  companyFilter === 'LEAD' ? 'orange darken-2' : undefined
                "
                :text-color="companyFilter === 'LEAD' ? 'white' : undefined"
                @click="companyFilter = 'LEAD'"
              >
                잠재고객사
              </v-chip>
            </div>

            <!-- 검색 -->
            <v-text-field
              v-model="companySearch"
              placeholder="고객사 검색"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              class="mb-3"
            />

            <!-- 리스트 -->
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

        <!-- 고객 담당자 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객 담당자</div>
          <v-text-field
            v-model="selectedClientName"
            placeholder="담당자 선택"
            variant="outlined"
            class="input-field"
            hide-details
            readonly
            @click="clientDialog = true"
          />
        </v-col>

        <!-- 담당자 선택 모달 -->
        <v-dialog v-model="clientDialog" width="500">
          <v-card class="pa-4">
            <div class="dialog-title mb-3">담당자 선택</div>

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
                class="input-field"
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
                class="input-field"
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
            class="input-field"
          />
        </v-col>

        <!-- 비고 -->
        <v-col cols="12">
          <div class="input-label">비고</div>
          <v-textarea
            v-model="form.remark"
            placeholder="비고 입력"
            variant="outlined"
            hide-details
            class="textarea-field"
            rows="3"
          />
        </v-col>
      </v-row>

      <!-- -------------------- 공간 정보 -------------------- -->
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
              item-title="storeNumber"
              item-value="storeId"
              @update:modelValue="onStoreChange(idx)"
            />
          </v-col>

          <!-- 임대료 -->
          <v-col cols="12" md="3">
            <div class="input-label">임대료</div>
            <v-text-field
              :model-value="
                sp.rentPrice ? sp.rentPrice.toLocaleString() + '원' : ''
              "
              readonly
            />
          </v-col>

          <!-- 면적 -->
          <v-col cols="12" md="3">
            <div class="input-label">면적</div>
            <v-text-field
              :model-value="sp.areaSize ? sp.areaSize + '㎡' : ''"
              readonly
            />
          </v-col>

          <!-- 추가비용 -->
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

        <!-- 공간 설명 (추가) -->
        <v-col cols="12">
          <div class="input-label">공간 설명</div>
          <v-textarea
            :model-value="sp.description"
            readonly
            variant="outlined"
            hide-details
            class="textarea-field"
          />
        </v-col>

        <v-btn
          color="red"
          variant="outlined"
          @click="removeSpace(idx)"
          class="mt-2"
        >
          공간 삭제
        </v-btn>
      </v-card>

      <!-- 공간 추가 -->
      <div class="actions-row mb-4">
        <v-btn color="blue" variant="outlined" @click="addSpace">
          + 공간 추가
        </v-btn>
      </div>

      <!-- 총 금액 표시 -->
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
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

import { createEstimate } from "@/apis/estimate";
import { getFloors, getSpaces } from "@/apis/storemap";
import { getProjectTitles, getProjectMeta } from "@/apis/project";
import { getProposalsByProject, getProposalDetail } from "@/apis/proposal";
import {
  getSimpleClientCompanies,
  getSimpleClientsByCompany,
} from "@/apis/client";

const router = useRouter();

/* ------------ 옵션들 ------------ */
const projectOptions = ref([]);
const proposalOptions = ref([]);

const companyList = ref([]);
const clientList = ref([]);

const floorOptions = ref([]);
const spaceStoreOptions = ref([[]]); // ← 에러 발생하던 부분 수정됨!

const paymentOptions = ref([
  { label: "선불", value: "PREPAY" },
  { label: "후불", value: "POSTPAY" },
]);

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

/* ------------ 모달 UI ------------ */
const companyDialog = ref(false);
const clientDialog = ref(false);

const companySearch = ref("");
const clientSearch = ref("");

const companyFilter = ref("ALL"); // ALL / CLIENT / LEAD

/* ------------ 이름 표시용 ------------ */
const selectedCompanyName = ref("");
const selectedClientName = ref("");

/* ------------ Snackbar ------------ */
const snackbar = ref(false);
const snackbarColor = ref("red");
const snackbarMessage = ref("");

const showError = (err, fallback = "저장 실패") => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.errorMessage ||
    fallback;

  snackbarMessage.value = msg;
  snackbarColor.value = "red";
  snackbar.value = true;
};

const showSuccess = (msg) => {
  snackbarMessage.value = msg;
  snackbarColor.value = "green";
  snackbar.value = true;
};

/* ------------ 고객사 로딩 ------------ */
const loadCompanies = async () => {
  const params = { page: 1, size: 100 };

  if (companyFilter.value !== "ALL") {
    params.type = companyFilter.value;
  }
  if (companySearch.value.trim()) {
    params.keyword = companySearch.value.trim();
  }

  const res = await getSimpleClientCompanies(params);
  companyList.value = res.data.content.map((c) => ({
    companyId: c.id,
    companyName: c.name,
    type: c.type,
  }));
};

const filteredCompanyList = computed(() =>
  companyList.value.filter((c) =>
    c.companyName.includes(companySearch.value.trim())
  )
);

watch([companyFilter, companySearch, companyDialog], (values) => {
  if (companyDialog.value) loadCompanies();
});

/* ------------ 담당자 로딩 ------------ */
const loadClients = async (companyId) => {
  if (!companyId) return;

  const params = { page: 1, size: 100 };
  if (clientSearch.value.trim()) {
    params.keyword = clientSearch.value.trim();
  }

  const res = await getSimpleClientsByCompany(companyId, params);
  clientList.value = res.data.content.map((c) => ({
    id: c.id,
    name: c.name,
  }));
};

const filteredClientList = computed(() =>
  clientList.value.filter((p) => p.name.includes(clientSearch.value.trim()))
);

watch([clientDialog, clientSearch], () => {
  if (clientDialog.value && form.clientCompanyId) {
    loadClients(form.clientCompanyId);
  }
});

/* ------------ 회사 선택 ------------ */
const selectCompany = (c) => {
  selectedCompanyName.value = c.companyName;
  form.clientCompanyId = c.companyId;

  form.clientId = null;
  selectedClientName.value = "";

  loadClients(c.companyId);
  companyDialog.value = false;
};

/* ------------ 담당자 선택 ------------ */
const selectClient = (p) => {
  selectedClientName.value = p.name;
  form.clientId = p.id;
  clientDialog.value = false;
};

/* ------------ 프로젝트 선택 ------------ */
const onProjectChange = async (projectId) => {
  form.proposalId = null;
  proposalOptions.value = [];

  if (!projectId) return;

  const { data } = await getProjectMeta(projectId);

  form.clientCompanyId = data.clientCompanyId;
  selectedCompanyName.value = data.clientCompanyName;

  form.clientId = data.clientId;
  selectedClientName.value = data.clientName;

  await loadCompanies();
  await loadClients(data.clientCompanyId);

  const res = await getProposalsByProject(projectId);
  proposalOptions.value = res.data.map((p) => ({
    id: p.id,
    title: p.title,
  }));
};

/* ------------ 제안 선택 ------------ */
const onProposalChange = async (proposalId) => {
  if (!proposalId) return;

  const { data } = await getProposalDetail(proposalId);

  form.clientCompanyId = data.clientCompanyId;
  selectedCompanyName.value = data.clientCompanyName;

  form.clientId = data.clientId;
  selectedClientName.value = data.clientName;

  await loadCompanies();
  await loadClients(data.clientCompanyId);
};

/* ------------ 층 선택 ------------ */
const loadFloors = async () => {
  const { data } = await getFloors(1);
  floorOptions.value = data.floors.map((f) => ({
    id: f.floorId,
    label: f.floorName,
  }));
};

/* ------------ 매장 선택 ------------ */
const onFloorChange = async (idx) => {
  const floorId = form.spaces[idx].floorId;
  if (!floorId) return;

  form.spaces[idx].storeId = null;

  const { data } = await getSpaces(floorId);

  spaceStoreOptions.value[idx] = data.stores.map((s) => ({
    storeId: s.storeId,
    storeNumber: s.storeNumber,
    rentPrice: s.rentPrice,
    areaSize: s.areaSize,
    description: s.description,
  }));
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

/* ------------ 공간 추가 ------------ */
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
  spaceStoreOptions.value.push([]); // ← 추가된 공간의 매장 옵션 배열 생성
};

/* ------------ 공간 삭제 ------------ */
const removeSpace = (idx) => {
  if (form.spaces.length <= 1) return;

  form.spaces.splice(idx, 1);
  spaceStoreOptions.value.splice(idx, 1);
};

/* ------------ 총 금액 ------------ */
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

/* ------------ 날짜 ------------ */
const estimateMenu = ref(false);
const deliveryMenu = ref(false);

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().substring(0, 10);
};

/* ------------ 저장 ------------ */
const saveEstimate = async () => {
  try {
    const payload = {
      title: form.title,
      clientCompanyId: form.clientCompanyId,
      clientId: form.clientId,

      projectId: form.projectId,
      proposalId: form.proposalId,

      estimateDate: formatDate(form.estimateDate),
      deliveryDate: formatDate(form.deliveryDate),
      paymentCondition: form.paymentCondition,
      remark: form.remark || null,

      spaces: form.spaces.map((sp) => ({
        storeId: sp.storeId,
        additionalFee: sp.additionalFee,
        discountAmount: sp.discountAmount,
        description: sp.description || "",
      })),
    };

    await createEstimate(payload);
    showSuccess("견적이 생성되었습니다.");

    router.push({ name: "Estimate" });
  } catch (err) {
    showError(err, "견적을 저장할 수 없습니다.");
  }
};

/* ------------ Mount ------------ */
onMounted(() => {
  loadFloors();
  loadCompanies();
  loadProjects();
});

const loadProjects = async () => {
  const res = await getProjectTitles();
  projectOptions.value = res.data.map((p) => ({
    projectId: p.projectId,
    projectTitle: p.projectTitle,
  }));
};
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

/* v-col 기본 여백 밀어버리기 (제안 페이지 동일) */
.estimate-card :deep(.v-col) {
  padding-top: 1px !important;
  padding-bottom: 1px !important;
}

/* ===== 인풋 박스/텍스트 높이 +10px ===== */
.input-field {
  border-radius: 6px !important;
  font-size: 0.8rem;
}

/* Vuetify field 박스 높이 */
.input-field :deep(.v-field) {
  min-height: 32px !important;
  height: 32px !important;
}

/* 실제 입력 글자 영역 */
.input-field :deep(.v-field__input) {
  font-size: 0.8rem !important;
  line-height: 1.2 !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  min-height: 32px !important;
}

/* select 아이콘, suffix, prefix 정렬 */
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
  padding-top: 14px !important;
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
</style>
