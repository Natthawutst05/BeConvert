import axios from "axios";

// URL หลักสำหรับ API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8011';

export const uploadFileData = async (fileData: any[]) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/fileupload`, fileData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    // จัดการ error และส่งต่อข้อความที่เหมาะสม
    if (error.response) {
      const { status, data } = error.response;

      if (status === 400) {
        console.error("Bad Request:", data.message);
        throw new Error("Invalid data. Please check your input.");
      } else if (status === 409) {
        console.error("Duplicate Entry:", data.message);
        throw new Error("Duplicate entry detected. Please check for conflicts.");
      } else {
        console.error("Unexpected error:", data.message);
        throw new Error("Unexpected error occurred. Please try again later.");
      }
    } else {
      console.error("Network error or no response received.");
      throw new Error("Network error. Please check your connection.");
    }
  }
};
