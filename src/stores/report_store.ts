import { defineStore } from 'pinia';
import { fetchReport, fetchUpdate, addReportStatus, fetchSingleUpdate } from '@/apis/report_api';
import type { ReportData, UpdateData } from '@/models/report_model';

export const useReportStore = defineStore('ReportData', {
  state: () => ({
    reportData: [] as ReportData[], // เก็บข้อมูลจาก API
  }),
  actions: {
    async fetchReportData() {
      this.reportData = [] as ReportData[]
      const response = await fetchReport();
      if (response.ok) {
        this.reportData = response.data as ReportData[];
      } else {
        console.error('Error fetching report data:', response.error);
      }
    },
    async saveReportStatus(payload: any) {
      try {
        const result = await addReportStatus(payload);
        return result;
      } catch (error) {
        console.error("Error saving report status:", error);
        throw error;
      }
    },
  },
});

export const useUpdateReportStore = defineStore('updateData', {
  state: () => ({
    updateData: [] as UpdateData[], // เก็บข้อมูลจาก API
  }),
  actions: {
    async fetchReportUpdateData() {
      this.updateData = [] as UpdateData[]
      const response = await fetchUpdate();
      if (response.ok) {
        this.updateData = response.data as UpdateData[];
      } else {
        console.error('Error fetching update data:', response.error);
      }
    },
    async fetchSingleUpdateData(fileId: number) {
      try {
        const response = await fetchSingleUpdate(fileId); // เรียก API เพื่อนำข้อมูลแถวที่เลือก
        if (response.ok) {
          return response.data as UpdateData; // คืนค่าข้อมูลแถวที่เลือก
        } else {
          console.error('Error fetching single report data:', response.error);
          throw new Error(response.error);
        }
      } catch (error) {
        console.error("Error fetching single report data:", error);
        throw error;
      }
    },
  },
});
