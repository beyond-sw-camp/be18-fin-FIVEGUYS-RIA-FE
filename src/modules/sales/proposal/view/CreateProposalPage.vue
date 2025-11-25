<template>
  <v-container fluid class="pa-6 page-wrapper">
    <div class="page-title mb-6">새 제안 추가</div>

    <v-card elevation="3" class="project-card pa-8">
      <div class="section-title mb-6">제안 정보</div>

      <v-row dense>
        <!-- 제안명 -->
        <v-col cols="12" md="6">
          <div class="input-label">제안명</div>
          <v-text-field v-model="form.projectName" placeholder="제안명을 입력하세요" variant="outlined" class="input-field"
            hide-details />
        </v-col>

        <!-- 영업 기회 -->
        <v-col cols="12" md="6">
          <div class="input-label">영업 기회</div>
          <v-text-field v-model="form.projectType" placeholder="영업 기회를 선택하세요" variant="outlined" class="input-field"
            hide-details readonly @click="opportunityDialog = true" />
        </v-col>

        <!-- 고객사 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객사</div>
          <v-text-field v-model="form.clientCompany" placeholder="고객사를 선택하세요" variant="outlined" class="input-field"
            hide-details readonly @click="companyDialog = true" />
        </v-col>

        <!-- 고객 -->
        <v-col cols="12" md="6">
          <div class="input-label">고객</div>
          <v-text-field v-model="form.clientOwner" placeholder="고객을 선택하세요" variant="outlined" class="input-field"
            hide-details readonly @click="clientDialog = true" />
        </v-col>

        <!-- 내용 -->
        <v-col cols="12">
          <div class="input-label">내용</div>
          <v-textarea v-model="form.content" placeholder="내용을 입력하세요" variant="outlined" class="input-field" hide-details
            rows="4" />
        </v-col>

        <!-- 요청일 -->
        <v-col cols="12" md="3">
          <div class="input-label">요청일</div>
          <v-menu v-model="startMenu" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-text-field :model-value="formatDate(form.startDate)" placeholder="요청일" variant="outlined" hide-details
                readonly v-bind="props" class="input-field" />
            </template>
            <v-date-picker v-model="form.startDate" @update:model-value="startMenu = false" />
          </v-menu>
        </v-col>

        <!-- 제출일 -->
        <v-col cols="12" md="3">
          <div class="input-label">제출일</div>
          <v-menu v-model="endMenu" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-text-field :model-value="formatDate(form.endDate)" placeholder="제출일" variant="outlined" hide-details
                readonly v-bind="props" class="input-field" />
            </template>
            <v-date-picker v-model="form.endDate" @update:model-value="endMenu = false" />
          </v-menu>
        </v-col>


        <!-- 비고 -->
        <v-col cols="12">
          <div class="input-label">비고</div>
          <v-textarea v-model="form.notes" placeholder="비고를 입력하세요" variant="outlined" class="input-field" hide-details
            rows="4" />
        </v-col>
      </v-row>

      <!-- 버튼 그룹 -->
      <div class="text-right mt-8">
        <v-btn color="orange darken-2" class="white--text px-6" rounded="lg" elevation="2" @click="saveProposal">
          저장
        </v-btn>
        <v-btn color="grey darken-1" class="white--text px-6" rounded="lg" elevation="2" @click="cancelForm">
          취소
        </v-btn>
      </div>
    </v-card>

    <!-- 고객사 모달 -->
    <v-dialog v-model="companyDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객사 선택</div>
        <v-list>
          <v-list-item v-for="company in companyList" :key="company.id" @click="selectCompany(company)"
            class="company-button">
            {{ company.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 고객 모달 -->
    <v-dialog v-model="clientDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">고객 선택</div>

        <v-text-field v-model="clientSearch" placeholder="검색" prepend-inner-icon="mdi-magnify" variant="outlined"
          hide-details class="mb-4" />

        <v-list>
          <template v-for="company in sortedCompanyList" :key="company.id">
            <v-list-item class="company-button" @click="toggleCompany(company)">
              {{ company.name }}
            </v-list-item>

            <v-list-item v-for="client in clientsByCompany(company.id)" :key="client.id"
              v-show="expandedCompany.includes(company.id)" @click="selectClient(client)" class="dialog-item">
              {{ client.name }}
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 영업 기회 모달 -->
    <v-dialog v-model="opportunityDialog" width="500">
      <v-card class="pa-4">
        <div class="dialog-title mb-4">영업 기회 선택</div>

        <v-list>
          <v-list-item v-for="o in opportunityList" :key="o.id" @click="selectOpportunity(o)" class="dialog-item">
            {{ o.name }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { createProposal } from '@/apis/proposal';
import { getProjectTitles, getProjectMeta } from '@/apis/project';

const router = useRouter();

const startMenu = ref(false);
const endMenu = ref(false);

const clientDialog = ref(false);
const managerDialog = ref(false);
const opportunityDialog = ref(false);
const companyDialog = ref(false);

const clientSearch = ref('');

// 폼 초기값
const initialForm = {
  projectName: '',
  projectId: null,
  projectType: '',
  clientCompanyId: null,
  clientCompany: '',
  clientId: null,
  clientOwner: '',
  salesManager: '',
  startDate: '',
  endDate: '',
  content: '',
  notes: '',
};

const form = reactive({ ...initialForm });

// 더미 데이터 (id 포함)
const companyList = [
  { id: 1, name: '삼성전자' },
  { id: 2, name: 'LG CNS' },
  { id: 3, name: '카카오' },
];

const clientList = [
  { id: 101, name: '김사원', clientCompanyId: 1 },
  { id: 102, name: '이팀장', clientCompanyId: 1 },
  { id: 103, name: '박대리', clientCompanyId: 1 },
  { id: 201, name: '홍영업', clientCompanyId: 2 },
  { id: 202, name: '이영희', clientCompanyId: 2 },
  { id: 301, name: '최고객', clientCompanyId: 3 },
];

const managerList = ['박팀장', '최팀장', '장팀장'];

// 영업 기회 목록 (서버 응답 매핑)
const opportunityList = ref([]);

// 고객 모달 관련
const expandedCompany = ref([]); // companyId 배열

// 선택 고객사 최상단 정렬
const sortedCompanyList = computed(() => {
  const list = [...companyList];
  if (form.clientCompanyId) {
    const idx = list.findIndex((c) => c.id === form.clientCompanyId);
    if (idx !== -1) {
      const [selected] = list.splice(idx, 1);
      list.unshift(selected);
    }
  }
  return list;
});

// 검색 시 자동 펼침
watch(clientSearch, (val) => {
  if (val.trim() !== '') {
    expandedCompany.value = companyList.map((c) => c.id);
  } else if (form.clientCompanyId) {
    expandedCompany.value = [form.clientCompanyId];
  } else {
    expandedCompany.value = [];
  }
});

const toggleCompany = (company) => {
  expandedCompany.value = expandedCompany.value.includes(company.id)
    ? expandedCompany.value.filter((id) => id !== company.id)
    : [company.id];
};

const clientsByCompany = (companyId) => {
  const keyword = clientSearch.value.toLowerCase();
  return clientList.filter(
    (c) =>
      c.clientCompanyId === companyId &&
      (!keyword || c.name.toLowerCase().includes(keyword)),
  );
};

const selectClient = (c) => {
  form.clientId = c.id;
  form.clientOwner = c.name;
  form.clientCompanyId = c.clientCompanyId;

  const company = companyList.find((co) => co.id === c.clientCompanyId);
  form.clientCompany = company ? company.name : '';

  expandedCompany.value = [c.clientCompanyId];
  clientDialog.value = false;
};

const selectManager = (m) => {
  form.salesManager = m;
  managerDialog.value = false;
};

// 영업기회 리스트 조회
const fetchProjectTitles = async (keyword = '') => {
  const { data } = await getProjectTitles(keyword);
  // 서버 DTO: { projectId, projectTitle }
  // 템플릿에서 쓰던 형태(id, name)로 변환
  opportunityList.value = data.map((p) => ({
    id: p.projectId,
    name: p.projectTitle,
  }));
};

// 영업기회 다이얼로그가 열릴 때마다 서버 호출
watch(opportunityDialog, (open) => {
  if (open) {
    fetchProjectTitles();
  }
});

// 영업기회 목록은 그대로: opportunityList.value = [{ id, name }, ...]

// 기존 selectOpportunity 삭제하고 아래로 교체
const selectOpportunity = async (o) => {
  // 1) 기본 project 정보 세팅
  form.projectId = o.id;
  form.projectType = o.name;

  // 2) 서버에서 프로젝트 메타 조회
  const { data } = await getProjectMeta(o.id);
  // data: ProjectMetaResponseDto
  // { projectId, projectName, clientCompanyId, clientCompanyName, clientId, clientName }

  // 3) 폼에 반영
  form.projectId = data.projectId;
  form.projectType = data.projectName;

  form.clientCompanyId = data.clientCompanyId;
  form.clientCompany = data.clientCompanyName;

  form.clientId = data.clientId;
  form.clientOwner = data.clientName;

  // 4) 고객 모달에서 선택한 회사가 맨 위로 오도록
  expandedCompany.value = [data.clientCompanyId];

  // 5) 모달 닫기
  opportunityDialog.value = false;
};
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const selectCompany = (c) => {
  form.clientCompanyId = c.id;
  form.clientCompany = c.name;
  expandedCompany.value = [c.id];
  companyDialog.value = false;
};

const saveProposal = async () => {
  const payload = {
    title: form.projectName,
    clientCompanyId: form.clientCompanyId,
    clientId: form.clientId,
    projectId: form.projectId,
    data: form.content,
    requestDate: form.startDate || null,
    submitDate: form.endDate || null,
    remark: form.notes || null,
  };

  await createProposal(payload);
  router.push({ name: 'Proposal' });
};

const cancelForm = () => {
  Object.assign(form, { ...initialForm });
  expandedCompany.value = [];
  clientSearch.value = '';
  clientDialog.value = false;
  managerDialog.value = false;
  opportunityDialog.value = false;
  companyDialog.value = false;
};
</script>

<style scoped>
.page-wrapper {
  background: #fefefe;
  min-height: 100vh;
}

.page-title {
  font-size: 1.7rem;
  font-weight: 700;
  color: #111;
}

.project-card {
  border-radius: 16px;
  background: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;
}

.input-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
}

.input-field {
  border-radius: 12px;
  background: #fff;
}

.dialog-title {
  font-size: 1.2rem;
  font-weight: 600;
}

.dialog-item {
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 8px;
}

.dialog-item:hover {
  background: #f9f9f9;
}

.company-button {
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #f3f3f3;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  display: block;
}

.company-button:hover {
  background: #e8e8e8;
}
</style>
