export interface ReportData {
  fileId: number;
  fileIp: string;
  fileTime: string;
  fileMethod: string;
  urlBefore: string;
  fileResponse: number;
  fileSize: number;
  fileFrom: string;
  userAgent: string;
  fileDevice: string;
  createdUser: string;
  updatedUser: string;
  createdAt: string;
  updatedAt: string;
  fileStatus: string,
}

export interface UpdateData {
  fileStatusId: number,
  fileId: number,
  assignBy: string,
  assignTo: string,
  assignAt: string,
  urlAfter: string,
  fileStatus: string,
  fileComment: string,
  dateProcess: string,
  assignDateStart: string,
  assignDateEnd: string,
  createdUser: string,
  updatedUser: string,
}

export interface SelectedRow {
  fileId: number;
  fileIp: string;
  fileTime: string;
  fileMethod: string;
  urlBefore: string;
  fileResponse: number;
  fileSize: number;
  fileFrom: string;
  userAgent: string;
  fileDevice: string;
  createdAt: string;
  createdUser: string;
  assignTo: string;
  fileStatus: string;
  fileComment: string;
  dateProcess: string;
  assignDateStart: string;
  assignDateEnd: string;
}

export interface AllStatus {
  statusWait: number,
  statusConfirm: number,
  statusProcess: number,
  statusCancel: number,
}
