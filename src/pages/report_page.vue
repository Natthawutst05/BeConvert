<script lang="ts">
import { ref, computed, onMounted, reactive, watch  } from "vue";
import { useReportStore, useUpdateReportStore } from '../stores/report_store';
import { useLoginStore } from '../stores/auth_store'
import { SelectedRow } from '../models/report_model'
//import { requiredRule, emailRule, passwordRule } from '../utils/validationRules'

export default {
  setup() {
    const reportStore = useReportStore();
    const updateDataStore = useUpdateReportStore();
    const loginStore = useLoginStore();

    // Dialog Controls
    const isDialogActive = ref(false);
    const dateProcessDialog = ref(false)
    const assignDateStartDialog = ref(false)
    const assignDateEndDialog = ref(false)

    //ตรวจสอบ Role
    const isAdmin = computed(() => loginStore.authUser?.userRole === "admin");
    //กำหนดให้ SqlQuery ไม่เกิน 25 ตัวอักษร
    const truncateSQLQuery = (query: string) =>
      query.length > 25 ? query.substring(0, 25) + "..." : query;
    const showFullSQLQuery = (query: string) => {
      alert(`Full SQL Query: ${query}`);
    };

    // Status
    const status = ref([
      'Wait',
      'Confirm',
      'Process',
      'Cancel',
    ])

    // User Mockup
    const userlist = ref([
      'user1',
      'user2',
      'admin1',
      'admin2',
    ])

    // DataTable Header
    const headers = [
      { title: 'No.', key: 'index'},
      { title: 'SQL ID', key: 'fileId' },
      { title: 'SQL Time', key: 'fileTime' },
      { title: 'Service', key: 'sqlService' },
      { title: 'Process ID', key: 'processId' },
      { title: 'Query Time', key: 'queryTime' },
      { title: 'Lock Time', key: 'lockTime' },
      { title: 'Rows Sent', key: 'rowsSent' },
      { title: 'Rows Examined', key: 'rowsExamined' },
      { title: 'Set Timestamp', key: 'setTimestamp' },
      { title: 'SQL Query', key: 'sqlBefore' },
      { title: 'Created At', key: 'createdAt' },
      { title: 'Updated At', key: 'updatedAt' },
      { title: 'Created User', key: 'createdUser' },
      { title: 'Updated User', key: 'updatedUser' },
      { title: 'Status', key: 'fileStatus' },
      { title: 'Action', key: 'action' },
    ]

    // State สำหรับข้อมูล row ที่เลือก
    const selectedRow = reactive<SelectedRow>({
      fileId: null,
      fileTime: "",
      sqlService: "",
      processId: "",
      queryTime: "",
      lockTime: "",
      rowsSent: "",
      rowsExamined: "",
      setTimestamp: "",
      sqlBefore: "",
      createdAt: "",
      createdUser: "",
      assignTo: "",
      fileStatus: "",
      fileComment: "",
      dateProcess: "",
      assignDateStart: "",
      assignDateEnd: "",
    });

    const resetSelectedRow = () => {
      Object.keys(selectedRow).forEach(key => {
        selectedRow[key] = "";
      });
    };

    // สร้างตัวแปรใหม่เพื่อใช้กับ v-model ของ v-date-picker
    const dateProcessModel = ref(new Date(selectedRow.dateProcess));
    const dateAssignStartModel = ref(new Date(selectedRow.assignDateStart));
    const dateAssignEndModel = ref(new Date(selectedRow.assignDateEnd));

    const handleDateChange = (date: Date) => {
      selectedRow.dateProcess = date.toLocaleDateString("sv-SE"); // แปลงเป็น YYYY-MM-DD
      dateProcessDialog.value = false;
    };
    const handleAssignDateStartChange = (date: Date) => {
      selectedRow.assignDateStart = date.toLocaleDateString("sv-SE");
      assignDateStartDialog.value = false;
    };
    const handleAssignDateEndChange = (date: Date) => {
      selectedRow.assignDateEnd = date.toLocaleDateString("sv-SE");
      assignDateEndDialog.value = false;
    };

    // ฟังก์ชันสำหรับตั้งค่าข้อมูล row ที่เลือก
    const selectRow = (row: any) => {
      const updateItem = updateDataStore.updateData.find(update => update.fileId === row.fileId);
      Object.assign(selectedRow, { ...row, ...updateItem });

      dateProcessModel.value = selectedRow.dateProcess ? new Date(selectedRow.dateProcess) : null;
      dateAssignStartModel.value = selectedRow.assignDateStart ? new Date(selectedRow.assignDateStart) : null;
      dateAssignEndModel.value = selectedRow.assignDateEnd ? new Date(selectedRow.assignDateEnd) : null;

      isDialogActive.value = true;
    };

    const previousFileStatus = ref(selectedRow.fileStatus); // เก็บสถานะก่อนหน้า
    watch(() => selectedRow.fileStatus, (newStatus, oldStatus) => {
      if (newStatus !== oldStatus && !selectedRow.fileComment) {
        //alert("กรุณากรอก Comment เมื่อเปลี่ยน Status");
      }
    });

    // เพิ่ม rules สำหรับ v-text-field ของ fileComment
    const fileCommentRules = computed(() => {
      return [
        value => {
          if (!value && selectedRow.fileStatus && selectedRow.fileStatus !== 'Wait') {
            return "กรุณากรอก Comment เมื่อสถานะเปลี่ยนแปลง";
          }
          return true;
        }
      ];
    });

    const saveDialogData = async () => {
      if (!selectedRow.fileId) return;

      const payload = {
        fileId: selectedRow.fileId,
        assignBy: loginStore.authUser.userName,
        assignTo: selectedRow.assignTo,
        sqlAfter: selectedRow.sqlBefore,
        fileStatus: selectedRow.fileStatus,
        fileComment: selectedRow.fileComment,
        dateProcess: selectedRow.dateProcess,
        assignDateStart: selectedRow.assignDateStart,
        assignDateEnd: selectedRow.assignDateEnd,
        createdUser: loginStore.authUser.userName,
        updatedUser: loginStore.authUser.userName,
      };

      try {
        console.log("Payload:", JSON.stringify(payload, null, 2));

        await reportStore.saveReportStatus(payload);
        //console.log("reportData ก่อนอัปเดต:", JSON.stringify(reportStore.reportData, null, 2));

        // อัปเดตข้อมูลเฉพาะแถวที่มีการแก้ไข
        const index = reportStore.reportData.findIndex(item => item.fileId === selectedRow.fileId);
        if (index !== -1) {
          Object.assign(reportStore.reportData[index], payload);
          console.log("อัปเดตข้อมูลใน reportData:", JSON.stringify(reportStore.reportData[index], null, 2));
        }

        //await reportStore.fetchReportData();
        await updateDataStore.fetchReportUpdateData();
        updateDataTable();
        //console.log("reportData หลังอัปเดต:", JSON.stringify(reportStore.reportData, null, 2));

        console.log("Data saved successfully!");
        isDialogActive.value = false;
      } catch (error) {
        console.error("Error saving data:", error);
        alert("Error saving data!");
      }
    };

    // ฟังก์ชันอัปเดต DataTable
    const updateDataTable = () => {
      reportStore.reportData = reportStore.reportData.map(reportItem => {
        const updateItem = updateDataStore.updateData.find(update => update.fileId === reportItem.fileId);
        return {
          ...reportItem,
          sqlBefore: updateItem?.sqlAfter || reportItem.sqlBefore,
          fileStatus: updateItem?.fileStatus || reportItem.fileStatus || "Wait",
        };
      });
    };

    onMounted(async () => {
      try {
        await reportStore.fetchReportData();
        await updateDataStore.fetchReportUpdateData();
        // reportStore.reportData = reportStore.reportData.map(item => ({
        //   ...item,
        //   fileStatus: item.fileStatus || "Wait",
        // }));

        updateDataTable();
      } catch (error) {
        console.error("Error loading data:", error);
      }
    });

    return {
      reportData: computed(() =>
        reportStore.reportData.map((item, index) => ({ ...item, index: index + 1 }))
      ),
      selectedRow,
      selectRow,
      headers,
      status,
      userlist,
      resetSelectedRow,
      saveDialogData,
      isAdmin,
      truncateSQLQuery,
      showFullSQLQuery,
      isDialogActive,
      dateProcessDialog,
      assignDateStartDialog,
      assignDateEndDialog,
      dateProcessModel,
      dateAssignStartModel,
      dateAssignEndModel,
      handleDateChange,
      handleAssignDateStartChange,
      handleAssignDateEndChange,
      fileCommentRules,
      previousFileStatus
    };
  },
};
</script>

<template>
  <v-col cols="12">
    <h1 class="text-2xl font-bold mb-4">
      Report
    </h1>

    <!-- Data Table -->
    <v-data-table
      :items="reportData"
      :headers="headers"
      item-value="index"
      class="elevation-1"
    >
      <template #item.sqlBefore="{ item }">
        <span v-if="item.sqlBefore.length <= 25">
          {{ item.sqlBefore }}
        </span>
        <span v-else>
          {{ truncateSQLQuery(item.sqlBefore) }}
          <v-tooltip bottom>
            <template #activator="{ props }">
              <span
                class="text-blue-500 underline cursor-pointer"
                v-bind="props"
              >
                More
              </span>
            </template>
            <span>{{ item.sqlBefore }}</span>
          </v-tooltip>
        </span>
      </template>

      <template #item.action="{ item }">
        <!--Dialog-->
        <v-dialog max-width="1300">
          <template #activator="{ props: activatorManagement }">
            <v-btn
              icon="$vuetify"
              v-bind="activatorManagement"
              @click="selectRow(item)"
            />
          </template>
          <!--Dialog Content-->
          <template #default="{ isActive }">
            <v-card title="Management">
              <v-row>
                <v-col
                  cols="3"
                  class="pl-9"
                >
                  <v-text-field
                    label="SQL ID"
                    variant="outlined"
                    disabled
                    v-model="selectedRow.fileId"
                  />
                </v-col>
                <v-col
                  cols="3"
                >
                  <v-text-field
                    label="SQL Time"
                    variant="outlined"
                    disabled
                    v-model="selectedRow.fileTime"
                  />
                </v-col>
                <v-col
                  cols="3"
                >
                  <v-text-field
                    label="SQL Service"
                    variant="outlined"
                    disabled
                    v-model="selectedRow.sqlService"
                  />
                </v-col>
                <v-col
                  cols="3"
                  class="pr-9"
                >
                  <v-text-field
                    label="Process ID"
                    variant="outlined"
                    disabled
                    v-model="selectedRow.processId"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  cols="3"
                  class="pl-9"
                >
                  <v-text-field
                    label="Query Time"
                    variant="outlined"
                    disabled
                    v-model="selectedRow.queryTime"
                  />
                </v-col>
                <v-col
                  cols="3"
                >
                  <v-text-field
                    label="Lock Time"
                    variant="outlined"
                    disabled
                    v-model="selectedRow.lockTime"
                  />
                </v-col>
                <v-col
                  cols="3"
                >
                  <v-text-field
                    label="Rows Sent"
                    variant="outlined"
                    disabled
                    v-model="selectedRow.rowsSent"
                  />
                </v-col>
                <v-col
                  cols="3"
                  class="pr-9"
                >
                  <v-text-field
                    label="Rows Examined"
                    variant="outlined"
                    disabled
                    v-model="selectedRow.rowsExamined"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  cols="4"
                  class="pl-9"
                >
                  <v-text-field
                    label="Set Timestamp"
                    variant="outlined"
                    disabled
                    v-model="selectedRow.setTimestamp"
                  />
                </v-col>
                <v-col
                  cols="4"
                >
                  <v-text-field
                    label="Created Date"
                    variant="outlined"
                    disabled
                    v-model="selectedRow.createdAt"
                  />
                </v-col>
                <v-col
                  cols="4"
                  class="pr-9"
                >
                  <v-text-field
                    label="Created User"
                    variant="outlined"
                    disabled
                    v-model="selectedRow.createdUser"
                  />
                </v-col>
              </v-row>
              <!-- Admin only -->
              <template v-if="isAdmin">
              <v-col
                class="pl-6 pr-6 pt-0 pb-2"
              >
                <hr>
              </v-col>
              <v-col
                class="pl-6 pr-6 pb-6"
              >
                <h3>Admin Management</h3>
              </v-col>
              <v-row>
                <v-col
                  cols="4"
                  class="pl-9"
                >
                  <v-select
                    label="Assign To"
                    variant="outlined"
                    :items="userlist"
                    v-model="selectedRow.assignTo"
                  />
                </v-col>
                <v-col
                  cols="4"
                >
                  <v-text-field
                    label="Assign Start"
                    variant="outlined"
                    v-model="selectedRow.assignDateStart"
                    @click="assignDateStartDialog = true"
                  />
                  <!-- Dialog DatePicker -->
                  <v-dialog v-model="assignDateStartDialog" width="auto">
                    <v-card max-width="400">
                      <v-date-picker
                        v-model="dateAssignStartModel"
                        elevation="24"
                        @update:model-value="handleAssignDateStartChange"
                      />
                    </v-card>
                  </v-dialog>
                </v-col>
                <v-col
                  cols="4"
                  class="pr-9"
                >
                  <v-text-field
                    label="Assign End"
                    variant="outlined"
                    v-model="selectedRow.assignDateEnd"
                    @click="assignDateEndDialog = true"
                  />
                  <!-- Dialog DatePicker -->
                  <v-dialog v-model="assignDateEndDialog" width="auto">
                    <v-card max-width="400">
                      <v-date-picker
                        v-model="dateAssignEndModel"
                        elevation="24"
                        @update:model-value="handleAssignDateEndChange"
                      />
                    </v-card>
                  </v-dialog>
                </v-col>
              </v-row>
              <v-col
                class="pl-6 pr-6 pt-2 pb-4"
              >
                <hr>
              </v-col>
              </template>
              <v-col
                cols="12"
                class="pl-6 pr-6"
              >
                <v-text-field
                  label="SQL Query"
                  variant="outlined"
                  v-model="selectedRow.sqlBefore"
                />
              </v-col>
              <v-row>
                <v-col
                  cols="4"
                  class="pl-9"
                >
                  <v-select
                    label="Status"
                    variant="outlined"
                    :items="status"
                    v-model="selectedRow.fileStatus"
                  />
                </v-col>
                <v-col
                  cols="8"
                  class="pr-9"
                >
                  <v-text-field
                    label="Date Process"
                    variant="outlined"
                    v-model="selectedRow.dateProcess"
                    @click="dateProcessDialog = true"
                  />
                  <!-- Dialog DatePicker -->
                  <v-dialog v-model="dateProcessDialog" width="auto">
                    <v-card max-width="400">
                      <v-date-picker
                        v-model="dateProcessModel"
                        elevation="24"
                        @update:model-value="handleDateChange"
                      />
                    </v-card>
                  </v-dialog>
                </v-col>
              </v-row>
              <v-col
                cols="12"
                class="pl-6 pr-6"
              >
                <v-text-field
                  label="Comment"
                  variant="outlined"
                  v-model="selectedRow.fileComment"
                  :rules="fileCommentRules"
                  ref="fileCommentField"
                />
              </v-col>
              <!-- Save&Cancel BTN -->
              <v-card-actions>
                <v-spacer />
                <v-btn
                  text="Save"
                  variant="text"
                  @click="saveDialogData().then(() => isActive.value = false)"
                />
                <v-btn
                  color="surface-variant"
                  text="Cancel"
                  variant="flat"
                  @click="isActive.value = false; resetSelectedRow()"
                />
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </template>
    </v-data-table>
  </v-col>
</template>
