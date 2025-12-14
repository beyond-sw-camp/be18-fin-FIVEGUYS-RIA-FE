<template>
  <v-container fluid class="page-wrapper">
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
      {{ snackbarMessage }}
    </v-snackbar>

    <div class="page-title">견적 수정</div>

    <v-card elevation="1" class="estimate-card">
      <div class="section-title">견적 정보</div>

      <v-row dense>
        <!-- 견적 제목 -->
        <v-col cols="12" md="6">
          <div class="input-label">견적 제목</div>
          <v-text-field v-model="form.title" class="input-field" variant="outlined" hide-details />
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
            <v-date-picker v-model="form.estimateDate" @update:model-value="estimateMenu = false" />
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
            <v-date-picker v-model="form.deliveryDate" @update:model-value="deliveryMenu = false" />
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
          <v-textarea v-model="form.remark" rows="3" class="textarea-field" variant="outlined" hide-details />
        </v-col>
      </v-row>

      <!-- ===================== 공간 정보 ===================== -->
      <div class="section-title mt-6">공간 정보</div>

      <v-card v-for="(sp, idx) in form.spaces" :key="idx" class="space-card pa-3 mb-3">
        <v-row dense>
          <!-- 층 -->
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

          <!-- 매장 -->
          <v-col cols="12" md="3">
            <div class="input-label">매장(호수)</div>
            <v-select
              :items="spaceStoreOptions[idx]"
              v-model="sp.storeId"
              item-title="storeName"
              item-value="storeId"
              class="input-field"
              hide-details
              :disabled="!spaceStoreOptions[idx]?.length"
              no-data-text="사용 가능한 매장이 없습니다"
              @update:modelValue="onStoreChange(idx)"
            />
          </v-col>

          <!-- 임대료 -->
          <v-col cols="12" md="3">
            <div class="input-label">임대료</div>
            <v-text-field :model-value="toComma(sp.rentPrice)" readonly class="input-field" hide-details />
          </v-col>

          <!-- 면적 -->
          <v-col cols="12" md="3">
            <div class="input-label">면적</div>
            <v-text-field :model-value="sp.areaSize + '㎡'" readonly class="input-field" hide-details />
          </v-col>

          <!-- 추가 비용 -->
          <v-col cols="12" md="3">
            <div class="input-label">추가 비용</div>
            <v-text-field v-model.number="sp.additionalFee" type="number" class="input-field" hide-details />
          </v-col>

          <!-- 할인 -->
          <v-col cols="12" md="3">
            <div class="input-label">할인 금액</div>
            <v-text-field v-model.number="sp.discountAmount" type="number" class="input-field" hide-details />
          </v-col>
        </v-row>

        <v-col cols="12">
          <div class="input-label">공간 설명</div>
          <v-textarea v-model="sp.description" rows="2" class="textarea-field" hide-details />
        </v-col>

        <v-btn color="red" class="mt-2" @click="removeSpace(idx)">공간 삭제</v-btn>
      </v-card>

      <div class="actions-row">
        <v-btn class="space-add-btn" variant="outlined" @click="addSpace">+ 공간 추가</v-btn>
      </div>

      <v-card class="total-card pa-4">
        <div class="total-title">총 견적 금액</div>
        <div class="total-price">₩{{ totalPrice.toLocaleString() }}</div>
      </v-card>

      <div class="actions-row">
        <v-btn color="orange-darken-2" class="white--text px-6" rounded="lg" elevation="2" @click="saveEstimate">
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

const route = useRoute();
const router = useRouter();

const paymentOptions = [
  { label: "선불", value: "PREPAY" },
  { label: "후불", value: "POSTPAY" },
];
const estimateMenu = ref(false);
const deliveryMenu = ref(false);
const toComma = (v) => Number(v || 0).toLocaleString();

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

const selectedProjectName = ref("");
const selectedProposalName = ref("");
const selectedCompanyName = ref("");
const selectedClientName = ref("");

const floorOptions = ref([]);
const spaceStoreOptions = ref([]);

const snackbar = ref(false);
const snackbarColor = ref("");
const snackbarMessage = ref("");

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().substring(0, 10);
};


const onFloorChange = async (idx, isInit = false) => {
  const floorId = form.spaces[idx].floorId;
  if (!floorId) return;

  try {
    const { data } = await getSpaces(floorId);

    spaceStoreOptions.value[idx] = data.stores.map((s) => ({
      storeId: s.storeId,
      storeName: s.storeNumber,
      rentPrice: s.rentPrice,
      areaSize: s.areaSize,
      description: s.description,
    }));


    if (!isInit) {
      form.spaces[idx].storeId = null;
      form.spaces[idx].rentPrice = 0;
      form.spaces[idx].areaSize = 0;
      form.spaces[idx].description = "";
    }
  } catch {
    spaceStoreOptions.value[idx] = [];
    form.spaces[idx].storeId = null;
    snackbarColor.value = "orange";
    snackbarMessage.value = "사용 가능한 매장이 없습니다.";
    snackbar.value = true;
  }
};

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
      spaces: form.spaces.map((s) => ({
        storeEstimateMapId: s.storeEstimateMapId,
        storeId: s.storeId,
        additionalFee: s.additionalFee,
        discountAmount: s.discountAmount,
        description: s.description,
      })),
    };

    await updateEstimate(route.params.id, payload);

    snackbarColor.value = "green";
    snackbarMessage.value = "견적이 수정되었습니다.";
    snackbar.value = true;

    router.push({
      name: "EstimateDetail",
      params: { id: route.params.id },
    });
  } catch (err) {
    snackbarColor.value = "red";
    snackbarMessage.value =
      err?.response?.data?.message ||
      err?.response?.data?.errorMessage ||
      "견적 수정 중 오류가 발생했습니다.";
    snackbar.value = true;
  }
};

const onStoreChange = (idx) => {
  const store = spaceStoreOptions.value[idx]?.find(
    (s) => s.storeId === form.spaces[idx].storeId
  );
  if (!store) return;
  form.spaces[idx].rentPrice = store.rentPrice;
  form.spaces[idx].areaSize = store.areaSize;
  form.spaces[idx].description = store.description;
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
  form.spaces.splice(idx, 1);
  spaceStoreOptions.value.splice(idx, 1);
};

const totalPrice = computed(() =>
  form.spaces.reduce(
    (sum, s) => sum + (s.rentPrice || 0) + (s.additionalFee || 0) - (s.discountAmount || 0),
    0
  )
);

onMounted(async () => {
  const { data } = await getEstimateDetail(route.params.id);
  form.title = data.estimateTitle;
  form.spaces = data.spaces.map((s) => ({
    floorId: s.floorId,
    storeId: s.storeId,
    rentPrice: s.rentFee,
    areaSize: s.area,
    additionalFee: s.additionalFee,
    discountAmount: s.discountAmount,
    description: s.remark,
  }));

  const floors = await getFloors(1);
  floorOptions.value = floors.data.floors.map((f) => ({
    id: f.floorId,
    label: f.floorName,
  }));

  spaceStoreOptions.value = Array.from({ length: form.spaces.length }, () => []);

for (let i = 0; i < form.spaces.length; i++) {
  await onFloorChange(i, true); // ← 초기 로딩임을 명시
  if (spaceStoreOptions.value[i]?.length) {
    onStoreChange(i);
  }
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
