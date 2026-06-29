import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BACKEND_URL;

export const getMyNotifications = async (token, limit = 12) => {
  const res = await axios.get(`${BASE_API_URL}/api/notifications/me?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return res.data;
};

export const markNotificationRead = async (notificationId, token) => {
  const res = await axios.patch(
    `${BASE_API_URL}/api/notifications/${notificationId}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return res.data;
};

export const markAllNotificationsRead = async (token) => {
  const res = await axios.patch(
    `${BASE_API_URL}/api/notifications/me/read-all`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return res.data;
};
