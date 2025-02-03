import axios from 'axios';
import type { ResponseStandard } from '@/models/response_standard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8011';

/**
 * เรียก API เพื่อดึงข้อมูล Report
 * @returns Promise<ResponseStandard>
 */
export const fetchReport = async (): Promise<ResponseStandard> => {
  try {
    const response = await axios.get<ResponseStandard>(`${API_BASE_URL}/report`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching report data:', error);

    return {
      ok: false,
      data: null,
      error: error.response ? error.response.data : 'Unknown error',
    };
  }
};

export const fetchUpdate = async (): Promise<ResponseStandard> => {
  try {
    const response = await axios.get<ResponseStandard>(`${API_BASE_URL}/report/updatedata`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching report data:', error);

    return {
      ok: false,
      data: null,
      error: error.response ? error.response.data : 'Unknown error',
    };
  }
};

export async function addReportStatus(payload: any) {
  try {
    const response = await axios.post(`${API_BASE_URL}/report/add-status`, payload);
    return response.data;
  } catch (error) {
    console.error("Error adding report status:", error);
    throw error;
  }
}

// ฟังก์ชันสำหรับดึงข้อมูลแถวที่เลือก
export const fetchSingleUpdate = async (fileId: number): Promise<ResponseStandard> => {
  try {
    const response = await axios.get<ResponseStandard>(`${API_BASE_URL}/report/updatedata/${fileId}`); // เรียก API ที่ใช้ดึงข้อมูลของแถวที่เลือก
    return response.data; // คืนค่าข้อมูลที่ดึงมา
  } catch (error) {
    console.error("Error fetching single update:", error);
    throw error;
  }
};
