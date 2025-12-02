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
            variant="outlined"
            hide-details
            :readonly="!editMode"
          />
        </v-col>

        <!-- 프로젝트 -->
        <v-col cols="12" md="6">
          <div class="input-label">프로젝트</div>
          <v-text-field
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
            v-model="form.estimateDate"
            variant="outlined"
            hide-details
            readonly
          />
        </v-col>

        <!-- 결제 조건 -->
        <v-col cols="12" md="6">
          <div class="input-label">결제 조건</div>
          <v-text-field
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
            variant="outlined"
            hide-details
            :readonly="!editMode"
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
  font-weight: 600;
  margin-bottom: 4px;
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

.actions-row {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
