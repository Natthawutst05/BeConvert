export interface FileDataUpload {
  fileTime: string;      // เวลาที่ได้จาก #Time
  sqlService: string;        // User@Host
  processId: number;     // Process ID
  queryTime: string;     // Query Time
  lockTime: string;      // Lock Time
  rowsSent: number;      // Rows Sent
  rowsExamined: number;  // Rows Examined
  setTimestamp: number;  // Timestamp ที่ได้จาก SET timestamp=
  sqlBefore: string;     // SQL Query
  createdUser: string;
  updatedUser: string;
}
