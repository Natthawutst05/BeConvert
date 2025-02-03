import axios from "axios";
import { ResponseStandard } from "../models/response_standard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8011';

export const registerUser = async (username: string, email: string, password: string): Promise<ResponseStandard> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, { username, email, password });
    return { ok: true, data: response.data.data, error: null };
  } catch (error: any) {
    return { ok: false, data: null, error: error.response?.data?.message || "Registration request failed" };
  }
};
