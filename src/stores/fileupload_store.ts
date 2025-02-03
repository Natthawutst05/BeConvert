import { defineStore } from "pinia";
import { uploadFileData } from "@/apis/fileupload_api";
import { ref } from "vue";

export const useFileUploadStore = defineStore("fileupload", () => {
  const fileRows = ref<any[]>([]);

  const setFileRows = (rows: any[]) => {
    fileRows.value = rows;
  };

  const uploadData = async (preparedData: any[]) => {
    try {
      console.log("Uploading data...", preparedData);

      const response = await uploadFileData(preparedData);

      console.log("Upload successful:", response);
      return response; // Return response to the caller (e.g., frontend component)
    } catch (error: any) {
      console.error("Error uploading file data:", error.message);
      throw new Error(error.message || "Failed to upload file data.");
    }
  };

  return {
    fileRows,
    setFileRows,
    uploadData,
  };
});
