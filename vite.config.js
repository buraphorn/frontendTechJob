import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  // แก้ปัญหา 404 เมื่อ refresh หน้าที่ไม่ใช่ root
  // ทำให้ทุก route ไปที่ index.html แล้วให้ React Router จัดการ
  server: {
    historyApiFallback: true,
  },

  // ถ้า build แล้วยังเจอปัญหา ให้เพิ่มส่วนนี้ด้วย
  preview: {
    historyApiFallback: true,
  },
  base: '/'
})
