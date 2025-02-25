<script lang="ts" setup>
import { ref, computed, onMounted, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import "remixicon/fonts/remixicon.css";
import { useLoginStore, getAllUserStore } from "../stores/auth_store";
import { useAccessReportStore } from "../stores/report2_store";
import { SelectedRow } from "@/models/report2_model";
import { requiredRule } from "@/utils/validationRules";

const allUserStore = getAllUserStore();
const reportStore = useAccessReportStore();
const { filteredReportData, allStatus, reportData, updateData } =
  storeToRefs(reportStore);
const loginStore = useLoginStore();
const form = ref();

//Snackbar
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");

const showSnackbar = (message: string, color: string = "error") => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};

// Dialog Controls
const activeDialogId = ref<number | null>(null);
const dateProcessDialog = ref(false);
const assignDateStartDialog = ref(false);
const assignDateEndDialog = ref(false);
const isDialogOpen = computed(() => activeDialogId.value !== null);

//ตรวจสอบ Role
const isAdmin = computed(() => loginStore.authUser?.userRole === "Admin");
const isSaveDisabled = computed(() => {
  return (
    loginStore.authUser?.userRole === "User" &&
    loginStore.authUser?.userName !== selectedRow.assignTo
  );
});

//กำหนดให้ตัวอักษรไม่เกิน 25 ตัวอักษร
const truncateColumn = (query: string) =>
  query.length > 25 ? query.substring(0, 25) + "..." : query;
const showFullText = (query: string) => {
  alert(`Full SQL Query: ${query}`);
};

// Status List
const status = ref(["Wait", "Confirm", "Process", "Cancel"]);
// ActiveCard Status
const clickActiveCard = (status: string) => {
  reportStore.setActiveCard(status);
};

// Filter method,user,month,year
const selectedMethod = ref<string | null>(null);
const selectedUser = ref<string | null>(null);
const selectedMonth = ref<number | null>(null);
const selectedYear = ref<number | null>(null);
const applyFilter = () => {
  reportStore.setFilter(
    selectedMethod.value,
    selectedUser.value,
    selectedMonth.value,
    selectedYear.value
  );
};
// watch(() => selectedMethod.value, () => applyFilter());
// watch(() => selectedUser.value, () => applyFilter());
// watch(() => selectedMonth.value, () => applyFilter());
// watch(() => selectedYear.value, () => applyFilter());

// Service List
const methodlist = ref<string[]>([]);

// User List
const userlist = ref<string[]>([]);

// Month List
const months = ref([
  { text: "January", value: 1 },
  { text: "February", value: 2 },
  { text: "March", value: 3 },
  { text: "April", value: 4 },
  { text: "May", value: 5 },
  { text: "June", value: 6 },
  { text: "July", value: 7 },
  { text: "August", value: 8 },
  { text: "September", value: 9 },
  { text: "October", value: 10 },
  { text: "November", value: 11 },
  { text: "December", value: 12 },
]);

// Year List
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 2022 + 1 }, (_, i) => 2022 + i);
});

// User List for assign
const assignUserlist = ref<string[]>([]);

// DataTable Header
const headers = [
  { title: "ID", key: "fileId" },
  { title: "DateTime", key: "fileTime" },
  { title: "Method", key: "fileMethod" },
  { title: "Response", key: "fileResponse" },
  { title: "Size(byte)", key: "fileSize" },
  { title: "From", key: "fileFrom" },
  { title: "UserAgent", key: "userAgent" },
  { title: "Device", key: "fileDevice" },
  { title: "API Url", key: "urlBefore" },
  { title: "Assign User", key: "createdUser" },
  { title: "Assign To User", key: "updatedUser" },
  { title: "Status", key: "fileStatus" },
  { title: "Action", key: "action" },
];

// Crad Status
const activeCard = ref(null);
const getCardColor = (cardTitle) => {
  if (activeCard.value === cardTitle) {
    switch (cardTitle) {
      case "Wait":
        return "primary";
      case "Confirm":
        return "success";
      case "Process":
        return "warning";
      case "Cancel":
        return "error";
      default:
        return "";
    }
  }
  return "";
};

// State สำหรับข้อมูล row ที่เลือก
const selectedRow = reactive<SelectedRow>({
  fileId: null,
  fileIp: "",
  fileTime: "",
  fileMethod: "",
  urlBefore: "",
  fileResponse: null,
  fileSize: null,
  fileFrom: "",
  userAgent: "",
  fileDevice: "",
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
  Object.keys(selectedRow).forEach((key) => {
    selectedRow[key] = key === "fileId" ? null : "";
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
const updateDataMap = computed(() => {
  return new Map(
    reportStore.updateData.map((update) => [update.fileId, update])
  );
});

const selectRow = (row: any) => {
  activeDialogId.value = row.fileId;
  const updateItem = updateDataMap.value.get(row.fileId) || {};
  Object.assign(selectedRow, { ...row, ...updateItem });

  // selectedRow.fileComment = "";
  previousFileStatus.value = selectedRow.fileStatus;

  dateProcessModel.value = selectedRow.dateProcess
    ? new Date(selectedRow.dateProcess)
    : null;
  dateAssignStartModel.value = selectedRow.assignDateStart
    ? new Date(selectedRow.assignDateStart)
    : null;
  dateAssignEndModel.value = selectedRow.assignDateEnd
    ? new Date(selectedRow.assignDateEnd)
    : null;
};

// ตรวจสอบว่า fileStatus มีการเปลี่ยนแปลงหรือไม่
const previousFileStatus = ref(selectedRow.fileStatus);
const isFileStatusChanged = computed(() => {
  return selectedRow.fileStatus !== previousFileStatus.value;
});
watch(
  () => selectedRow.fileStatus,
  (newStatus, oldStatus) => {
    if (oldStatus !== undefined && newStatus !== oldStatus) {
      previousFileStatus.value = oldStatus;
      selectedRow.fileComment = "";
    }
  }
);

// Rules สำหรับ fileComment
const fileCommentRules = computed(() => {
  return [
    (value) => {
      if (isFileStatusChanged.value && !value) {
        return "กรุณากรอก Comment เมื่อแก้ไขสถานะ!";
      }
      return true;
    },
  ];
});

const saveDialogData = async () => {
  if (!selectedRow.fileId) return;
  const result = await form.value?.validate();
  if (!result.valid) return;

  if (isFileStatusChanged.value && !selectedRow.fileComment) {
    showSnackbar("กรุณากรอกรายละเอียด เมื่อแก้ไขข้อมูล!", "error");
    return;
  }

  const payload = {
    fileId: selectedRow.fileId,
    assignBy: loginStore.authUser.userName,
    assignTo: selectedRow.assignTo,
    urlAfter: selectedRow.urlBefore,
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

    // อัปเดตข้อมูลเฉพาะแถวที่มีการแก้ไข
    const index = reportStore.reportData.findIndex(
      (item) => item.fileId === selectedRow.fileId
    );
    if (index !== -1) {
      Object.assign(reportStore.reportData[index], payload);
      console.log(
        "อัปเดตข้อมูลใน reportData:",
        JSON.stringify(reportStore.reportData[index], null, 2)
      );
    }

    await reportStore.fetchAllReportData();

    console.log("Data saved successfully!");
    showSnackbar("บันทึกข้อมูลสำเร็จ!", "success");
    activeDialogId.value = null;
  } catch (error) {
    console.error("Error saving data:", error);
    showSnackbar("กรุณาใส่ข้อมูลให้ครบถ้วน!", "error");
  }
};

const getStatusCountText = computed(() => (status) => {
  const count = allStatus.value[`status${status}`];
  return `Total: ${count || 0}`;
});

const resetDataFilter = async () => {
  selectedMethod.value = null;
  selectedUser.value = null;
  selectedMonth.value = null;
  selectedYear.value = null;

  reportStore.setActiveCard(null);
  reportStore.setFilter(null, null, null, null);
};

onMounted(async () => {
  try {
    await reportStore.fetchAllReportData();
    await allUserStore.fetchAllUserData();
    assignUserlist.value = allUserStore.authUser.map((user) => user.userName);
    userlist.value = [
      "None",
      ...Array.from(new Set(updateData.value.map((item) => item.assignTo))),
    ];
    methodlist.value = Array.from(
      new Set(reportData.value.map((item) => item.fileMethod))
    );
  } catch (error) {
    console.error("Error loading data:", error);
  }
});
</script>

<template>
  <v-col cols="12" class="pa-6">
    <h1 class="text-2xl font-bold mb-4">Access Log Management</h1>
    <!-- Status Cards -->
    <v-row class="pb-6">
      <v-col cols="12" md="3">
        <v-card
          title="Wait"
          :subtitle="getStatusCountText('Wait')"
          :variant="activeCard === 'Wait' ? 'tonal' : 'elevated'"
          :color="getCardColor('Wait')"
          @click="clickActiveCard('Wait')"
        >
          <p class="pa-4">Click</p>
          <template v-slot:append>
            <v-avatar color="primary" rounded>
              <v-icon class="ri-chat-3-line"></v-icon>
            </v-avatar>
          </template>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card
          title="Confirm"
          :subtitle="getStatusCountText('Confirm')"
          :variant="activeCard === 'Confirm' ? 'tonal' : 'elevated'"
          :color="getCardColor('Confirm')"
          @click="clickActiveCard('Confirm')"
        >
          <p class="pa-4">Click</p>
          <template v-slot:append>
            <v-avatar color="success" rounded>
              <v-icon class="ri-chat-3-line"></v-icon>
            </v-avatar>
          </template>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card
          title="Process"
          :subtitle="getStatusCountText('Process')"
          :variant="activeCard === 'Process' ? 'tonal' : 'elevated'"
          :color="getCardColor('Process')"
          @click="clickActiveCard('Process')"
        >
          <p class="pa-4">Click</p>
          <template v-slot:append>
            <v-avatar color="warning" rounded>
              <v-icon class="ri-chat-3-line"></v-icon>
            </v-avatar>
          </template>
        </v-card>
      </v-col>
      <v-col cols="12" md="3" min-width="200px">
        <v-card
          title="Cancel"
          :subtitle="getStatusCountText('Cancel')"
          :variant="activeCard === 'Cancel' ? 'tonal' : 'elevated'"
          :color="getCardColor('Cancel')"
          @click="clickActiveCard('Cancel')"
        >
          <p class="pa-4">Click</p>
          <template v-slot:append>
            <v-avatar color="error" rounded>
              <v-icon class="ri-chat-3-line"></v-icon>
            </v-avatar>
          </template>
        </v-card>
      </v-col>
    </v-row>
    <!-- Card Content -->
    <v-card>
      <v-row class="pa-4">
        <v-col cols="3">
          <v-select
            label="Method"
            variant="outlined"
            :items="methodlist"
            v-model="selectedMethod"
          />
        </v-col>
        <v-col cols="3">
          <v-select
            label="User"
            variant="outlined"
            :items="userlist"
            v-model="selectedUser"
          />
        </v-col>
        <v-col cols="2">
          <v-select
            label="Months"
            variant="outlined"
            :items="months"
            item-title="text"
            item-value="value"
            v-model="selectedMonth"
          />
        </v-col>
        <v-col cols="2">
          <v-select
            label="Years"
            variant="outlined"
            :items="years"
            v-model="selectedYear"
          />
        </v-col>
        <v-col cols="1">
          <v-btn height="56px" @click="applyFilter">
            <i class="ri-search-2-line mr-2"></i> Search
          </v-btn>
        </v-col>
        <v-col cols="1">
          <v-btn height="56px" @click="resetDataFilter">
            <i class="ri-loop-left-line mr-2"></i> Clear
          </v-btn>
        </v-col>
      </v-row>
      <!-- Data Table -->
      <v-data-table
        :items="filteredReportData"
        :headers="headers"
        item-value="index"
        class="elevation-1"
      >
        <!-- User Agent -->
        <template #item.fileFrom="{ item }">
          <span v-if="item.fileFrom.length <= 25">
            {{ item.fileFrom }}
          </span>
          <span v-else>
            {{ truncateColumn(item.fileFrom) }}
            <v-tooltip bottom>
              <template #activator="{ props }">
                <span
                  class="text-blue-500 underline cursor-pointer"
                  v-bind="props"
                >
                  More
                </span>
              </template>
              <span>{{ item.fileFrom }}</span>
            </v-tooltip>
          </span>
        </template>
        <!-- Url From -->
        <template #item.userAgent="{ item }">
          <span v-if="item.userAgent.length <= 25">
            {{ item.userAgent }}
          </span>
          <span v-else>
            {{ truncateColumn(item.userAgent) }}
            <v-tooltip bottom>
              <template #activator="{ props }">
                <span
                  class="text-blue-500 underline cursor-pointer"
                  v-bind="props"
                >
                  More
                </span>
              </template>
              <span>{{ item.userAgent }}</span>
            </v-tooltip>
          </span>
        </template>
        <!-- Api url -->
        <template #item.urlBefore="{ item }">
          <span v-if="item.urlBefore.length <= 25">
            {{ item.urlBefore }}
          </span>
          <span v-else>
            {{ truncateColumn(item.urlBefore) }}
            <v-tooltip bottom>
              <template #activator="{ props }">
                <span
                  class="text-blue-500 underline cursor-pointer"
                  v-bind="props"
                >
                  More
                </span>
              </template>
              <span>{{ item.urlBefore }}</span>
            </v-tooltip>
          </span>
        </template>
        <!-- Action Dialog -->
        <template #item.action="{ item }">
          <v-btn icon="$vuetify" @click="selectRow(item)" />
          <v-dialog
            v-if="activeDialogId === item.fileId"
            v-model="isDialogOpen"
            max-width="1300"
          >
            <!--Dialog Content-->
            <template v-slot:default>
              <v-card title="Management">
                <v-row>
                  <v-col cols="3" class="pl-9">
                    <v-text-field
                      label="ID"
                      variant="outlined"
                      disabled
                      v-model="selectedRow.fileId"
                    />
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="DateTime"
                      variant="outlined"
                      disabled
                      v-model="selectedRow.fileTime"
                    />
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="SQL Service"
                      variant="outlined"
                      disabled
                      v-model="selectedRow.fileMethod"
                    />
                  </v-col>
                  <v-col cols="3" class="pr-9">
                    <v-text-field
                      label="Response"
                      variant="outlined"
                      disabled
                      v-model="selectedRow.fileResponse"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="3" class="pl-9">
                    <v-text-field
                      label="Size(byte)"
                      variant="outlined"
                      disabled
                      v-model="selectedRow.fileSize"
                    />
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="From"
                      variant="outlined"
                      disabled
                      v-model="selectedRow.fileFrom"
                    />
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="UserAgent"
                      variant="outlined"
                      disabled
                      v-model="selectedRow.userAgent"
                    />
                  </v-col>
                  <v-col cols="3" class="pr-9">
                    <v-text-field
                      label="Device"
                      variant="outlined"
                      disabled
                      v-model="selectedRow.fileDevice"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6" class="pl-9">
                    <v-text-field
                      label="Created Date"
                      variant="outlined"
                      disabled
                      v-model="selectedRow.createdAt"
                    />
                  </v-col>
                  <v-col cols="6" class="pr-9">
                    <v-text-field
                      label="Created User"
                      variant="outlined"
                      disabled
                      v-model="selectedRow.createdUser"
                    />
                  </v-col>
                </v-row>
                <v-form ref="form">
                  <!-- Admin only -->
                  <template v-if="isAdmin">
                    <v-col class="pl-6 pr-6 pt-0 pb-2">
                      <hr />
                    </v-col>
                    <v-col class="pl-6 pr-6 pb-6">
                      <h3>Admin Management</h3>
                    </v-col>
                    <v-row>
                      <v-col cols="4" class="pl-9">
                        <v-select
                          label="Assign To"
                          variant="outlined"
                          :items="assignUserlist"
                          v-model="selectedRow.assignTo"
                          :rules="[requiredRule]"
                        />
                      </v-col>
                      <v-col cols="4">
                        <v-text-field
                          label="Assign Start"
                          variant="outlined"
                          v-model="selectedRow.assignDateStart"
                          :rules="[requiredRule]"
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
                      <v-col cols="4" class="pr-9">
                        <v-text-field
                          label="Assign End"
                          variant="outlined"
                          v-model="selectedRow.assignDateEnd"
                          :rules="[requiredRule]"
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
                    <v-col class="pl-6 pr-6 pt-2 pb-4">
                      <hr />
                    </v-col>
                  </template>
                  <v-col cols="12" class="pl-6 pr-6">
                    <v-text-field
                      label="API Url"
                      variant="outlined"
                      v-model="selectedRow.urlBefore"
                      :rules="[requiredRule]"
                    />
                  </v-col>
                  <v-row>
                    <v-col cols="4" class="pl-9">
                      <v-select
                        label="Status"
                        variant="outlined"
                        :items="status"
                        v-model="selectedRow.fileStatus"
                        :rules="[requiredRule]"
                      />
                    </v-col>
                    <v-col cols="8" class="pr-9">
                      <v-text-field
                        label="Date Process"
                        variant="outlined"
                        v-model="selectedRow.dateProcess"
                        :rules="[requiredRule]"
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
                  <v-col cols="12" class="pl-6 pr-6">
                    <v-textarea
                      label="Comment"
                      variant="outlined"
                      v-model="selectedRow.fileComment"
                      :rules="fileCommentRules"
                      ref="fileCommentField"
                      auto-grow
                    />
                  </v-col>
                </v-form>

                <v-card-actions class="pa-6 pt-0">
                  <v-spacer />
                  <v-btn
                    text="Save"
                    variant="text"
                    @click="saveDialogData()"
                    :disabled="isSaveDisabled"
                  />
                  <v-btn
                    color="error"
                    text="Cancel"
                    variant="outlined"
                    @click="
                      activeDialogId = null;
                      resetSelectedRow();
                    "
                  />
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </template>
      </v-data-table>
    </v-card>
  </v-col>

  <!-- Snackbar -->
  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="5000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>
