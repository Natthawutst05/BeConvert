<script lang="ts" setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useFileAccessUploadStore } from "../stores/fileupload2_store";
import { useLoginStore } from "../stores/auth_store";

const fileUploadStore = useFileAccessUploadStore();
const loginStore = useLoginStore();
const { setFileRows, uploadData } = useFileAccessUploadStore();
const { fileRows } = storeToRefs(fileUploadStore);
const router = useRouter();

//SnackBar
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");

const showSnackbar = (message: string, color: string = "error") => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};

const headers = [
  { title: "No.", key: "no" },
  { title: "IP", key: "fileIp" },
  { title: "DateTime", key: "fileTime" },
  { title: "Method", key: "fileMethod" },
  { title: "ApiUrl Time", key: "urlBefore" },
  { title: "Response", key: "fileResponse" },
  { title: "Size(byte)", key: "fileSize" },
  { title: "FromUrl", key: "fileFrom" },
  { title: "UserAgent", key: "userAgent" },
  { title: "Device", key: "fileDevice" },
];

const truncateSQLQuery = (query: string) =>
  query.length > 25 ? query.substring(0, 25) + "..." : query;

const showFullSQLQuery = (query: string) => {
  showSnackbar(`Full SQL Query: ${query}`, "indigo");
};

const prepareDataForUpload = () =>
  fileRows.value.map((row) => ({
    fileIp: row.fileIp,
    fileTime: row.fileTime,
    fileMethod: row.fileMethod,
    urlBefore: row.urlBefore,
    fileResponse: parseInt(row.fileResponse),
    fileSize: parseInt(row.fileSize),
    fileFrom: row.fileFrom,
    userAgent: row.userAgent,
    fileDevice: row.fileDevice,
    createdUser: loginStore.authUser.userName,
    updatedUser: loginStore.authUser.userName,
  }));

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) {
    showSnackbar("Please select a file.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    if (typeof content === "string") {
      const logPattern =
        /(\S+) - - \[(.*?)\] "(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD) (.*?) HTTP\/[\d.]+\" (\d+) (\d+) "(.*?)" "(.*?)" "(.*?)" Request_Time: ([\d.]+)/g;
      let match;
      const rows = [];
      setFileRows(rows);
      console.log("File Rows:", rows);

      while ((match = logPattern.exec(content)) !== null) {
        const [
          ,
          fileIp,
          fileTime,
          fileMethod,
          urlBefore,
          fileResponse,
          fileSize,
          fileFrom,
          userAgent,
        ] = match;

        let fileDevice = "Unknown";
        if (userAgent.includes("Windows NT")) fileDevice = "Windows";
        else if (userAgent.includes("Mac OS X")) fileDevice = "MacOS";
        else if (userAgent.includes("Android")) fileDevice = "Android";
        else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
          fileDevice = "iOS";
        else if (userAgent.includes("Linux")) fileDevice = "Linux";

        rows.push({
          fileIp,
          fileTime,
          fileMethod,
          urlBefore,
          fileResponse: parseInt(fileResponse),
          fileSize: parseInt(fileSize),
          fileFrom,
          userAgent,
          fileDevice,
        });
      }

      const processedRows = rows.map((row, index) => ({
        ...row,
        no: index + 1,
      }));

      setFileRows(processedRows);
    } else {
      showSnackbar("ไม่สามารถแปลงไฟล์ได้!");
    }
  };
  reader.readAsText(file);
};

const handleUploadData = async () => {
  if (!fileRows.value || fileRows.value.length === 0) {
    alert("กรุณาเลือกไฟล์ก่อน!");
    return;
  }

  try {
    const preparedData = prepareDataForUpload(); // แปลงข้อมูลก่อนอัปโหลด
    console.log("Prepared data:", preparedData);

    const result = await uploadData(preparedData);

    if (result && result.message) {
      showSnackbar(
        result.message,
        result.duplicateRows > 0 ? "warning" : "success"
      );
    } else {
      showSnackbar("อัพโหลดข้อมูลสำเร็จ!", "success");
    }

    console.log("Upload result:", result);
  } catch (error) {
    console.error("Error uploading data:", error);
    showSnackbar(`อัพโหลดข้อมูลไม่สำเร็จ : ${error.message}`, "error");
  }
};

// ฟังก์ชันสำหรับล้างข้อมูลใน DataTable
const clearFileRows = () => {
  setFileRows([]);
};
</script>

<template>
  <v-col cols="12">
    <h1 class="text-2xl font-bold mb-4">Upload File Access (.log)</h1>

    <!-- File Input -->
    <v-row>
      <v-col cols="11">
        <v-file-input
          clearable
          label="Select a file"
          variant="outlined"
          accept=".log"
          @change="handleFileUpload"
        />
      </v-col>
      <v-col cols="1" class="d-flex justify-center pl-0">
        <v-btn prepend-icon="$vuetify" height="55px" @click="clearFileRows">
          Cancel
        </v-btn>
      </v-col>
    </v-row>

    <!-- Data Table -->
    <v-data-table
      v-if="fileRows.length > 0"
      :items="fileRows"
      :headers="headers"
      item-value="index"
      class="elevation-1"
    >
      <template #item.index="{ item }">
        {{ item.index }}
      </template>

      <template #item.urlBefore="{ item }">
        <span v-if="item.urlBefore.length <= 25">
          {{ item.urlBefore }}
        </span>
        <span v-else>
          {{ truncateSQLQuery(item.urlBefore) }}
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
    </v-data-table>
    <v-col cols="12" class="pb-0 pl-0 pr-0">
      <v-btn
        prepend-icon="$vuetify"
        class="w-100"
        height="55px"
        @click="handleUploadData"
      >
        Upload Data
      </v-btn>
    </v-col>
  </v-col>
  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="5000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>
