import api from "@/apis/http";

// 계약 목록 조회 (페이지네이션 + 필터)
export const getContracts = ({
    projectId,
    clientCompanyId,
    keyword,
    status,
    contractDate,
    page = 1,
    size = 12,
    } = {}) => {
    return api.get("/api/contracts", {
        params: {
        projectId,
        clientCompanyId,
        keyword,
        status, // 'SUBMITTED' | 'COMPLETED' | 'CANCELED'
        contractDate,
        page,
        size,
        },
    });
};

// 계약 생성
export const createContract = (payload) => {
    return api.post("/api/contracts", payload);
};

// 단일 계약 상세 조회
export const getContractDetail = (contractId) => {
    return api.get(`/api/contracts/${contractId}`);
};

// 계약 수정
export const updateContract = (contractId, payload) => {
    return api.patch(`/api/contracts/${contractId}`, payload);
};

// 계약 완료 처리
export const completeContract = (contractId) => {
    return api.patch(`/api/contracts/${contractId}/complete`);
};

// 계약 취소 처리 (soft delete)
export const cancelContract = (contractId) => {
    return api.patch(`/api/contracts/${contractId}/cancel`);
};

// 견적 리스트 조회 (계약 생성용)
export const getContractEstimates = ({
    projectId,
    clientCompanyId,
    keyword,
    status,
    limit = 50,
    } = {}) => {
    return api.get("/api/contracts/estimates", {
        params: {
        projectId,
        clientCompanyId,
        keyword,
        status,
        limit,
        },
    });
};

// 견적 상세 조회
export const getContractEstimateDetail = (estimateId) => {
    return api.get(`/api/contracts/estimates/${estimateId}`);
};
