import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";

import packageInfo from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/rom-toolkit/",
  plugins: [
    react(),
    svgr()
  ],
  define: {
    "import.meta.env.APP_VERSION": JSON.stringify(packageInfo.version),
    "import.meta.env.APP_REPO_URL": JSON.stringify(packageInfo.repository.url)
  }
})
