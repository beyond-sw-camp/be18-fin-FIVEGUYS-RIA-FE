<template>
  <v-container fluid class="page-wrapper">
    <div class="page-inner">
      <!-- 스낵바 -->
      <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
        {{ snackbarMessage }}
      </v-snackbar>
      <div class="page-title">계약 상세</div>

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
                <v-text-field v-model="form.contractTitle" class="input-field" variant="outlined" hide-details
                  readonly />
              </v-col>

              <!-- 프로젝트 -->
              <v-col cols="12">
                <div class="input-label">프로젝트</div>
                <v-text-field v-model="form.projectName" class="input-field" variant="outlined" hide-details readonly />
              </v-col>

              <!-- 견적 (nullable) -->
              <v-col cols="12">
                <div class="input-label">견적</div>
                <v-text-field v-model="selectedEstimateTitle" class="input-field" variant="outlined" hide-details
                  readonly placeholder="선택된 견적 없음" />
              </v-col>

              <!-- 고객사 / 담당 고객 -->
              <v-col cols="12" md="6">
                <div class="input-label">고객사</div>
                <v-text-field v-model="form.clientCompanyName" class="input-field" variant="outlined" hide-details
                  readonly />
              </v-col>
              <v-col cols="12" md="6">
                <div class="input-label">담당 고객</div>
                <v-text-field v-model="form.clientName" class="input-field" variant="outlined" hide-details readonly />
              </v-col>

              <!-- 계약 시작/마감일 -->
              <v-col cols="12" md="4">
                <div class="input-label">계약 시작일</div>
                <v-text-field :value="formatDate(form.contractStartDate)" class="input-field" readonly />
              </v-col>
              <v-col cols="12" md="4">
                <div class="input-label">계약 마감일</div>
                <v-text-field :value="formatDate(form.contractEndDate)" class="input-field" readonly />
              </v-col>
              <v-col cols="12" md="4">
                <div class="input-label">계약일</div>
                <v-text-field :value="formatDate(form.contractDate)" class="input-field" readonly />
              </v-col>

              <!-- 계약 유형 / 계약일 -->
              <v-col cols="12" md="6">
                <div class="input-label">계약 유형</div>
                <v-text-field :value="contractTypesMap[form.contractType]" class="input-field" readonly />
              </v-col>
              <!-- 담당자 -->
              <v-col cols="12" md="6">
                <div class="input-label">담당자</div>
                <v-text-field :value="form.createUserName" class="input-field" readonly />
              </v-col>

              <!-- 보증금 / 수수료율 -->
              <v-col cols="6" md="6">
                <div class="input-label">보증금</div>
                <v-text-field :value="form.contractAmount?.toLocaleString()" class="input-field" readonly />
              </v-col>
              <v-col cols="6" md="6">
                <div class="input-label">수수료율(%)</div>
                <v-text-field :value="form.commissionRate" class="input-field" readonly />
              </v-col>

              <!-- 총 계약 금액 -->
              <v-col cols="12">
                <v-card class="total-card pa-3">
                  <div class="total-title">총 계약 금액</div>
                  <div class="total-price">
                    ₩{{ totalContractAmount.toLocaleString() }}
                    <span v-if="form.commissionRate && form.commissionRate > 0"
                      style="font-size: 0.8rem; color: #555; margin-left: 6px;">
                      + α × {{ form.commissionRate }}%
                    </span>
                  </div>
                </v-card>
              </v-col>

              <!-- 결제 조건 / 화폐 -->
              <v-col cols="12" md="6">
                <div class="input-label">결제 조건</div>
                <v-text-field :value="paymentOptionsMap[form.paymentCondition]" class="input-field" readonly />
              </v-col>
              <v-col cols="12" md="6">
                <div class="input-label">화폐</div>
                <v-text-field :value="currencyOptionsMap[form.currency]" class="input-field" readonly />
              </v-col>

              <!-- 비고 -->
              <v-col cols="12">
                <div class="input-label">비고</div>
                <v-textarea v-model="form.remark" class="textarea-field no-gradient-textarea" rows="3"
                  variant="outlined" readonly />
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- 우측 공간 정보 카드 -->
        <v-col cols="12" md="6">
          <v-card elevation="2" class="space-info-card pa-4">
            <div class="section-title">공간 정보</div>
            <v-divider class="section-divider mb-3"></v-divider>

            <v-card v-for="(sp, idx) in form.spaces" :key="idx" class="space-card pa-3 mb-3">
              <v-row dense>
                <v-col cols="12" md="6">
                  <div class="input-label">층 선택</div>
                  <v-text-field :value="sp.floorName" readonly class="input-field" />
                </v-col>
                <v-col cols="12" md="6">
                  <div class="input-label">매장(호수)</div>
                  <v-text-field :value="sp.storeNumber" readonly class="input-field" />
                </v-col>
                <v-col cols="12" md="6">
                  <div class="input-label">면적</div>
                  <v-text-field :value="sp.areaSize + '㎡'" readonly class="input-field" />
                </v-col>
                <v-col cols="12" md="6">
                  <div class="input-label">매장 타입</div>
                  <v-text-field :value="sp.storeType" readonly class="input-field" />
                </v-col>
                <v-col cols="12" md="6">
                  <div class="input-label">임대료</div>
                  <v-text-field :value="sp.rentPrice?.toLocaleString() + '원'" readonly class="input-field" />
                </v-col>
                <v-col cols="12" md="6">
                  <div class="input-label">추가 비용</div>
                  <v-text-field :value="sp.additionalFee?.toLocaleString()" readonly class="input-field" />
                </v-col>
                <v-col cols="12" md="6">
                  <div class="input-label">할인 금액</div>
                  <v-text-field :value="sp.discountAmount?.toLocaleString()" readonly class="input-field" />
                </v-col>
                <v-col cols="12">
                  <div class="input-label">공간 설명</div>
                  <v-textarea :value="sp.description" rows="2" readonly class="textarea-field no-gradient-textarea"
                    variant="outlined" />
                </v-col>
              </v-row>
            </v-card>

            <v-row justify="center" class="mt-4">
              <v-col cols="12" md="8">
                <v-btn color="success" block
                  :disabled="completing || form.status === 'COMPLETED' || form.status === 'CANCELLED'"
                  @click="onComplete">
                  계약 완료
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- 편집 / 삭제 버튼 -->
      <div class="d-flex justify-end gap-3 mt-4" v-if="form.status !== 'COMPLETED' && form.status !== 'CANCELLED'">
        <v-btn color="orange darken-2" class="white--text px-6" rounded="lg" elevation="2" @click="goToEdit">
          편집
        </v-btn>

        <v-btn color="red darken-2" class="white--text px-6" rounded="lg" elevation="2" :disabled="deleting"
          @click="onDelete">
          삭제
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getContractDetail, cancelContract, completeContract } from "@/apis/contract";

const route = useRoute();
const router = useRouter();
const contractId = route.params.id;

/* ---- 스낵바 ---- */
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("red");

// 오류용
const showError = (errOrMsg, fallback = "오류가 발생했습니다.") => {
  const msg = typeof errOrMsg === "string"
    ? errOrMsg
    : errOrMsg?.response?.data?.message || fallback;

  snackbarMessage.value = msg;
  snackbarColor.value = "red";
  snackbar.value = true;
};

// 성공용
const showSuccess = (msg = "성공했습니다.") => {
  snackbarMessage.value = msg;
  snackbarColor.value = "green";
  snackbar.value = true;
};

const form = reactive({
  contractTitle: "",
  estimateId: null,
  estimateName: "",
  projectId: null,
  projectName: "",
  clientCompanyId: null,
  clientCompanyName: "",
  clientId: null,
  clientName: "",
  contractStartDate: null,
  contractEndDate: null,
  contractDate: null,
  contractAmount: 0,
  commissionRate: 0,
  contractType: "",
  rentType: "",
  paymentCondition: "",
  currency: "",
  remark: "",
  spaces: [],
  status: "", // 계약 상태
});

const selectedEstimateTitle = ref("");
const deleting = ref(false);

// 맵핑용
const contractTypesMap = { LEASE: "임대형", CONSIGNMENT: "수수료형", MIX: "혼합" };
const paymentOptionsMap = { PREPAY: "선불", POSTPAY: "후불" };
const currencyOptionsMap = { KRW: "KRW", USD: "USD", EUR: "EUR" };

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

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

onMounted(async () => {
  try {
    const { data } = await getContractDetail(contractId);
    Object.assign(form, data);
    selectedEstimateTitle.value = data.estimateName || "";
  } catch (err) {
    console.error("계약 상세 조회 실패", err);
    showError(err, "계약 상세 조회 실패");
  }
});

const goToEdit = () => {
  if (form.status === "COMPLETED" || form.status === "CANCELED") {
    showError("완료되거나 취소된 계약은 편집할 수 없습니다.");
    return;
  }
  router.push(`/contract/${route.params.id}/edit`);
};

// 삭제
const onDelete = async () => {
  if (deleting.value) return;
  if (form.status === "CANCELLED") {
    showError("이미 취소된 계약입니다.");
    return;
  }

  const ok = window.confirm("계약을 취소하시겠습니까?");
  if (!ok) return;

  deleting.value = true;
  try {
    await cancelContract(contractId);
    form.status = "CANCELLED"; // 상태 업데이트
    showSuccess("계약이 취소되었습니다.");
    await router.push({ name: "Contract" });
  } catch (err) {
    console.error("계약 취소 실패", err);
    showError(err, "계약 취소 중 오류가 발생했습니다.");
  } finally {
    deleting.value = false;
  }
};

const completing = ref(false);
const onComplete = async () => {
  if (completing.value) return;

  if (form.status === "COMPLETED") {
    showError("이미 완료된 계약입니다.");
    return;
  }
  if (form.status === "CANCELLED") {
    showError("취소된 계약은 완료할 수 없습니다.");
    return;
  }

  const ok = window.confirm("계약을 완료하시겠습니까?");
  if (!ok) return;

  completing.value = true;
  try {
    const { data } = await completeContract(contractId);
    form.status = "COMPLETED";
    showSuccess("계약이 완료되었습니다.");
  } catch (err) {
    console.error("계약 완료 실패", err);
    showError(err, "계약 완료 중 오류가 발생했습니다.");
  } finally {
    completing.value = false;
  }
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

.v-row>.v-col {
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
  background: #fff !important;
  /* 그라데이션 제거 */
  background-image: none !important;
  /* 혹시 남아있을 배경 이미지 완전 제거 */
  min-height: 30px !important;
  font-size: 0.8rem !important;
  padding-top: 3px !important;
  padding-bottom: 3px !important;
  border-radius: 6px !important;
}

.textarea-field :deep(textarea) {
  resize: none !important;
}

/* v-textarea 래퍼에 묻어 있는 배경도 강제 제거 */
.textarea-field :deep(.v-field) {
  background: #fff !important;
  background-image: none !important;
}

.input-field :deep(.v-field::before),
.textarea-field :deep(.v-field::before),
.input-field :deep(.v-field::after),
.textarea-field :deep(.v-field::after) {
  opacity: 0 !important;
  background: transparent !important;
  display: none !important;
}

.no-gradient-textarea :deep(.v-field__input) {
  padding: 16px 12px !important;
  /* 원하는 값으로 조정 */
}

/* 실제 textarea 요소 패딩 */
.no-gradient-textarea :deep(textarea) {
  padding: 10px 12px !important;
  /* 원하는 값으로 조정 */
}
</style>
