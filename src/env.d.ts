interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // เพิ่ม environment variables อื่นที่คุณใช้
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
