import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BACKEND_URL;

export const getMyProfile = async (token) => {
  const res = await axios.get(`${BASE_API_URL}/api/profile/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return res.data;
};

export const upsertMyProfile = async (profile, token) => {
  const res = await axios.put(`${BASE_API_URL}/api/profile/me`, profile, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return res.data;
};
