import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import HomePage from '@/views/HomePage.vue'
import CalendarPage from '@/modules/calendar/views/CalendarPage.vue'
import ProjectPage from '@/modules/project/views/ProjectPage.vue'
import CreateProjectPage from '@/modules/project/views/CreateProjectPage.vue'
import ProjectDetailPage from '@/modules/project/views/ProjectDetailPage.vue'
import FloorPage from '@/modules/storemap/views/StoreMapPage.vue'
import VipMemberPage from '@/modules/member/views/VipMemberPage.vue'
import VipMemberListPage from '@/modules/member/views/VipMemberListPage.vue'
import PotentialClientPage from '@/modules/client/views/PotentialClientPage.vue'
import ClientPage from '@/modules/client/views/ClientPage.vue'
import ClientCompanyPage from '@/modules/client/views/ClientCompanyPage.vue'
import ClientCompanyDetailPage from '@/modules/client/views/ClientCompanyDetailPage.vue'
import ProposalPage from '@/modules/sales/proposal/view/ProposalPage.vue'
import CreateProposalPage from '@/modules/sales/proposal/view/CreateProposalPage.vue'
import ProposalDetailPage from '@/modules/sales/proposal/view/ProposalDetailPage.vue'
import EstimatePage from '@/modules/sales/estimate/view/EstimatePage.vue'
import ContractPage from '@/modules/sales/contract/view/ContractPage.vue'
import RevenuePage from '@/modules/sales/revenue/view/RevenuePage.vue'
// import GeneralMemberPage from '@/modules/member/views/GeneralMemberPage.vue'
import FileStoragePage from '@/modules/file/views/FileStoragePage.vue'

const routes = [
  { path: '/login',
    name: 'Login',
    component: LoginPage, 
    meta: { hideHeader: true, hideFooter: true }
  },
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'Home', component: HomePage },
  { path: '/calendar', name: 'Calendar', component: CalendarPage },
  { path: '/project', name: 'Project', component: ProjectPage },
  { path: '/project/createproject', name: 'CreateProject', component: CreateProjectPage },
  { path: '/project/:id', name: 'ProjectDetail', component: ProjectDetailPage },
  { path: '/floor', name: 'Floor', component: FloorPage },
  {path: '/floor/:level',name: 'Floor',component: FloorPage,},
  // { path: '/generalmember', name: 'GeneralMember', component: GeneralMemberPage },
  { path: '/vipmember', name: 'VipMember', component: VipMemberPage },
  { path: '/vipmemberlist', name: 'VipMemberList', component: VipMemberListPage },
  { path: '/potentialclient', name: 'PotentialClient', component: PotentialClientPage },
  { path: '/client', name: 'Client', component: ClientPage },
  { path: '/clientcompany', name: 'ClientCompany', component: ClientCompanyPage },
  { path: '/clientcompany/:id', name: 'ClientCompanyDetail', component: ClientCompanyDetailPage, props: true},
  { path: '/proposal', name: 'Proposal', component: ProposalPage },
  { path: '/proposal/createproposal', name: 'CreateProposal', component: CreateProposalPage},
  { path: '/proposal/:id', name: 'ProposalDetail', component: ProposalDetailPage, props: true },
  { path: '/estimate', name: 'Estimate', component: EstimatePage },
  { path: '/contract', name: 'Contract', component: ContractPage },
  { path: '/revenue', name: 'Revenue', component: RevenuePage },
  { path: '/filestorage', name: 'FileStorage', component: FileStoragePage }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
