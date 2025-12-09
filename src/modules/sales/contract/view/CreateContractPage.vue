<template>
  <v-container fluid class="page-wrapper">
    <div class="page-inner">
      <!-- 스낵바 -->
      <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
        {{ snackbarMessage }}
      </v-snackbar>

      <div class="page-title">계약 생성</div>

      <v-row dense>
        <!-- 좌측 계약 정보 카드 -->
        <v-col cols="12" md="6">
          <v-card elevation="1" class="contract-card pa-4">
            <div class="section-title">계약 정보</div>
            <v-divider class="section-divider mb-3"></v-divider>

            <v-row dense>
              <!-- 계약 제목 -->
              <v-col cols="12">
                <div class="input-label">계약 제목</div>
                <v-text-field
                  v-model="form.contractTitle"
                  class="input-field"
                  variant="outlined"
                  hide-details
                  placeholder="계약 제목 입력"
                />
              </v-col>

              <!-- 프로젝트 선택 -->
              <v-col cols="12">
                <div class="input-label">프로젝트</div>
                <v-text-field
                  v-model="form.projectName"
                  placeholder="프로젝트 선택"
                  class="input-field"
                  variant="outlined"
                  hide-details
                  readonly
                  @click="projectDialog = true"
                />
                <ProjectSelectModal
                  v-model="projectDialog"
                  @select="onSelectProject"
                />
              </v-col>

              <!-- 견적 선택 -->
              <v-col cols="12">
                <div class="input-label">견적 선택</div>
                <v-text-field
                  v-model="selectedEstimateTitle"
                  placeholder="견적 선택"
                  class="input-field"
                  variant="outlined"
                  hide-details
                  readonly
                  @click="estimateDialog = true"
                />
                <EstimateSelectModal
                  v-model="estimateDialog"
                  :project-id="form.projectId"
                  @select="onSelectEstimate"
                />
              </v-col>

              <!-- 고객사 / 담당 고객 -->
              <v-col cols="12" md="6">
                <div class="input-label">고객사</div>
                <v-text-field
                  v-model="form.clientCompanyName"
                  class="input-field"
                  variant="outlined"
                  hide-details
                  readonly
                  @click="companyDialog = true"
                />
              </v-col>
              <v-col cols="12" md="6">
                <div class="input-label">담당 고객</div>
                <v-text-field
                  v-model="form.clientName"
                  class="input-field"
                  variant="outlined"
                  hide-details
                  readonly
                  @click="clientDialog = true"
                />
              </v-col>

              <!-- 계약 시작일 / 마감일 -->
              <v-col cols="12" md="6">
                <div class="input-label">계약 시작일</div>
                <v-menu v-model="contractStartMenu" :close-on-content-click="false">
                  <template #activator="{ props }">
                    <v-text-field
                      :value="formatDate(form.contractStartDate)"
                      class="input-field"
                      readonly
                      placeholder="YYYY-MM-DD"
                      variant="outlined"
                      hide-details
                      v-bind="props"
                    />
                  </template>
                  <v-date-picker
                    v-model="form.contractStartDate"
                    @update:model-value="contractStartMenu = false"
                  />
                </v-menu>
              </v-col>
              <v-col cols="12" md="6">
                <div class="input-label">계약 마감일</div>
                <v-menu v-model="contractEndMenu" :close-on-content-click="false">
                  <template #activator="{ props }">
                    <v-text-field
                      :value="formatDate(form.contractEndDate)"
                      class="input-field"
                      readonly
                      placeholder="YYYY-MM-DD"
                      variant="outlined"
                      hide-details
                      v-bind="props"
                    />
                  </template>
                  <v-date-picker
                    v-model="form.contractEndDate"
                    @update:model-value="contractEndMenu = false"
                  />
                </v-menu>
              </v-col>

              <!-- 계약 유형 / 계약일 -->
              <v-col cols="12" md="6">
                <div class="input-label">계약 유형</div>
                <v-select
                  v-model="form.contractType"
                  :items="contractTypes"
                  item-title="label"
                  item-value="value"
                  class="input-field"
                  hide-details
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <div class="input-label">계약일</div>
                <v-menu v-model="contractDateMenu" :close-on-content-click="false">
                  <template #activator="{ props }">
                    <v-text-field
                      :value="formatDate(form.contractDate)"
                      class="input-field"
                      readonly
                      placeholder="YYYY-MM-DD"
                      variant="outlined"
                      hide-details
                      v-bind="props"
                    />
                  </template>
                  <v-date-picker
                    v-model="form.contractDate"
                    @update:model-value="contractDateMenu = false"
                  />
                </v-menu>
              </v-col>

              <!-- 보증금 / 수수료율 -->
              <v-col cols="6" md="6">
                <div class="input-label">보증금</div>
                <v-text-field
                  v-model.number="form.contractAmount"
                  type="number"
                  class="input-field"
                  variant="outlined"
                  hide-details
                  placeholder="예: 1000000"
                />
              </v-col>
              <v-col cols="6" md="6">
                <div class="input-label">수수료율(%)</div>
                <v-text-field
                  v-model.number="form.commissionRate"
                  type="number"
                  class="input-field"
                  variant="outlined"
                  hide-details
                  placeholder="예: 10"
                />
              </v-col>

              <v-divider class="section-divider mb-3"></v-divider>

              <!-- 총 계약 금액 -->
              <v-col cols="12">
                <v-card class="total-card pa-3">
                  <div class="total-title">총 계약 금액</div>
                  <div class="total-price">
                    ₩{{ totalContractAmount.toLocaleString() }}
                    <span
                      v-if="form.commissionRate && form.commissionRate > 0"
                      style="font-size: 0.8rem; color: #555; margin-left: 6px;"
                    >
                      + α × {{ form.commissionRate }}%
                    </span>
                  </div>
                </v-card>
              </v-col>

              <!-- 결제 조건 / 화폐 -->
              <v-col cols="12" md="6">
                <div class="input-label">결제 조건</div>
                <v-select
                  v-model="form.paymentCondition"
                  :items="paymentOptions"
                  item-title="label"
                  item-value="value"
                  class="input-field"
                  hide-details
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <div class="input-label">화폐</div>
                <v-select
                  v-model="form.currency"
                  :items="currencyOptions"
                  item-title="label"
                  item-value="value"
                  class="input-field"
                  hide-details
                  variant="outlined"
                />
              </v-col>

              <!-- 비고 -->
              <v-col cols="12">
                <div class="input-label">비고</div>
                <v-textarea
                  v-model="form.remark"
                  class="textarea-field"
                  rows="3"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- 우측 공간 정보 카드 -->
        <v-col cols="12" md="6">
          <v-card elevation="2" class="space-info-card pa-4">
            <div class="section-title">공간 정보</div>
            <v-divider class="section-divider mb-3"></v-divider>

            <v-card
              v-for="(sp, idx) in form.spaces"
              :key="idx"
              class="space-card pa-3 mb-3"
            >
              <v-row dense>
                <!-- 층 선택 -->
                <v-col cols="12" md="6">
                  <div class="input-label">층 선택</div>
                  <v-select
                    v-model="sp.floorId"
                    :items="floorOptions"
                    item-title="label"
                    item-value="id"
                    class="input-field"
                    hide-details
                    variant="outlined"
                    @update:modelValue="onFloorChange(idx)"
                  />
                </v-col>

                <!-- 매장 선택 -->
                <v-col cols="12" md="6">
                  <div class="input-label">매장(호수)</div>
                  <v-select
                    v-model="sp.storeId"
                    :items="spaceStoreOptions[idx]"
                    item-title="storeNumber"
                    item-value="storeId"
                    class="input-field"
                    hide-details
                    variant="outlined"
                    @update:modelValue="onStoreChange(idx)"
                  />
                </v-col>

                <!-- 면적 -->
                <v-col cols="12" md="6">
                  <div class="input-label">면적</div>
                  <v-text-field
                    :value="sp.areaSize ? sp.areaSize + '㎡' : ''"
                    class="input-field"
                    readonly
                  />
                </v-col>

                <!-- 매장 타입 -->
                <v-col cols="12" md="6">
                  <div class="input-label">매장 타입</div>
                  <v-text-field
                    :value="sp.storeType"
                    class="input-field"
                    readonly
                  />
                </v-col>

                <!-- 임대료 -->
                <v-col cols="12" md="6">
                  <div class="input-label">임대료</div>
                  <v-text-field
                    :value="sp.rentPrice ? sp.rentPrice.toLocaleString() + '원' : ''"
                    class="input-field"
                    readonly
                  />
                </v-col>

                <!-- 추가 비용 -->
                <v-col cols="12" md="6">
                  <div class="input-label">추가 비용</div>
                  <v-text-field
                    v-model.number="sp.additionalFee"
                    type="number"
                    class="input-field"
                  />
                </v-col>

                <!-- 할인 금액 -->
                <v-col cols="12" md="6">
                  <div class="input-label">할인 금액</div>
                  <v-text-field
                    v-model.number="sp.discountAmount"
                    type="number"
                    class="input-field"
                  />
                </v-col>

                <!-- 공간 설명 -->
                <v-col cols="12">
                  <div class="input-label">공간 설명</div>
                  <v-textarea
                    v-model="sp.description"
                    class="textarea-field"
                    rows="2"
                  />
                </v-col>

                <!-- 삭제 버튼 -->
                <v-col cols="12" class="d-flex justify-end">
                  <v-btn
                    color="red"
                    variant="outlined"
                    small
                    :disabled="form.spaces.length === 1"
                    @click="removeSpace(idx)"
                  >
                    삭제
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>

            <!-- 공간 추가 버튼 -->
            <div class="d-flex justify-end mt-2">
              <v-btn color="blue" variant="outlined" small @click="addSpace">
                + 공간 추가
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <div class="actions-row">
        <v-btn
          color="orange darken-2"
          class="white--text px-6"
          rounded="lg"
          elevation="2"
          @click="saveContract"
        >
          저장
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";

import ProjectSelectModal from "@/modules/sales/contract/components/ProjectSelectModal.vue";
import EstimateSelectModal from "@/modules/sales/contract/components/EstimateSelectModal.vue";

import { createContract, getContractEstimateDetail } from "@/apis/contract";
import { getSimpleClientCompanies, getSimpleClientsByCompany } from "@/apis/client";
import { getFloors, getSpaces } from "@/apis/storemap";

// ------------------ 다이얼로그 상태 ------------------
const projectDialog = ref(false);
const estimateDialog = ref(false);
const companyDialog = ref(false);
const clientDialog = ref(false);

// ------------------ 스낵바 ------------------
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("red");
const showError = (err, fallback = "오류가 발생했습니다.") => {
  snackbarMessage.value = err?.response?.data?.message || fallback;
  snackbarColor.value = "red";
  snackbar.value = true;
};
const showSuccess = (msg = "계약이 생성되었습니다.") => {
  snackbarMessage.value = msg;
  snackbarColor.value = "green";
  snackbar.value = true;
};

const router = useRouter();

// ------------------ 폼 상태 ------------------
const today = new Date();
const form = reactive({
  contractTitle: "",
  estimateId: null,
  projectId: null,
  projectName: "",
  clientCompanyId: null,
  clientCompanyName: "",
  clientId: null,
  clientName: "",
  contractStartDate: null,
  contractEndDate: null,
  contractDate: today,
  contractAmount: null,
  commissionRate: null,
  contractType: "LEASE",
  rentType: "MONTHLY",
  paymentCondition: "PREPAY",
  currency: "KRW",
  remark: "",
  spaces: [
    {
      floorId: null,
      floorName: "",
      storeId: null,
      storeNumber: "",
      areaSize: null,
      storeType: "",
      rentPrice: null,
      additionalFee: 0,
      discountAmount: 0,
      description: "",
    },
  ],
});

// 선택한 견적명
const selectedEstimateTitle = ref("");

// 계약 유형 / 결제 / 화폐
const contractTypes = [
  { label: "임대차", value: "LEASE" },
  { label: "위탁", value: "CONSIGNMENT" },
  { label: "혼합", value: "MIX" },
];
const paymentOptions = [
  { label: "선불", value: "PREPAY" },
  { label: "후불", value: "POSTPAY" },
];
const currencyOptions = [
  { label: "KRW", value: "KRW" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
];

const storeTypeOptions = [
  { label: "일반 매장", value: "REGULAR" },
  { label: "팝업 스토어", value: "POPUP" },
  { label: "전시회", value: "EXHIBITION" }
];

// 메뉴 상태
const contractStartMenu = ref(false);
const contractEndMenu = ref(false);
const contractDateMenu = ref(false);

// ------------------ 프로젝트 선택 ------------------
const onSelectProject = async (project) => {
  form.projectId = project.projectId;
  form.projectName = project.title;

  form.clientCompanyId = null;
  form.clientCompanyName = project.clientCompanyName || "";
  form.clientId = null;
  form.clientName = project.clientName || "";

  form.estimateId = null;
  selectedEstimateTitle.value = "";

  form.spaces = [
    {
      floorId: null,
      floorName: "",
      storeId: null,
      storeNumber: "",
      areaSize: null,
      storeType: "",
      rentPrice: null,
      additionalFee: 0,
      discountAmount: 0,
      description: "",
    },
  ];
  spaceStoreOptions.value = [[]];

  projectDialog.value = false;
};

// ------------------ 견적 선택 ------------------
const onSelectEstimate = async (estimate) => {
  if (!estimate?.estimateId) return showError("유효한 견적을 선택해주세요.");
  try {
    const { data } = await getContractEstimateDetail(estimate.estimateId);
    selectedEstimateTitle.value = data.estimateTitle;
    form.estimateId = data.estimateId;

    form.clientCompanyId = data.clientCompanyId || form.clientCompanyId;
    form.clientCompanyName = data.clientCompanyName || form.clientCompanyName;
    form.clientId = data.clientId || form.clientId;
    form.clientName = data.clientName || form.clientName;

    form.paymentCondition = data.paymentCondition || form.paymentCondition;
    form.remark = data.remark || form.remark;

    if (data.spaces?.length) {
      form.spaces = data.spaces.map(s => ({
        floorId: s.floorId,
        floorName: s.floorName || "",
        storeId: s.storeId,
        storeNumber: s.storeNumber || "",
        areaSize: s.areaSize || "",
        storeType: s.storeType || "",
        rentPrice: s.rentPrice || 0,
        additionalFee: s.additionalFee || 0,
        discountAmount: s.discountAmount || 0,
        description: s.description || "",
      }));
      spaceStoreOptions.value = form.spaces.map(() => []);
    } else {
      form.spaces = [
        {
          floorId: null,
          floorName: "",
          storeId: null,
          storeNumber: "",
          areaSize: null,
          storeType: "",
          rentPrice: null,
          additionalFee: 0,
          discountAmount: 0,
          description: "",
        },
      ];
      spaceStoreOptions.value = [[]];
    }
  } catch (err) {
    showError(err, "견적 상세 조회 실패");
  } finally {
    estimateDialog.value = false;
  }
};

// ------------------ 고객사 / 담당 고객 ------------------
const clientCompanies = ref([]);
const clientPersons = ref([]);

const loadCompanies = async () => {
  try {
    const { data } = await getSimpleClientCompanies();
    clientCompanies.value = data;
  } catch (err) {
    showError(err);
  }
};

const loadClients = async (companyId) => {
  try {
    const { data } = await getSimpleClientsByCompany(companyId);
    clientPersons.value = data;
  } catch (err) {
    showError(err);
  }
};

const selectCompany = async (company) => {
  form.clientCompanyId = company.companyId;
  form.clientCompanyName = company.name;
  form.clientId = null;
  form.clientName = "";
  await loadClients(company.companyId);
  companyDialog.value = false;
};

const selectClient = (client) => {
  form.clientId = client.clientId;
  form.clientName = client.name;
  clientDialog.value = false;
};

// ------------------ 공간 관련 ------------------
const floorOptions = ref([]);
const spaceStoreOptions = ref([[]]);

// 층 목록 불러오기
const loadFloors = async () => {
  try {
    const { data } = await getFloors(1); // 빌딩 ID 1 예시
    floorOptions.value = data.floors.map(f => ({
      id: f.floorId,
      label: f.floorName,
    }));
  } catch (err) {
    showError(err, "층 목록 조회 실패");
  }
};

// 층 선택 시 해당 층의 매장 목록 불러오기
const onFloorChange = async (idx) => {
  const floorId = form.spaces[idx].floorId;
  if (!floorId) return;

  try {
    const { data } = await getSpaces(floorId);
    console.log("매장 목록:", data.stores);
    spaceStoreOptions.value[idx] = data.stores ? [...data.stores] : [];

    // 매장 초기화
    form.spaces[idx].storeId = null;
    form.spaces[idx].storeNumber = "";
    form.spaces[idx].areaSize = null;
    form.spaces[idx].storeType = "";
    form.spaces[idx].rentPrice = null;
  } catch (err) {
    showError(err, "매장 목록 조회 실패");
  }
};

// 매장 선택 시 상세 정보 반영
const onStoreChange = (idx) => {
  const sp = form.spaces[idx];
  const selected = spaceStoreOptions.value[idx].find(
    s => String(s.storeId) === String(sp.storeId)
  );
  if (!selected) return;

  console.log("선택된 매장:", selected);
  console.log("storeType 타입:", typeof selected.storeType);

  sp.areaSize = selected.areaSize || null;
  sp.storeType = selected.storeType || ""; // Enum 그대로, 화면에 표시
  sp.rentPrice = selected.rentPrice || 0;
  sp.storeNumber = selected.storeNumber || "";
  sp.description = selected.description || "";
  sp.floorName = floorOptions.value.find(f => f.id === sp.floorId)?.label || "";
};

// 공간 추가
const addSpace = () => {
  form.spaces.push({
    floorId: null,
    floorName: "",
    storeId: null,
    storeNumber: "",
    areaSize: null,
    storeType: "",
    rentPrice: null,
    additionalFee: 0,
    discountAmount: 0,
    description: "",
  });
  spaceStoreOptions.value.push([]);
};

// 공간 삭제 (최소 1개 유지)
const removeSpace = (idx) => {
  if (form.spaces.length <= 1) return;
  form.spaces.splice(idx, 1);
  spaceStoreOptions.value.splice(idx, 1);
};

// ------------------ 총 계약금액 ------------------
const totalContractAmount = computed(() => {
  const spaceTotal = form.spaces.reduce((sum, sp) => {
    const rent = sp.rentPrice || 0;
    const add = sp.additionalFee || 0;
    const disc = sp.discountAmount || 0;
    return sum + rent + add - disc;
  }, 0);

  const contractAmount = form.contractAmount || 0;

  return spaceTotal + contractAmount;
});

// ------------------ 저장 ------------------
const saveContract = async () => {
  if (!form.clientCompanyId) return showError("고객사를 선택해주세요!");
  if (!form.clientId) return showError("담당 고객을 선택해주세요!");

  const payload = {
  contractTitle: form.contractTitle,
  projectId: form.projectId,
  estimateId: form.estimateId || null,
  clientCompanyId: Number(form.clientCompanyId),
  clientId: Number(form.clientId),
  contractAmount: Number(form.contractAmount), // 보증금
  commissionRate: form.commissionRate ? Number(form.commissionRate) : null,
  contractType: form.contractType,       // LEASE, CONSIGNMENT, MIX
  rentType: form.rentType || null,       // MONTHLY, YEARLY, FIXED
  paymentCondition: form.paymentCondition || null, // PREPAY, POSTPAY
  currency: form.currency,               // KRW, USD, EUR
  contractStartDate: form.contractStartDate ? formatDate(form.contractStartDate) : null,
  contractEndDate: form.contractEndDate ? formatDate(form.contractEndDate) : null,
  contractDate: form.contractDate ? formatDate(form.contractDate) : null,
  remark: form.remark || null,
  spaces: form.spaces.map(sp => ({
    storeId: sp.storeId ? Number(sp.storeId) : null,
    additionalFee: sp.additionalFee ? Number(sp.additionalFee) : 0,
    discountAmount: sp.discountAmount ? Number(sp.discountAmount) : 0,
    description: sp.description || "",
  })),
};

  console.log(this.payload);

  try {
    await createContract(payload);
    showSuccess("계약이 생성되었습니다.");
    router.push("/contracts");
  } catch (err) {
    console.log(err);             // 전체 에러 객체 확인
    console.log(err.response);    // Axios 응답 확인
    console.log(err.response?.data); // 서버가 보내는 데이터
    showError(err?.response?.data?.message || "계약 생성 실패");
  }
};

// ------------------ 초기화 ------------------
loadFloors();
loadCompanies();

// ------------------ 헬퍼 ------------------
const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
</script>

<style scoped>
.page-wrapper {
  background: #fafafa;
  min-height: 100vh;
  padding: 16px 0;
}

.page-inner {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 16px 0 24px;
}

.contract-card,
.space-info-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e5e5;
  width: 100%;
  padding: 16px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.section-divider {
  border-color: #e0e0e0;
}

.v-row > .v-col {
  margin-bottom: 16px;
}

.total-card {
  border-radius: 10px;
  border: 1px solid #eee;
  background: #fff;
  text-align: left;
  padding: 12px;
  margin-bottom: 12px;
}

.total-title {
  font-size: 0.9rem;
  font-weight: 600;
}

.total-price {
  font-size: 1.2rem;
  font-weight: 800;
  margin-top: 4px;
  text-align: right;
}

.input-field :deep(.v-field__input),
.textarea-field :deep(.v-field__input) {
  background-color: #fff !important;
  min-height: 30px !important;
  font-size: 0.8rem !important;
  padding-top: 3px !important;
  padding-bottom: 3px !important;
  border-radius: 6px !important;
}

/* 공통 input-field 높이 */
.input-field :deep(.v-field__input) {
  min-height: 27px !important;
}

.input-field :deep(.v-input__append-inner) {
  line-height: 27px !important;
}

.textarea-field :deep(.v-field__input) {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

.v-btn {
  min-width: 80px;
  height: 28px;
  font-size: 0.75rem;
}

.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
