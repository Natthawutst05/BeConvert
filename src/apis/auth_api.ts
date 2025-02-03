import axios from "axios";
import { ResponseStandard } from "../models/response_standard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8011';

export const loginUser = async (userEmail: string, userPassword: string): Promise<ResponseStandard> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { userEmail, userPassword });
    return { ok: true, data: response.data.data, error: null };
  } catch (error: any) {
    return { ok: false, data: null, error: error.response?.data?.message || "Login request failed" };
  }
};

export const fetchAllUsers = async (): Promise<ResponseStandard> => {
  try {
    const response = await axios.get<ResponseStandard>(`${API_BASE_URL}/users/alluser`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all user data:', error);

    return {
      ok: false,
      data: null,
      error: error.response ? error.response.data : 'Unknown error',
    };
  }
};
