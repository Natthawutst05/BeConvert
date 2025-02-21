import { defineStore } from "pinia";
import { uploadFileData } from "@/apis/fileupload2_api";
import { ref } from "vue";

export const useFileAccessUploadStore = defineStore("AccessUploadStore", () => {
  const fileRows = ref<any[]>([]);

  const setFileRows = (rows: any[]) => {
    fileRows.value = rows;
  };

  const uploadData = async (preparedData: any[]) => {
    try {
      console.log("Uploading data...", preparedData);

      const response = await uploadFileData(preparedData);

      console.log("Upload successful:", response);
      return response;
    } catch (error: any) {
      console.error("Error uploading file data:", error.message);
      throw new Error(error.message || "อัพโหลดข้อมูลไม่สำเร็จ!");
    }
  };

  return {
    fileRows,
    setFileRows,
    uploadData,
  };
});
