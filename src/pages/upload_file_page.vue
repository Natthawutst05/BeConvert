<script lang="ts" setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useFileUploadStore } from "../stores/fileupload_store";
import { useLoginStore } from "../stores/auth_store";

const fileUploadStore = useFileUploadStore();
const loginStore = useLoginStore();
const { setFileRows, uploadData } = useFileUploadStore();
const { fileRows, loading } = storeToRefs(fileUploadStore);

// dialog
const successDialog = ref(false);

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
  { title: "Time", key: "fileTime" },
  { title: "User@Host", key: "sqlService" },
  { title: "ID", key: "processId" },
  { title: "Query Time", key: "queryTime" },
  { title: "Lock Time", key: "lockTime" },
  { title: "Rows Sent", key: "rowsSent" },
  { title: "Rows Examined", key: "rowsExamined" },
  { title: "SET Timestamp", key: "setTimestamp" },
  { title: "SQL Query", key: "sqlBefore" },
];

const truncateSQLQuery = (query: string) =>
  query.length > 25 ? query.substring(0, 25) + "..." : query;

const showFullSQLQuery = (query: string) => {
  showSnackbar(`Full SQL Query: ${query}`, "indigo");
};

const sqlKeywords = [
  "SELECT",
  "INSERT",
  "UPDATE",
  "DELETE",
  "CREATE",
  "ALTER",
  "DROP",
  "TRUNCATE",
  "WITH",
  "EXPLAIN",
  "SHOW",
  "DESCRIBE",
  "USE",
  "GRANT",
  "REVOKE",
  "BEGIN",
  "COMMIT",
  "ROLLBACK",
  "SAVEPOINT",
  "ADD",
  "select",
  "insert",
  "update",
  "delete",
  "create",
  "alter",
  "drop",
  "truncate",
  "with",
  "explain",
  "show",
  "describe",
  "use",
  "grant",
  "revoke",
  "begin",
  "commit",
  "rollback",
  "savepoint",
  "add",
];

const prepareDataForUpload = () =>
  fileRows.value.map((row) => ({
    fileTime: row.fileTime,
    sqlService: row.sqlService,
    processId: parseInt(row.processId),
    queryTime: row.queryTime,
    lockTime: row.lockTime,
    rowsSent: parseInt(row.rowsSent),
    rowsExamined: parseInt(row.rowsExamined),
    setTimestamp: parseInt(row.setTimestamp),
    sqlBefore: row.sqlBefore,
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
      const lines = content.split("\n").filter((line) => line.trim() !== "");
      const rows = [];
      setFileRows(rows);
      console.log("File Rows:", rows);
      let currentRow = {
        fileTime: "",
        sqlService: "",
        processId: "",
        queryTime: "",
        lockTime: "",
        rowsSent: "",
        rowsExamined: "",
        setTimestamp: "",
        sqlBefore: "",
      };
      let collectingQuery = false;

      for (const line of lines) {
        if (line.startsWith("# Time:")) {
          if (currentRow.fileTime) rows.push(currentRow);
          currentRow = {
            fileTime: "",
            sqlService: "",
            processId: "",
            queryTime: "",
            lockTime: "",
            rowsSent: "",
            rowsExamined: "",
            setTimestamp: "",
            sqlBefore: "",
          };
          currentRow.fileTime = line.replace("# Time:", "").trim();
          collectingQuery = false;
        } else if (line.startsWith("# User@Host:")) {
          const match = line.match(
            /# User@Host:\s*([\w\[\]]+)\s+@\s+\[.*?\]\s+Id:\s*(\d+)/
          );
          if (match) {
            currentRow.sqlService = match[1].trim();
            currentRow.processId = match[2].trim();
          }
        } else if (line.startsWith("# Query_time:")) {
          const match = line.match(
            /# Query_time: (\S+)\s+Lock_time: (\S+)\s+Rows_sent: (\d+)\s+Rows_examined: (\d+)/
          );
          if (match) {
            currentRow.queryTime = match[1];
            currentRow.lockTime = match[2];
            currentRow.rowsSent = match[3];
            currentRow.rowsExamined = match[4];
          }
        } else if (line.startsWith("SET timestamp=")) {
          currentRow.setTimestamp = line
            .replace("SET timestamp=", "")
            .replace(";", "")
            .trim();
        } else if (
          sqlKeywords.some((keyword) => line.startsWith(keyword)) ||
          collectingQuery
        ) {
          currentRow.sqlBefore += " " + line.trim();
          collectingQuery = true;
        }
      }

      if (currentRow.fileTime) rows.push(currentRow);

      // กรองชุดข้อมูลที่มี service กับ sqlquery ซ้ำกันโดยเลือกข้อมูลที่ fileTime ใหม่ที่สุด
      const uniqueRows = Array.from(
        rows
          .reduce((map, row) => {
            const key = `${row.sqlService}|${row.sqlBefore}`;
            const existingRow = map.get(key);
            if (
              !existingRow ||
              new Date(row.fileTime) > new Date(existingRow.fileTime)
            ) {
              map.set(key, row);
            }
            return map;
          }, new Map())
          .values()
      ).map((row, index) => ({
        ...row,
        no: index + 1,
      }));

      setFileRows(uniqueRows);
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
      //showSnackbar("อัพโหลดข้อมูลสำเร็จ!", "success");
      successDialog.value = true;
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
    <h1 class="text-2xl font-bold mb-4">Upload File Slow Query (.log)</h1>
  </v-col>
  <v-card class="pa-4 ma-4">
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
          <v-btn variant="tonal" prepend-icon="$vuetify" height="55px" @click="clearFileRows">
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
      </v-data-table>
      <v-col cols="12" class="pb-0 pl-0 pr-0">
        <v-btn
          prepend-icon="$vuetify"
          class="w-100"
          height="55px"
          variant="tonal"
          @click="handleUploadData"
        >
          Upload Data
        </v-btn>
      </v-col>
  </v-card>

  <!-- snackbar -->
  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="5000">
    {{ snackbarMessage }}
  </v-snackbar>

  <!-- upload success dialog -->
  <v-dialog v-model="successDialog" max-width="400">
    <v-card class="pa-6 text-center">
      <v-col cols="12">
        <v-icon size="100" color="success">mdi-check-circle</v-icon>
      </v-col>
      <h2 class="mt-4 text-h5">บันทึกข้อมูลสำเร็จ!</h2>
      <p class="mt-2">ข้อมูลถูกเพิ่มเรียบร้อย</p>
      <v-card-actions class="justify-center mt-4">
        <v-btn variant="tonal" width="100" color="success" @click="successDialog = false">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Loading -->
  <v-dialog v-model="loading" persistent width="300">
    <v-card class="pa-4 d-flex flex-column align-center">
      <v-progress-circular indeterminate size="50" color="primary" />
      <p class="mt-3">กำลังบันทึกข้อมูล...</p>
    </v-card>
  </v-dialog>
</template>
