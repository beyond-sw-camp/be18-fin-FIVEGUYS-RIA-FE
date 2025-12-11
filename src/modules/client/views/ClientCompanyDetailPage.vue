<!-- src/modules/client/view/ClientCompanyDetail.vue -->
<template>
  <v-container fluid class="pa-0 full-height">
    <v-row no-gutters class="full-height">
      <!-- 좌측: 고객사 정보 -->
      <v-col cols="12" md="4" class="pa-4">
        <v-card outlined class="pa-3 full-height-card">
          <v-card-title class="d-flex justify-space-between align-center mb-3">
            <span class="text-h6">{{ clientCompany.name }}</span>
            <v-icon
              small
              class="cursor-pointer pencil"
              @click="editCompany"
              title="고객사 정보 수정"
            >
              mdi-pencil-outline
            </v-icon>
          </v-card-title>

          <v-divider class="mb-3" />
          <div class="scroll-area">
            <v-list dense>
              <template v-for="(value, key) in clientCompany" :key="key">
                <v-list-item v-if="shouldShowCompanyField(key)">
                  <v-list-item>
                    <v-list-item-title>
                      {{ formatCompanyValue(key, value) }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatCompanyLabel(key) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list-item>
              </template>
            </v-list>
          </div>
        </v-card>
      </v-col>

      <!-- 중앙 컬럼: 고객 담당자 목록 / 상세 -->
      <v-col cols="12" md="4" class="pa-4 d-flex flex-column">
        <v-card
          outlined
          class="pa-3 full-height-card"
          style="
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
          "
        >
          <!-- 상단: 고객 검색 + 즐겨찾기 버튼 -->
          <div class="d-flex mb-2">
            <v-text-field
              v-model="customerSearch"
              append-inner-icon="mdi-magnify"
              placeholder="고객 검색"
              dense
              outlined
              hide-details
              class="flex-grow-1 mr-2"
            />
            <v-btn
              small
              outlined
              @click="showFavoritesOnly = !showFavoritesOnly"
            >
              <v-icon :color="showFavoritesOnly ? '#FFD60A' : '#8e8e93'">
                {{ showFavoritesOnly ? "mdi-star" : "mdi-star-outline" }}
              </v-icon>
            </v-btn>
          </div>

          <!-- 고객 목록 -->
          <div class="scroll-area list-area mb-2">
            <v-row dense no-gutters>
              <v-col
                v-for="customer in filteredCustomers"
                :key="customer.id"
                cols="12"
                class="mb-2"
              >
                <v-card
                  outlined
                  class="pa-2 customer-item-card"
                  :class="{
                    'selected-card':
                      selectedCustomer && selectedCustomer.id === customer.id,
                  }"
                  @click="toggleSelectCustomer(customer)"
                >
                  <v-row align="center" justify="space-between" no-gutters>
                    <v-col class="pa-0">
                      <div class="label text-caption mb-1">이름</div>
                      <div class="font-weight-medium">{{ customer.name }}</div>
                    </v-col>
                    <v-col cols="auto" class="pa-0">
                      <v-icon
                        :color="customer.favorite ? 'yellow darken-3' : 'grey'"
                        @click.stop="toggleFavorite(customer)"
                        class="cursor-pointer"
                      >
                        {{
                          customer.favorite ? "mdi-star" : "mdi-star-outline"
                        }}
                      </v-icon>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- 고객 등록 버튼 -->
          <div class="d-flex justify-end mb-2">
            <v-btn color="#ff9500" outlined @click="openModal">고객 등록</v-btn>
          </div>

          <!-- 하단: 선택된 고객 상세 정보 -->
          <v-card v-if="selectedCustomer" outlined class="pa-3 detail-card">
            <v-card-title
              class="d-flex align-center justify-space-between mb-3"
            >
              <div>
                <div class="label text-caption">이름</div>
                <div class="text-h6">{{ selectedCustomer.name }}</div>
              </div>
              <v-icon
                :color="selectedCustomer.favorite ? 'yellow darken-3' : 'grey'"
                @click.stop="toggleFavorite(selectedCustomer)"
                class="cursor-pointer"
              >
                {{
                  selectedCustomer.favorite ? "mdi-star" : "mdi-star-outline"
                }}
              </v-icon>
            </v-card-title>

            <v-divider class="mb-2" />

            <div class="scroll-area detail-area">
              <v-row dense no-gutters>
                <v-col cols="6">
                  <div class="label">이름</div>
                  <div class="info-text">{{ selectedCustomer.name }}</div>
                </v-col>

                <v-col cols="6">
                  <div class="label">직책</div>
                  <div class="info-text">{{ selectedCustomer.position }}</div>
                </v-col>

                <v-col cols="6">
                  <div class="label">이메일</div>
                  <div class="info-text">{{ selectedCustomer.email }}</div>
                </v-col>

                <v-col cols="6">
                  <div class="label">전화번호</div>
                  <div class="info-text">{{ selectedCustomer.phone }}</div>
                </v-col>
              </v-row>
            </div>
          </v-card>
        </v-card>
      </v-col>

      <!-- 우측 컬럼: History -->
      <v-col cols="12" md="4" class="pa-4">
        <v-card outlined class="pa-3 full-height-card">
          <v-card-title class="text-h6 mb-2">History</v-card-title>
          <v-divider class="mb-3" />

          <div class="scroll-area">
            <v-card
              v-for="(item, index) in filteredHistory"
              :key="index"
              outlined
              class="pa-4 mb-5 history-card"
              @click="goToHistoryDetail(item)"
            >
              <v-row no-gutters>
                <v-col>
                  <div class="text-subtitle-2 font-weight-bold">
                    {{ formatHistoryText(item.title) }}
                  </div>
                  <div class="text-body-2 grey--text text--darken-1 mt-1">
                    {{ formatHistoryText(item.content) }}
                  </div>
                  <div class="text-caption mt-2">
                    {{ item.projectTitle }} ({{ item.projectTypeLabel }} ·
                    {{ item.projectStatusLabel }})
                  </div>
                </v-col>
                <v-col cols="4" class="d-flex flex-column align-end">
                  <div class="text-caption font-weight-medium">
                    {{ item.owner }}
                  </div>
                  <div class="text-caption grey--text mt-1">
                    {{ item.occurredAt }}
                  </div>
                </v-col>
              </v-row>
            </v-card>

            <div
              v-if="selectedCustomer && !filteredHistory.length"
              class="text-caption grey--text"
            >
              이 담당자의 히스토리가 없습니다.
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 고객사 수정 모달 -->
    <v-dialog v-model="showEditModal" max-width="600">
      <v-card class="pa-6 modal-card">
        <v-card-title class="modal-title-container">
          <div class="modal-title">고객사 정보 수정</div>
          <div class="modal-subtitle">필요한 정보를 수정하고 저장하세요.</div>
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-for="field in editableFields"
            :key="field.key"
            v-model="editForm[field.key]"
            :label="field.label"
            variant="outlined"
            class="modal-input"
            @compositionend="onCompositionEnd(field.key, $event)"
          />
        </v-card-text>

        <v-card-actions class="modal-actions justify-end">
          <v-btn
            text
            color="grey darken-1"
            class="cancel-btn"
            @click="showEditModal = false"
          >
            취소
          </v-btn>
          <v-btn
            color="#ff9500"
            class="white--text add-btn"
            @click="saveCompany"
          >
            저장
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 고객 담당자 추가 모달 -->
    <v-dialog v-model="showModal" max-width="500">
      <v-card class="pa-6 modal-card">
        <v-card-title class="modal-title-container">
          <div class="modal-title">고객 추가</div>
          <div class="modal-subtitle">고객 정보를 입력해주세요.</div>
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="고객명"
            variant="outlined"
            class="modal-input"
          />
          <v-text-field
            v-model="form.clientCompany"
            label="고객사"
            variant="outlined"
            class="modal-input"
            readonly
          />
          <v-text-field
            v-model="form.department"
            label="부서"
            variant="outlined"
            class="modal-input"
          />
          <v-text-field
            v-model="form.position"
            label="직책"
            variant="outlined"
            class="modal-input"
          />
          <v-text-field
            v-model="form.phone"
            label="휴대폰"
            variant="outlined"
            class="modal-input"
          />
          <v-text-field
            v-model="form.email"
            label="이메일"
            variant="outlined"
            class="modal-input"
          />
          <v-text-field
            v-model="form.note"
            label="메모"
            variant="outlined"
            class="modal-input"
          />
        </v-card-text>

        <v-card-actions class="modal-actions justify-end">
          <v-btn
            text
            color="grey darken-1"
            class="cancel-btn"
            @click="showModal = false"
          >
            취소
          </v-btn>
          <v-btn
            color="orange darken-2"
            class="white--text add-btn"
            @click="submitClient"
          >
            추가
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getClientCompanyDetail,
  getClientsByCompany,
  registerClient,
  getClientCompanyLeaseSummary,
  getClientProjectHistory,
} from "@/apis/client";

const route = useRoute();
const router = useRouter();

// 고객사 정보
const clientCompany = reactive({
  id: null,
  name: "",
  website: "",
  businessNumber: "",
  fax: "",
  phone: "",
  zipCode: "",
  address: "",
  tenantName: "",
  area: "",
  openingDate: "",
  contractPeriod: "",
  totalRent: "",
  commissionRate: "",
  category: "",
  type: "",
  createdAt: "",
  updatedAt: "",
});

const fetchClientCompany = async () => {
  const id = route.params.id;
  const { data } = await getClientCompanyDetail(id);

  clientCompany.id = data.clientCompanyId;
  clientCompany.name = data.companyName;
  clientCompany.website = data.website;
  clientCompany.businessNumber = data.businessNumber;
  clientCompany.fax = data.fax;
  clientCompany.phone = data.phone;
  clientCompany.zipCode = data.zipCode;
  clientCompany.address = data.address;
  clientCompany.category = data.category;
  clientCompany.type = data.type;
  clientCompany.createdAt = data.createdAt;
  clientCompany.updatedAt = data.updatedAt;
};

// 임대/계약 요약
const fetchClientCompanyLeaseSummaryFn = async () => {
  try {
    const id = route.params.id;
    const { data } = await getClientCompanyLeaseSummary(id);

    clientCompany.tenantName = data.storeDisplayName;
    clientCompany.area = data.areaSize;
    clientCompany.openingDate = data.moveInDate;
    clientCompany.contractPeriod = `${data.contractStartDate} ~ ${data.contractEndDate}`;
    clientCompany.totalRent = data.totalRentAmount;
    clientCompany.commissionRate = `${data.commissionRate}%`;
  } catch (e) {
    console.error("고객사 임대/계약 요약 조회 실패", e);
  }
};

// 담당자 목록
const customers = ref([]);

const fetchClients = async () => {
  try {
    const companyId = route.params.id;
    const params = { page: 1, size: 20 };
    const { data } = await getClientsByCompany(companyId, params);

    customers.value = (data.data || []).map((c) => ({
      id: c.clientId,
      clientId: c.clientId,
      clientCompanyId: c.clientCompanyId,
      name: c.name,
      position: c.position,
      email: c.email,
      phone: c.phone,
      type: c.type,
      createdAt: c.createdAt,
      favorite: false,
    }));
  } catch (e) {
    console.error("고객 목록 조회 실패", e);
  }
};

// 히스토리
const historyEvents = ref([]);

// 타입별 정렬 우선순위
const EVENT_ORDER = {
  PROJECT: 1,
  PROPOSAL: 2,
  ESTIMATE: 3,
  CONTRACT: 4,
  REVENUE: 5,
};

const toKoreanProjectType = (t) => {
  if (t === "RENTAL") return "입점";
  if (t === "POPUP") return "팝업";
  if (t === "EXHIBITION") return "전시회";
  return t || "-";
};

const toKoreanProjectStatus = (s) => {
  if (s === "ACTIVE") return "진행중";
  if (s === "PENDING") return "준비중";
  if (s === "COMPLETED") return "완료";
  if (s === "CANCELED") return "취소";
  return s || "-";
};

const loadHistoryByClient = async (clientId) => {
  try {
    if (!clientId) {
      historyEvents.value = [];
      return;
    }

    const { data } = await getClientProjectHistory(clientId);

    const flat = [];

    (data.projects || []).forEach((project) => {
      const meta = {
        projectId: project.projectId,
        projectTitle: project.projectTitle,
        projectType: project.projectType,
        projectStatus: project.projectStatus,
        projectTypeLabel: toKoreanProjectType(project.projectType),
        projectStatusLabel: toKoreanProjectStatus(project.projectStatus),
        managerName: project.managerName,
      };

      (project.events || []).forEach((ev) => {
        const rawType = ev.type; // "PROJECT" | "PROPOSAL" | ...

        // PROJECT 는 refId 말고 projectId 사용
        const id = rawType === "PROJECT" ? project.projectId : ev.refId;

        flat.push({
          id, // ← 클릭 시 사용할 id
          refId: ev.refId, // 필요하면 따로 보관
          rawType, // 대문자 타입
          type: rawType?.toLowerCase?.() || rawType,
          title: ev.title,
          content: ev.content,
          owner: ev.owner,
          occurredAt: ev.occurredAt,
          ...meta,
        });
      });
    });

    flat.sort((a, b) => {
      const oa = EVENT_ORDER[a.rawType] ?? 999;
      const ob = EVENT_ORDER[b.rawType] ?? 999;
      if (oa !== ob) return oa - ob;
      return new Date(a.occurredAt) - new Date(b.occurredAt);
    });

    historyEvents.value = flat;
  } catch (e) {
    console.error("담당자 프로젝트 히스토리 조회 실패", e);
    historyEvents.value = [];
  }
};

// 검색/선택/즐겨찾기
const customerSearch = ref("");
const selectedCustomer = ref(null);
const showFavoritesOnly = ref(false);
const showModal = ref(false);

const form = reactive({
  name: "",
  clientCompany: "",
  department: "",
  position: "",
  phone: "",
  owner: "",
  email: "",
  note: "",
});

const openModal = () => {
  form.clientCompany = clientCompany.name;
  showModal.value = true;
};

const filteredCustomers = computed(() => {
  let list = customers.value;
  if (customerSearch.value) {
    list = list.filter((c) => c.name.includes(customerSearch.value));
  }
  if (showFavoritesOnly.value) {
    list = list.filter((c) => c.favorite);
  }
  return list;
});

const toggleSelectCustomer = async (customer) => {
  if (selectedCustomer.value?.id === customer.id) {
    selectedCustomer.value = null;
    historyEvents.value = [];
  } else {
    selectedCustomer.value = customer;
    await loadHistoryByClient(customer.clientId);
  }
};

const filteredHistory = computed(() => historyEvents.value);

const toggleFavorite = (customer) => {
  customer.favorite = !customer.favorite;
};

const submitClient = async () => {
  try {
    const companyId = route.params.id;

    const payload = {
      name: form.name,
      position: form.position,
      email: form.email,
      phone: form.phone,
      note: form.note || "",
    };

    const { data } = await registerClient(companyId, payload);

    customers.value.push({
      id: data.clientId,
      clientId: data.clientId,
      clientCompanyId: data.clientCompanyId,
      name: data.name,
      position: data.position,
      email: data.email,
      phone: data.phone,
      type: data.type,
      createdAt: data.createdAt,
      favorite: false,
    });

    Object.assign(form, {
      name: "",
      clientCompany: clientCompany.name,
      department: "",
      position: "",
      phone: "",
      owner: "",
      email: "",
      note: "",
    });

    showModal.value = false;
  } catch (e) {
    console.error("고객 담당자 등록 실패", e);
  }
};

// 회사 필드 포맷: 라벨
const formatCompanyLabel = (key) => {
  const map = {
    website: "웹 사이트",
    businessNumber: "사업자 번호",
    fax: "팩스 번호",
    phone: "유선 번호",
    zipCode: "우편 번호",
    address: "주소",
    tenantName: "입점명",
    area: "면적",
    openingDate: "입점일",
    contractPeriod: "계약 기간",
    totalRent: "누적 임대료",
    commissionRate: "매출 수수료율",
    category: "카테고리",
    type: "유형",
    createdAt: "생성일",
    updatedAt: "수정일",
  };
  return map[key] || key;
};

// 금액 포맷 공통 함수: 소숫점 제거 + 천단위 콤마 + 원 추가
const formatMoneyValue = (raw) => {
  if (raw === null || raw === undefined || raw === "") return "-";

  const str = String(raw);
  const match = str.match(/(\d[\d.,]*)/);
  if (!match) return raw;

  const prefix = str.slice(0, match.index);
  const suffix = str.slice(match.index + match[0].length);
  const numericStr = match[0].replace(/,/g, "");
  const num = Number(numericStr);

  if (Number.isNaN(num)) return raw;

  const intPart = Math.trunc(num);

  // 금액이 아닌 일반 숫자(예: 연도 등)는 원 붙이지 않음
  if (!match[0].includes(".") && Math.abs(intPart) < 10000) {
    return raw;
  }

  const formatted = intPart.toLocaleString("ko-KR");

  return `${prefix}${formatted} 원${suffix}`;
};

// 회사 필드 포맷: 값
const formatCompanyValue = (key, value) => {
  if (value === null || value === undefined || value === "") return "-";

  const moneyKeyPattern = /(amount|total|rent|revenue|sales)/i;
  if (moneyKeyPattern.test(key)) {
    return formatMoneyValue(value);
  }

  return value;
};

// History 타이틀/내용 포맷
const formatHistoryText = (text) => {
  if (!text) return "";
  return formatMoneyValue(text);
};

const hiddenCommonKeys = [
  "id",
  "name",
  "category",
  "type",
  "createdAt",
  "updatedAt",
];

const leaseOnlyKeys = [
  "tenantName",
  "area",
  "openingDate",
  "contractPeriod",
  "totalRent",
  "commissionRate",
];

const shouldShowCompanyField = (key) => {
  if (hiddenCommonKeys.includes(key)) return false;
  if (clientCompany.type === "LEAD" && leaseOnlyKeys.includes(key)) {
    return false;
  }
  return true;
};

// 고객사 수정 모달
const showEditModal = ref(false);
const editForm = reactive({ ...clientCompany });

const editableFields = [
  { key: "name", label: "고객사명" },
  { key: "website", label: "웹 사이트" },
  { key: "fax", label: "팩스 번호" },
  { key: "phone", label: "전화번호" },
  { key: "zipCode", label: "우편번호" },
  { key: "address", label: "주소" },
];

const editCompany = () => {
  Object.assign(editForm, clientCompany);
  showEditModal.value = true;
};

const onCompositionEnd = (field, event) => {
  editForm[field] = event.target.value;
};

const saveCompany = () => {
  document.activeElement.blur();
  const editableKeys = editableFields.map((f) => f.key);
  editableKeys.forEach((key) => {
    clientCompany[key] = editForm[key];
  });
  showEditModal.value = false;
};

// 초기 로딩
onMounted(async () => {
  await fetchClientCompany();
  await fetchClientCompanyLeaseSummaryFn();
  await fetchClients();
});

const goToHistoryDetail = (item) => {
  if (!item?.id || !item?.rawType) return;

  switch (item.rawType) {
    case "PROJECT":
      router.push(`/project/${item.id}`);
      break;
    case "PROPOSAL":
      router.push(`/proposal/${item.id}`);
      break;
    case "ESTIMATE":
      router.push(`/estimate/${item.id}`);
      break;
    case "CONTRACT":
      router.push(`/contract/${item.id}`);
      break;
    case "REVENUE":
      router.push(`/revenue/${item.id}`);
      break;
    default:
      console.warn("Unknown history type:", item.rawType, item);
  }
};

const goToProject = (projectId) => {
  if (!projectId) return;
  router.push(`/projects/${projectId}`);
};
</script>

<style scoped>
.full-height-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 12px;
}

.scroll-area {
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}

.list-area {
  max-height: 280px;
  overflow-y: auto;
}

.customer-item-card {
  padding: 6px 8px;
  border-radius: 10px;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: box-shadow 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
}

.customer-item-card .label {
  font-size: 0.65rem;
  margin-bottom: 2px;
  color: #8e8e93;
}

.customer-item-card .font-weight-medium {
  font-size: 0.8rem;
  color: #1c1c1e;
}

.customer-item-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.selected-card {
  border: 1.5px solid #ff9500;
  box-shadow: 0 6px 16px rgba(255, 149, 0, 0.2);
}

.detail-card {
  min-height: 160px;
  max-height: 380px;
  overflow-y: auto;
  padding: 14px;
  border-radius: 14px;
  background-color: #fefefe;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.scroll-area.detail-area {
  max-height: 360px;
}

.history-card {
  border-radius: 12px;
  background-color: #fefefe;
  padding: 14px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s;
}

.history-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.label {
  font-size: 0.65rem;
  color: #8e8e93;
  margin-bottom: 2px;
  font-weight: 500;
}

.info-text {
  font-size: 0.85rem;
  color: #1c1c1e;
  line-height: 1.3;
}

.modal-card {
  border-radius: 18px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
  padding: 24px 20px;
}

.modal-title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1c1c1e;
}

.modal-subtitle {
  font-size: 0.8rem;
  color: #8e8e93;
  margin-top: 4px;
}

:deep(.modal-input) .v-field__control {
  background-color: #f8f8f8 !important;
  border-radius: 10px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
  padding: 6px 10px !important;
  font-size: 0.85rem;
}

.modal-actions {
  margin-top: 12px;
}

.cancel-btn {
  font-size: 0.75rem;
  min-height: 28px;
  padding: 4px 12px;
  border-radius: 10px;
}

.cancel-btn:hover {
  background-color: #f2f2f7;
}

.add-btn {
  font-size: 0.75rem;
  min-height: 28px;
  padding: 4px 12px;
  border-radius: 10px;
}

.add-btn:hover {
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3);
  transform: translateY(-1px);
}

.v-icon.cursor-pointer {
  transition: transform 0.2s, color 0.2s;
}

.v-icon.cursor-pointer:hover {
  transform: scale(1.15);
}

.v-text-field.flex-grow-1 {
  font-size: 0.85rem;
}

.v-btn {
  font-size: 0.75rem;
  min-height: 28px;
  padding: 4px 10px;
}

.pencil {
  font-size: 1.4rem;
  color: #8e8e93;
  transition: color 0.2s;
}

.pencil:hover {
  color: #111;
}

.project-link {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dashed;
  text-underline-offset: 2px;
}
</style>
