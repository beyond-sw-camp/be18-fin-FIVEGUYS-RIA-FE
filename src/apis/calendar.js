import api from "@/apis/http";

//  Controller Base URL
const API_URL = "/api/calendars";

export const CalendarAPI = {
  /**
   *  모든 이벤트 조회
   */
  async getEvents() {
    const res = await api.get(API_URL);
    return res.data;
  },

  /**
   *  메모 생성
   */
  async createMemo(memo) {
    const res = await api.post(`${API_URL}/memos`, memo);
    return res.data;
  },

  /**
   *  메모 수정
   */
  async updateMemo(id, memo) {
    const res = await api.put(`${API_URL}/memos/${id}`, memo);
    return res.data;
  },

  /**
   *  메모 삭제
   */
  async deleteEvent(id) {
    const res = await api.delete(`${API_URL}/memos/${id}`);
    return res.data;
  },

  /**
   *  사용자 초대
   */
  async addUser(email, role = "writer") {
    const res = await api.post(`${API_URL}/users`, { email, role });
    return res.data;
  },

  /**
   *  사용자 삭제 (DELETE Body 금지 → QueryParam 사용)
   */
  async removeUser(email) {
    const res = await api.delete(`${API_URL}/users`, {
      params: { email },
    });
    return res.data;
  },

  /**
   *  사용자 목록 조회
   */
  async getUsers() {
    const res = await api.get(`${API_URL}/users`);
    return res.data;
  },
};
