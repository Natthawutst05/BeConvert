export const requiredRule = (v: string) => !!v || "กรุณากรอกข้อมูล";
export const emailRule = (v: string) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) ||
  "รูปแบบ Email ไม่ถูกต้อง";
export const passwordRule = (v: string) =>
  /^[A-Za-z\d]{4,}$/.test(v) || "Password ต้องยาวอย่างน้อย 4 ตัวอักษร";
export const confirmPasswordRule = (confirmValue: string, passwordValue: string) =>
  confirmValue === passwordValue || "รหัสผ่านไม่ตรงกัน";
