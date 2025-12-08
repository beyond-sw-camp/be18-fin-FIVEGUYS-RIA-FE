// src/apis/proposal.js
import api from "./http";

export const getProposals = ({
  projectId,
  clientCompanyId,
  keyword,
  status,
  page = 1,
  size = 12,
} = {}) => {
  return api.get("/api/proposals", {
    params: {
      projectId,
      clientCompanyId,
      keyword,
      status, // 'DRAFT' | 'SUBMITTED' | 'COMPLETED' | 'CANCELED'
      page,
      size,
    },
  });
};

export const createProposal = (payload) => {
  return api.post("/api/proposals", payload);
};
export const getProposalDetail = (proposalId) => {
  return api.get(`/api/proposals/${proposalId}`);
};
export const updateProposal = (proposalId, payload) => {
  return api.patch(`/api/proposals/${proposalId}`, payload);
};
export const deleteProposal = (id) => {
  return api.delete(`/api/proposals/${id}`);
};
export const getProposalsByProject = (projectId) => {
  return api.get(`/api/proposals/projects/${projectId}`);
};
