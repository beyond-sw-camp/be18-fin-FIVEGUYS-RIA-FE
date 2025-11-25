import axios from "axios";

// 🔥 Controller Base URL 맞춤
const API_URL = "http://localhost:8080/api/calendars";

export const CalendarAPI = {
  /**
   * 📅 모든 이벤트 조회
   */
  async getEvents() {
    const res = await axios.get(API_URL);
    return res.data;
  },

  /**
   * 📝 메모 생성
   */
  async createMemo(memo) {
    const res = await axios.post(`${API_URL}/memos`, memo);
    return res.data;
  },

  /**
   * ✏️ 메모(이벤트) 수정
   */
  async updateMemo(id, memo) {
    const res = await axios.put(`${API_URL}/memos/${id}`, memo);
    return res.data;
  },

  /**
   * ❌ 메모 삭제
   */
  async deleteEvent(id) {
    await axios.delete(`${API_URL}/memos/${id}`);
  },

  /**
   * ➕ 사용자 초대
   */
  async addUser(email, role = "writer") {
    const res = await axios.post(`${API_URL}/users`, { email, role });
    return res.data;
  },

  /**
   * ➖ 사용자 삭제 (DELETE Body 금지 → QueryParam 사용)
   */
  async removeUser(email) {
    const res = await axios.delete(`${API_URL}/users`, {
      params: { email },
    });
    return res.data;
  },

  /**
   * 👥 사용자 목록 조회
   */
  async getUsers() {
    const res = await axios.get(`${API_URL}/users`);
    return res.data;
  },
};
