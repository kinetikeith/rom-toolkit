import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";

import packageInfo from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  define: {
    APP_VERSION: JSON.stringify(packageInfo.version),
    APP_REPO_URL: JSON.stringify(packageInfo.repository.url)
  }
})
