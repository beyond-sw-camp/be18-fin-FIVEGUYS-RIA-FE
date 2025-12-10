<template>
    <v-container fluid class="page-wrapper">
        <div class="page-inner">
        <!-- 스낵바 -->
        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
            {{ snackbarMessage }}
        </v-snackbar>

        <div class="page-title">계약 수정</div>

        <v-row dense>
            <!-- 좌측 계약 정보 카드 -->
            <v-col cols="12" md="6">
            <v-card elevation="1" class="contract-card pa-4">
                <div class="section-title">계약 정보</div>
                <v-divider class="section-divider mb-3"></v-divider>

                <v-row dense>
                <!-- 계약 제목 -->
                <v-col cols="12">
                    <div class="input-label">
                    계약 제목 <span class="required">*</span>
                    </div>
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
                    <div class="input-label">
                    프로젝트 <span class="required">*</span>
                    </div>
                    <v-text-field
                    v-model="form.projectName"
                    placeholder="프로젝트 선택"
                    class="input-field"
                    variant="outlined"
                    hide-details
                    readonly
                    @click="projectDialog = true"
                    />
                    <v-btn
                    v-if="form.projectId"
                    icon
                    @click.stop="clearProject"
                    small
                    class="ml-1 ios-clear-btn"
                    >
                    <v-icon size="20">mdi-close-circle</v-icon>
                    </v-btn>
                    <ProjectSelectModal
                    v-model="projectDialog"
                    @select="onSelectProject"
                    />
                </v-col>
                

                <!-- 견적 선택 (옵션) -->
                <v-col cols="12">
                    <div class="input-label">견적 선택</div>
                    <v-text-field
                    v-model="selectedEstimateTitle"
                    placeholder="견적 선택 (선택 사항)"
                    class="input-field"
                    variant="outlined"
                    hide-details
                    readonly
                    @click="estimateDialog = true"
                    />
                    <EstimateSelectModal
                    v-model="estimateDialog"
                    :project-id="form.projectId"
                    :nullable="true"
                    @select="onSelectEstimate"
                    />
                    <v-btn
                    v-if="form.estimateId"
                    icon
                    @click.stop="clearEstimate"
                    small
                    class="ml-2 ios-clear-btn"
                    >
                    <v-icon size="20">mdi-close-circle</v-icon>
                    </v-btn>
                </v-col>

                <!-- 고객사 / 담당 고객 -->
                <v-col cols="12" md="6">
                    <div class="input-label">
                    고객사 <span class="required">*</span>
                    </div>
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
                    <div class="input-label">
                    담당 고객 <span class="required">*</span>
                    </div>
                    <v-text-field
                    v-model="form.clientName"
                    class="input-field"
                    variant="outlined"
                    hide-details
                    readonly
                    @click="clientDialog = true"
                    />
                </v-col>

                <!-- 계약 날짜 및 유형 / 담당자 -->
                <v-row dense>
                <!-- 계약 시작일 -->
                <v-col cols="12" md="4">
                    <div class="input-label">계약 시작일 <span class="required">*</span></div>
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

                <!-- 계약 마감일 -->
                <v-col cols="12" md="4">
                    <div class="input-label">계약 마감일 <span class="required">*</span></div>
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

                <!-- 계약일 -->
                <v-col cols="12" md="4">
                    <div class="input-label">계약일 <span class="required">*</span></div>
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

                <!-- 계약 유형 -->
                <v-col cols="12" md="6">
                    <div class="input-label">계약 유형 <span class="required">*</span></div>
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

                <!-- 담당자(생성자) -->
                <v-col cols="12" md="6">
                    <div class="input-label">담당자</div>
                    <v-text-field
                    v-model="form.createUserName"
                    readonly
                    class="input-field"
                    variant="outlined"
                    hide-details
                    />
                </v-col>
                </v-row>

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
                    :readonly="form.contractType === 'LEASE'"
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
                    <div class="input-label">
                    결제 조건 <span class="required">*</span>
                    </div>
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
                    <div class="input-label">
                    화폐 <span class="required">*</span>
                    </div>
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
                <div class="section-title">
                공간 정보 <span class="required">*</span>
                </div>
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
                        :value="form.contractType === 'CONSIGNMENT' ? '0원' : (sp.rentPrice ? sp.rentPrice.toLocaleString() + '원' : '')"
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

            <div class="d-flex justify-end gap-3 mt-4">
            <!-- 저장 버튼 -->
            <v-btn
                color="orange darken-2"
                class="white--text px-6"
                rounded="lg"
                elevation="2"
                @click="saveContract"
            >
                저장
            </v-btn>
            <!-- 취소 버튼 -->
            <v-btn
                color="grey darken-1"
                class="white--text px-6"
                rounded="lg"
                elevation="2"
                @click="cancelEdit"
            >
                취소
            </v-btn>
            </div>
        </div>
    </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import ProjectSelectModal from "@/modules/sales/contract/components/ProjectSelectModal.vue";
import EstimateSelectModal from "@/modules/sales/contract/components/EstimateSelectModal.vue";

import { updateContract, getContractEstimateDetail, getContractDetail } from "@/apis/contract";
import { getSimpleClientCompanies, getSimpleClientsByCompany } from "@/apis/client";
import { getFloors, getSpaces } from "@/apis/storemap";

/* ---- 다이얼로그 상태 ---- */
const projectDialog = ref(false);
const estimateDialog = ref(false);

/* ---- 스낵바 ---- */
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("red");
const showError = (err, fallback = "오류가 발생했습니다.") => {
    snackbarMessage.value = err?.response?.data?.message || (typeof err === "string" ? err : fallback);
    snackbarColor.value = "red";
    snackbar.value = true;
};
const showSuccess = (msg = "계약이 수정되었습니다.") => {
    snackbarMessage.value = msg;
    snackbarColor.value = "green";
    snackbar.value = true;
};

const router = useRouter();
const route = useRoute();

// contractId: route param (유연하게 id 또는 contractId 처리)
const contractId = route.params.id ?? route.params.contractId;

/* ---- 폼 상태 ---- */
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
    commissionRate: 0, // 초기값 0
    contractType: "MIX",
    createUserName: null,
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

const selectedEstimateTitle = ref("");

// 계약 유형 / 결제 / 화폐
const contractTypes = [
    { label: "임대형", value: "LEASE" },
    { label: "수수료형", value: "CONSIGNMENT" },
    { label: "혼합형", value: "MIX" },
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

// 메뉴 상태
const contractStartMenu = ref(false);
const contractEndMenu = ref(false);
const contractDateMenu = ref(false);

/* ---- 고객사 / 담당 고객 ---- */
const clientCompanies = ref([]);
const clientPersons = ref([]);

/* ---- 층 / 매장 옵션 및 매장별 옵션 배열 ---- */
const floorOptions = ref([]);
const spaceStoreOptions = ref([]);

/* ---- 기존 데이터 로드 및 초기화 함수들 ---- */
const loadCompanies = async () => {
    try {
        const { data } = await getSimpleClientCompanies();
        clientCompanies.value = data;
    } catch (err) {
        showError(err, "고객사 목록 조회 실패");
    }
};

const loadClients = async (companyId) => {
    try {
        const { data } = await getSimpleClientsByCompany(companyId);
        clientPersons.value = data;
    } catch (err) {
        showError(err, "담당 고객 목록 조회 실패");
    }
};

const loadFloors = async () => {
    try {
        const { data } = await getFloors(1); // zoneId가 하드코딩 되어 있는데 기존 코드 기준 유지
        floorOptions.value = (data.floors || []).map(f => ({
        id: f.floorId,
        label: f.floorName,
        }));
    } catch (err) {
        showError(err, "층 목록 조회 실패");
    }
};

/**
 * loadFloorsAndStores
 * - 기존 계약의 spaces에 맞춰 spaceStoreOptions을 채워준다.
 * - (Edit에서 필요) 각 공간의 floorId가 있다면 해당 floor의 매장 목록을 불러와서 spaceStoreOptions[idx]에 넣음.
 */
const loadFloorsAndStores = async () => {
  // 먼저 floor 목록 로드
    await loadFloors();

    // 초기화: spaceStoreOptions 길이를 form.spaces와 동일하게 맞춤
    spaceStoreOptions.value = form.spaces.map(() => []);

    // 각각의 공간에 대해 floorId 있으면 getSpaces 호출
    for (let idx = 0; idx < form.spaces.length; idx++) {
        const sp = form.spaces[idx];
        if (sp && sp.floorId) {
        try {
            const { data } = await getSpaces(sp.floorId);
            spaceStoreOptions.value[idx] = data.stores ? [...data.stores] : [];
        } catch (err) {
            // 매장 로드 실패여도 전체 동작에 영향 없게 경고만
            console.warn(`floor ${sp.floorId}의 매장 로드 실패`, err);
            spaceStoreOptions.value[idx] = [];
        }
        } else {
        spaceStoreOptions.value[idx] = [];
        }
    }
};

/* ---- watch: 계약 유형 변경 시 수수료율 자동 조정 ---- */
watch(() => form.contractType, (newType) => {
    if (newType === "LEASE") {
        form.commissionRate = 0;
    }
});

/* ---- 프로젝트 선택 관련 ---- */
const onSelectProject = async (project) => {
    form.projectId = project.projectId;
    form.projectName = project.projectName;

    form.clientCompanyId = project.clientCompanyId ?? "";
    form.clientCompanyName = project.clientCompanyName || "";

    form.clientId = project.clientId ?? "";
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

const clearProject = () => {
    form.projectId = null;
    form.projectName = "";
    form.clientCompanyId = null;
    form.clientCompanyName = "";
    form.clientId = null;
    form.clientName = "";

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
};

/* ---- 견적 선택 ---- */
const onSelectEstimate = async (estimate) => {
    if (!estimate) {
        form.estimateId = null;
        selectedEstimateTitle.value = "";
        return;
    }

    if (!estimate?.estimateId) return showError("유효한 견적을 선택해주세요.");

    try {
        const { data } = await getContractEstimateDetail(estimate.estimateId);

        selectedEstimateTitle.value = data.estimateTitle;
        form.estimateId = data.estimateId;

        if (data.clientCompanyId) form.clientCompanyId = data.clientCompanyId;
        if (data.clientCompanyName) form.clientCompanyName = data.clientCompanyName;
        if (data.clientId) form.clientId = data.clientId;
        if (data.clientName) form.clientName = data.clientName;
        if (data.paymentCondition) form.paymentCondition = data.paymentCondition;
        if (data.remark) form.remark = data.remark;

        if (data.spaces?.length) {
        form.spaces = data.spaces.map(s => ({
            floorId: s.floorId,
            floorName: s.floorName || "",
            storeId: s.storeId,
            storeNumber: s.storeNumber || "",
            areaSize: s.areaSize || "",
            storeType: s.storeType || "",
            rentPrice: s.rentPrice != null ? s.rentPrice : 0,
            additionalFee: s.additionalFee || 0,
            discountAmount: s.discountAmount || 0,
            description: s.description || "",
        }));
        // 매장 옵션 배열 맞춤
        spaceStoreOptions.value = form.spaces.map(() => []);
        // 매장 리스트 로드 (비동기이지만 무리 없음)
        await loadFloorsAndStores();
        }
    } catch (err) {
        showError(err, "견적 상세 조회 실패");
    } finally {
        estimateDialog.value = false;
    }
};

const clearEstimate = () => {
    form.estimateId = null;
    selectedEstimateTitle.value = "";

    form.remark = "";

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
};

/* ---- 공간 관련 핸들러 (onFloorChange/onStoreChange/add/remove) ---- */
const onFloorChange = async (idx) => {
    const floorId = form.spaces[idx].floorId;
    if (!floorId) {
        spaceStoreOptions.value[idx] = [];
        return;
    }

    try {
        const { data } = await getSpaces(floorId);
        spaceStoreOptions.value[idx] = data.stores ? [...data.stores] : [];

        // 선택된 매장 초기화
        form.spaces[idx].storeId = null;
        form.spaces[idx].storeNumber = "";
        form.spaces[idx].areaSize = null;
        form.spaces[idx].storeType = "";
        form.spaces[idx].rentPrice = null;
    } catch (err) {
        showError(err, "매장 목록 조회 실패");
    }
};

const onStoreChange = (idx) => {
    const sp = form.spaces[idx];
    const selected = (spaceStoreOptions.value[idx] || []).find(
        s => String(s.storeId) === String(sp.storeId)
    );
    if (!selected) return;

    sp.areaSize = selected.areaSize || null;
    sp.storeType = selected.storeType || "";
    sp.storeNumber = selected.storeNumber || "";
    sp.description = selected.description || "";

    // CONSIGNMENT일 경우 임대료 0
    sp.rentPrice = form.contractType === "CONSIGNMENT" ? 0 : (selected.rentPrice || 0);
};

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

const removeSpace = (idx) => {
    if (form.spaces.length <= 1) return;
    form.spaces.splice(idx, 1);
    spaceStoreOptions.value.splice(idx, 1);
};

/* ---- 총 계약금액 ---- */
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

/* ---- 저장 (수정) ---- */
const saveContract = async () => {
    try {
        // --- 1. 필수값 체크 ---
        if (!form.contractTitle) return showError("계약 제목을 입력해주세요!");
        if (!form.projectId) return showError("프로젝트를 선택해주세요!");
        if (!form.clientCompanyId) return showError("고객사를 선택해주세요!");
        if (!form.clientId) return showError("담당 고객을 선택해주세요!");
        if (!form.contractStartDate) return showError("계약 시작일을 선택해주세요!");
        if (!form.contractEndDate) return showError("계약 마감일을 선택해주세요!");
        if (!form.contractType) return showError("계약 유형을 선택해주세요!");
        if (!form.contractDate) return showError("계약일을 선택해주세요!");
        if (!form.paymentCondition) return showError("결제 조건을 선택해주세요!");
        if (!form.currency) return showError("화폐를 선택해주세요!");
        if (!form.spaces.length) return showError("최소 1개의 공간이 필요합니다!");

        // --- 2. 날짜 체크 ---
        const start = new Date(form.contractStartDate);
        const end = new Date(form.contractEndDate);
        if (start >= end) return showError("계약 마감일이 계약 시작일 이전일 수는 없습니다.");

        // --- 3. 숫자값 체크 ---
        if (form.contractAmount != null && form.contractAmount < 0) return showError("보증금은 음수가 될 수 없습니다.");
        if (form.commissionRate != null) {
        if (form.commissionRate < 0) return showError("수수료율은 음수가 될 수 없습니다.");
        if (form.commissionRate > 100) return showError("수수료율은 100%를 넘을 수 없습니다.");
        }

        // --- 4. 공간 검증 ---
        const storeIds = new Set();
        for (let i = 0; i < form.spaces.length; i++) {
        const sp = form.spaces[i];
        if (!sp.floorId) return showError(`공간 ${i + 1}의 층을 선택해주세요.`);
        if (!sp.storeId) return showError(`공간 ${i + 1}의 매장을 선택해주세요.`);
        if (sp.additionalFee < 0) return showError(`공간 ${i + 1}의 추가 비용은 음수가 될 수 없습니다.`);
        if (sp.discountAmount < 0) return showError(`공간 ${i + 1}의 할인 금액은 음수가 될 수 없습니다.`);
        if (storeIds.has(sp.storeId)) return showError(`같은 매장은 중복 선택할 수 없습니다.`);
        storeIds.add(sp.storeId);
        }

        // --- 5. 계약 유형 관련 검증 ---
        if (form.contractType === "LEASE" && form.commissionRate !== 0) {
        form.commissionRate = 0; // 안전하게 강제 0
        }

        // --- 6. payload 구성 ---
        const payload = {
        contractTitle: form.contractTitle,
        projectId: form.projectId,
        estimateId: form.estimateId || null,
        clientCompanyId: Number(form.clientCompanyId),
        clientId: Number(form.clientId),
        contractAmount: Number(form.contractAmount || 0),
        commissionRate: form.contractType === "LEASE" ? 0 : (form.commissionRate != null ? Number(form.commissionRate) : 0),
        contractType: form.contractType,
        rentType: form.rentType || null,
        paymentCondition: form.paymentCondition,
        currency: form.currency,
        contractStartDate: formatDate(form.contractStartDate),
        contractEndDate: formatDate(form.contractEndDate),
        contractDate: formatDate(form.contractDate),
        remark: form.remark || null,
        spaces: form.spaces.map(sp => ({
            storeId: sp.storeId ? Number(sp.storeId) : null,
            additionalFee: sp.additionalFee ? Number(sp.additionalFee) : 0,
            discountAmount: sp.discountAmount ? Number(sp.discountAmount) : 0,
            description: sp.description || "",
        })),
        };

        // --- 7. API 호출 ---
        await updateContract(contractId, payload);
        showSuccess("계약이 수정되었습니다.");
        router.push(`/contract/${contractId}`);

    } catch (err) {
        showError(err?.response?.data?.message || "계약 수정 실패");
    }
};

const cancelEdit = () => {
    router.push(`/contract/${contractId}`);
};

/* ---- mounted: 기존 계약 불러오기 ---- */
onMounted(async () => {
    if (!contractId) {
        showError("유효한 계약 ID가 없습니다.");
        return;
    }

    try {
        const res = await getContractDetail(contractId);
        const data = res.data;
        console.log("contract detail:", data);

        // form에 매핑
        Object.assign(form, {
        contractTitle: data.contractTitle,
        projectId: data.projectId,
        projectName: data.projectName,
        estimateId: data.estimateId,
        contractType: data.contractType,
        contractStartDate: data.contractStartDate,
        contractEndDate: data.contractEndDate,
        contractDate: data.contractDate,
        contractAmount: data.contractAmount,
        commissionRate: data.commissionRate,
        paymentCondition: data.paymentCondition,
        currency: data.currency,
        remark: data.remark,
        clientCompanyId: data.clientCompanyId,
        clientCompanyName: data.clientCompanyName,
        clientId: data.clientId,
        clientName: data.clientName,
        createUserName: data.createUserName,
        spaces: (data.spaces && data.spaces.length) ? data.spaces.map(s => ({
            floorId: s.floorId,
            floorName: s.floorName || "",
            storeId: s.storeId,
            storeNumber: s.storeNumber || "",
            areaSize: s.areaSize || null,
            storeType: s.storeType || "",
            rentPrice: s.rentPrice != null ? s.rentPrice : 0,
            additionalFee: s.additionalFee || 0,
            discountAmount: s.discountAmount || 0,
            description: s.description || "",
        })) : form.spaces,
    });

    // 견적 이름(화면 표시용) 설정
    selectedEstimateTitle.value = data.estimateName || "";

    // 층/매장 옵션 로드 및 각 공간에 맞는 매장 목록 세팅
    await loadFloorsAndStores();

    // 고객사 목록 등 초기 로드
    await loadCompanies();
    } catch (err) {
        showError(err, "계약 상세 조회 실패");
    }
});

/* ---- 초기화 호출 (필요 시) ---- */
loadFloors();
loadCompanies();

/* ---- 헬퍼 ---- */
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

.actions-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
}

.required {
    color: red;
}

.ios-clear-btn {
    background-color: transparent;
    color: #888;
    min-width: 0;
    padding: 0;
    transition: color 0.2s;
}
</style>
