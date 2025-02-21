import { defineStore } from 'pinia';
import { fetchReport, fetchUpdate, addReportStatus} from '@/apis/report2_api';
import type { ReportData, UpdateData, AllStatus } from '@/models/report2_model';
import monthMap from "@/utils/monthMap";

export const useAccessReportStore = defineStore('ReportAccessData', {
  state: () => ({
    reportData: [] as ReportData[],
    updateData: [] as UpdateData[],
    mergedReportData: [] as ReportData[],
    activeCard: "",
    allStatus: {
      statusWait: 0,
      statusConfirm: 0,
      statusProcess: 0,
      statusCancel: 0,
    } as AllStatus,
    methodFilter: "",
    userNameFilter: "",
    monthFilter: 0,
    yearFilter: 0,
  }),
  actions: {
    async fetchAllReportData() {
      this.loading = true;
      try {
        const reportResponse = await fetchReport();
        if (reportResponse.ok) {
          this.reportData = reportResponse.data as ReportData[];
        } else {
          console.error('Error fetching report data:', reportResponse.error);
        }

        const updateResponse = await fetchUpdate();
        if (updateResponse.ok) {
          this.updateData = updateResponse.data as UpdateData[];
        } else {
          console.error('Error fetching update data:', updateResponse.error);
        }

        this.mergeReportData();
        this.calculateStatusCounts();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        this.loading = false;
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
    mergeReportData() {
      this.mergedReportData = this.reportData.map(reportItem => {
        const updateItem = this.updateData.find(update => update.fileId === reportItem.fileId);
        return {
          ...reportItem,
          fileStatus: updateItem?.fileStatus || reportItem.fileStatus || "Wait",
          sqlBefore: updateItem?.urlAfter || reportItem.urlBefore,
          createdUser: updateItem?.assignBy ||  "None",
          updatedUser: updateItem?.assignTo ||  "None",
        };
      });
    },
    calculateStatusCounts() {
      const res = this.mergedReportData;
      this.allStatus.statusWait = res.filter((item: ReportData) => item.fileStatus == "Wait").length;
      this.allStatus.statusConfirm = res.filter((item: ReportData) => item.fileStatus == "Confirm").length;
      this.allStatus.statusProcess = res.filter((item: ReportData) => item.fileStatus == "Process").length;
      this.allStatus.statusCancel = res.filter((item: ReportData) => item.fileStatus == "Cancel").length;
    },
    setActiveCard(status: string) {
      this.activeCard = status;
      this.allStatus.activeCard = status;
      this.calculateStatusCounts();
      this.fetchAllReportData();
    },
    setFilter(sqlService: string | null, userName: string | null, month: number | null, year: number | null) {
      this.methodFilter = sqlService;
      this.userNameFilter = userName;
      this.monthFilter = month;
      this.yearFilter = year;
    },
  },
  getters: {
    filteredReportData: (state) => {
      let filteredData = state.mergedReportData;

      if (state.activeCard) {
        filteredData = filteredData.filter(item => item.fileStatus === state.activeCard);
      }

      if (state.methodFilter) {
        filteredData = filteredData.filter(item => item.fileMethod === state.methodFilter);
      }

      if (state.userNameFilter) {
        filteredData = filteredData.filter(item => item.updatedUser === state.userNameFilter);
      }

      if (state.monthFilter || state.yearFilter) {
        filteredData = filteredData.filter(item => {
          const dateMatch = item.fileTime.match(/(\d+)\/([A-Za-z]+)\/(\d+):/);
          if (!dateMatch) return false;

          const day = parseInt(dateMatch[1], 10);
          const monthStr = dateMatch[2];
          const year = parseInt(dateMatch[3], 10);

          const month = monthMap[monthStr];

          return (!state.monthFilter || month === state.monthFilter) &&
                 (!state.yearFilter || year === state.yearFilter);
        });
      }

      return filteredData;
    },
  }
});
