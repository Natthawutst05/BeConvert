<script lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useFileUploadStore } from "../stores/fileupload_store";
import { useLoginStore } from '../stores/auth_store'

export default {
  setup() {
    const fileUploadStore = useFileUploadStore();
    const loginStore = useLoginStore();
    const { setFileRows, uploadData } = useFileUploadStore();
    const { fileRows } = storeToRefs(fileUploadStore);
    const router = useRouter();

    const headers = [
      { title: 'No.', key: 'no'},
      { title: 'Time', key: 'fileTime' },
      { title: 'User@Host', key: 'sqlService' },
      { title: 'ID', key: 'processId' },
      { title: 'Query Time', key: 'queryTime' },
      { title: 'Lock Time', key: 'lockTime' },
      { title: 'Rows Sent', key: 'rowsSent' },
      { title: 'Rows Examined', key: 'rowsExamined' },
      { title: 'SET Timestamp', key: 'setTimestamp' },
      { title: 'SQL Query', key: 'sqlBefore' },
    ]

    const goToReportPage = () => {
      router.push("/report_page");
    };

    const truncateSQLQuery = (query: string) =>
      query.length > 25 ? query.substring(0, 25) + "..." : query;

    const showFullSQLQuery = (query: string) => {
      alert(`Full SQL Query: ${query}`);
    };

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
        alert("Please select a file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        if (typeof content === "string") {
          const lines = content
            .split("\n")
            .filter((line) => line.trim() !== "");
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
              const match = line.match(/# User@Host: (.+?)\s+@.+?Id: (\d+)/);
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
            } else if (line.startsWith("SELECT") || collectingQuery) {
              currentRow.sqlBefore += " " + line.trim();
              collectingQuery = true;
            }
          }

          if (currentRow.fileTime) rows.push(currentRow);

          // กรองข้อมูลที่ sqlBefore ซ้ำกันโดยเลือกข้อมูลที่ fileTime ใหม่ที่สุด
          const uniqueRows = Array.from(
            rows
              .reduce((map, row) => {
                const existingRow = map.get(row.sqlBefore);
                if (
                  !existingRow ||
                  new Date(row.fileTime) > new Date(existingRow.fileTime)
                ) {
                  map.set(row.sqlBefore, row);
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
          alert("Unable to process the file content.");
        }
      };
      reader.readAsText(file);
    };

    const handleUploadData = async () => {
      if (!fileRows.value || fileRows.value.length === 0) {
        alert("No data to upload. Please upload a valid file first.");
        return;
      }

      try {
        const preparedData = prepareDataForUpload(); // แปลงข้อมูลก่อนอัปโหลด
        console.log("Prepared data:", preparedData);

        const result = await uploadData(preparedData);
        console.log("Upload result:", result);
      } catch (error) {
        console.error("Error uploading data:", error);
        alert(`Failed to upload data. Error: ${error.message}`);
      }
    };

    // ฟังก์ชันสำหรับล้างข้อมูลใน DataTable
    const clearFileRows = () => {
      setFileRows([]);
    };

    return {
      headers,
      fileRows,
      truncateSQLQuery,
      showFullSQLQuery,
      handleFileUpload,
      handleUploadData,
      goToReportPage,
      clearFileRows,
    };
  },
};
</script>

<template>
  <v-col cols="12">
    <h1 class="text-2xl font-bold mb-4">
      Upload File (.log)
    </h1>

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
      <v-col
        cols="1"
        class="d-flex justify-center pl-0 "
      >
        <v-btn
          prepend-icon="$vuetify"
          height="55px"
          @click="clearFileRows"
        >
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
    <v-col
      cols="12"
      class="pb-0 pl-0 pr-0"
    >
      <v-btn
        prepend-icon="$vuetify"
        class="w-100"
        height="55px"
        @click="handleUploadData"
      >
        Upload Data
      </v-btn>
    </v-col>

    <!-- ไปหน้า Report -->
    <v-col
      cols="12"
      class="pb-0 pl-0 pr-0"
    >
      <v-btn
        class="w-100"
        height="55px"
        @click="goToReportPage"
      >
        Go To Report Page
      </v-btn>
    </v-col>
  </v-col>
</template>
