export interface ReportData {
  fileId: number;
  fileTime: string;
  sqlService: string;
  processId: number;
  queryTime: string;
  lockTime: string;
  rowsSent: number;
  rowsExamined: number;
  setTimestamp: number;
  sqlBefore: string;
  createdAt: string;
  updatedAt: string;
  createdUser: string;
  updatedUser: string;
}

export interface UpdateData {
  fileStatusId: number,
  fileId: number,
  assignBy: string,
  assignTo: string,
  assignAt: string,
  sqlAfter: string,
  fileStatus: string,
  fileComment: string,
  dateProcess: string,
  assignDateStart: string,
  assignDateEnd: string,
  createdUser: string,
  updatedUser: string
}

export interface SelectedRow {
  fileId: number;
  fileTime: string;
  sqlService: string;
  processId: string;
  queryTime: string;
  lockTime: string;
  rowsSent: string;
  rowsExamined: string;
  setTimestamp: string;
  sqlBefore: string;
  createdAt: string;
  createdUser: string;
  assignTo: string;
  fileStatus: string;
  fileComment: string;
  dateProcess: string;
  assignDateStart: string;
  assignDateEnd: string;
}
