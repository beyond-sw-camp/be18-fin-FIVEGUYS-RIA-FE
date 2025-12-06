<template>
  <v-container fluid class="page-wrapper">
    <div class="page-title">견적 상세</div>

    <v-card elevation="1" class="project-card">
      <!-- 견적 정보 -->
      <div class="section-title">견적 정보</div>

      <v-row dense>
        <!-- 견적 제목 -->
        <v-col cols="12" md="6">
          <div class="input-label">견적 제목</div>
          <v-text-field
            v-model="form.estimateTitle"
            class="input-field"
            variant="outlined"
            hide-details
            :readonly="!editMode"
          />
        </v-col>

        <!-- 프로젝트 -->
        <v-col cols="12" md="6">
          <div class="input-label">프로젝트</div>
          <v-text-field
            class="input-field"
            v-model="form.projectTitle"
            variant="outlined"
            hide-details
            readonly
          />
        </v-col>

        <!-- 제안 -->
        <v-col cols="12" md="6">
          <div class="input-label">제안</div>
          <v-text-field
            class="input-field"
            v-model="form.proposalTitle"
            variant="outlined"
            hide-details
            readonly
          />
        </v-col>

        <!-- 고객사 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객사</div>
          <v-text-field
            class="input-field"
            v-model="form.clientCompanyName"
            variant="outlined"
            hide-details
            readonly
          />
        </v-col>

        <!-- 고객 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객</div>
          <v-text-field
            class="input-field"
            v-model="form.clientName"
            variant="outlined"
            hide-details
            readonly
          />
        </v-col>

        <!-- 담당자 -->
        <v-col cols="12" md="6">
          <div class="input-label">담당자</div>
          <v-text-field
            class="input-field"
            v-model="form.createdUserName"
            variant="outlined"
            hide-details
            readonly
          />
        </v-col>

        <!-- 견적일 -->
        <v-col cols="12" md="6">
          <div class="input-label">견적일</div>
          <v-text-field
            class="input-field"
            v-model="form.estimateDate"
            variant="outlined"
            hide-details
            readonly
          />
        </v-col>

        <!-- 납기일 -->
        <v-col cols="12" md="6">
          <div class="input-label">납기일</div>
          <v-text-field
            class="input-field"
            :model-value="form.deliveryDate"
            readonly
            variant="outlined"
            hide-details
          />
        </v-col>

        <!-- 결제 조건 -->
        <v-col cols="12" md="6">
          <div class="input-label">결제 조건</div>
          <v-text-field
            class="input-field"
            v-model="form.paymentCondition"
            variant="outlined"
            hide-details
            readonly
          />
        </v-col>

        <!-- 비고 -->
        <v-col cols="12">
          <div class="input-label">비고</div>
          <v-textarea
            v-model="form.remark"
            placeholder="비고를 입력하세요"
            variant="outlined"
            class="textarea-field"
            hide-details
            :readonly="!editMode"
            rows="4"
          />
        </v-col>
      </v-row>

      <!-- 공간 정보 -->
      <div class="section-title mt-6">공간 정보</div>

      <v-table class="space-table">
        <thead>
          <tr>
            <th>층</th>
            <th>매장명</th>
            <th>면적(㎡)</th>
            <th>임대료</th>
            <th>추가금액</th>
            <th>할인</th>
            <th>최종금액</th>
            <th>설명</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="space in form.spaces" :key="space.storeId">
            <td>{{ space.floorName }}</td>
            <td>{{ space.storeName }}</td>
            <td>{{ space.area }}㎡</td>
            <td>{{ toComma(space.rentFee) }}원</td>
            <td>{{ toComma(space.additionalFee) }}원</td>
            <td>{{ toComma(space.discountAmount) }}원</td>
            <td class="final">{{ toComma(space.finalAmount) }}원</td>
            <td>{{ space.remark }}</td>
          </tr>
        </tbody>
      </v-table>

      <v-card class="total-card pa-4 mt-4">
        <div class="total-title">총 견적 금액</div>
        <div class="total-price">
          ₩{{ totalEstimateAmount.toLocaleString() }}
        </div>
      </v-card>
      <!-- 하단 버튼 -->
      <div class="actions-row">
        <!-- 조회 모드 -->
        <div v-if="!editMode" class="d-flex gap-3">
          <v-btn
            color="orange-darken-2"
            class="white--text"
            rounded="lg"
            @click="goEdit"
          >
            편집
          </v-btn>
          <v-btn
            color="red-darken-2"
            class="white--text"
            rounded="lg"
            @click="removeEstimate"
          >
            삭제
          </v-btn>
        </div>

        <!-- 수정 모드 -->
        <div v-else class="d-flex gap-3">
          <v-btn
            color="orange-darken-2"
            class="white--text"
            rounded="lg"
            @click="saveEstimate"
          >
            저장
          </v-btn>
          <v-btn
            color="grey-darken-1"
            class="white--text"
            rounded="lg"
            @click="cancelEdit"
          >
            취소
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getEstimateDetail,
  deleteEstimate,
  updateEstimate,
} from "@/apis/estimate";

const route = useRoute();
const router = useRouter();

const editMode = ref(false);

const form = reactive({
  estimateTitle: "",
  projectTitle: "",
  proposalTitle: "",
  clientCompanyName: "",
  clientName: "",
  createdUserName: "",
  estimateDate: "",
  deliveryDate: "",
  paymentCondition: "",
  remark: "",
  spaces: [],
});

const toComma = (v) => (v ? v.toLocaleString() : 0);

/* 상세 조회 */
const fetchDetail = async () => {
  const { data } = await getEstimateDetail(route.params.id);

  form.estimateTitle = data.estimateTitle;
  form.projectTitle = data.projectTitle;
  form.proposalTitle = data.proposalTitle;
  form.clientCompanyName = data.clientCompanyName;
  form.clientName = data.clientName;
  form.createdUserName = data.createdUserName;
  form.estimateDate = data.estimateDate;
  form.deliveryDate = data.deliveryDate;
  form.paymentCondition = mapPaymentCondition(data.paymentCondition);
  form.remark = data.remark;

  form.spaces = data.spaces.map((sp) => ({
    storeId: sp.storeId,
    floorName: sp.floorName,
    storeName: sp.storeName, // ok
    area: sp.area, // ✔ 정정
    rentFee: sp.rentFee,
    baseAmount: sp.baseAmount,
    additionalFee: sp.additionalFee,
    discountAmount: sp.discountAmount,
    finalAmount: sp.finalAmount,
    remark: sp.remark,
  }));
};

/* 저장 */
const saveEstimate = async () => {
  await updateEstimate(route.params.id, {
    estimateTitle: form.estimateTitle,
    remark: form.remark,
  });
  editMode.value = false;
  await fetchDetail();
};

/* 삭제 */
const removeEstimate = async () => {
  if (!confirm("삭제하시겠습니까?")) return;
  await deleteEstimate(route.params.id);
  router.push({ name: "Estimate" });
};

const cancelEdit = () => {
  editMode.value = false;
  fetchDetail();
};

const mapPaymentCondition = (v) => {
  return (
    {
      PREPAY: "선불",
      POSTPAY: "후불",
    }[String(v).toUpperCase()] || v
  );
};

const totalEstimateAmount = computed(() =>
  form.spaces.reduce((total, s) => total + (s.finalAmount || 0), 0)
);

const goEdit = () => {
  router.push({
    name: "EstimateEdit",
    params: { id: route.params.id },
  });
};

onMounted(fetchDetail);
</script>

<style scoped>
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
}

.project-card {
  max-width: 1100px;
  margin: 0 auto;
  border-radius: 14px;
  border: 1px solid #e5e5e5;
  padding: 15px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 20px 0 10px;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 6px;
}

/* =========================
   입력 박스 공통 스타일
========================= */
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

/* =========================
   textarea (비고) — 확장 & 정상 작동 버전
========================= */

/* 바깥 wrapper */
.textarea-field :deep(.v-field) {
  min-height: 90px !important; /* 비고 박스 높이 증가 */
  border-radius: 6px !important;
  height: 30px !important; /* Vuetify 자동 높이 조절 허용 */
}

/* wrapper 내부 */
.textarea-field :deep(.v-field__input) {
  min-height: 90px !important;
  height: 30px !important;
  padding-top: 12px !important; /* 텍스트 위에서 보이게 */
  align-items: flex-start !important;
  font-size: 0.85rem !important;
}

/* 실제 textarea */
.textarea-field :deep(textarea) {
  min-height: 130px !important;
  height: auto !important;
  padding: 10 !important;
  margin: 0 !important;
  font-size: 0.85rem !important;
  line-height: 1.25 !important;
  resize: none !important;
}

/* overlay 제거 */
.textarea-field :deep(.v-field__overlay) {
  display: none !important;
}

/* readonly일 때 흐려짐 방지 */
.v-input--readonly .v-field__input,
.v-input--readonly textarea {
  color: #000 !important;
  -webkit-text-fill-color: #000 !important;
  opacity: 1 !important;
}

/* =========================
   테이블 + 버튼 스타일
========================= */

.actions-row {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.space-table thead th {
  background: #fafafa;
  font-weight: 600;
}

.space-table .final {
  font-weight: 700;
  color: #d35400;
}

.total-card {
  border: 1px solid #ddd;
  border-radius: 10px;
}

.total-title {
  font-size: 0.9rem;
}

.total-price {
  font-size: 1.4rem;
  font-weight: 800;
}
</style>
