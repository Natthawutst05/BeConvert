import axios from "axios";
//import { ResponseStandard } from "../models/response_standard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8011';

export const registerUser = async (userName: string, userEmail: string, userPassword: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      userName,
      userEmail,
      userPassword,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};
