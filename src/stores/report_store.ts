import { defineStore } from 'pinia';
import { fetchReport, fetchUpdate, addReportStatus} from '@/apis/report_api';
import type { ReportData, UpdateData, SelectedRow, AllStatus } from '@/models/report_model';

export const useReportStore = defineStore('ReportData', {
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
    serviceFilter: "",
    userNameFilter: "",
    monthFilter: 0,
    yearFilter: 0,
    loading: false,
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
      this.loading = true;
      try {
        const result = await addReportStatus(payload);
        return result;
      } catch (error) {
        console.error("Error saving report status:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    mergeReportData() {
      this.mergedReportData = this.reportData.map(reportItem => {
        const updateItem = this.updateData.find(update => update.fileId === reportItem.fileId);
        return {
          ...reportItem,
          fileStatus: updateItem?.fileStatus || reportItem.fileStatus || "Wait",
          sqlBefore: updateItem?.sqlAfter || reportItem.sqlBefore,
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
      this.serviceFilter = sqlService;
      this.userNameFilter = userName;
      this.monthFilter = month;
      this.yearFilter = year;
    },
    resetStore() {
      this.reportData = [];
      this.updateData = [];
      this.mergedReportData = [];
      this.activeCard = "";
      this.allStatus = {
        statusWait: 0,
        statusConfirm: 0,
        statusProcess: 0,
        statusCancel: 0,
      };
      this.serviceFilter = "";
      this.userNameFilter = "";
      this.monthFilter = 0;
      this.yearFilter = 0;
      this.loading = false;
    },
  },
  getters: {
    filteredReportData: (state) => {
      // if (!state.activeCard) {
      //   return state.mergedReportData;
      // } else {
      //   return state.mergedReportData.filter(item => item.fileStatus === state.activeCard);
      // }
      let filteredData = state.mergedReportData;

      if (state.activeCard) {
        filteredData = filteredData.filter(item => item.fileStatus === state.activeCard);
      }

      if (state.serviceFilter) {
        filteredData = filteredData.filter(item => item.sqlService === state.serviceFilter);
      }

      if (state.userNameFilter) {
        filteredData = filteredData.filter(item => item.updatedUser === state.userNameFilter);
      }

      if (state.monthFilter) {
        filteredData = filteredData.filter(item => {
          const fileTime = new Date(item.fileTime);
          return fileTime.getMonth() + 1 === state.monthFilter;
        });
      }

      if (state.yearFilter) {
        filteredData = filteredData.filter(item => {
          const fileTime = new Date(item.fileTime);
          return fileTime.getFullYear() === state.yearFilter;
        });
      }

      return filteredData;
    },
  }
});
