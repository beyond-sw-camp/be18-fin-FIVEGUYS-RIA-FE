<template>
  <v-container fluid class="pa-6 page-wrapper">
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- 페이지 타이틀 -->
    <div class="page-title mb-6">마이 페이지</div>

    <v-row dense>
      <!-- 좌측: 프로필 + 비밀번호 변경 -->
      <v-col cols="12" md="4">
        <!-- 프로필 카드 -->
        <v-card class="mb-4 profile-card" elevation="2">
          <v-card-title class="card-title">사용자 프로필</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="6">
                <div class="field-row">
                  <div class="field-label">사번</div>
                  <div class="field-value">{{ profile.employeeId || '-' }}</div>
                </div>
              </v-col>

              <v-col cols="6">
                <div class="field-label">이름</div>
                <div class="field-value">
                  {{ profile.name || '-' }}
                </div>
              </v-col>

              <v-col cols="12">
                <div class="field-label">이메일</div>
                <div class="field-value">
                  {{ profile.email || '-' }}
                </div>
              </v-col>

              <v-col cols="6">
                <div class="field-label">부서</div>
                <div class="field-value">
                  {{ profile.department || '-' }}
                </div>
              </v-col>

              <v-col cols="6">
                <div class="field-label">직책</div>
                <div class="field-value">
                  {{ profile.position || '-' }}
                </div>
              </v-col>

              <v-col cols="6">
                <div class="field-label">상태</div>
                <v-chip size="small" class="mt-1" :color="statusChipColor" label>
                  {{ profile.status || '재직 중' }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 비밀번호 변경 카드 -->
        <v-card class="password-card" elevation="2">
          <v-card-title class="card-title d-flex justify-space-between align-center">
            <span>비밀번호 변경</span>
            <span v-if="passwordErrorMessage" class="password-error-text">
              {{ passwordErrorMessage }}
            </span>
          </v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12">
                <div class="input-label">이전 비밀번호</div>
                <v-text-field v-model="passwordForm.currentPassword" type="password" variant="outlined"
                  density="comfortable" class="input-field" hide-details="auto" :error-messages="currentPasswordError"
                  @input="() => { currentPasswordError = ''; passwordErrorMessage = '' }" />
              </v-col>

              <v-col cols="12">
                <div class="input-label">새 비밀번호</div>
                <v-text-field v-model="passwordForm.newPassword" type="password" variant="outlined"
                  density="comfortable" hide-details class="input-field" @input="passwordErrorMessage = ''" />
              </v-col>

              <v-col cols="12">
                <div class="input-label">새 비밀번호 확인</div>
                <v-text-field v-model="passwordForm.confirmPassword" type="password" variant="outlined"
                  density="comfortable" hide-details class="input-field" @input="passwordErrorMessage = ''" />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="justify-end px-6 pb-4">
            <v-btn color="orange darken-2" class="white--text" @click="onChangePassword">
              비밀번호 변경
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 우측: 진행 중인 프로젝트 카드 리스트 -->
      <v-col cols="12" md="8">
        <v-card elevation="2" class="project-list-card">
          <v-card-title class="card-title d-flex justify-space-between align-center">
            <span>진행 중인 프로젝트</span>
          </v-card-title>

          <v-card-text>
            <v-row dense>
              <v-col v-for="p in myProjects" :key="p.projectId" cols="12" md="6" class="mb-3">
                <v-card class="project-item-card" elevation="1">
                  <v-card-text>
                    <div class="project-item-header">
                      <div class="project-title-text">
                        {{ p.title }}
                      </div>
                      <v-btn variant="text" size="small" class="detail-link" @click="goProjectDetail(p.projectId)">
                        상세보기
                      </v-btn>
                    </div>

                    <div class="project-meta-row">
                      <span class="meta-label">유형</span>
                      <span class="meta-value">{{ translateType(p.type) }}</span>
                    </div>

                    <div class="project-meta-row">
                      <span class="meta-label">고객사</span>
                      <span class="meta-value">{{ p.clientCompanyName || '-' }}</span>
                    </div>

                    <div class="project-meta-row">
                      <span class="meta-label">기간</span>
                      <span class="meta-value">
                        {{ formatDate(p.startDay) }} ~ {{ formatDate(p.endDay) }}
                      </span>
                    </div>

                    <div class="project-meta-footer d-flex justify-space-between align-center mt-2">
                      <div class="meta-small">
                        담당자: {{ p.salesManagerName || '-' }}
                      </div>
                      <v-chip size="small" :color="getProjectStatusColor(p.status)" class="white--text">
                        {{ translateStatus(p.status) }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col v-if="!myProjects.length" cols="12" class="text-center py-6">
                <div class="empty-text">진행 중인 프로젝트가 없습니다.</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyProfile, changePassword, getActiveProjects } from '@/apis/user'

const router = useRouter()

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('red')

const showError = (err, fallback = '요청 처리 중 오류가 발생했습니다.') => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.errorMessage ||
    fallback

  snackbarMessage.value = msg
  snackbarColor.value = 'red'
  snackbar.value = true
}

const showSuccess = (msg) => {
  snackbarMessage.value = msg
  snackbarColor.value = 'green'
  snackbar.value = true
}

// 프로필
const profile = reactive({
  employeeId: '',
  name: '',
  email: '',
  department: '',
  position: '',
  status: '재직 중',
  createdAt: '-',
  updatedAt: '-',
})

const loadProfile = async () => {
  const { data } = await getMyProfile()

  profile.employeeId = data.employeeId
  profile.name = data.name
  profile.email = data.email
  profile.department = data.department
  profile.position = data.position
}

const statusChipColor = computed(() => 'green darken-1')

// 비밀번호 변경
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 에러 메시지
const currentPasswordError = ref('')
const passwordErrorMessage = ref('')

// 진행 중 프로젝트
const myProjects = ref([])

// 날짜 util
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const translateStatus = (status) => {
  switch (status) {
    case 'ACTIVE':
      return '진행중'
    case 'SUCCESS':
      return '계약 성공'
    case 'FAIL':
      return '실패'
    default:
      return status || '-'
  }
}

const getProjectStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'orange darken-2'
    case 'SUCCESS':
      return 'green darken-2'
    case 'FAIL':
      return 'red darken-2'
    default:
      return 'grey'
  }
}

// 비밀번호 변경 처리
const onChangePassword = async () => {
  // 이전 에러 초기화
  currentPasswordError.value = ''
  passwordErrorMessage.value = ''

  // 클라이언트 검증
  if (!passwordForm.currentPassword) {
    currentPasswordError.value = '현재 비밀번호를 입력하세요.'
    passwordErrorMessage.value = currentPasswordError.value
    return
  }

  if (!passwordForm.newPassword) {
    passwordErrorMessage.value = '새 비밀번호를 입력하세요.'
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrorMessage.value = '새 비밀번호가 일치하지 않습니다.'
    return
  }

  try {
    await changePassword({
      oldPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })

    showSuccess('비밀번호가 변경되었습니다.')

    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    currentPasswordError.value = ''
    passwordErrorMessage.value = ''
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.errorMessage ||
      ''

    if (
      msg.includes('비밀번호') &&
      (msg.includes('불일치') || msg.includes('현재') || msg.includes('incorrect'))
    ) {
      currentPasswordError.value = '현재 비밀번호가 올바르지 않습니다.'
      passwordErrorMessage.value = currentPasswordError.value
      showError(null, currentPasswordError.value)
    } else {
      passwordErrorMessage.value = '비밀번호를 변경할 수 없습니다.'
      showError(err, passwordErrorMessage.value)
    }
  }
}

// 프로젝트 상세 이동
const goProjectDetail = (projectId) => {
  if (!projectId) return
  router.push(`/project/${projectId}`)
}

// 내 진행 중 프로젝트 조회
const loadMyProjects = async () => {
  const { data } = await getActiveProjects()
  myProjects.value = data || []
}

onMounted(async () => {
  try {
    await Promise.all([loadProfile(), loadMyProjects()])
  } catch (err) {
    showError(err)
  }
})

const translateType = (type) => {
  switch (type) {
    case 'POPUP':
      return '팝업 스토어'
    case 'EXHIBITION':
      return '전시회'
    case 'RENTAL':
      return '임대'
    default:
      return type || '-'
  }
}
</script>

<style scoped>
.page-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111;
}

.profile-card,
.password-card,
.project-list-card {
  border-radius: 16px;
  background: #fff;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 600;
}

.field-label {
  font-size: 0.75rem;
  color: #777;
  margin-bottom: 2px;
}

.field-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #222;
}

.input-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.input-field {
  border-radius: 10px;
}

.password-error-text {
  font-size: 0.8rem;
  color: #e53935;
}

.project-item-card {
  border-radius: 14px;
}

.project-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.project-title-text {
  font-size: 0.98rem;
  font-weight: 600;
  color: #222;
}

.detail-link {
  font-size: 0.8rem;
  text-transform: none;
  padding: 0;
  min-width: auto;
}

.project-meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-top: 3px;
}

.meta-label {
  color: #888;
}

.meta-value {
  color: #333;
  max-width: 65%;
  text-align: right;
}

.project-meta-footer .meta-small {
  font-size: 0.78rem;
  color: #777;
}

.empty-text {
  font-size: 0.9rem;
  color: #888;
}
</style>
