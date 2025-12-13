import api from "@/apis/http";

export const getNotifications = async ({ page = 1, size = 50 } = {}) => {
    return api.get("/api/notifications", {
        params: { page, size }
    });
};

// export const getNotification = async (notificationId) => {
//     return api.get(`/api/notifications/${notificationId}`);
// };

export const createNotification = async ({ receiverId, context }) => {
    return api.post("/api/notifications", { receiverId, context });
};

export const readNotification = async (notificationId) => {
    return api.patch(`/api/notifications/${notificationId}`);
};

export const readAllNotifications = async () => {
    return api.patch("/api/notifications");
};

export const deleteNotification = async (notificationId) => {
    return api.delete(`/api/notifications/${notificationId}`);
};

export const deleteAllNotifications = async () => {
    return api.delete("/api/notifications");
};
